"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/supabase";
import {
  FolderIcon,
  DocumentIcon,
  PhotoIcon,
  DocumentTextIcon,
  SparklesIcon,
  PaperAirplaneIcon,
  CalendarIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { MarkdownToolbar } from "@/components/common/MarkdownToolbar";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";

interface Purpose {
  id: number;
  name: string;
  format_id: number;
}

interface ReportFormat {
  id: number;
  name: string;
  content: string;
}

interface ReportFormProps {
  userId: string;
  purposes: Purpose[];
  formats: ReportFormat[];
}

interface Base64Image {
  data: string;
  mimeType: string;
}

export const ReportForm = ({ userId, purposes, formats }: ReportFormProps) => {
  const router = useRouter();
  const [purposeId, setPurposeId] = useState("");
  const [formatId, setFormatId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [reportDate, setReportDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isPreview, setIsPreview] = useState(false);
  const [insights, setInsights] = useState("");
  const [showInsights, setShowInsights] = useState(false);

  const supabase = createClient();

  // フォルダが選択されたら、そのデフォルトのフォーマットを設定
  useEffect(() => {
    if (purposeId) {
      const selectedPurpose = purposes.find(
        (purpose) => purpose.id.toString() === purposeId
      );
      if (selectedPurpose && !formatId) {
        setFormatId(selectedPurpose.format_id.toString());
      }
    } else {
      setFormatId("");
    }
  }, [purposeId, purposes]);

  const convertToBase64 = (file: File): Promise<Base64Image> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // FileReaderの結果から、MIMEタイプとbase64データを抽出
        const result = reader.result as string;
        const mimeType = file.type; // File オブジェクトから直接MIMEタイプを取得
        resolve({
          data: result.split(",")[1], // base64データ部分のみを抽出
          mimeType: mimeType,
        });
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (files: File[]) => {
    const uploadedImages = [];
    for (const file of files) {
      const { data, error } = await supabase.storage
        .from("nippo_images")
        .upload(`${userId}/${file.name}`, file);

      if (error) {
        setError(`画像のアップロードに失敗しました: ${error.message}`);
        return null;
      }

      uploadedImages.push(data.path);
    }
    return uploadedImages;
  };

  const handleGenerate = async () => {
    if (!purposeId) {
      setError("フォルダを選択してください");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      // 画像をbase64に変換
      const base64Images = await Promise.all(
        images.map((file) => convertToBase64(file))
      );

      const response = await fetch("/api/llm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          purposeId,
          formatId: formatId === "" ? null : formatId,
          currentContent: content,
          images: base64Images,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "エラーが発生しました");
      }

      setContent(data.content);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setShowInsights(false);

    if (content.length > 5000) {
      setError("内容は5000文字以内で入力してください");
      return;
    }

    try {
      // 日報を保存
      const { data: report, error: reportError } = await supabase
        .from("nippo_reports")
        .insert([
          {
            user_id: userId,
            purpose_id: purposeId,
            title,
            content,
            report_date: reportDate,
          },
        ])
        .select()
        .single();

      if (reportError) throw reportError;

      // 画像をアップロードして保存
      if (images.length > 0) {
        const uploadedImagePaths = await handleImageUpload(images);
        if (!uploadedImagePaths) return;

        const { error: imageError } = await supabase
          .from("nippo_images")
          .insert(
            uploadedImagePaths.map((path) => ({
              report_id: report.id,
              file_path: path,
            }))
          );

        if (imageError) throw imageError;
      }

      // インサイトを取得
      const insightResponse = await fetch("/api/insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ purposeId, content }),
      });

      const insightData = await insightResponse.json();

      if (!insightResponse.ok) {
        throw new Error(insightData.error || "インサイトの取得に失敗しました");
      }

      setInsights(insightData.insights);
      setShowInsights(true);

      // フォームをリセット
      setTitle("");
      setContent("");
      setImages([]);
      setPurposeId("");
      setFormatId("");

      router.refresh();
    } catch (error: any) {
      setError(error.message);
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
          htmlFor="purpose"
          className="block text-sm font-medium flex items-center gap-2"
        >
          <FolderIcon className="h-5 w-5" />
          フォルダ
        </label>
        <select
          id="purpose"
          value={purposeId}
          onChange={(e) => setPurposeId(e.target.value)}
          required
          className="w-full px-4 py-2 border border-border rounded-md"
        >
          <option value="">選択してください</option>
          {purposes.map((purpose) => (
            <option key={purpose.id} value={purpose.id}>
              {purpose.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="format"
          className="block text-sm font-medium flex items-center gap-2"
        >
          <DocumentIcon className="h-5 w-5" />
          フォーマット
        </label>
        <select
          id="format"
          value={formatId}
          onChange={(e) => setFormatId(e.target.value)}
          className="w-full px-4 py-2 border border-border rounded-md"
        >
          <option value="">選択してください</option>
          {formats.map((format) => (
            <option key={format.id} value={format.id}>
              {format.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="title"
          className="block text-sm font-medium flex items-center gap-2"
        >
          <DocumentTextIcon className="h-5 w-5" />
          タイトル
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-4 py-2 border border-border rounded-md"
          placeholder="例: 今日の作業報告"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="reportDate"
          className="block text-sm font-medium flex items-center gap-2"
        >
          <CalendarIcon className="h-5 w-5" />
          日付
        </label>
        <input
          id="reportDate"
          type="date"
          value={reportDate}
          onChange={(e) => setReportDate(e.target.value)}
          required
          className="w-full px-4 py-2 border border-border rounded-md"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="content"
          className="block text-sm font-medium flex items-center gap-2"
        >
          <DocumentTextIcon className="h-5 w-5" />
          内容
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

      <div className="space-y-2">
        <label
          htmlFor="images"
          className="block text-sm font-medium flex items-center gap-2"
        >
          <PhotoIcon className="h-5 w-5" />
          画像
        </label>
        <input
          id="images"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setImages(Array.from(e.target.files || []))}
          className="w-full px-4 py-2 border border-border rounded-md"
        />
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex-1 py-2 px-4 rounded-md text-white font-medium transition-colors disabled:opacity-50 bg-secondary-500 hover:bg-secondary-600 flex items-center gap-2 justify-center"
        >
          {isGenerating ? (
            <ArrowPathIcon className="h-5 w-5 animate-spin" />
          ) : (
            <SparklesIcon className="h-5 w-5" />
          )}
          {isGenerating ? "生成中..." : "AIで生成"}
        </button>
        <button
          type="submit"
          className="flex-1 py-2 px-4 rounded-md text-white font-medium transition-colors disabled:opacity-50 bg-primary-500 hover:bg-primary-600 flex items-center gap-2 justify-center"
        >
          <PaperAirplaneIcon className="h-5 w-5" />
          保存
        </button>
      </div>

      {showInsights && (
        <div className="p-4 rounded-md bg-secondary-50 text-secondary-900">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <SparklesIcon className="h-5 w-5" />
            インサイト
          </h3>
          <div className="prose prose-sm max-w-none">
            <MarkdownRenderer content={insights} />
          </div>
        </div>
      )}
    </form>
  );
};
