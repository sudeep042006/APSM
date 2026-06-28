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


export function FacebookEngagement({ data }) {
  if (!data) return <EmptyState title="Not Enough Engagement" description="Your engagement metrics will appear here once your posts start receiving likes, comments, and shares." icon={Heart} />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard label="Total Likes" value={data.kpis.totalLikes} change={4.2} changeLabel="vs last month" icon={ThumbsUp} color="bg-blue-500/10 text-blue-500" />
        <KpiCard label="Total Comments" value={data.kpis.totalComments} change={-1.5} changeLabel="vs last month" icon={MessageCircle} color="bg-emerald-500/10 text-emerald-500" />
        <KpiCard label="Total Shares" value={data.kpis.totalShares} change={8.7} changeLabel="vs last month" icon={Share2} color="bg-indigo-500/10 text-indigo-500" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="bg-[#161B22] border-white/5 text-white xl:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-200">Engagement Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.engagementTrend} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fbEngTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1877F2" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#1877F2" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => v >= 1000 ? `${v/1000}K` : v} />
                  <Tooltip content={<DarkTooltip />} />
                  <Area type="monotone" dataKey="total" name="Total Engagement" stroke="#1877F2" strokeWidth={2} fill="url(#fbEngTrend)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#161B22] border-white/5 text-white xl:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-200">Reaction Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.reactionTypes} layout="vertical" margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" horizontal={false} />
                  <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => v >= 1000 ? `${v/1000}K` : v} />
                  <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} width={60} />
                  <Tooltip content={<DarkTooltip />} cursor={{ fill: "#ffffff05" }} />
                  <Bar dataKey="value" name="Count" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20}>
                    {data.reactionTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}