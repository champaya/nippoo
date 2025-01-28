"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/supabase";
import { semanticColors } from "@/styles/semanticColors";

interface DeleteReportButtonProps {
  reportId: string;
  imagePaths: string[];
}

export const DeleteReportButton = ({
  reportId,
  imagePaths,
}: DeleteReportButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async () => {
    setIsDeleting(true);
    setError("");

    try {
      // 画像ファイルの削除
      if (imagePaths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from("nippo-images")
          .remove(imagePaths);

        if (storageError) throw storageError;
      }

      // 日報の削除（関連する画像情報テーブルはON DELETE CASCADEで自動的に削除される）
      const { error: deleteError } = await supabase
        .from("nippo_reports")
        .delete()
        .eq("id", reportId);

      if (deleteError) throw deleteError;

      router.push("/reports");
      router.refresh();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
      >
        削除
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">日報の削除</h2>
            <p className="mb-4">この日報を削除してもよろしいですか？</p>
            {imagePaths.length > 0 && (
              <p className="text-sm text-gray-500 mb-4">
                ※ アップロードされた画像（{imagePaths.length}枚）も削除されます
              </p>
            )}

            {error && (
              <div
                className="p-4 rounded-md mb-4"
                style={{
                  backgroundColor: semanticColors.light.error.background,
                  color: semanticColors.light.error.foreground,
                }}
              >
                {error}
              </div>
            )}

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                disabled={isDeleting}
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? "削除中..." : "削除する"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
