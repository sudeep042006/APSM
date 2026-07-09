// ── Facebook Engagement Page ──────────────────────────────────────────────────
// Fetches data independently via fbapi.getEngagementMetrics() on mount.
// Shows KPI cards, engagement trend AreaChart, reaction types horizontal BarChart.

import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import fbapi from "@/services/fbapi";
import { ThumbsUp, MessageCircle, Share2, Heart, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";

const FB_BLUE = "#1877F2";
const REACTION_COLORS = ["#1877F2", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899"];
const fmt = (n) => n == null ? "—" : new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);

const GlassTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ backgroundColor: "rgba(22,27,34,0.85)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} className="px-3 py-2.5 text-xs">
      <p className="font-semibold text-white mb-1">{label}</p>
      {payload.map((e, i) => <p key={i} className="text-gray-300">{e.name}: <span className="font-bold text-white">{fmt(e.value)}</span></p>)}
    </div>
  );
};

const FacebookEngagement = () => {
  const { isConnected } = useOutletContext();
  const [data, setData]     = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]   = useState(null);

  // ── Fetch engagement metrics independently on mount ───────────────────────
  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        const result = await fbapi.getEngagementMetrics();
        if (mounted) setData(result);
      } catch (e) {
        if (mounted) setError("Could not load engagement data.");
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

  // ── KPI definitions ────────────────────────────────────────────────────────
  const kpis = [
    { label: "Total Likes",    value: data?.kpis?.totalLikes,    change: 4.2,  icon: ThumbsUp,       color: "bg-blue-500/10 text-blue-400"    },
    { label: "Total Comments", value: data?.kpis?.totalComments, change: -1.5, icon: MessageCircle,  color: "bg-emerald-500/10 text-emerald-400" },
    { label: "Total Shares",   value: data?.kpis?.totalShares,   change: 8.7,  icon: Share2,         color: "bg-indigo-500/10 text-indigo-400"  },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">

      {/* ── KPI Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpis.map((k, i) => (
          <Card key={i} className="bg-[#161B22]/90 backdrop-blur-md rounded-xl border border-white/5 p-5">
            <CardContent className="p-0">
              {isLoading ? (
                <><Skeleton className="h-10 w-10 rounded-full bg-gray-700/50 mb-3" /><Skeleton className="h-3 w-20 bg-gray-700/50 mb-2" /><Skeleton className="h-8 w-24 bg-gray-700/50" /></>
              ) : (
                <>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${k.color} mb-3`}>
                    <k.icon className="h-5 w-5" />
                  </div>
                  <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">{k.label}</p>
                  <p className="text-3xl font-bold text-white mt-2">{fmt(k.value)}</p>
                  <div className={`text-xs font-medium flex items-center gap-0.5 mt-1 ${k.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {k.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {k.change >= 0 ? "+" : ""}{k.change}%
                    <span className="text-gray-500 font-normal ml-1">vs last month</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* ── Engagement Trend AreaChart ─────────────────────────────────── */}
        <Card className="bg-[#161B22]/90 backdrop-blur-md rounded-xl border border-white/5">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-white">Engagement Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {isLoading ? (
              <Skeleton className="w-full h-full bg-gray-700/30 rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.engagementTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fbEngGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={FB_BLUE} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={FB_BLUE} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} tickFormatter={fmt} />
                  <Tooltip content={<GlassTooltip />} />
                  <Area type="monotone" dataKey="total" name="Total Engagement" stroke={FB_BLUE} strokeWidth={2} fillOpacity={1} fill="url(#fbEngGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* ── Reaction Types Horizontal BarChart ────────────────────────── */}
        <Card className="bg-[#161B22]/90 backdrop-blur-md rounded-xl border border-white/5">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-white">Reaction Types</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {isLoading ? (
              <Skeleton className="w-full h-full bg-gray-700/30 rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.reactionTypes} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} tickFormatter={fmt} />
                  <YAxis type="category" dataKey="name" stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} width={55} />
                  <Tooltip content={<GlassTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Bar dataKey="value" name="Count" radius={[0, 4, 4, 0]} maxBarSize={22}>
                    {(data?.reactionTypes || []).map((_, i) => (
                      <Cell key={i} fill={REACTION_COLORS[i % REACTION_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FacebookEngagement;