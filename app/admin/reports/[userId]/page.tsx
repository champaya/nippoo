"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/supabase";
import { useRouter } from "next/navigation";
import { DocumentTextIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
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
}

interface Profile {
  id: string;
  name: string;
}

interface ReportResponse {
  id: string;
  title: string;
  content: string;
  report_date: string;
  purpose: {
    id: string;
    name: string;
  };
}

export default function AdminReportsPage({
  params,
}: {
  params: { userId: string };
}) {
  const [reports, setReports] = useState<Report[]>([]);
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

      // 日報一覧の取得
      const { data: reportsList } = await supabase
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
          )
        `
        )
        .eq("user_id", params.userId)
        .order("report_date", { ascending: false });

      if (reportsList) {
        const typedReports = reportsList.map((report: any) => ({
          id: report.id,
          title: report.title,
          content: report.content,
          report_date: report.report_date,
          purpose: {
            id: report.purpose.id,
            name: report.purpose.name,
          },
        })) as Report[];
        setReports(typedReports);
      }

      setIsLoading(false);
    };

    checkAuthAndLoadData();
  }, [params.userId]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">読み込み中...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">ユーザーが見つかりません</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin"
          className="flex items-center gap-2 text-neutral-500 hover:text-neutral-700 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          管理画面へ戻る
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-8 flex items-center gap-2">
        <DocumentTextIcon className="h-8 w-8" />
        {profile.name}の日報一覧
      </h1>

      <div className="grid gap-4">
        {reports.map((report) => (
          <Link
            key={report.id}
            href={`/admin/reports/${params.userId}/${report.id}`}
            className="block border border-border rounded-lg p-6 hover:border-primary-500 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{report.title}</h2>
              <span className="text-sm text-neutral-500">
                {new Date(report.report_date).toLocaleDateString()}
              </span>
            </div>
            <div className="prose prose-sm max-w-none mb-4 line-clamp-3">
              <MarkdownRenderer content={report.content} />
            </div>
            <div className="text-sm text-neutral-500">
              フォルダ: {report.purpose.name}
            </div>
          </Link>
        ))}

        {reports.length === 0 && (
          <div className="text-center text-neutral-500 py-8">
            日報がありません
          </div>
        )}
      </div>
    </div>
  );
}
