// ── Facebook Engagement Page ──────────────────────────────────────────────────
// Fetches data via fbapi.getEngagementMetrics() on mount.
// Shows KPI cards, 6-month engagement AreaChart, reaction types breakdown.

import { useState, useEffect, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import fbapi from "@/services/fbapi";
import { KpiCard } from "./MetaSharedComponents";
import { ThumbsUp, MessageCircle, Share2, TrendingDown, Activity } from "lucide-react";
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

const fmt = (n) =>
  n == null ? "—" : new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);

// ── Glassmorphism Tooltip ─────────────────────────────────────────────────────
const GlassTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#161B22]/95 border border-white/10 backdrop-blur-md rounded-lg px-3 py-2.5 shadow-xl text-xs min-w-[140px]">
      <p className="font-semibold text-white mb-1.5 border-b border-white/10 pb-1">{label}</p>
      {payload.map((e, i) => (
        <div key={i} className="flex items-center justify-between gap-3 py-0.5">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: e.color }} />
            <span className="text-slate-400">{e.name}</span>
          </span>
          <span className="font-bold text-white">{fmt(e.value)}</span>
        </div>
      ))}
    </div>
  );
};

// ── Safe domain for YAxis ─────────────────────────────────────────────────────
const safeDomain = ([, dataMax]) => {
  const max = isNaN(dataMax) || !isFinite(dataMax) || dataMax <= 0 ? 2 : dataMax;
  return [0, Math.ceil(max * 1.25)];
};

// ── Format date for X-axis (short: "Jul 23") ─────────────────────────────────
const fmtXDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      month: "short", day: "numeric",
    });
  } catch {
    return dateStr;
  }
};

// ── Format date range for badge ───────────────────────────────────────────────
const fmtRange = (dateRange) => {
  if (!dateRange?.start || !dateRange?.end) return "Last 6 months";
  const opts = { month: "short", year: "numeric" };
  const s = new Date(dateRange.start + "T00:00:00").toLocaleDateString("en-US", opts);
  const e = new Date(dateRange.end + "T00:00:00").toLocaleDateString("en-US", opts);
  return `${s} – ${e}`;
};

const FacebookEngagement = () => {
  const { isConnected } = useOutletContext();
  const [data, setData]         = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const result = await fbapi.getEngagementMetrics(6); // 6 months
        if (mounted) setData(result);
      } catch (e) {
        if (mounted) setError("Could not load engagement data.");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  if (error) return (
    <div className="p-6 flex items-center justify-center min-h-[50vh]">
      <div className="text-center space-y-3">
        <TrendingDown className="h-10 w-10 text-red-400 mx-auto" />
        <p className="text-sm text-gray-400">{error}</p>
        <Button onClick={() => window.location.reload()} className="bg-[#1877F2] hover:bg-[#1877F2]/90 text-white text-xs">
          Retry
        </Button>
      </div>
    </div>
  );

  // ── Derived stats ──────────────────────────────────────────────────────────
  const trend = data?.engagementTrend || [];
  const totalEngagement = trend.reduce((a, b) => a + (b.total || 0), 0);
  const peakDay         = trend.length > 0 ? trend.reduce((best, d) => (d.total > best.total ? d : best), trend[0]) : null;
  const avgPerDay       = trend.length > 0 ? (totalEngagement / trend.length) : 0;

  // ── Thin out X-axis ticks for 6-month range (show ~8 ticks max) ───────────
  const tickInterval = trend.length > 60 ? Math.floor(trend.length / 8) : trend.length > 20 ? Math.floor(trend.length / 6) : 0;

  // ── KPI definitions ────────────────────────────────────────────────────────
  const kpis = [
    { label: "Total Likes",    value: data?.kpis?.totalLikes,    icon: ThumbsUp     },
    { label: "Total Comments", value: data?.kpis?.totalComments, icon: MessageCircle },
    { label: "Total Shares",   value: data?.kpis?.totalShares,   icon: Share2       },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">

      {/* ── KPI Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpis.map((k, i) => (
          isLoading ? (
            <Card key={i} className="bg-[#10141D] border border-white/[0.06] rounded-xl p-5 shadow-none">
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-3 w-20 bg-gray-700/50" />
                <Skeleton className="h-7 w-7 rounded-md bg-gray-700/50" />
              </div>
              <Skeleton className="h-7 w-24 bg-gray-700/50 mt-1" />
              <Skeleton className="h-4 w-16 bg-gray-700/50 mt-2" />
            </Card>
          ) : (
            <KpiCard key={i} title={k.label} value={fmt(k.value)} icon={k.icon} showActive={true} />
          )
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* ── Engagement Trend AreaChart (6 months) ──────────────────────── */}
        <Card className="bg-[#10141D] rounded-xl border border-white/[0.06] flex flex-col min-h-[460px]">
          <CardHeader className="p-5 pb-0 flex flex-row items-start justify-between gap-2">
            <div>
              <CardTitle className="text-sm font-semibold text-white">Engagement Trend</CardTitle>
              <p className="text-[10px] text-slate-500 mt-0.5">Likes · Comments · Shares over time</p>
            </div>
            <div className="shrink-0 bg-white/5 border border-white/10 text-slate-300 text-[10px] font-semibold px-2.5 py-1 rounded-md whitespace-nowrap">
              {isLoading ? "Loading…" : fmtRange(data?.dateRange)}
            </div>
          </CardHeader>

          <CardContent className="p-5 pt-4 flex-1 flex flex-col">
            {isLoading || !data ? (
              <Skeleton className="w-full h-full bg-gray-700/30 rounded-xl" />
            ) : (
              <>
                {/* ── Stats badges ─────────────────────────────────────── */}
                <div className="flex flex-wrap gap-2 mb-5">
                  <div className="bg-white/[0.02] border border-white/5 px-3 py-1.5 rounded-lg flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Peak</span>
                    <span className="text-sm font-bold text-white">
                      {peakDay ? `${fmt(peakDay.total)} on ${fmtXDate(peakDay.date)}` : "—"}
                    </span>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 px-3 py-1.5 rounded-lg flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Total</span>
                    <span className="text-sm font-bold text-white">{fmt(totalEngagement)}</span>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 px-3 py-1.5 rounded-lg flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Avg/Day</span>
                    <span className="text-sm font-bold text-white">{avgPerDay.toFixed(1)}</span>
                  </div>
                </div>

                {/* ── Chart ────────────────────────────────────────────── */}
                <div className="flex-1 min-h-[260px]">
                  {trend.length === 0 || (trend.length === 1 && trend[0].total === 0) ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
                      <div className="mb-3 p-3 rounded-full bg-white/5 border border-white/10">
                        <Activity className="h-6 w-6 opacity-40" />
                      </div>
                      <p className="text-sm font-medium text-slate-400">No engagement data for this period</p>
                      <p className="text-xs text-slate-600 mt-1">Post content to start generating engagement trends</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trend} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="engLikesGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.18} />
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}    />
                          </linearGradient>
                          <linearGradient id="engCmtGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}    />
                          </linearGradient>
                          <linearGradient id="engShrGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#10B981" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0}    />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#ffffff0d" strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="date"
                          tickFormatter={fmtXDate}
                          stroke="#4b5563"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                          dy={8}
                          interval={tickInterval}
                        />
                        <YAxis
                          stroke="#4b5563"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={fmt}
                          allowDecimals={false}
                          domain={safeDomain}
                        />
                        <Tooltip content={<GlassTooltip />} cursor={{ stroke: "#ffffff15", strokeWidth: 1, strokeDasharray: "4 4" }} />
                        <Legend
                          iconType="circle"
                          iconSize={7}
                          wrapperStyle={{ paddingTop: "14px", fontSize: "11px", color: "#94a3b8" }}
                        />
                        <Area
                          type="monotone"
                          dataKey="likes"
                          name="Likes"
                          stroke="#3B82F6"
                          strokeWidth={2}
                          fill="url(#engLikesGrad)"
                          activeDot={{ r: 5, strokeWidth: 0, fill: "#3B82F6" }}
                          dot={false}
                        />
                        <Area
                          type="monotone"
                          dataKey="comments"
                          name="Comments"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          fill="url(#engCmtGrad)"
                          activeDot={{ r: 5, strokeWidth: 0, fill: "#f59e0b" }}
                          dot={false}
                        />
                        <Area
                          type="monotone"
                          dataKey="shares"
                          name="Shares"
                          stroke="#10B981"
                          strokeWidth={2}
                          fill="url(#engShrGrad)"
                          activeDot={{ r: 5, strokeWidth: 0, fill: "#10B981" }}
                          dot={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* ── Reaction Types Breakdown ─────────────────────────────────────── */}
        <Card className="bg-[#10141D] rounded-xl border border-white/[0.06] flex flex-col min-h-[460px]">
          <CardHeader className="p-5 pb-2">
            <CardTitle className="text-sm font-semibold text-white">Reaction Types</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-2 flex-1 flex flex-col">
            {isLoading || !data ? (
              <Skeleton className="w-full h-full bg-gray-700/30 rounded-xl" />
            ) : (() => {
              const allReactions = [
                { id: "likes",   name: "Likes",   color: "#1877F2", icon: "👍" },
                { id: "love",    name: "Love",     color: "#ec4899", icon: "❤️" },
                { id: "care",    name: "Care",     color: "#f59e0b", icon: "🥰" },
                { id: "haha",    name: "Haha",     color: "#eab308", icon: "😂" },
                { id: "wow",     name: "Wow",      color: "#a855f7", icon: "😮" },
                { id: "sad",     name: "Sad",      color: "#64748b", icon: "😢" },
                { id: "angry",   name: "Angry",    color: "#ef4444", icon: "😡" },
              ];

              const rawReactions = data?.reactionTypes || [];
              const reactionsData = allReactions.map(r => {
                const found = rawReactions.find(d => d.name.toLowerCase() === r.name.toLowerCase());
                return { ...r, count: found ? found.value : 0 };
              });

              const totalReactions = reactionsData.reduce((acc, r) => acc + r.count, 0);
              const dominant = [...reactionsData].sort((a, b) => b.count - a.count)[0];

              return (
                <div className="flex flex-col h-full">
                  <div className="space-y-3.5 flex-1">
                    {reactionsData.map((reaction) => {
                      const percent = totalReactions > 0 ? Math.round((reaction.count / totalReactions) * 100) : 0;
                      return (
                        <div key={reaction.id} className="flex items-center gap-3">
                          <span className="text-base w-6 text-center">{reaction.icon}</span>
                          <span className="text-[11px] text-slate-300 w-14">{reaction.name}</span>
                          <div className="flex-1 h-2 bg-white/[0.03] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${percent}%`, backgroundColor: reaction.color }}
                            />
                          </div>
                          <span className="text-[11px] text-slate-400 w-20 text-right font-medium">
                            {reaction.count} <span className="opacity-60">({percent}%)</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/[0.06] bg-white/[0.01] -mx-5 px-5 -mb-5 pb-5 rounded-b-xl flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Dominant Sentiment</span>
                    <span className="text-xs text-white font-semibold flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                      {dominant.icon} {dominant.name} ({totalReactions > 0 ? Math.round((dominant.count / totalReactions) * 100) : 0}%)
                    </span>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FacebookEngagement;