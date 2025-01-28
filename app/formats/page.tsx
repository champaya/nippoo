import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import {
  DocumentIcon,
  CalendarIcon,
  DocumentTextIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";

export default async function FormatsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/signin");
  }

  // Get all formats
  const { data: formats } = await supabase
    .from("nippo_report_formats")
    .select("*")
    .eq("user_id", data.user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">フォーマット管理</h1>
        <Link
          href="/formats/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
        >
          <PlusCircleIcon className="h-5 w-5" />
          新規作成
        </Link>
      </div>

      <div className="divide-y divide-neutral-200 border border-neutral-200 rounded-lg overflow-hidden">
        {formats?.map((format) => (
          <Link
            key={format.id}
            href={`/formats/${format.id}`}
            className="block p-6 hover:bg-neutral-50 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary-50 rounded-lg">
                <DocumentIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-lg font-medium">{format.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <CalendarIcon className="h-4 w-4" />
                    <span>
                      {new Date(format.created_at).toLocaleDateString("ja-JP")}
                    </span>
                  </div>
                </div>
                <pre className="p-4 bg-neutral-50 rounded-lg text-sm font-mono whitespace-pre-wrap line-clamp-3 text-neutral-600">
                  <div className="flex items-center gap-2 mb-2">
                    <DocumentTextIcon className="h-4 w-4" />
                    <span className="font-medium">フォーマット内容</span>
                  </div>
                  {format.content}
                </pre>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
