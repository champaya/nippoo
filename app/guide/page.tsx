import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import {
  DocumentTextIcon,
  DocumentDuplicateIcon,
  FolderIcon,
  SparklesIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";

export default async function GuidePage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/signin");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">使い方ガイド</h1>

      <div className="space-y-12">
        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FolderIcon className="h-6 w-6 text-primary-600" />
            フォルダ機能
          </h2>
          <p className="text-neutral-600">
            フォルダは日報を整理するための機能です。プロジェクトごと、チームごとなど、用途に応じて自由に作成できます。
          </p>
          <ul className="list-disc list-inside space-y-2 text-neutral-600 ml-4">
            <li>フォルダごとにデフォルトのフォーマットを設定可能</li>
            <li>フォルダ内の日報一覧を表示</li>
            <li>フォルダ名の変更や削除が可能</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <DocumentDuplicateIcon className="h-6 w-6 text-primary-600" />
            フォーマット機能
          </h2>
          <p className="text-neutral-600">
            フォーマットは日報の雛形を作成する機能です。よく使う項目や構成を定型化することで、効率的に日報を作成できます。
          </p>
          <ul className="list-disc list-inside space-y-2 text-neutral-600 ml-4">
            <li>マークダウン形式で自由に記述可能</li>
            <li>プレビュー機能で実際の表示を確認</li>
            <li>フォルダにデフォルトフォーマットとして設定可能</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <DocumentTextIcon className="h-6 w-6 text-primary-600" />
            日報機能
          </h2>
          <p className="text-neutral-600">
            日報は実際の活動記録を作成する機能です。フォーマットを活用しながら、効率的に記録を残すことができます。
          </p>
          <ul className="list-disc list-inside space-y-2 text-neutral-600 ml-4">
            <li>マークダウンエディタで直感的に編集</li>
            <li>画像の添付が可能</li>
            <li>日付を指定して記録</li>
            <li>後からの編集や削除が可能</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <SparklesIcon className="h-6 w-6 text-primary-600" />
            AI支援機能
          </h2>
          <p className="text-neutral-600">
            AI機能を活用して、より効率的に日報を作成できます。
          </p>
          <ul className="list-disc list-inside space-y-2 text-neutral-600 ml-4">
            <li>過去の日報を参考にした内容生成</li>
            <li>画像の内容を考慮した文章生成</li>
            <li>ユーザーの文体を学習し、自然な文章を生成</li>
            <li>日報からインサイトを自動生成</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <PhotoIcon className="h-6 w-6 text-primary-600" />
            画像機能
          </h2>
          <p className="text-neutral-600">
            日報に画像を添付することができます。スクリーンショットや成果物の画像を添付することで、より詳細な記録が可能です。
          </p>
          <ul className="list-disc list-inside space-y-2 text-neutral-600 ml-4">
            <li>複数の画像を添付可能</li>
            <li>画像の内容をAIが解析し、文章生成に活用</li>
            <li>画像付きの日報を一覧表示</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
