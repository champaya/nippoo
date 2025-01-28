import { ReportList } from "@/components/reports/ReportList";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { PurposeDetail } from "@/components/purposes/PurposeDetail";

interface PurposeDetailPageProps {
  params: {
    id: string;
  };
}

export default async function PurposeDetailPage({
  params,
}: PurposeDetailPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/signin");
  }

  const { id } = await params;

  // Get purpose details with format
  const { data: purpose } = await supabase
    .from("nippo_purposes")
    .select(
      `
      *,
      format:nippo_report_formats(
        id,
        name
      )
    `
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!purpose) {
    redirect("/purposes");
  }

  // Get all formats for editing
  const { data: formats } = await supabase
    .from("nippo_report_formats")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Get reports for this purpose
  const { data: reports } = await supabase
    .from("nippo_reports")
    .select(
      `
      *,
      purpose:nippo_purposes(name)
    `
    )
    .eq("purpose_id", id)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="container mx-auto px-4 py-8">
      <PurposeDetail
        purpose={purpose}
        reports={reports || []}
        formats={formats || []}
      />
    </div>
  );
}
