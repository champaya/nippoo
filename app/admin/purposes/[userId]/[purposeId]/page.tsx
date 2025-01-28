"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/supabase";
import { useRouter } from "next/navigation";
import {
  FolderIcon,
  ArrowLeftIcon,
  UserCircleIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";

interface Purpose {
  id: string;
  name: string;
  description: string | null;
  format: {
    id: string;
    name: string;
    content: string;
  } | null;
  reports: {
    id: string;
    title: string;
    content: string;
    report_date: string;
  }[];
}

interface Profile {
  id: string;
  name: string;
}

export default function AdminPurposeDetailPage({
  params,
}: {
  params: { userId: string; purposeId: string };
}) {
  const [purpose, setPurpose] = useState<Purpose | null>(null);
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

      // フォルダの取得
      const { data: purposeData } = await supabase
        .from("nippo_purposes")
        .select(
          `
          id,
          name,
          description,
          format:format_id (
            id,
            name,
            content
          ),
          reports:nippo_reports (
            id,
            title,
            content,
            report_date
          )
        `
        )
        .eq("id", params.purposeId)
        .single();

      if (purposeData) {
        const typedPurpose: Purpose = {
          id: purposeData.id,
          name: purposeData.name,
          description: purposeData.description,
          format: purposeData.format
            ? {
                id: purposeData.format.id,
                name: purposeData.format.name,
                content: purposeData.format.content,
              }
            : null,
          reports: purposeData.reports || [],
        };
        setPurpose(typedPurpose);
      }

      setIsLoading(false);
    };

    checkAuthAndLoadData();
  }, [params.userId, params.purposeId]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">読み込み中...</div>
      </div>
    );
  }

  if (!profile || !purpose) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">フォルダが見つかりません</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href={`/admin/purposes/${params.userId}`}
          className="flex items-center gap-2 text-neutral-500 hover:text-neutral-700 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          フォルダ一覧へ戻る
        </Link>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-2 text-neutral-500 mb-2">
          <UserCircleIcon className="h-5 w-5" />
          <span>{profile.name}</span>
        </div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FolderIcon className="h-8 w-8" />
          {purpose.name}
        </h1>
        {purpose.description && (
          <p className="mt-2 text-neutral-600">{purpose.description}</p>
        )}
      </div>

      {purpose.format && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">使用フォーマット</h2>
          <div className="border border-border rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4">{purpose.format.name}</h3>
            <div className="prose prose-neutral max-w-none">
              <MarkdownRenderer content={purpose.format.content} />
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold mb-4">日報一覧</h2>
        <div className="grid gap-4">
          {purpose.reports.map((report) => (
            <Link
              key={report.id}
              href={`/admin/reports/${params.userId}/${report.id}`}
              className="block border border-border rounded-lg p-6 hover:border-primary-500 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <DocumentTextIcon className="h-5 w-5" />
                  {report.title}
                </h3>
                <span className="text-sm text-neutral-500">
                  {new Date(report.report_date).toLocaleDateString()}
                </span>
              </div>
              <div className="prose prose-sm max-w-none line-clamp-3">
                <MarkdownRenderer content={report.content} />
              </div>
            </Link>
          ))}

          {purpose.reports.length === 0 && (
            <div className="text-center text-neutral-500 py-8">
              日報がありません
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
