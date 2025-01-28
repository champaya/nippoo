"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { signout } from "@/app/actions/signOut";
import {
  HomeIcon,
  DocumentTextIcon,
  DocumentDuplicateIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
  UserPlusIcon,
  QuestionMarkCircleIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/supabase";

export const Header = ({ user }: { user: User | null }) => {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;

      const { data: profile } = await supabase
        .from("nippo_profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      setIsAdmin(profile?.is_admin || false);
    };

    checkAdmin();
  }, [user]);

  const navItems = [
    { href: "/", label: "フォルダ", icon: HomeIcon },
    { href: "/reports", label: "日報", icon: DocumentTextIcon },
    { href: "/formats", label: "フォーマット", icon: DocumentDuplicateIcon },
    { href: "/guide", label: "使い方", icon: QuestionMarkCircleIcon },
    { href: "/profile", label: "プロフィール", icon: UserCircleIcon },
    ...(isAdmin
      ? [{ href: "/admin", label: "管理", icon: Cog6ToothIcon }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background border-border">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-2xl font-bold flex items-center gap-2">
          <img src="/images/icon.png" alt="Nippoo" width={36} height={36} />
          Nippoo
        </Link>

        <nav className="flex items-center gap-4">
          {user ? (
            <>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
                      pathname === item.href
                        ? "bg-primary-100 text-primary-900"
                        : "hover:bg-neutral-100"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
              <button
                onClick={signout}
                className="px-4 py-2 rounded-md text-white bg-secondary-500 hover:bg-secondary-600 transition-colors flex items-center gap-2"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                サインアウト
              </button>
            </>
          ) : (
            <>
              <Link
                href="/signin"
                className="px-4 py-2 rounded-md hover:bg-neutral-100 flex items-center gap-2"
              >
                <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                サインイン
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 rounded-md text-white bg-primary-500 hover:bg-primary-600 transition-colors flex items-center gap-2"
              >
                <UserPlusIcon className="h-5 w-5" />
                新規登録
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
