"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/supabase";
import { useRouter } from "next/navigation";
import {
  DocumentTextIcon,
  ArrowLeftIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";

interface Report {
  id: string;
  title: string;
  content: string;
  report_date: string;
  purpose: {
    id: string;
    name: string;
  };
  images: {
    id: string;
    file_path: string;
    ocr_result: string | null;
  }[];
}

interface Profile {
  id: string;
  name: string;
}

export default function AdminReportDetailPage({
  params,
}: {
  params: { userId: string; reportId: string };
}) {
  const [report, setReport] = useState<Report | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/signin");
        return;
      }

      // 管理者権限の確認
      const { data: adminProfile } = await supabase
        .from("nippo_profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (!adminProfile?.is_admin) {
        router.push("/");
        return;
      }

      // 対象ユーザーのプロフィール取得
      const { data: targetProfile } = await supabase
        .from("nippo_profiles")
        .select("id, name")
        .eq("id", params.userId)
        .single();

      if (targetProfile) {
        setProfile(targetProfile);
      }

      // 日報の取得
      const { data: reportData } = await supabase
        .from("nippo_reports")
        .select(
          `
          id,
          title,
          content,
          report_date,
          purpose:purpose_id (
            id,
            name
          ),
          images:nippo_images (
            id,
            file_path,
            ocr_result
          )
        `
        )
        .eq("id", params.reportId)
        .single();

      if (reportData) {
        const typedReport: Report = {
          id: reportData.id,
          title: reportData.title,
          content: reportData.content,
          report_date: reportData.report_date,
          purpose: {
            id: reportData.purpose.id,
            name: reportData.purpose.name,
          },
          images: reportData.images || [],
        };
        setReport(typedReport);
      }

      setIsLoading(false);
    };

    checkAuthAndLoadData();
  }, [params.userId, params.reportId]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">読み込み中...</div>
      </div>
    );
  }

  if (!profile || !report) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">日報が見つかりません</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href={`/admin/reports/${params.userId}`}
          className="flex items-center gap-2 text-neutral-500 hover:text-neutral-700 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          日報一覧へ戻る
        </Link>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-2 text-neutral-500 mb-2">
          <UserCircleIcon className="h-5 w-5" />
          <span>{profile.name}</span>
        </div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <DocumentTextIcon className="h-8 w-8" />
          {report.title}
        </h1>
        <div className="flex items-center gap-4 mt-2 text-sm text-neutral-500">
          <span>{new Date(report.report_date).toLocaleDateString()}</span>
          <span>フォルダ: {report.purpose.name}</span>
        </div>
      </div>

      <div className="prose prose-neutral max-w-none mb-8">
        <MarkdownRenderer content={report.content} />
      </div>

      {report.images && report.images.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">添付画像</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {report.images.map((image) => (
              <div key={image.id} className="relative aspect-video">
                <img
                  src={image.file_path}
                  alt="添付画像"
                  className="object-cover rounded-lg"
                />
                {image.ocr_result && (
                  <div className="mt-2 text-sm text-neutral-500">
                    {image.ocr_result}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
