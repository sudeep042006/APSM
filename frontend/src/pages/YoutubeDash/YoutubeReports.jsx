// ── YouTube Reports Page ────────────────────────────────────────────
// Professional empty state for report downloads and exports.
// CSV/PDF export functionality is not yet implemented on the backend.
// Shows a polished placeholder with upcoming feature descriptions.

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Download,
  FileText,
  Calendar,
  BarChart3,
  FileSpreadsheet,
  FilePieChart,
} from "lucide-react";

// ── Skeleton loading state ──────────────────────────────────────────
function ReportsSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-white/10">
            <CardContent className="p-5">
              <Skeleton className="h-12 w-12 rounded-xl mb-3" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3 mt-1" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Main Reports Component ──────────────────────────────────────────
export default function YoutubeReports({ loading }) {
  // ── Loading state ─────────────────────────────────────────────────
  if (loading) return <ReportsSkeleton />;

  // ── Report type preview cards ─────────────────────────────────────
  const reportTypes = [
    {
      icon: FileSpreadsheet,
      title: "CSV Export",
      description: "Download raw analytics data as CSV files for custom analysis in spreadsheets.",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      icon: FilePieChart,
      title: "PDF Reports",
      description: "Generate beautifully formatted PDF reports with charts and summaries.",
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      icon: Calendar,
      title: "Date Range Filtering",
      description: "Select custom date ranges to generate reports for specific time periods.",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      icon: BarChart3,
      title: "Historical Reports",
      description: "Access historical analytics snapshots and compare performance over time.",
      color: "text-violet-400",
      bg: "bg-violet-500/10",
    },
    {
      icon: FileText,
      title: "Scheduled Reports",
      description: "Set up automated weekly or monthly report generation delivered to your inbox.",
      color: "text-red-400",
      bg: "bg-red-500/10",
    },
    {
      icon: Download,
      title: "Bulk Downloads",
      description: "Download all analytics data for multiple platforms in a single archive.",
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Reports Hero Section ──────────────────────────────────────── */}
      <div className="flex flex-col items-center justify-center text-center py-12">
        {/* Icon */}
        <div className="relative mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-500/10 ring-1 ring-blue-500/20">
            <Download className="h-10 w-10 text-blue-400" />
          </div>
          <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-500/30 animate-pulse" />
        </div>
        <h2 className="text-xl font-bold">Reports & Exports</h2>
        <p className="mt-2 text-sm text-slate-400 max-w-md leading-relaxed">
          Report export functionality is currently initializing. You will soon be able to download detailed analytics
          reports as CSV or PDF files, with custom date ranges and historical data.
        </p>
      </div>

      {/* ── Report Type Preview Cards ─────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reportTypes.map((report) => (
          <Card
            key={report.title}
            className="border-white/10 bg-white/5 dark:backdrop-blur-sm shadow-sm shadow-none opacity-60 hover:opacity-80 transition-all duration-300 hover:shadow-lg hover:shadow-black/5"
          >
            <CardContent className="p-5">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${report.bg} mb-4`}>
                <report.icon className={`h-6 w-6 ${report.color}`} />
              </div>
              <h3 className="text-sm font-semibold">{report.title}</h3>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                {report.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
