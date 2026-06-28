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


export function FacebookAds({ data }) {
  if (!data) return <EmptyState title="Ad Campaigns" description="Connect your ad account to view active campaigns." icon={TrendingUp} />;

  // Calculate some average metrics from campaigns if needed, or use the top level metrics provided
  const kpis = [
    { label: "Total Spend", value: data.spend, change: 12.5, changeLabel: "vs last month", icon: TrendingUp, color: "bg-emerald-500/10 text-emerald-500" },
    { label: "Impressions", value: data.reach || "120K", change: 8.4, changeLabel: "vs last month", icon: Eye, color: "bg-blue-500/10 text-blue-500" },
    { label: "Link Clicks", value: data.clicks, change: 15.2, changeLabel: "vs last month", icon: Target, color: "bg-indigo-500/10 text-indigo-500" },
    { label: "Avg CPC", value: "$0.16", change: -4.2, changeLabel: "vs last month", icon: FileText, color: "bg-amber-500/10 text-amber-500" }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <KpiCard key={i} label={kpi.label} value={kpi.value} change={kpi.change} changeLabel={kpi.changeLabel} icon={kpi.icon} color={kpi.color} />
        ))}
      </div>

      <Card className="bg-[#161B22] border-white/5 text-white">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-200">Active Campaigns</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 bg-white/5 uppercase border-y border-white/5">
                <tr>
                  <th className="px-6 py-4 font-medium">Campaign Name</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Spend</th>
                  <th className="px-6 py-4 font-medium text-right">Impressions</th>
                  <th className="px-6 py-4 font-medium text-right">CTR</th>
                  <th className="px-6 py-4 font-medium text-right">CPC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.campaigns?.map((item, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-200 max-w-[200px] truncate" title={item.campaignName}>
                      {item.campaignName}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${item.status === 'Active' ? 'bg-emerald-500' : item.status === 'Paused' ? 'bg-amber-500' : 'bg-slate-500'}`} />
                        <span className="text-slate-300">{item.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-200 text-right">{item.spend}</td>
                    <td className="px-6 py-4 text-slate-200 text-right">{item.impressions}</td>
                    <td className="px-6 py-4 text-slate-200 text-right">{item.ctr}</td>
                    <td className="px-6 py-4 text-emerald-400 text-right">{item.cpc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}