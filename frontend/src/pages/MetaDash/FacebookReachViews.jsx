import { Activity, BarChart3, Bookmark, Calendar, ChevronDown, Eye, FileText, Heart, HelpCircle, History, MessageCircle, MoreVertical, Settings, Share2, Target, ThumbsUp, TrendingDown, TrendingUp, Users, Video } from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FB_BLUE = "#1877F2";
const PIE_COLORS = ["#1877F2", "#10b981", "#8b5cf6", "#64748b"];
import { EmptyState, KpiCard, DarkTooltip, FacebookDataTable, InstagramDataTable, ProgressBar } from './MetaSharedComponents';


export function FacebookReachViews({ data }) {
  if (!data || data.length === 0) return <EmptyState title="Reach & Views Metrics" description="Analyze your organic vs paid reach and identify trends in your page viewership." icon={Eye} />;

  const kpis = [
    { label: "Total Reach", value: "155.6K", change: 12.5, changeLabel: "vs last month", icon: Users, color: "bg-blue-500/10 text-blue-500" },
    { label: "Organic Reach", value: "112.4K", change: 8.4, changeLabel: "vs last month", icon: TrendingUp, color: "bg-emerald-500/10 text-emerald-500" },
    { label: "Total Video Views", value: "88.2K", change: 15.2, changeLabel: "vs last month", icon: Eye, color: "bg-indigo-500/10 text-indigo-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpis.map((kpi, i) => (
          <KpiCard key={i} label={kpi.label} value={kpi.value} change={kpi.change} changeLabel={kpi.changeLabel} icon={kpi.icon} color={kpi.color} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="bg-[#161B22] border-white/5 text-white xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-200">Reach Breakdown (Organic vs Paid)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip content={<DarkTooltip />} cursor={{ fill: "#ffffff05" }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }} />
                  <Bar dataKey="organicReach" name="Organic Reach" stackId="a" fill="#1877F2" radius={[0, 0, 0, 0]} barSize={20} />
                  <Bar dataKey="paidReach" name="Paid Reach" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#161B22] border-white/5 text-white xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-200">Video Views (3-Second vs 1-Minute)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="color3s" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="color1m" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1877F2" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#1877F2" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip content={<DarkTooltip />} cursor={{ stroke: "#ffffff10" }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }} />
                  <Area type="monotone" dataKey="threeSecondViews" name="3-Second Views" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#color3s)" />
                  <Area type="monotone" dataKey="oneMinuteViews" name="1-Minute Views" stroke="#1877F2" strokeWidth={2} fillOpacity={1} fill="url(#color1m)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}