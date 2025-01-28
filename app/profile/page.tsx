import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ProfileForm } from "@/components/profile/ProfileForm";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/signin");
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("nippo_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">プロフィール設定</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <ProfileForm user={user} profile={profile} />
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">その他の情報</h2>
            <nav className="space-y-2">
              <Link
                href="/TODO"
                className="block p-2 hover:bg-neutral-50 rounded-md transition-colors"
              >
                会社概要
              </Link>
              <Link
                href="/TODO"
                className="block p-2 hover:bg-neutral-50 rounded-md transition-colors"
              >
                利用規約
              </Link>
              <Link
                href="/TODO"
                className="block p-2 hover:bg-neutral-50 rounded-md transition-colors"
              >
                プライバシーポリシー
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
