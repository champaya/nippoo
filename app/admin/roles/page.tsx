"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/supabase";
import { useRouter } from "next/navigation";
import {
  UserCircleIcon,
  ArrowLeftIcon,
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  TrashIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

interface Role {
  id: string;
  name: string;
  role_level: number;
  organization_id: string;
}

interface Profile {
  id: string;
  email: string;
  name: string;
  is_admin: boolean;
  is_superuser: boolean;
  organization_id: string;
}

interface Organization {
  id: string;
  name: string;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newRoleName, setNewRoleName] = useState("");
  const [editingRole, setEditingRole] = useState<Role | null>(null);
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
        .select("*")
        .eq("id", user.id)
        .single();

      if (!profile?.is_superuser) {
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
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleAddRole = async () => {
    if (!currentUser || !newRoleName.trim()) return;

    const newRoleLevel =
      roles.length > 0 ? Math.max(...roles.map((r) => r.role_level)) + 1 : 0;

    const { data: newRole, error } = await supabase
      .from("nippo_roles")
      .insert({
        name: newRoleName.trim(),
        organization_id: currentUser.organization_id,
        role_level: newRoleLevel,
      })
      .select()
      .single();

    if (!error && newRole) {
      setRoles([...roles, newRole]);
      setNewRoleName("");
    }
  };

  const handleUpdateRole = async (roleId: string, newName: string) => {
    if (!newName.trim()) return;

    const { error } = await supabase
      .from("nippo_roles")
      .update({ name: newName.trim() })
      .eq("id", roleId);

    if (!error) {
      setRoles(
        roles.map((role) =>
          role.id === roleId ? { ...role, name: newName.trim() } : role
        )
      );
      setEditingRole(null);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    // 役職が使用されているかチェック
    const { data: usersWithRole } = await supabase
      .from("nippo_profiles")
      .select("id")
      .eq("role_id", roleId);

    if (usersWithRole && usersWithRole.length > 0) {
      alert("この役職は現在使用されているため削除できません");
      return;
    }

    const { error } = await supabase
      .from("nippo_roles")
      .delete()
      .eq("id", roleId);

    if (!error) {
      setRoles(roles.filter((role) => role.id !== roleId));
    }
  };

  const handleMoveRole = async (roleId: string, direction: "up" | "down") => {
    const roleIndex = roles.findIndex((r) => r.id === roleId);
    if (roleIndex === -1) return;

    const newRoles = [...roles];
    const targetIndex = direction === "up" ? roleIndex - 1 : roleIndex + 1;

    if (targetIndex < 0 || targetIndex >= roles.length) return;

    // 役職レベルを交換
    const currentLevel = newRoles[roleIndex].role_level;
    const targetLevel = newRoles[targetIndex].role_level;

    const updates = [
      { id: newRoles[roleIndex].id, role_level: targetLevel },
      { id: newRoles[targetIndex].id, role_level: currentLevel },
    ];

    for (const update of updates) {
      await supabase
        .from("nippo_roles")
        .update({ role_level: update.role_level })
        .eq("id", update.id);
    }

    // 配列内の要素を交換
    [newRoles[roleIndex], newRoles[targetIndex]] = [
      newRoles[targetIndex],
      newRoles[roleIndex],
    ];
    setRoles(newRoles);
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
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin"
          className="flex items-center gap-2 text-neutral-500 hover:text-neutral-700 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          管理画面へ戻る
        </Link>
      </div>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <UserCircleIcon className="h-8 w-8" />
          役職管理
        </h1>
        {organization && (
          <p className="text-neutral-500">組織：{organization.name}</p>
        )}
      </div>

      <div className="mb-8">
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
            placeholder="新しい役職名"
            className="flex-1 px-4 py-2 border border-border rounded-md"
          />
          <button
            onClick={handleAddRole}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            追加
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {roles.map((role, index) => (
          <div
            key={role.id}
            className="flex items-center justify-between border border-border rounded-lg p-4"
          >
            <div className="flex items-center gap-4 flex-1">
              {editingRole?.id === role.id ? (
                <input
                  type="text"
                  value={editingRole.name}
                  onChange={(e) =>
                    setEditingRole({ ...editingRole, name: e.target.value })
                  }
                  className="flex-1 px-4 py-2 border border-border rounded-md"
                  autoFocus
                  onBlur={() => handleUpdateRole(role.id, editingRole.name)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUpdateRole(role.id, editingRole.name);
                    }
                  }}
                />
              ) : (
                <span className="text-lg">{role.name}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleMoveRole(role.id, "up")}
                disabled={index === 0}
                className="p-2 text-neutral-500 hover:text-neutral-700 disabled:opacity-50"
              >
                <ArrowUpIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleMoveRole(role.id, "down")}
                disabled={index === roles.length - 1}
                className="p-2 text-neutral-500 hover:text-neutral-700 disabled:opacity-50"
              >
                <ArrowDownIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setEditingRole(role)}
                className="p-2 text-neutral-500 hover:text-neutral-700"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleDeleteRole(role.id)}
                className="p-2 text-red-500 hover:text-red-700"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
