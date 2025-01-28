import { ReportDetail } from "@/components/reports/ReportDetail";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

interface ReportDetailPageProps {
  params: {
    id: string;
  };
}

export default async function ReportDetailPage({
  params,
}: ReportDetailPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/signin");
  }

  const { id } = params;

  // Get report details with purpose and images
  const { data: report } = await supabase
    .from("nippo_reports")
    .select(
      `
      *,
      purpose:nippo_purposes(
        id,
        name
      ),
      images:nippo_images(
        id,
        file_path
      )
    `
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!report) {
    redirect("/reports");
  }

  // Get all purposes for editing
  const { data: purposes } = await supabase
    .from("nippo_purposes")
    .select("*")
    .eq("user_id", user.id);

  // 画像のURLを取得
  const imageUrls = await Promise.all(
    report.images.map(async (image: { file_path: string }) => {
      const { data } = await supabase.storage
        .from("nippo-images")
        .createSignedUrl(image.file_path, 3600);
      return data?.signedUrl;
    })
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <ReportDetail
        report={report}
        purposes={purposes || []}
        imageUrls={imageUrls.filter(Boolean) as string[]}
      />
    </div>
  );
}
