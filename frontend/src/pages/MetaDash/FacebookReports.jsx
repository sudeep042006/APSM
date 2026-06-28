import { Activity, BarChart3, Bookmark, Calendar, ChevronDown, Eye, FileText, Heart, HelpCircle, History, MessageCircle, MoreVertical, Settings, Share2, Target, ThumbsUp, TrendingDown, TrendingUp, Users, Video } from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockFacebookData } from "@/utils/metaMockData";

const FB_BLUE = "#1877F2";
const PIE_COLORS = ["#1877F2", "#10b981", "#8b5cf6", "#64748b"];
import { EmptyState, KpiCard, DarkTooltip, FacebookDataTable, InstagramDataTable, ProgressBar } from './MetaSharedComponents';


export function FacebookReports({ data }) {
  if (!data) return <EmptyState title="Export Reports" description="Generate and download custom PDF/CSV reports of your Facebook performance." icon={FileText} actionLabel="Generate Report" />;

  return (
    <div className="space-y-6">
      <Card className="bg-[#161B22] border-white/5 text-white">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-slate-200">Download Center</CardTitle>
          <p className="text-sm text-slate-400">Generate custom reports for stakeholders and team members.</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row items-end gap-4 p-4 border border-white/10 rounded-lg bg-white/[0.02]">
            <div className="w-full sm:flex-1 space-y-2">
              <label className="text-xs font-medium text-slate-400">Date Range</label>
              <input type="date" className="w-full bg-[#0B1121] border border-white/10 rounded-md px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-[#1877F2]" />
            </div>
            <div className="w-full sm:flex-1 space-y-2">
              <label className="text-xs font-medium text-slate-400">Report Type</label>
              <select className="w-full bg-[#0B1121] border border-white/10 rounded-md px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-[#1877F2]">
                <option>Full Analytics Overview</option>
                <option>Audience Demographics</option>
                <option>Content Performance</option>
              </select>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button className="flex-1 sm:flex-none px-4 py-2 bg-[#1877F2] hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap">
                Export CSV
              </button>
              <button className="flex-1 sm:flex-none px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap">
                Generate PDF
              </button>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-slate-300">Recent Exports</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 bg-white/5 uppercase border-y border-white/5">
                  <tr>
                    <th className="px-6 py-4 font-medium">Report Name</th>
                    <th className="px-6 py-4 font-medium">Date Generated</th>
                    <th className="px-6 py-4 font-medium text-center">Format</th>
                    <th className="px-6 py-4 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.map((report, i) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-200">{report.report}</td>
                      <td className="px-6 py-4 text-slate-400">{report.date}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2 py-1 bg-white/10 text-xs rounded font-medium">{report.type}</span>
                      </td>
                      <td className="px-6 py-4 text-right text-emerald-400 font-medium">{report.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}