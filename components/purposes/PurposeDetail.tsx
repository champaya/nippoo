"use client";

import { useState } from "react";
import { ReportList } from "@/components/reports/ReportList";
import { PurposeEditModal } from "@/components/purposes/PurposeEditModal";
import { PurposeDeleteModal } from "@/components/purposes/PurposeDeleteModal";
import Link from "next/link";

interface Purpose {
  id: number;
  name: string;
  created_at: string;
  format_id: number;
  description: string;
  insights: string;
  format: {
    id: number;
    name: string;
  };
}

interface Report {
  id: string;
  title: string;
  content: string;
  created_at: string;
  report_date: string;
  purpose: {
    name: string;
  };
  format?: {
    name: string;
  };
}

interface Format {
  id: number;
  name: string;
}

interface PurposeDetailProps {
  purpose: Purpose;
  reports: Report[];
  formats: Format[];
}

export const PurposeDetail = ({
  purpose,
  reports,
  formats,
}: PurposeDetailProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{purpose.name}</h1>
          <div className="mt-2 space-y-1">
            <p className="text-sm text-neutral-500">
              作成日: {new Date(purpose.created_at).toLocaleDateString("ja-JP")}
            </p>
            <p className="text-sm">
              使用フォーマット:{" "}
              <Link
                href={`/formats/${purpose?.format?.id}`}
                className="text-primary-600 hover:underline"
              >
                {purpose?.format?.name || "（フォーマットなし）"}
              </Link>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="px-4 py-2 rounded-md text-white transition-colors bg-secondary-500 hover:bg-secondary-600"
          >
            編集
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="px-4 py-2 rounded-md text-white transition-colors bg-error-50 text-error-600"
          >
            削除
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">フォルダ概要</h2>
        <p>{purpose.description || "（未設定）"}</p>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-4">インサイト</h2>
        <p>{purpose.insights || "（未設定）"}</p>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-4">このフォルダの日報一覧</h2>
        <ReportList reports={reports} />
      </div>

      <PurposeEditModal
        purpose={purpose}
        formats={formats}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      <PurposeDeleteModal
        purpose={purpose}
        reportsCount={reports.length}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};
