import { FormatDetail } from "@/components/formats/FormatDetail";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

interface FormatDetailPageProps {
  params: {
    id: string;
  };
}

export default async function FormatDetailPage({
  params,
}: FormatDetailPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/signin");
  }

  const { id } = await params;

  const { data: format } = await supabase
    .from("nippo_report_formats")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!format) {
    redirect("/formats");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <FormatDetail format={format} />
    </div>
  );
}
