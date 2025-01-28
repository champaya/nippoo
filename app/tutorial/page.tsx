"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/supabase";

export default function TutorialPage() {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const supabase = createClient();

  const analyzePersonality = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/tutorial", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error("分析に失敗しました");
      }

      const { personal } = await response.json();

      // プロフィールを更新
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("ユーザーが見つかりません");

      const { error } = await supabase
        .from("nippo_profiles")
        .update({ personal })
        .eq("id", user.id);

      if (error) throw error;

      setMessage("文体の分析が完了しました！");
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      setMessage("エラーが発生しました。もう一度お試しください。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">文体分析チュートリアル</h1>
      <div className="mb-6">
        <p className="text-gray-600 mb-4">
          過去の日報やブログ記事を入力すると、AIが自動であなたの文体や口癖を分析します。
          分析結果は、今後の日報作成時の参考になります。
        </p>
      </div>
      <div className="mb-6">
        <textarea
          className="w-full h-64 p-4 border rounded-lg"
          placeholder="ここに過去の日報やブログ記事を入力してください..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
      <div className="flex justify-center">
        <button
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
          onClick={analyzePersonality}
          disabled={isLoading || !content}
        >
          {isLoading ? "分析中..." : "文体を分析する"}
        </button>
      </div>
      {message && (
        <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-lg">
          {message}
        </div>
      )}
    </div>
  );
}
