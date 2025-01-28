"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/supabase";
import { useRouter } from "next/navigation";
import { FolderIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

interface Purpose {
  id: string;
  name: string;
  description: string | null;
  format_id: string | null;
}

interface Profile {
  id: string;
  name: string;
}

export default function AdminPurposesPage({
  params,
}: {
  params: { userId: string };
}) {
  const [purposes, setPurposes] = useState<Purpose[]>([]);
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

      // フォルダ一覧の取得
      const { data: purposesList } = await supabase
        .from("nippo_purposes")
        .select("*")
        .eq("user_id", params.userId)
        .order("created_at", { ascending: false });

      if (purposesList) {
        setPurposes(purposesList);
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
        <FolderIcon className="h-8 w-8" />
        {profile.name}のフォルダ一覧
      </h1>

      <div className="grid gap-4">
        {purposes.map((purpose) => (
          <Link
            key={purpose.id}
            href={`/admin/purposes/${params.userId}/${purpose.id}`}
            className="block border border-border rounded-lg p-6 hover:border-primary-500 transition-colors"
          >
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <FolderIcon className="h-6 w-6" />
              {purpose.name}
            </h2>
            {purpose.description && (
              <p className="text-neutral-600">{purpose.description}</p>
            )}
          </Link>
        ))}

        {purposes.length === 0 && (
          <div className="text-center text-neutral-500 py-8">
            フォルダがありません
          </div>
        )}
      </div>
    </div>
  );
}
