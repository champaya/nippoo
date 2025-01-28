"use client";

import Link from "next/link";
import {
  DocumentTextIcon,
  CalendarIcon,
  FolderIcon,
} from "@heroicons/react/24/outline";

interface Report {
  id: string;
  title: string;
  content: string;
  report_date: string;
  created_at: string;
  purpose: {
    name: string;
  };
}

interface ReportListProps {
  reports: Report[];
}

export const ReportList = ({ reports }: ReportListProps) => {
  return (
    <div className="divide-y divide-neutral-200 border border-neutral-200 rounded-lg overflow-hidden">
      {reports.map((report) => (
        <Link
          key={report.id}
          href={`/reports/${report.id}`}
          className="block p-6 hover:bg-neutral-50 transition-colors"
        >
          <div className="flex items-start gap-4">
            <div className="p-2 bg-primary-50 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-medium">{report.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <CalendarIcon className="h-4 w-4" />
                    <span>
                      {new Date(report.report_date).toLocaleDateString("ja-JP")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <FolderIcon className="h-4 w-4" />
                  <span>{report.purpose.name}</span>
                </div>
              </div>
              <div className="text-sm text-neutral-600 line-clamp-3 whitespace-pre-wrap bg-neutral-50 p-4 rounded-lg">
                {report.content}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};
