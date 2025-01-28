import { PurposeForm } from "@/components/purposes/PurposeForm";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  FolderIcon,
  CalendarIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";

export default async function PurposesPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/signin");
  }

  // Get all purposes with their formats
  const { data: purposes } = await supabase
    .from("nippo_purposes")
    .select(
      `
      *,
      format:nippo_report_formats(
        id,
        name
      )
    `
    )
    .eq("user_id", data.user.id)
    .order("created_at", { ascending: false });

  // Get all formats for the form
  const { data: formats } = await supabase
    .from("nippo_report_formats")
    .select("*")
    .eq("user_id", data.user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="divide-y divide-neutral-200 border border-neutral-200 rounded-lg overflow-hidden">
            {purposes?.map((purpose) => (
              <Link
                key={purpose.id}
                href={`/purposes/${purpose.id}`}
                className="block p-6 hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <FolderIcon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium mb-2">{purpose.name}</h3>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <CalendarIcon className="h-4 w-4" />
                        <span>
                          {new Date(purpose.created_at).toLocaleDateString(
                            "ja-JP"
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <DocumentIcon className="h-4 w-4" />
                        <span>
                          {purpose?.format?.name || "（フォーマットなし）"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <h2 className="text-xl font-semibold mb-4">新規作成</h2>
            <PurposeForm userId={data.user.id} formats={formats || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
