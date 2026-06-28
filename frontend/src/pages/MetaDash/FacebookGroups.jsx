import { Activity, BarChart3, Bookmark, Calendar, ChevronDown, Eye, FileText, Heart, HelpCircle, History, MessageCircle, MoreVertical, Settings, Share2, Target, ThumbsUp, TrendingDown, TrendingUp, Users, Video } from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FB_BLUE = "#1877F2";
const PIE_COLORS = ["#1877F2", "#10b981", "#8b5cf6", "#64748b"];
import { EmptyState, KpiCard, DarkTooltip, FacebookDataTable, InstagramDataTable, ProgressBar } from './MetaSharedComponents';


export function FacebookGroups({ data }) {
  if (!data || data.length === 0) return <EmptyState title="No Linked Groups" description="Link a Facebook Group to your page to track member growth and community engagement." icon={Users} actionLabel="Link Group" />;

  const latest = data[data.length - 1];
  
  const kpis = [
    { label: "Total Members", value: "12.7K", change: 3.2, changeLabel: "vs last month", icon: Users, color: "bg-blue-500/10 text-blue-500" },
    { label: "Active Members", value: "5.8K", change: 12.5, changeLabel: "vs last month", icon: TrendingUp, color: "bg-emerald-500/10 text-emerald-500" },
    { label: "Group Posts", value: "190", change: -1.2, changeLabel: "vs last month", icon: FileText, color: "bg-indigo-500/10 text-indigo-500" },
  ];

  const recentPosts = [
    { author: "Rahul Verma", time: "2 hours ago", content: "Hey everyone! Does anyone have recommendations for a good video editor?", likes: 45, comments: 12 },
    { author: "Sneha Patel", time: "5 hours ago", content: "Just reached 10k followers! Thank you all for the support! 🎉", likes: 120, comments: 34 },
    { author: "Admin", time: "1 day ago", content: "Welcome to our new members! Please read the group rules pinned at the top.", likes: 210, comments: 8 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpis.map((kpi, i) => (
          <KpiCard key={i} label={kpi.label} value={kpi.value} change={kpi.change} changeLabel={kpi.changeLabel} icon={kpi.icon} color={kpi.color} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="bg-[#161B22] border-white/5 text-white xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-200">Member Growth Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip content={<DarkTooltip />} cursor={{ stroke: "#ffffff10" }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }} />
                  <Line type="monotone" dataKey="totalMembers" name="Total Members" stroke="#1877F2" strokeWidth={3} dot={{ r: 4, fill: "#1877F2" }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="activeMembers" name="Active Members" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: "#10b981" }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#161B22] border-white/5 text-white xl:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-200">Recent Group Posts</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-white/5">
              {recentPosts.map((post, i) => (
                <div key={i} className="p-4 hover:bg-white/[0.02] transition-colors space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-slate-200">{post.author}</span>
                    <span className="text-xs text-slate-400">{post.time}</span>
                  </div>
                  <p className="text-sm text-slate-400 line-clamp-2">{post.content}</p>
                  <div className="flex items-center gap-4 pt-1">
                    <span className="text-xs text-emerald-400 flex items-center gap-1"><ThumbsUp className="h-3 w-3" /> {post.likes}</span>
                    <span className="text-xs text-blue-400 flex items-center gap-1"><MessageCircle className="h-3 w-3" /> {post.comments}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}