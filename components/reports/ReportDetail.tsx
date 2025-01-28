"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/supabase";
import Image from "next/image";
import Link from "next/link";
import { semanticColors } from "@/styles/semanticColors";
import { DeleteReportButton } from "@/components/reports/DeleteReportButton";
import { TextEditModal } from "@/components/common/TextEditModal";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";

interface Report {
  id: string;
  title: string;
  content: string;
  report_date: string;
  created_at: string;
  purpose: {
    id: number;
    name: string;
  };
  images: {
    id: number;
    file_path: string;
  }[];
}

interface Purpose {
  id: number;
  name: string;
  format_id: number;
}

interface ReportDetailProps {
  report: Report;
  purposes: Purpose[];
  imageUrls: string[];
}

export const ReportDetail = ({
  report,
  purposes,
  imageUrls,
}: ReportDetailProps) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(report.title);
  const [content, setContent] = useState(report.content);
  const [purposeId, setPurposeId] = useState(report.purpose.id.toString());
  const [reportDate, setReportDate] = useState(report.report_date);
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
        .from("nippo_reports")
        .update({
          title,
          content,
          purpose_id: purposeId,
          report_date: reportDate,
        })
        .eq("id", report.id);

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
      <div className="mb-4 flex justify-between items-center">
        <Link
          href="/reports"
          className="text-sm"
          style={{ color: semanticColors.light.link }}
        >
          ← 日報一覧に戻る
        </Link>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="py-2 px-4 rounded-md text-white font-medium bg-secondary-500 hover:bg-secondary-600"
          >
            {isEditing ? "キャンセル" : "編集"}
          </button>
          <DeleteReportButton
            reportId={report.id}
            imagePaths={report.images.map((img) => img.file_path)}
          />
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-md bg-error-50 text-error-600">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium">
              タイトル
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md border-border"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="purpose" className="block text-sm font-medium">
              フォルダ
            </label>
            <select
              id="purpose"
              value={purposeId}
              onChange={(e) => setPurposeId(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md border-border"
            >
              {purposes.map((purpose) => (
                <option key={purpose.id} value={purpose.id}>
                  {purpose.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="reportDate" className="block text-sm font-medium">
              日付
            </label>
            <input
              id="reportDate"
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md border-border"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="content" className="block text-sm font-medium">
              内容
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
                <span className="i-heroicons-arrows-pointing-out-20-solid h-5 w-5" />
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
            {isLoading ? "更新中..." : "日報を更新"}
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="prose prose-neutral max-w-none">
            <div className="border-b pb-4 mb-6">
              <h2 className="text-2xl font-semibold mb-2">{report.title}</h2>
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-sm text-neutral-500">
                    日付:{" "}
                    {new Date(report.report_date).toLocaleDateString("ja-JP")}
                  </p>
                  <Link
                    href={`/purposes/${report.purpose.id}`}
                    className="text-sm text-primary-500 hover:text-primary-600"
                  >
                    フォルダ: {report.purpose.name}
                  </Link>
                </div>
                <p className="text-sm text-neutral-500">
                  作成日時:{" "}
                  {new Date(report.created_at).toLocaleString("ja-JP")}
                </p>
              </div>
            </div>

            {imageUrls.length > 0 && (
              <div
                className={`grid gap-4 ${
                  imageUrls.length === 1
                    ? "grid-cols-1"
                    : imageUrls.length === 2
                    ? "grid-cols-2"
                    : "grid-cols-3"
                }`}
              >
                {imageUrls.map(
                  (url, index) =>
                    url && (
                      <div
                        key={index}
                        className="relative aspect-video bg-neutral-50 rounded-lg overflow-hidden"
                      >
                        <Image
                          src={url}
                          alt={`日報の画像 ${index + 1}`}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )
                )}
              </div>
            )}

            <div className="bg-white rounded-lg border border-border p-6">
              <MarkdownRenderer content={report.content} />
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
        title="日報編集"
        content={content}
      />
    </div>
  );
};
