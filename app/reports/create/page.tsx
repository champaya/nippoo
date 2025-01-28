import { ReportForm } from "@/components/reports/ReportForm";
import { createClient } from "@/utils/supabase/server";

export default async function CreateReportPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>ログインが必要です</div>;
  }

  // フォルダとフォーマットの一覧を取得
  const { data: purposes } = await supabase
    .from("nippo_purposes")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: formats } = await supabase
    .from("nippo_report_formats")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">レポートの作成</h1>
      <ReportForm
        userId={user.id}
        purposes={purposes || []}
        formats={formats || []}
      />
    </div>
  );
}
