"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/supabase";
import {
  DocumentIcon,
  DocumentTextIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import { MarkdownToolbar } from "@/components/common/MarkdownToolbar";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";

interface FormatFormProps {
  userId: string;
}

export const FormatForm = ({ userId }: FormatFormProps) => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (content.length > 5000) {
      setError("内容は5000文字以内で入力してください");
      return;
    }

    const supabase = createClient();

    try {
      const { error } = await supabase
        .from("nippo_report_formats")
        .insert([{ user_id: userId, name, content }]);

      if (error) {
        throw error;
      }

      setName("");
      setContent("");
      router.refresh();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkdownInsert = (markdown: string) => {
    const textarea = document.getElementById("content") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const newContent =
      text.substring(0, start) + markdown + text.substring(end);
    setContent(newContent);

    // カーソル位置を更新
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + markdown.length,
        start + markdown.length
      );
    }, 0);
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
          <DocumentIcon className="h-5 w-5" />
          フォーマット名
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-2 border border-border rounded-md"
          placeholder="例: 標準フォーマット、週報フォーマット"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="content"
          className="block text-sm font-medium flex items-center gap-2"
        >
          <DocumentTextIcon className="h-5 w-5" />
          フォーマット内容
        </label>
        <div className="space-y-2">
          <MarkdownToolbar onInsert={handleMarkdownInsert} />
          <div className="relative">
            {isPreview ? (
              <div className="prose max-w-none p-4 border border-border rounded-md bg-white min-h-[250px]">
                <MarkdownRenderer content={content} />
              </div>
            ) : (
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={10}
                className="w-full px-4 py-2 border border-border rounded-md font-mono text-sm"
                placeholder="# 今日の成果&#10;&#10;# 明日の予定&#10;&#10;# 気づき"
                maxLength={5000}
              />
            )}
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setIsPreview(!isPreview)}
              className="text-sm text-neutral-600 hover:text-neutral-900"
            >
              {isPreview ? "編集モード" : "プレビューモード"}
            </button>
          </div>
        </div>
        <p className="text-sm text-neutral-500">
          マークダウン形式で記述できます
        </p>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2 px-4 rounded-md text-white font-medium transition-colors disabled:opacity-50 bg-primary-500 hover:bg-primary-600 flex items-center gap-2 justify-center"
      >
        <PlusCircleIcon className="h-5 w-5" />
        {isLoading ? "作成中..." : "フォーマットを作成"}
      </button>
    </form>
  );
};
