"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/supabase";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import {
  UserCircleIcon,
  FolderIcon,
  DocumentTextIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

interface Profile {
  id: string;
  email: string;
  name: string;
  is_admin: boolean;
  is_superuser: boolean;
  organization_id: string;
  parent_id: string | null;
  role_id: string;
  role: {
    id: string;
    name: string;
    role_level: number;
    organization_id: string;
  };
}

interface Role {
  id: string;
  name: string;
  role_level: number;
  organization_id: string;
}

interface Organization {
  id: string;
  name: string;
}

export default function AdminPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/signin");
        return;
      }

      const { data: profile } = await supabase
        .from("nippo_profiles")
        .select("*, role:role_id(*)")
        .eq("id", user.id)
        .single();

      if (!profile?.is_admin) {
        router.push("/");
        return;
      }

      setCurrentUser(profile);

      // 組織情報を取得
      const { data: org } = await supabase
        .from("nippo_organizations")
        .select("*")
        .eq("id", profile.organization_id)
        .single();

      setOrganization(org);

      // 組織の役職を取得
      const { data: rolesList } = await supabase
        .from("nippo_roles")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .order("role_level", { ascending: false });

      setRoles(rolesList || []);

      // 組織のトップ（社長）の場合は全員を取得
      if (profile.parent_id === null) {
        const { data: allUsers } = await supabase
          .from("nippo_profiles")
          .select("*, role:role_id(*)")
          .eq("organization_id", profile.organization_id)
          .neq("id", user.id);

        setUsers(allUsers || []);
      } else {
        // 直属の部下と、その配下のメンバーを再帰的に取得
        const getSubordinates = async (
          managerId: string
        ): Promise<Profile[]> => {
          const { data: directSubordinates } = await supabase
            .from("nippo_profiles")
            .select("*, role:role_id(*)")
            .eq("parent_id", managerId);

          if (!directSubordinates || directSubordinates.length === 0) {
            return [];
          }

          const allSubordinates: Profile[] = [...directSubordinates];
          for (const subordinate of directSubordinates) {
            const subSubordinates = await getSubordinates(subordinate.id);
            allSubordinates.push(...subSubordinates);
          }

          return allSubordinates;
        };

        const subordinates = await getSubordinates(user.id);
        setUsers(subordinates);
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleRoleChange = async (userId: string, newRoleId: string) => {
    if (!currentUser?.is_superuser) return;

    const { error } = await supabase
      .from("nippo_profiles")
      .update({ role_id: newRoleId })
      .eq("id", userId);

    if (!error) {
      const { data: updatedRole } = await supabase
        .from("nippo_roles")
        .select("*")
        .eq("id", newRoleId)
        .single();

      setUsers(
        users.map((user) =>
          user.id === userId
            ? { ...user, role_id: newRoleId, role: updatedRole }
            : user
        )
      );
    }
  };

  const handleAdminChange = async (userId: string, isAdmin: boolean) => {
    if (!currentUser?.is_superuser) return;

    const { error } = await supabase
      .from("nippo_profiles")
      .update({ is_admin: isAdmin })
      .eq("id", userId);

    if (!error) {
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, is_admin: isAdmin } : user
        )
      );
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <UserCircleIcon className="h-8 w-8" />
          メンバー管理
        </h1>
        {currentUser?.is_superuser && (
          <Link
            href="/admin/roles"
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary-500 text-white hover:bg-primary-600 transition-colors"
          >
            <Cog6ToothIcon className="h-5 w-5" />
            役職管理
          </Link>
        )}
      </div>

      <div className="grid gap-6">
        {users.map((user) => (
          <div
            key={user.id}
            className="border border-border rounded-lg p-6 hover:border-primary-500 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <UserCircleIcon className="h-6 w-6" />
                  {user.name}
                </h2>
                <div className="flex items-center gap-4 mb-4">
                  {currentUser?.is_superuser ? (
                    <>
                      <select
                        value={user.role_id}
                        onChange={(e) =>
                          handleRoleChange(user.id, e.target.value)
                        }
                        className="px-3 py-1 border border-border rounded-md text-sm"
                      >
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={user.is_admin}
                          onChange={(e) =>
                            handleAdminChange(user.id, e.target.checked)
                          }
                          className="rounded border-border text-primary-500 focus:ring-primary-500"
                        />
                        管理者権限
                      </label>
                    </>
                  ) : (
                    <p className="text-sm text-neutral-500">
                      役職: {user.role?.name || "未設定"}
                      {user.is_admin && " (管理者)"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Link
                href={`/admin/purposes/${user.id}`}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
              >
                <FolderIcon className="h-5 w-5" />
                フォルダ一覧
              </Link>
              <Link
                href={`/admin/reports/${user.id}`}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-secondary-50 text-secondary-700 hover:bg-secondary-100 transition-colors"
              >
                <DocumentTextIcon className="h-5 w-5" />
                日報一覧
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
