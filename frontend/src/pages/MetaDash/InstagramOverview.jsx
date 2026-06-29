// ── Instagram Overview Page ──────────────────────────────────────────
// Main overview dashboard for the Instagram analytics shell.
// Uses DashboardShared primitives (KPI cards, chart containers, empty
// states) extracted from the YouTube design system — ensuring visual
// consistency across all platforms. Only accent color differs (pink).

import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import {
  Users, Eye, Heart, Bookmark, Activity,
  TrendingUp, BarChart3, Globe, MapPin, PlaySquare,
} from "lucide-react";
import {
  DashKpiCard, DashChartCard, DashCustomTooltip,
  DashEmptyState, DashOverviewSkeleton,
} from "@/components/ui/DashboardShared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ── Instagram brand pink ─────────────────────────────────────────────
const IG_PINK    = "#E1306C";
const PIE_COLORS = ["#E1306C", "#8b5cf6", "#10b981", "#64748b", "#f59e0b", "#06b6d4"];

// ── KPI metadata (icons + colors) ────────────────────────────────────
const KPI_META = [
  { icon: Users,    color: "text-pink-400",   bg: "bg-pink-500/10"   },
  { icon: Eye,      color: "text-purple-400", bg: "bg-purple-500/10" },
  { icon: Globe,    color: "text-amber-400",  bg: "bg-amber-500/10"  },
  { icon: Heart,    color: "text-emerald-400",bg: "bg-emerald-500/10"},
  { icon: Bookmark, color: "text-indigo-400", bg: "bg-indigo-500/10" },
  { icon: Activity, color: "text-yellow-400", bg: "bg-yellow-500/10" },
];

export function InstagramOverview({ data, loading }) {
  // ── Loading state: YT-identical skeleton ─────────────────────────────
  if (loading) return <DashOverviewSkeleton />;

  // ── Empty state: YT-identical pattern ────────────────────────────────
  if (!data) {
    return (
      <DashEmptyState
        title="Not enough data available yet"
        description="Your Instagram analytics will appear here once we have enough data. This usually takes a few hours after connecting your Business Account."
        icon={BarChart3}
        iconBg="bg-pink-500/10"
        iconColor="text-pink-400"
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

        {/* Account Reach — Area chart with IG pink gradient */}
        <DashChartCard
          title="Account Reach"
          titleIcon={Eye}
          iconColor="text-pink-400"
        >
          {(d?.charts?.reachOverTime?.length || 0) > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={d.charts.reachOverTime}>
                <defs>
                  {/* IG pink gradient fill — mirrors YT red gradient */}
                  <linearGradient id="igReachGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={IG_PINK} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={IG_PINK} stopOpacity={0}   />
                  </linearGradient>
                </defs>
                {/* YT grid/axis style: stroke=#ffffff10, fontSize=10, no ticks/lines */}
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" tickLine={false} axisLine={false} fontSize={10} interval="preserveStartEnd" />
                <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} fontSize={10} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
                <Tooltip content={<DashCustomTooltip />} />
                <Area type="monotone" dataKey="value" name="Reach" stroke={IG_PINK} fill="url(#igReachGrad)" strokeWidth={2} />
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
                <Bar dataKey="value" name="Engagements" fill={IG_PINK} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[280px] items-center justify-center text-sm text-slate-400">
              No engagement data available for this date range
            </div>
          )}
        </DashChartCard>
      </div>

      {/* ── Charts Row 2: Reach by Source + Audience Demographics ─────── */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Reach by Source — Donut chart */}
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

        {/* Top Countries — progress bar list (YT audience style) */}
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
                      {/* Gradient bar — IG pink to purple */}
                      <div className="h-1.5 w-full rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-700"
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

      {/* ── Audience Age/Gender + Top Posts/Reels ────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Age & Gender breakdown — Pie donut */}
        <DashChartCard title="Audience Demographics" titleIcon={Users} iconColor="text-pink-400">
          {(d?.charts?.audience?.ageGender?.length || 0) > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={d.charts.audience.ageGender}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="group"
                >
                  {d.charts.audience.ageGender.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<DashCustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", color: "#94a3b8" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[280px] items-center justify-center text-sm text-slate-400">
              No audience data available yet
            </div>
          )}
        </DashChartCard>

        {/* Top Posts + Reels */}
        <Card className="bg-[#161B22] border border-white/5 rounded-xl shadow-sm">
          <CardHeader className="pb-2 p-5">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <PlaySquare className="h-4 w-4 text-pink-400" />
              Top Content
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {(d?.tables?.topPosts?.length || 0) > 0 ? (
              <div className="space-y-3">
                {[...(d.tables.topPosts || []), ...(d.tables.topReels || [])].slice(0, 5).map((p, i) => (
                  <div key={i} className="flex items-center gap-4 rounded-lg p-2 hover:bg-white/5 transition-colors group">
                    <img src={p.image} alt={p.title} className="h-12 w-20 rounded-lg object-cover ring-1 ring-white/10 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.title}</p>
                      <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{(p.reach || p.plays || 0).toLocaleString()}</span>
                        <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{(p.likes || 0).toLocaleString()}</span>
                        <span className="hidden sm:inline">{p.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-40 items-center justify-center text-sm text-slate-400">
                No content data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Engagement Rate Sparkline ─────────────────────────────────── */}
      {d?.charts?.engagementRate?.data?.length > 0 && (
        <DashChartCard title="Engagement Rate Trend" titleIcon={TrendingUp} iconColor="text-violet-400">
          <div className="mb-3 flex items-center gap-4">
            <p className="text-2xl font-bold tracking-tight">{d.charts.engagementRate.rate || "N/A"}</p>
            {d.charts.engagementRate.change > 0 && (
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-xs font-medium text-emerald-400">
                  +{d.charts.engagementRate.change}% vs previous period
                </span>
              </div>
            )}
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={d.charts.engagementRate.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" tickLine={false} axisLine={false} fontSize={10} interval="preserveStartEnd" />
              <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} fontSize={10} tickFormatter={v => `${v}%`} />
              <Tooltip content={<DashCustomTooltip />} />
              <Line type="monotone" dataKey="rate" name="Rate %" stroke={IG_PINK} strokeWidth={2} dot={{ r: 3, fill: IG_PINK, strokeWidth: 0 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </DashChartCard>
      )}
    </div>
  );
}