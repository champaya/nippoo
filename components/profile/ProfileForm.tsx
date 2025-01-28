"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/supabase";
import { User } from "@supabase/supabase-js";
import {
  EnvelopeIcon,
  UserIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

interface Profile {
  id: string;
  name: string;
  personal: string | null;
  created_at: string;
  updated_at: string;
}

interface ProfileFormProps {
  user: User;
  profile: Profile | null;
}

export const ProfileForm = ({ user, profile }: ProfileFormProps) => {
  const router = useRouter();
  const [name, setName] = useState(profile?.name || "");
  const [personal, setPersonal] = useState(profile?.personal || "");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const supabase = createClient();

    try {
      const { error } = await supabase
        .from("nippo_profiles")
        .upsert({ id: user.id, name, personal })
        .select()
        .single();

      if (error) {
        throw error;
      }

      router.refresh();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-md bg-error-50 text-error-600">{error}</div>
      )}

      <div className="space-y-2">
        <div className="block text-sm font-medium flex items-center gap-2">
          <EnvelopeIcon className="h-5 w-5" />
          メールアドレス
        </div>
        <div className="w-full px-4 py-2 border rounded-md bg-neutral-50 border-border">
          {user.email}
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="name"
          className="block text-sm font-medium flex items-center gap-2"
        >
          <UserIcon className="h-5 w-5" />
          名前
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded-md border-border"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="personal"
          className="block text-sm font-medium flex items-center gap-2"
        >
          <UserIcon className="h-5 w-5" />
          文体分析結果
        </label>
        <textarea
          id="personal"
          value={personal}
          onChange={(e) => setPersonal(e.target.value)}
          className="w-full h-48 px-4 py-2 border rounded-md border-border"
          placeholder="文体を分析すると、ここに結果が表示されます。"
        />
      </div>
      <div className="flex justify-end">
        <Link href="/tutorial" className="text-primary-600 hover:underline">
          文体分析に遷移
        </Link>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2 px-4 rounded-md text-white font-medium transition-colors disabled:opacity-50 bg-primary-500 hover:bg-primary-600 flex items-center gap-2 justify-center"
      >
        <ArrowPathIcon className="h-5 w-5" />
        {isLoading ? "更新中..." : "プロフィールを更新"}
      </button>
    </form>
  );
};
