"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/supabase";

interface Purpose {
  id: number;
  name: string;
  description: string;
  created_at: string;
  format_id: number;
  format: {
    id: number;
    name: string;
  };
}

interface Format {
  id: number;
  name: string;
}

interface PurposeEditModalProps {
  purpose: Purpose;
  formats: Format[];
  isOpen: boolean;
  onClose: () => void;
}

export const PurposeEditModal = ({
  purpose,
  formats,
  isOpen,
  onClose,
}: PurposeEditModalProps) => {
  const router = useRouter();
  const [name, setName] = useState(purpose.name);
  const [description, setDescription] = useState(purpose.description || "");
  const [formatId, setFormatId] = useState(purpose?.format?.id.toString());
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const supabase = createClient();

    try {
      const { error } = await supabase
        .from("nippo_purposes")
        .update({ name, description, format_id: formatId })
        .eq("id", purpose.id);

      if (error) {
        throw error;
      }

      router.refresh();
      onClose();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div
        className="bg-background rounded-lg p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">フォルダを編集</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-md bg-error-50 text-error-600">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-foreground"
            >
              フォルダ名
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-foreground"
            >
              フォルダ概要
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="format"
              className="block text-sm font-medium text-foreground"
            >
              使用するフォーマット
            </label>
            <select
              id="format"
              value={formatId}
              onChange={(e) => setFormatId(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md"
            >
              {formats.map((format) => (
                <option key={format.id} value={format.id}>
                  {format.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 rounded-md transition-colors bg-gray-200 text-gray-800"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2 px-4 rounded-md text-white font-medium transition-colors disabled:opacity-50 bg-blue-500"
            >
              {isLoading ? "更新中..." : "更新"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
