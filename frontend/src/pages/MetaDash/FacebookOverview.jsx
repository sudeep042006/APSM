// ── Facebook Overview Page ───────────────────────────────────────────
// Main overview dashboard for the Facebook analytics shell.
// Uses DashboardShared primitives (KPI cards, chart containers, empty
// states) extracted from the YouTube design system — ensuring visual
// consistency across all platforms. Only accent color differs (blue).

import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import {
  Users, Eye, Heart, ThumbsUp, MessageCircle, Share2, Activity,
  TrendingUp, BarChart3, Globe, MapPin, PlaySquare,
} from "lucide-react";
import {
  DashKpiCard, DashChartCard, DashCustomTooltip,
  DashEmptyState, DashOverviewSkeleton,
} from "@/components/ui/DashboardShared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ── Facebook brand blue ───────────────────────────────────────────────
const FB_BLUE    = "#1877F2";
const FB_FILL    = "#1877F220";
const PIE_COLORS = ["#1877F2", "#10b981", "#8b5cf6", "#64748b"];

// ── KPI metadata (icons + colors) ────────────────────────────────────
const KPI_META = [
  { icon: Users,       color: "text-blue-400",    bg: "bg-blue-500/10"   },
  { icon: Eye,         color: "text-indigo-400",  bg: "bg-indigo-500/10" },
  { icon: Heart,       color: "text-emerald-400", bg: "bg-emerald-500/10"},
  { icon: ThumbsUp,    color: "text-amber-400",   bg: "bg-amber-500/10"  },
  { icon: MessageCircle,color:"text-blue-300",    bg: "bg-blue-400/10"   },
  { icon: Share2,      color: "text-rose-400",    bg: "bg-rose-500/10"   },
];

export function FacebookOverview({ data, loading }) {
  // ── Loading state: YT-identical skeleton ─────────────────────────────
  if (loading) return <DashOverviewSkeleton />;

  // ── Empty state: YT-identical pattern ────────────────────────────────
  if (!data) {
    return (
      <DashEmptyState
        title="Not enough data available yet"
        description="Your Facebook analytics will appear here once we have enough data. This usually takes a few hours after connecting your Page."
        icon={BarChart3}
        iconBg="bg-blue-500/10"
        iconColor="text-blue-400"
      />
    );
  }

  const d = data;

  if (d?.charts?.reachOverTime?.length === 0) {
    return <div className="text-center p-10 text-slate-400">Data is unavailable for this date range.</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── KPI Cards — YT primary card layout ───────────────────────── */}
      {/* Left: uppercase label + large bold value. Right: rounded-xl icon. */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {(d?.kpis || []).map((k, i) => {
          const meta = KPI_META[i] || {};
          return (
            <DashKpiCard
              key={i}
              title={k.title || k.label}
              value={k.value}
              icon={meta.icon}
              color={meta.color}
              bg={meta.bg}
              trend={(k.value || 0) > 0}
            />
          );
        })}
      </div>

      {/* ── Charts Row 1: Reach Area + Engagements Bar ───────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Reach Over Time — Area chart with FB blue gradient */}
        <DashChartCard
          title="Reach Over Time"
          titleIcon={Eye}
          iconColor="text-blue-400"
        >
          {(d?.charts?.reachOverTime?.length || 0) > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={d.charts.reachOverTime}>
                <defs>
                  {/* FB blue gradient fill — mirrors YT red gradient */}
                  <linearGradient id="fbReachGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={FB_BLUE} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={FB_BLUE} stopOpacity={0}   />
                  </linearGradient>
                </defs>
                {/* YT grid/axis style: stroke=#ffffff10, fontSize=10, no ticks/lines */}
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" tickLine={false} axisLine={false} fontSize={10} interval="preserveStartEnd" />
                <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} fontSize={10} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
                <Tooltip content={<DashCustomTooltip />} />
                <Area type="monotone" dataKey="value" name="Reach" stroke={FB_BLUE} fill="url(#fbReachGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[280px] items-center justify-center text-sm text-slate-400">
              No reach data available for this date range
            </div>
          )}
        </DashChartCard>

        {/* Engagements Over Time — Bar chart */}
        <DashChartCard
          title="Engagements Over Time"
          titleIcon={Activity}
          iconColor="text-emerald-400"
        >
          {(d?.charts?.engagementsOverTime?.length || 0) > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={d.charts.engagementsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" tickLine={false} axisLine={false} fontSize={10} interval="preserveStartEnd" />
                <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} fontSize={10} />
                <Tooltip content={<DashCustomTooltip />} cursor={{ fill: "#ffffff05" }} />
                <Bar dataKey="value" name="Engagements" fill={FB_BLUE} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[280px] items-center justify-center text-sm text-slate-400">
              No engagement data available for this date range
            </div>
          )}
        </DashChartCard>
      </div>

      {/* ── Charts Row 2: Reach by Source + Audience ─────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Reach by Source — Donut chart matching YT device chart style */}
        <DashChartCard title="Reach by Source" titleIcon={Globe} iconColor="text-cyan-400">
          {(d?.charts?.reachBySource?.length || 0) > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={d.charts.reachBySource}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                >
                  {d.charts.reachBySource.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<DashCustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", color: "#94a3b8" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[280px] items-center justify-center text-sm text-slate-400">
              No reach source data available yet
            </div>
          )}
        </DashChartCard>

        {/* Top Countries — progress bar list matching YT audience style */}
        <DashChartCard title="Top Countries" titleIcon={MapPin} iconColor="text-cyan-400">
          {(d?.charts?.audience?.topCountries?.length || 0) > 0 ? (
            <div className="space-y-3">
              {(d.charts.audience.topCountries || []).map((c, i) => {
                const maxVal = d.charts.audience.topCountries[0]?.value || 1;
                const pct    = Math.round((c.value / maxVal) * 100);
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-5 text-xs font-bold text-slate-400">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium flex items-center gap-1.5">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          {c.country}
                        </span>
                        <span className="text-xs text-slate-400">{c.value}%</span>
                      </div>
                      {/* Progress bar — gradient matches YT top countries */}
                      <div className="h-1.5 w-full rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex h-[280px] items-center justify-center text-sm text-slate-400">
              No geographic data available yet
            </div>
          )}
        </DashChartCard>
      </div>

      {/* ── Engagement Rate Sparkline + Top Posts Table ───────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Engagement Rate sparkline */}
        <DashChartCard title="Engagement Rate" titleIcon={TrendingUp} iconColor="text-violet-400">
          <div className="mb-4">
            <p className="text-2xl font-bold tracking-tight">{d?.charts?.engagementRate?.rate || "N/A"}</p>
            {d?.charts?.engagementRate?.change > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-xs font-medium text-emerald-400">
                  +{d.charts.engagementRate.change}% vs previous period
                </span>
              </div>
            )}
          </div>
          {(d?.charts?.engagementRate?.data?.length || 0) > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={d.charts.engagementRate.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" tickLine={false} axisLine={false} fontSize={10} interval="preserveStartEnd" />
                <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} fontSize={10} tickFormatter={v => `${v}%`} />
                <Tooltip content={<DashCustomTooltip />} />
                <Line type="monotone" dataKey="rate" name="Rate %" stroke={FB_BLUE} strokeWidth={2} dot={{ r: 3, fill: FB_BLUE, strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[160px] items-center justify-center text-sm text-slate-400">
              No engagement rate data available yet
            </div>
          )}
        </DashChartCard>

        {/* Top Posts table */}
        <Card className="bg-[#161B22] border border-white/5 rounded-xl shadow-sm">
          <CardHeader className="pb-2 p-5">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <PlaySquare className="h-4 w-4 text-blue-400" />
              Top Posts
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {(d?.tables?.topPosts?.length || 0) > 0 ? (
              <div className="space-y-3">
                {d.tables.topPosts.map((p, i) => (
                  <div key={i} className="flex items-center gap-4 rounded-lg p-2 hover:bg-white/5 transition-colors">
                    <img src={p.image} alt={p.title} className="h-12 w-20 rounded-lg object-cover ring-1 ring-white/10 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.title}</p>
                      <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{(p.reach || 0).toLocaleString()}</span>
                        <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{(p.reactions || 0).toLocaleString()}</span>
                        <span className="hidden sm:inline">{p.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-40 items-center justify-center text-sm text-slate-400">
                No post data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}