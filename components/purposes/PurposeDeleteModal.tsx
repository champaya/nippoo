"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/supabase";

interface Purpose {
  id: number;
  name: string;
}

interface PurposeDeleteModalProps {
  purpose: Purpose;
  reportsCount: number;
  isOpen: boolean;
  onClose: () => void;
}

export const PurposeDeleteModal = ({
  purpose,
  reportsCount,
  isOpen,
  onClose,
}: PurposeDeleteModalProps) => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setError("");
    setIsLoading(true);

    const supabase = createClient();

    try {
      const { data: images } = await supabase
        .from("nippo_images")
        .select("*")
        .eq("purpose_id", purpose.id);
      // 画像がある場合は削除する
      if (images && images.length > 0) {
        const { error: storageError } = await supabase.storage
          .from("nippo-images")
          .remove(images);

        if (storageError) throw storageError;
      }

      // フォルダを削除（関連する日報は CASCADE で自動的に削除される）
      const { error: purposeError } = await supabase
        .from("nippo_purposes")
        .delete()
        .eq("id", purpose.id);

      if (purposeError) {
        throw purposeError;
      }

      router.push("/purposes");
      router.refresh();
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
        <h2 className="text-xl font-semibold mb-4">フォルダを削除</h2>

        <div className="space-y-4">
          {error && (
            <div className="p-4 rounded-md bg-error-50 text-error-600">
              {error}
            </div>
          )}

          <p>
            「{purpose.name}」を削除しますか？
            {reportsCount > 0 && (
              <span className="block mt-2 text-red-600">
                ※このフォルダに紐づく{reportsCount}
                件の日報も全て削除されます。
              </span>
            )}
          </p>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 rounded-md transition-colors bg-secondary-500 hover:bg-secondary-600"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isLoading}
              className="flex-1 py-2 px-4 rounded-md text-white font-medium transition-colors disabled:opacity-50 bg-error-600 hover:bg-error-700"
            >
              {isLoading ? "削除中..." : "削除する"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
