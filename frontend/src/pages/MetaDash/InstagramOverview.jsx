import { Activity, BarChart3, Bookmark, Calendar, ChevronDown, Eye, FileText, Hash, Heart, HelpCircle, History, Image as ImageIcon, MessageCircle, PlaySquare, Settings, Target, ThumbsUp, TrendingDown, TrendingUp, Users, Video } from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const IG_PINK = "#E1306C";
const PIE_COLORS = ["#E1306C", "#8b5cf6", "#10b981", "#64748b"];
import { EmptyState, KpiCard, DarkTooltip, FacebookDataTable, InstagramDataTable, ProgressBar } from './MetaSharedComponents';


export function InstagramOverview({ data }) {
  const d = data || {};

  const kpiIcons = [Users, Eye, Eye, Heart, Eye, Bookmark];
  const kpiColors = [
    "bg-pink-500/10 text-pink-500",
    "bg-purple-500/10 text-purple-500",
    "bg-amber-500/10 text-amber-500",
    "bg-emerald-500/10 text-emerald-500",
    "bg-indigo-500/10 text-indigo-500",
    "bg-yellow-500/10 text-yellow-500"
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {(d?.kpis || []).map((k, i) => (
          <KpiCard key={i} {...k} icon={kpiIcons[i]} color={kpiColors[i]} />
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Row 1: Area Chart, Bar Chart, Gender+Countries Card */}
        <Card className="bg-[#161B22] border-white/5 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-200 flex items-center gap-1">Account Reach</CardTitle>
            <div className="text-xs text-slate-400 flex items-center gap-1 cursor-pointer border border-white/10 px-2 py-1 rounded">Last 7 days <ChevronDown className="h-3 w-3"/></div>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={d?.charts?.reachOverTime} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="igReach" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={IG_PINK} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={IG_PINK} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => v >= 1000 ? `${v/1000}K` : v} />
                  <Tooltip content={<DarkTooltip />} />
                  <Area type="monotone" dataKey="value" stroke={IG_PINK} strokeWidth={2} fill="url(#igReach)" dot={{ r: 3, fill: IG_PINK, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#161B22] border-white/5 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">Follower Growth</CardTitle>
            <div className="text-xs text-slate-400 flex items-center gap-1 cursor-pointer border border-white/10 px-2 py-1 rounded">Last 7 days <ChevronDown className="h-3 w-3"/></div>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={d?.charts?.followerGrowth} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip content={<DarkTooltip />} cursor={{ fill: "#ffffff05" }} />
                  <Bar dataKey="value" fill={IG_PINK} radius={[2, 2, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#161B22] border-white/5 text-white row-span-1">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-medium text-slate-200">Gender</CardTitle>
          </CardHeader>
          <CardContent className="pt-2 space-y-6">
            <div className="flex items-center">
              <div className="h-[120px] w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={d?.charts?.gender} cx="50%" cy="50%" innerRadius={35} outerRadius={50} paddingAngle={0} dataKey="value" stroke="#161B22" strokeWidth={3}>
                      {(d?.charts?.gender || []).map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<DarkTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 space-y-3">
                {(d?.charts?.gender || []).map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-slate-300">{s.name}</span>
                    </div>
                    <span className="text-slate-200 font-medium">{s.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-white/5 pt-4">
              <p className="text-xs text-slate-400 mb-3 font-medium">Top Countries</p>
              <div className="space-y-3">
                {(d?.charts?.topCountries || []).map((c, i) => (
                  <ProgressBar key={i} label={c.country} value={c.value} max={100} />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Row 2: Top Posts, Top Reels, Engagement Rate */}
        <Card className="bg-[#161B22] border-white/5 text-white flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">Top Posts</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-x-auto p-0 pb-4 px-4">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="text-[10px] uppercase text-slate-500 border-b border-white/5">
                <tr>
                  <th className="pb-3 font-medium">Post</th>
                  <th className="pb-3 font-medium text-center">Type</th>
                  <th className="pb-3 font-medium text-right">Reach</th>
                  <th className="pb-3 font-medium text-right">Likes</th>
                  <th className="pb-3 font-medium text-right">Comments</th>
                  <th className="pb-3 font-medium text-right">Saves</th>
                  <th className="pb-3 font-medium text-right">Engagement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(d?.tables?.topPosts || []).map((p, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt="" className="h-10 w-10 rounded object-cover" />
                        <div>
                          <p className="text-xs font-medium text-slate-200 truncate max-w-[200px]">{p.title}</p>
                          <p className="text-[10px] text-slate-500">{p.date}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <div className="inline-flex items-center justify-center p-1.5 rounded-lg bg-white/5">
                        {p.type === "Video" ? <PlaySquare className="h-3.5 w-3.5 text-slate-400" /> : <ImageIcon className="h-3.5 w-3.5 text-slate-400" />}
                      </div>
                    </td>
                    <td className="py-3 text-right text-xs text-slate-300">{p.reach}</td>
                    <td className="py-3 text-right text-xs text-slate-300">{p.likes}</td>
                    <td className="py-3 text-right text-xs text-slate-300">{p.comments}</td>
                    <td className="py-3 text-right text-xs text-slate-300">{p.saves}</td>
                    <td className="py-3 text-right text-xs text-emerald-400">{p.engagement}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 text-center">
              <button className="text-xs font-medium text-pink-500 hover:text-pink-400 transition-colors">View all posts</button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#161B22] border-white/5 text-white flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">Top Reels</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-x-auto p-0 pb-4 px-4">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="text-[10px] uppercase text-slate-500 border-b border-white/5">
                <tr>
                  <th className="pb-3 font-medium">Reel</th>
                  <th className="pb-3 font-medium text-right">Plays</th>
                  <th className="pb-3 font-medium text-right">Likes</th>
                  <th className="pb-3 font-medium text-right">Comments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(d?.tables?.topReels || []).map((v, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-9 rounded overflow-hidden">
                          <img src={v.image} alt="" className="h-full w-full object-cover" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <PlaySquare className="h-4 w-4 text-white drop-shadow" />
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-200 truncate max-w-[200px]">{v.title}</p>
                          <p className="text-[10px] text-slate-500">{v.date}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-right text-xs text-slate-300">{v.plays}</td>
                    <td className="py-3 text-right text-xs text-slate-300">{v.likes}</td>
                    <td className="py-3 text-right text-xs text-slate-300">{v.comments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 text-center">
              <button className="text-xs font-medium text-pink-500 hover:text-pink-400 transition-colors">View all reels</button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#161B22] border-white/5 text-white">
          <CardHeader className="pb-0 flex flex-row justify-between items-start">
            <div>
              <CardTitle className="text-sm font-medium text-slate-200">Engagement Rate</CardTitle>
              <div className="mt-2">
                <p className="text-2xl font-bold">{d?.charts?.engagementRate?.rate}</p>
                <div className="flex items-center gap-1 mt-1 text-emerald-400 text-xs font-medium">
                  <TrendingUp className="h-3 w-3" /> +{d?.charts?.engagementRate?.change}% <span className="text-slate-500 font-normal">vs previous 7 days</span>
                </div>
              </div>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-1 cursor-pointer border border-white/10 px-2 py-1 rounded">Last 7 days <ChevronDown className="h-3 w-3"/></div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[140px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={d?.charts?.engagementRate?.data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} dy={5} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip content={<DarkTooltip />} />
                  <Line type="monotone" dataKey="rate" name="Rate" stroke={IG_PINK} strokeWidth={2} dot={{ r: 3, fill: IG_PINK, strokeWidth: 0 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Shared Empty State Helper ──────────────────────────────────────────