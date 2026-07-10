// ── Facebook Reports Page ─────────────────────────────────────────────────────
// Fetches data independently via fbapi.getReportsData() on mount.
// Provides date range + report type selectors, export buttons, and recent exports table.

import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

import fbapi from "@/services/fbapi";
import { FileText, Download, Calendar, TrendingDown } from "lucide-react";

// ── Report type options ────────────────────────────────────────────────────────
const REPORT_TYPES = [
  "Overview Summary",
  "Audience Report",
  "Content Performance",
  "Engagement Report",
  "Ads Report",
  "Custom",
];

const FacebookReports = () => {
  const { isConnected } = useOutletContext();
  const [data, setData]           = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState(null);
  // ── Local form state for generating a new report ──────────────────────────
  const [reportType, setReportType] = useState(REPORT_TYPES[0]);
  const [startDate, setStartDate]   = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate]       = useState(() => new Date().toISOString().split("T")[0]);

  // ── Fetch reports data independently on mount ─────────────────────────────
  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        const result = await fbapi.getReportsData();
        if (mounted) setData(result);
      } catch (e) {
        if (mounted) setError("Could not load reports data.");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetch();
    return () => { mounted = false; };
  }, []);

  if (error) return (
    <div className="p-6 flex items-center justify-center min-h-[50vh]">
      <div className="text-center space-y-3">
        <TrendingDown className="h-10 w-10 text-red-400 mx-auto" />
        <p className="text-sm text-gray-400">{error}</p>
        <Button onClick={() => window.location.reload()} className="bg-[#1877F2] hover:bg-[#1877F2]/90 text-white text-xs">Retry</Button>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 space-y-6">

      {/* ── Report Generator Card ──────────────────────────────────────────── */}
      <Card className="bg-[#161B22]/90 backdrop-blur-md rounded-xl border border-white/5">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-white">Generate New Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* ── Report Type Selector ─────────────────────────────────── */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-[#1877F2]/50 transition-colors"
              >
                {REPORT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {/* ── Start Date ───────────────────────────────────────────── */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-[#1877F2]/50 transition-colors"
              />
            </div>
            {/* ── End Date ─────────────────────────────────────────────── */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-[#1877F2]/50 transition-colors"
              />
            </div>
          </div>
          {/* ── Export Buttons ────────────────────────────────────────── */}
          <div className="flex flex-wrap gap-3">
            <Button className="bg-[#1877F2] hover:bg-[#1877F2]/90 text-white gap-2 text-sm" id="fb-export-csv-btn">
              <Download className="h-4 w-4" />
              Export as CSV
            </Button>
            <Button
              variant="outline"
              className="border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white gap-2 text-sm"
              id="fb-export-pdf-btn"
            >
              <FileText className="h-4 w-4" />
              Export as PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Recent Exports Table ───────────────────────────────────────────── */}
      <Card className="bg-[#161B22]/90 backdrop-blur-md rounded-xl border border-white/5">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-white">Recent Exports</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-6">
              {[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full bg-gray-700/30 rounded-lg" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase tracking-wider border-y border-white/5 bg-white/[0.02]">
                  <tr>
                    <th className="px-6 py-4 font-medium">Report Name</th>
                    <th className="px-6 py-4 font-medium">Date Range</th>
                    <th className="px-6 py-4 font-medium">Type</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Generated</th>
                    <th className="px-6 py-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {(!data?.recentExports?.length) ? (
                    <tr><td colSpan={6} className="py-12 text-center text-gray-500 text-sm">No exports yet. Generate your first report above.</td></tr>
                  ) : data.recentExports.map((exp, i) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-xs font-medium text-gray-200 max-w-[200px] truncate">
                        {exp.report}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-400 whitespace-nowrap">
                        {exp.startDate} – {exp.endDate}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full inline-block bg-[#1877F2]/10 text-[#1877F2]">
                          {exp.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full inline-block bg-emerald-500/10 text-emerald-400">
                          {exp.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-400 whitespace-nowrap">{exp.generatedAt}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-[10px] text-[#1877F2] hover:underline flex items-center gap-1 ml-auto">
                          <Download className="h-3 w-3" /> Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FacebookReports;