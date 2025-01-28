"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/supabase";
import { EyeIcon, ArrowsPointingOutIcon } from "@heroicons/react/24/outline";
import { TextEditModal } from "@/components/common/TextEditModal";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";

interface Format {
  id: string;
  name: string;
  content: string;
  created_at: string;
}

interface FormatDetailProps {
  format: Format;
}

export const FormatDetail = ({ format }: FormatDetailProps) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(format.name);
  const [content, setContent] = useState(format.content);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const supabase = createClient();

    try {
      const { error } = await supabase
        .from("nippo_report_formats")
        .update({ name, content })
        .eq("id", format.id);

      if (error) {
        throw error;
      }

      setIsEditing(false);
      router.refresh();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">フォーマット詳細</h1>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="py-2 px-4 rounded-md text-white font-medium bg-secondary-500 hover:bg-secondary-600"
        >
          {isEditing ? "キャンセル" : "編集"}
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-md bg-error-50 text-error-600">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium">
              フォーマット名
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
            <label htmlFor="content" className="block text-sm font-medium">
              フォーマット内容
            </label>
            <div className="relative">
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={10}
                className="w-full px-4 py-2 border rounded-md font-mono text-sm border-border"
              />
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full"
                title="拡大表示"
              >
                <ArrowsPointingOutIcon className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-neutral-500">
              マークダウン形式で記述できます
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 rounded-md text-white font-medium transition-colors disabled:opacity-50 bg-primary-500 hover:bg-primary-600"
          >
            {isLoading ? "更新中..." : "フォーマットを更新"}
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="prose prose-neutral max-w-none">
            <div className="border-b pb-4 mb-6">
              <h2 className="text-2xl font-semibold mb-2">{format.name}</h2>
              <p className="text-sm text-neutral-500">
                作成日:{" "}
                {new Date(format.created_at).toLocaleDateString("ja-JP")}
              </p>
            </div>

            <div className="mt-6">
              <div className="bg-white rounded-lg border border-border p-6">
                <MarkdownRenderer content={content} />
              </div>
            </div>
          </div>
        </div>
      )}

      <TextEditModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onSave={(newContent) => {
          setContent(newContent);
          setIsPreviewOpen(false);
        }}
        title="フォーマット編集"
        content={content}
      />
    </div>
  );
};
