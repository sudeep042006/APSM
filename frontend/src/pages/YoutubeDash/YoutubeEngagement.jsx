// ── YouTube Engagement Page ─────────────────────────────────────────
// Engagement analytics: totals, per-day trends, derived engagement quality
// metrics and per-video performance.
//
// All figures are derived from the live YouTube Reporting API snapshot.
// Derived rates (engagement rate, likes per 1K views) are computed from
// measured numerators and denominators — never assumed.

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import {
  ThumbsUp,
  MessageSquare,
  Share2,
  Clock,
  Eye,
  Play,
  TrendingUp,
  Activity,
  Timer,
  Heart,
} from "lucide-react";
import ChartCard from "@/components/charts/ChartCard";
import ChartTooltip from "@/components/charts/ChartTooltip";
import TimeSeriesChart from "@/components/charts/TimeSeriesChart";
import TopList from "@/components/charts/TopList";
import {
  CHART_COLORS,
  CURSOR,
  GRID_PROPS,
  axisX,
  axisY,
  compact,
  niceDomain,
} from "@/components/charts/chartTheme";
import {
  parseCoreMetrics,
  parseDailyAnalytics,
  parseRecentVideos,
  parseEffectiveRange,
  parseReportHealth,
  formatCompactNumber,
  formatWatchTime,
  formatRelativeTime,
} from "@/services/ytapi";

const formatSeconds = (s) => {
  const total = Number(s) || 0;
  if (total <= 0) return "0:00";
  const m = Math.floor(total / 60);
  const sec = Math.round(total % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
};

// ── Skeleton loading state ──────────────────────────────────────────
function EngagementSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="surface-card">
            <CardContent className="p-5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-3 h-7 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i} className="surface-card">
            <CardHeader>
              <Skeleton className="h-5 w-36" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[280px] w-full rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Empty state ─────────────────────────────────────────────────────
function EmptyEngagement() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center animate-fade-in">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 ring-1 ring-red-500/20">
          <Activity className="h-8 w-8 text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">No engagement data available</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          Engagement metrics come from the YouTube Reporting API daily report. Nothing can be shown
          until that report is available for a selected window.
        </p>
      </div>
    </div>
  );
}

// ── KPI tile ────────────────────────────────────────────────────────
function EngagementKpi({ title, value, icon: Icon, hint }) {
  return (
    <Card className="surface-card group p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">{title}</p>
          <p className="mt-2 text-[26px] font-bold leading-none tracking-tight text-white tabular-nums">
            {value}
          </p>
          {hint && <p className="mt-2 text-[10px] leading-relaxed text-slate-500">{hint}</p>}
        </div>
        {Icon && (
          <span className="rounded-lg bg-white/5 p-1.5 ring-1 ring-white/10 transition-colors group-hover:bg-white/10">
            <Icon className="h-3.5 w-3.5 text-slate-300" />
          </span>
        )}
      </div>
    </Card>
  );
}

// ── Main Engagement Component ───────────────────────────────────────
export default function YoutubeEngagement({ data, loading }) {
  if (loading) return <EngagementSkeleton />;
  if (!data) return <EmptyEngagement />;

  const metrics = parseCoreMetrics(data);
  const dailyData = parseDailyAnalytics(data);
  const recentVideos = parseRecentVideos(data);
  const range = parseEffectiveRange(data);
  const health = parseReportHealth(data);

  // Aggregate the measured daily rows.
  const totalLikes = dailyData.reduce((a, d) => a + (d.likes || 0), 0);
  const totalComments = dailyData.reduce((a, d) => a + (d.comments || 0), 0);
  const totalShares = dailyData.reduce((a, d) => a + (d.shares || 0), 0);
  const totalViews = dailyData.reduce((a, d) => a + (d.views || 0), 0);

  // YouTube reports a per-day AVERAGE duration. Averaging those averages
  // unweighted would let a 3-view day count as much as a 30,000-view day, so
  // the mean is weighted by that day's views.
  let weightedDuration = 0;
  let durationWeight = 0;
  for (const d of dailyData) {
    if (d.avgViewDuration > 0) {
      weightedDuration += d.avgViewDuration * (d.views || 0);
      durationWeight += d.views || 0;
    }
  }
  const avgViewDuration = durationWeight > 0 ? weightedDuration / durationWeight : 0;

  // Per-day derived quality series (measured numerator ÷ measured denominator).
  const qualityData = dailyData
    .map((d) => ({
      date: d.date,
      views: d.views,
      engagements: (d.likes || 0) + (d.comments || 0) + (d.shares || 0),
      engagementRate: d.views > 0 ? (((d.likes || 0) + (d.comments || 0) + (d.shares || 0)) / d.views) * 100 : 0,
      likesPer1k: d.views > 0 ? ((d.likes || 0) / d.views) * 1000 : 0,
      avgViewPercentage: d.avgViewPercentage,
    }))
    .filter((d) => d.views > 0);

  // Per-video engagement, computed from each video's own lifetime statistics.
  const videoPerformance = recentVideos
    .map((v) => {
      const engagements = (v.likeCount || 0) + (v.commentCount || 0);
      return {
        id: v.id,
        title: v.title,
        thumbnail: v.thumbnail,
        publishedAt: v.publishedAt,
        views: v.viewCount || 0,
        likes: v.likeCount || 0,
        comments: v.commentCount || 0,
        engagements,
        engagementRate: v.viewCount > 0 ? (engagements / v.viewCount) * 100 : 0,
        likesPer1k: v.viewCount > 0 ? ((v.likeCount || 0) / v.viewCount) * 1000 : 0,
      };
    })
    .filter((v) => v.views > 0)
    .sort((a, b) => b.engagements - a.engagements);

  const topEngagingVideos = videoPerformance.slice(0, 5);

  const rangeBadge = range ? (
    <span className="shrink-0 rounded-md bg-white/5 px-2 py-1 text-[10px] font-medium text-slate-400 ring-1 ring-white/10">
      {new Date(range.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} –{" "}
      {new Date(range.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
    </span>
  ) : null;

  const engagementKPIs = [
    {
      title: "Total Engagement",
      value: formatCompactNumber(metrics.totalEngagement),
      icon: Heart,
      hint: "Likes + comments + shares in window",
    },
    {
      title: "Watch Time",
      value: formatWatchTime(metrics.watchTimeMinutes),
      icon: Clock,
      hint: `${compact(Math.round(metrics.watchTimeMinutes))} minutes`,
    },
    {
      title: "Avg View Duration",
      value: formatSeconds(avgViewDuration),
      icon: Timer,
      hint: durationWeight > 0 ? "Weighted by daily views" : "No duration rows",
    },
    {
      title: "Engagement Rate",
      value: `${metrics.engagementRate.toFixed(2)}%`,
      icon: Activity,
      hint: "Engagements ÷ views",
    },
  ];

  const secondaryMetrics = [
    { title: "Likes", value: formatCompactNumber(totalLikes), icon: ThumbsUp },
    { title: "Comments", value: formatCompactNumber(totalComments), icon: MessageSquare },
    { title: "Shares", value: formatCompactNumber(totalShares), icon: Share2 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {engagementKPIs.map((kpi) => (
          <EngagementKpi key={kpi.title} {...kpi} />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {secondaryMetrics.map((m) => (
          <Card key={m.title} className="surface-card p-4">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-white/5 p-2 ring-1 ring-white/10">
                <m.icon className="h-4 w-4 text-slate-300" />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  {m.title}
                </p>
                <p className="text-lg font-bold text-white tabular-nums">{m.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TimeSeriesChart
          platform="youtube"
          title="Engagement Trends"
          subtitle="Daily likes, comments and shares — click a series to isolate it"
          icon={<TrendingUp className="h-4 w-4 text-emerald-400" />}
          data={dailyData}
          valueKeys={["likes", "comments", "shares"]}
          technical={health.daily.reason}
          height={280}
          initialType="line"
          series={[
            { key: "likes", name: "Likes", kind: "line", color: CHART_COLORS.primary },
            { key: "comments", name: "Comments", kind: "line", color: CHART_COLORS.warning },
            { key: "shares", name: "Shares", kind: "line", color: CHART_COLORS.success },
          ]}
          emptyMessages={{
            noDataTitle: "No engagement trend data",
            noDataDetail: "The daily report contains no likes, comments or shares rows for this window.",
          }}
        />

        <TimeSeriesChart
          platform="youtube"
          title="Engagement Quality"
          subtitle="Daily engagement rate — engagements as a share of views"
          icon={<Activity className="h-4 w-4 text-violet-400" />}
          data={qualityData}
          valueKeys={["engagementRate"]}
          technical={health.daily.reason}
          height={280}
          format="percent"
          showAverage
          series={[
            { key: "engagementRate", name: "Engagement rate", kind: "area", color: CHART_COLORS.tertiary },
          ]}
          emptyMessages={{
            noDataTitle: "No rate data",
            noDataDetail:
              "Engagement rate needs both views and engagements for the same day. At least one of those columns is missing for this window.",
          }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Watch Time"
          subtitle="Estimated minutes watched per day"
          icon={<Clock className="h-4 w-4 text-amber-400" />}
          badge={rangeBadge}
          data={dailyData}
          valueKeys="watchTime"
          technical={health.daily.reason}
          height={280}
          emptyMessages={{
            noDataTitle: "No watch time data",
            noDataDetail: "estimatedMinutesWatched is missing from the daily report for this window.",
          }}
        >
          {(rows) => (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="ytWatchFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS.warning} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={CHART_COLORS.warning} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...GRID_PROPS} />
                <XAxis dataKey="date" {...axisX({ interval: "preserveStartEnd", minTickGap: 24 })} />
                <YAxis {...axisY({ tickFormatter: (v) => `${compact(v)}m`, domain: niceDomain(1.2) })} />
                <Tooltip content={<ChartTooltip format="number" valueSuffix=" min" />} cursor={CURSOR} />
                <Area
                  type="monotone"
                  dataKey="watchTime"
                  name="Minutes watched"
                  stroke={CHART_COLORS.warning}
                  strokeWidth={2}
                  fill="url(#ytWatchFill)"
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title="Watch-Through Rate"
          subtitle="Average percentage of each view watched"
          icon={<Timer className="h-4 w-4 text-cyan-400" />}
          badge={rangeBadge}
          data={dailyData}
          valueKeys="avgViewPercentage"
          technical={health.daily.reason}
          height={280}
          emptyMessages={{
            noDataTitle: "No watch-through data",
            noDataDetail: "averageViewPercentage is missing from the daily report for this window.",
          }}
        >
          {(rows) => (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid {...GRID_PROPS} />
                <XAxis dataKey="date" {...axisX({ interval: "preserveStartEnd", minTickGap: 24 })} />
                <YAxis {...axisY({ width: 44, domain: [0, 100], tickFormatter: (v) => `${v}%` })} />
                <Tooltip content={<ChartTooltip format="percent" />} cursor={CURSOR} />
                <Line
                  type="monotone"
                  dataKey="avgViewPercentage"
                  name="Avg. viewed"
                  stroke={CHART_COLORS.secondary}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* ── Per-video performance ────────────────────────────────────── */}
      <ChartCard
        title="Video Engagement Comparison"
        subtitle="Engagement rate per video, from each video's own lifetime statistics"
        icon={<Play className="h-4 w-4 text-red-400" />}
        badge={
          videoPerformance.length > 0 ? (
            <span className="shrink-0 rounded-md bg-white/5 px-2 py-1 text-[10px] font-medium text-slate-400 ring-1 ring-white/10">
              {videoPerformance.length} videos
            </span>
          ) : null
        }
        data={videoPerformance}
        valueKeys="engagementRate"
        height={Math.max(280, videoPerformance.length * 32 + 60)}
        emptyMessages={{
          noDataTitle: "No video statistics",
          noDataDetail:
            "Per-video rates need each video's own view and like counts. The channel returned no videos with view data.",
        }}
      >
        {(rows) => (
          <ResponsiveContainer width="100%" height={Math.max(280, rows.length * 32 + 60)}>
            <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 40, left: 8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" horizontal={false} />
              <XAxis
                type="number"
                {...axisX({ tickFormatter: (v) => `${v.toFixed(0)}%`, dy: 0 })}
              />
              <YAxis
                type="category"
                dataKey="title"
                {...axisY({
                  width: 150,
                  tick: { fill: "#CBD5E1", fontSize: 11 },
                  dy: 0,
                  tickFormatter: (v) => (String(v).length > 24 ? `${String(v).slice(0, 24)}…` : v),
                })}
              />
              <Tooltip
                content={<ChartTooltip format="percent" />}
                cursor={CURSOR}
                labelFormatter={(l) => String(l)}
              />
              <Bar dataKey="engagementRate" name="Engagement rate" radius={[0, 4, 4, 0]} maxBarSize={22}>
                {rows.map((row, i) => (
                  <Cell key={row.id || i} fill={CHART_COLORS.pink} fillOpacity={1 - i * 0.12} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* ── Top engaging videos list ─────────────────────────────────── */}
      <Card className="surface-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-100">
              <Heart className="h-4 w-4 text-red-400" />
              Top Engaging Videos
            </CardTitle>
            <span className="rounded-md bg-white/5 px-2 py-1 text-[10px] font-medium text-slate-400 ring-1 ring-white/10">
              Ranked by likes + comments
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {topEngagingVideos.length > 0 ? (
            <div className="space-y-2">
              {topEngagingVideos.map((video, i) => (
                <div
                  key={video.id}
                  className="group flex items-center gap-4 rounded-xl border border-transparent p-2.5 transition-colors hover:border-white/5 hover:bg-white/[0.03]"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5 text-xs font-bold text-slate-400 ring-1 ring-white/10">
                    {i + 1}
                  </div>
                  {video.thumbnail ? (
                    <div className="relative shrink-0">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="h-12 w-20 rounded-md object-cover ring-1 ring-white/10"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                        <Play className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-12 w-20 shrink-0 items-center justify-center rounded-md bg-white/5">
                      <Play className="h-4 w-4 text-slate-500" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-100">{video.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {formatCompactNumber(video.views)}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />
                        {formatCompactNumber(video.likes)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {formatCompactNumber(video.comments)}
                      </span>
                      <span className="text-slate-500">
                        {video.engagementRate.toFixed(2)}% ER · {formatRelativeTime(video.publishedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center text-sm text-slate-400">
              No video engagement data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
