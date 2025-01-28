import { FormatForm } from "@/components/formats/FormatForm";
import { createClient } from "@/utils/supabase/server";

export default async function CreateFormatPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>ログインが必要です</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">フォーマットの作成</h1>
      <FormatForm userId={user.id} />
    </div>
  );
}
