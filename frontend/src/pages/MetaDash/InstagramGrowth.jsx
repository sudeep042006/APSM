import { Activity, BarChart3, Bookmark, Calendar, ChevronDown, Eye, FileText, Hash, Heart, HelpCircle, History, Image as ImageIcon, MessageCircle, PlaySquare, Settings, Target, ThumbsUp, TrendingDown, TrendingUp, Users, Video } from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const IG_PINK = "#E1306C";
const PIE_COLORS = ["#E1306C", "#8b5cf6", "#10b981", "#64748b"];
import { EmptyState, KpiCard, DarkTooltip, FacebookDataTable, InstagramDataTable, ProgressBar } from './MetaSharedComponents';


export function InstagramGrowth({ data }) {
  if (!data) return <EmptyState title="Growth Dashboard" description="Track your net follower growth and analyze peaks in unfollows over time." icon={TrendingUp} />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard label="Total Gained" value={data.gained} change={12.5} changeLabel="vs last month" icon={TrendingUp} color="bg-emerald-500/10 text-emerald-500" />
        <KpiCard label="Total Lost" value={data.lost} change={-2.4} changeLabel="vs last month" icon={TrendingDown} color="bg-red-500/10 text-red-500" />
        <KpiCard label="Net Growth" value={data.net} change={8.4} changeLabel="vs last month" icon={Users} color="bg-indigo-500/10 text-indigo-500" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="bg-[#161B22] border-white/5 text-white xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-200">Net Follower Growth (30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.followerGrowthTimeline} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="igGrowthTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip content={<DarkTooltip />} cursor={{ stroke: "#ffffff10" }} />
                  <Area type="monotone" dataKey="gained" stroke="#10b981" strokeWidth={3} fill="url(#igGrowthTrend)" name="Gained" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#161B22] border-white/5 text-white xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-200">Follower Breakdown (Gained vs Lost)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.followerGrowthTimeline} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip content={<DarkTooltip />} cursor={{ fill: "#ffffff05" }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }} />
                  <Bar dataKey="gained" name="Followers Gained" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="lost" name="Followers Lost" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}