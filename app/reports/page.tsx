import { ReportList } from "@/components/reports/ReportList";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PlusCircleIcon } from "@heroicons/react/24/outline";

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/signin");
  }

  // Get all reports
  const { data: reports } = await supabase
    .from("nippo_reports")
    .select(
      `
      *,
      purpose:nippo_purposes(
        id,
        name
      )
    `
    )
    .eq("user_id", data.user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">日報一覧</h1>
        <Link
          href="/reports/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
        >
          <PlusCircleIcon className="h-5 w-5" />
          新規作成
        </Link>
      </div>

      <ReportList reports={reports || []} />
    </div>
  );
}
