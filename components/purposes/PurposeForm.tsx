"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/supabase";
import {
  FolderIcon,
  DocumentIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";

interface Format {
  id: number;
  name: string;
}

interface PurposeFormProps {
  userId: string;
  formats: Format[];
}

export const PurposeForm = ({ userId, formats }: PurposeFormProps) => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [formatId, setFormatId] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const supabase = createClient();

    try {
      const { error } = await supabase.from("nippo_purposes").insert([
        {
          user_id: userId,
          name,
          description,
          format_id: formatId === "" ? null : formatId,
        },
      ]);

      if (error) {
        throw error;
      }

      setName("");
      setDescription("");
      setFormatId("");
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
        <label
          htmlFor="name"
          className="block text-sm font-medium flex items-center gap-2"
        >
          <FolderIcon className="h-5 w-5" />
          フォルダ名
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded-md border-border text-foreground"
          placeholder="例: フォルダA、自己研鑽"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="description"
          className="block text-sm font-medium flex items-center gap-2"
        >
          <DocumentIcon className="h-5 w-5" />
          フォルダ概要
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2 border rounded-md border-border text-foreground"
          placeholder="フォルダの目的や概要を入力してください"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="format"
          className="block text-sm font-medium flex items-center gap-2"
        >
          <DocumentIcon className="h-5 w-5" />
          使用するフォーマット
        </label>
        <select
          id="format"
          value={formatId}
          onChange={(e) => setFormatId(e.target.value)}
          className="w-full px-4 py-2 border rounded-md border-border bg-background text-foreground"
        >
          <option value="">フォーマットなし</option>
          {formats.map((format) => (
            <option key={format.id} value={format.id}>
              {format.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2 px-4 rounded-md text-white font-medium transition-colors disabled:opacity-50 bg-primary-500 hover:bg-primary-600 flex items-center gap-2 justify-center"
      >
        <PlusCircleIcon className="h-5 w-5" />
        {isLoading ? "作成中..." : "フォルダを作成"}
      </button>
    </form>
  );
};
