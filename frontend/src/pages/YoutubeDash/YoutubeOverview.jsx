// ── YouTube Overview Page ───────────────────────────────────────────
// Channel KPIs, time-series analytics, audience demographics and content
// performance — all rendered from the live YouTube Reporting API snapshot.
//
// Every chart goes through the shared chart layer (ChartCard) so that a
// report with zero rows produces an explicit explanation instead of an empty
// chart frame.

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, Legend } from "recharts";
import {
  Users,
  Eye,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Globe,
  Smartphone,
  Play,
  ThumbsUp,
  MessageSquare,
  Activity,
  Info,
  Clapperboard,
} from "lucide-react";
import { Youtube } from "@/components/icons/BrandIcons";
import ChartCard from "@/components/charts/ChartCard";
import ChartTooltip from "@/components/charts/ChartTooltip";
import DonutChart from "@/components/charts/DonutChart";
import TimeSeriesChart from "@/components/charts/TimeSeriesChart";
import EngagementInsights from "@/components/charts/EngagementInsights";
import {
  CHART_COLORS,
  CURSOR,
  GRID_PROPS,
  axisX,
  axisY,
  compact,
  percentDomain,
  shortDate,
  hasValues,
} from "@/components/charts/chartTheme";
import {
  parseCoreMetrics,
  parseChannelInfo,
  parseDailyAnalytics,
  parseRecentVideos,
  parseCountryData,
  parseDeviceData,
  parseAgeGenderData,
  parseSubscriberGrowth,
  parseEffectiveRange,
  parseReportHealth,
  formatCompactNumber,
  formatRelativeTime,
} from "@/services/ytapi";

// ── Delta helpers ────────────────────────────────────────────────────
const sumOf = (rows, key) => rows.reduce((a, r) => a + (Number(r?.[key]) || 0), 0);

/**
 * Mean daily value for a measured column. Written into chart subtitles so the
 * reader has a scale reference — a curve only becomes meaningful when you know
 * what a normal day looks like. Averaged over rows that actually carry the
 * metric, never across days where YouTube returned nothing.
 */
const avgDaily = (rows, key) => {
  const measured = (Array.isArray(rows) ? rows : []).filter((r) => Number(r?.[key]) > 0);
  if (measured.length === 0) return 0;
  return measured.reduce((a, r) => a + Number(r[key]), 0) / measured.length;
};

/** Total of a column over the days where it was measured. */
const measuredSum = (rows, key) =>
  (Array.isArray(rows) ? rows : [])
    .filter((r) => Number(r?.[key]) > 0)
    .reduce((a, r) => a + Number(r[key]), 0);

/**
 * Period-over-period change: the most recent half of the window vs the half
 * before it. Uses only measured values from the daily report.
 * Returns null when there is not enough history to compare honestly.
 */
const periodDelta = (rows, key) => {
  if (!Array.isArray(rows) || rows.length < 4) return null;
  const half = Math.floor(rows.length / 2);
  const current = sumOf(rows.slice(-half), key);
  const previous = sumOf(rows.slice(-half * 2, -half), key);
  if (previous === 0) return current > 0 ? { pct: 100, direction: "up" } : null;
  const pct = ((current - previous) / previous) * 100;
  return { pct, direction: pct >= 0 ? "up" : "down" };
};

/** Sparkline series for a KPI tile, normalised to 0–100 for a stable shape. */
const sparkPoints = (rows, key) => {
  const values = (rows || []).map((r) => Number(r?.[key]) || 0);
  if (values.length < 2) return "";
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * 100;
      const y = 28 - ((v - min) / span) * 26;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
};

// ── Skeleton Loading State ───────────────────────────────────────────
function OverviewSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="surface-card">
            <CardContent className="p-5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-3 h-7 w-24" />
              <Skeleton className="mt-4 h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i} className="surface-card">
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[280px] w-full rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="surface-card">
        <CardHeader>
          <Skeleton className="h-5 w-28" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-16 w-28 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Empty State Component ───────────────────────────────────────────
function EmptyOverview() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center animate-fade-in">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 ring-1 ring-red-500/20">
          <BarChart3 className="h-8 w-8 text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">No analytics snapshot yet</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          We could not load a YouTube snapshot for this account. Use Refresh to request a live
          fetch from the YouTube Reporting API, or reconnect the channel if it keeps failing.
        </p>
      </div>
    </div>
  );
}

// ── Reusable KPI Card ───────────────────────────────────────────────
// Shows the measured value, a real period-over-period delta and a sparkline.
// The previous "Active" badge was driven by `value > 0`, which told the user
// nothing; it is replaced with an actual change measurement.
function KpiCard({ title, value, icon: Icon, delta, spark, sparkColor = CHART_COLORS.primary, hint }) {
  const DeltaIcon = delta?.direction === "up" ? TrendingUp : delta?.direction === "down" ? TrendingDown : Minus;
  const deltaColor =
    delta?.direction === "up"
      ? "text-emerald-400 bg-emerald-500/10 ring-emerald-500/20"
      : delta?.direction === "down"
        ? "text-rose-400 bg-rose-500/10 ring-rose-500/20"
        : "text-slate-400 bg-white/5 ring-white/10";

  return (
    <Card className="surface-card group relative overflow-hidden p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          {title}
        </span>
        {Icon && (
          <span className="rounded-lg bg-white/5 p-1.5 ring-1 ring-white/10 transition-colors group-hover:bg-white/10">
            <Icon className="h-3.5 w-3.5 text-slate-300" />
          </span>
        )}
      </div>

      <div className="mt-2.5 text-[26px] font-bold leading-none tracking-tight text-white tabular-nums">
        {value}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        {delta ? (
          <span
            className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${deltaColor}`}
          >
            <DeltaIcon className="h-3 w-3" />
            {Math.abs(delta.pct).toFixed(1)}%
          </span>
        ) : (
          <span className="text-[11px] text-slate-500">No prior period</span>
        )}

        {spark && (
          <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="h-7 w-24 overflow-visible">
            <polyline
              points={spark}
              fill="none"
              stroke={sparkColor}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        )}
      </div>

      {hint && <p className="mt-2 text-[10px] leading-relaxed text-slate-500">{hint}</p>}
    </Card>
  );
}

// ── Main Overview Component ─────────────────────────────────────────
export default function YoutubeOverview({ data, loading }) {
  if (loading) return <OverviewSkeleton />;
  if (!data) return <EmptyOverview />;

  const channel = parseChannelInfo(data);
  const metrics = parseCoreMetrics(data);
  const dailyData = parseDailyAnalytics(data);
  const recentVideos = parseRecentVideos(data);
  const countryData = parseCountryData(data).slice(0, 10);
  const deviceData = parseDeviceData(data);
  const { age: ageData, gender: genderData } = parseAgeGenderData(data);
  const subGrowth = parseSubscriberGrowth(data);
  const range = parseEffectiveRange(data);
  const health = parseReportHealth(data);

  // Net subscriber movement across the whole window (measured, not estimated)
  const netSubs = subGrowth.reduce((a, d) => a + (d.net || 0), 0);

  

  const rangeLabel = range
    ? `${new Date(range.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${new Date(range.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
    : "Reporting window";

  // Scale references that let a reader judge each chart without a legend lookup.
  const countryViewsTotal = measuredSum(countryData, "views");

  // Per-video figures come from YouTube's own channel statistics, not from the
  // daily analytics report — so they stay populated even when a channel has too
  // little daily activity for the reporting API to return a single non-zero row.
  // Titles are truncated for the axis; the full title stays in the tooltip.
  const videoChartData = recentVideos.map((v) => {
    const views = Number(v.viewCount) || 0;
    const likes = Number(v.likeCount) || 0;
    const comments = Number(v.commentCount) || 0;
    return {
      id: v.id,
      label: v.title.length > 20 ? `${v.title.slice(0, 19)}…` : v.title,
      views,
      likes,
      comments,
      // Rate is only meaningful when there are views to divide by; a video with
      // no views has no engagement rate, so it is left undefined rather than 0.
      engagementRate: views > 0 ? ((likes + comments) / views) * 100 : undefined,
    };
  });

  // ── All-time (overall) figures ─────────────────────────────────────
  // The Reporting API only returns per-day rows, and it returns zeros for a
  // channel with little recent activity. These totals come from YouTube's own
  // channel statistics and per-video statistics instead, so the headline
  // numbers describe the channel as a whole rather than one reporting window.
  const overallViews = measuredSum(videoChartData, "views");
  const overallLikes = measuredSum(videoChartData, "likes");
  const overallComments = measuredSum(videoChartData, "comments");
  const overallInteractions = overallLikes + overallComments;
  const overallEngagementRate =
    overallViews > 0 ? (overallInteractions / overallViews) * 100 : 0;
  const avgViewsPerVideo =
    videoChartData.length > 0 ? overallViews / videoChartData.length : 0;
  

  // Donut inputs are derived from the measured per-video counts above; nothing
  // is invented, a category only appears when its count is above zero.
  const interactionSplit = [
    { name: "Likes", value: overallLikes },
    { name: "Comments", value: overallComments },
  ].filter((s) => s.value > 0);

  const videoShareData = videoChartData
    .filter((v) => v.views > 0)
    .map((v) => ({ name: v.label, value: v.views }));

  // ── Daily-reality check ─────────────────────────────────────────────
  // The Reporting API hands back rows for every day in the window even when the
  // channel had no activity, so "rows exist" does not mean "there is data". Only
  // when at least one day has a non-zero measurement do the daily charts carry
  // information worth showing; otherwise they are all-zero decoration that hides
  // the real per-video picture above them.
  const dailyHasSignal =
    hasValues(dailyData, ["views", "watchTime", "likes", "comments"]) ||
    hasValues(countryData, "views") ||
    hasValues(deviceData, "views") ||
    hasValues(ageData, "percentage") ||
    hasValues(subGrowth, "gained");

  const rangeBadge = (
    <span className="shrink-0 rounded-md bg-white/5 px-2 py-1 text-[10px] font-medium text-slate-400 ring-1 ring-white/10">
      {rangeLabel}
    </span>
  );

  // ── KPI tiles ──────────────────────────────────────────────────────
  // ── KPI tiles ─────────────────────────────────────────────────────────
  // Headline tiles report all-time channel totals, because a 28-day reporting
  // window on a low-traffic channel legitimately reads as zero. The all-time
  // figures are the ones that describe the channel, so they lead.
  const primaryKPIs = [
    {
      title: "Total Views",
      value: formatCompactNumber(metrics.lifetimeViews),
      icon: Eye,
      delta: periodDelta(dailyData, "views"),
      spark: sparkPoints(dailyData, "views"),
      sparkColor: CHART_COLORS.info,
      hint: `Lifetime, from YouTube channel statistics`,
    },
    {
      title: "Subscribers",
      value: formatCompactNumber(metrics.subscribers),
      icon: Users,
      delta: periodDelta(dailyData, "subscribersGained"),
      spark: sparkPoints(dailyData, "subscribersGained"),
      sparkColor: CHART_COLORS.success,
      hint: `${netSubs >= 0 ? "+" : ""}${netSubs.toLocaleString()} net in window`,
    },
    {
      title: "Interactions",
      value: formatCompactNumber(overallInteractions),
      icon: ThumbsUp,
      spark: sparkPoints(dailyData, "likes"),
      sparkColor: CHART_COLORS.tertiary,
      hint: `${formatCompactNumber(overallLikes)} likes · ${formatCompactNumber(overallComments)} comments on recent videos`,
    },
    {
      title: "Avg. Views per Video",
      value: formatCompactNumber(Math.round(avgViewsPerVideo)),
      icon: Play,
      spark: sparkPoints(dailyData, "views"),
      sparkColor: CHART_COLORS.secondary,
      hint: `Across ${videoChartData.length} recent videos`,
    },
  ];

  const secondaryKPIs = [
    {
      title: "Published Videos",
      value: formatCompactNumber(metrics.videoCount),
      icon: Youtube,
      hint: "Lifetime, from channel statistics",
    },
    {
      title: "Likes",
      value: formatCompactNumber(overallLikes),
      icon: ThumbsUp,
      hint: "Across recent videos",
    },
    {
      title: "Comments",
      value: formatCompactNumber(overallComments),
      icon: MessageSquare,
      hint: "Across recent videos",
    },
    {
      title: "Engagement Rate",
      value: `${overallEngagementRate.toFixed(2)}%`,
      icon: Activity,
      hint: "Likes + comments ÷ views on recent videos",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Channel header + data provenance ─────────────────────────── */}
      <Card className="surface-card overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-4">
            {channel?.thumbnail ? (
              <img
                src={channel.thumbnail}
                alt={channel.title}
                className="h-14 w-14 rounded-full object-cover ring-2 ring-red-500/30"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 ring-1 ring-red-500/20">
                <Youtube className="h-7 w-7 text-red-400" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h3 className="truncate text-lg font-bold text-white">{channel?.title}</h3>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                {channel?.customUrl && <span>{channel.customUrl}</span>}
                {channel?.country && <span>{channel.country}</span>}
                {channel?.publishedAt && <span>Joined {new Date(channel.publishedAt).getFullYear()}</span>}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {netSubs !== 0 && (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold ring-1 ring-inset ${
                    netSubs > 0
                      ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20"
                      : "bg-rose-500/10 text-rose-400 ring-rose-500/20"
                  }`}
                >
                  {netSubs > 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                  {netSubs > 0 ? "+" : ""}
                  {netSubs.toLocaleString()} subs
                </span>
              )}
            </div>
          </div>

          {(range?.clampedByLagDays > 0 || data?.rawPlatformData?.reportErrors) && (
            <div className="mt-4 space-y-2 border-t border-white/5 pt-4">
              {range?.clampedByLagDays > 0 && (
                <p className="flex items-start gap-2 text-[11px] leading-relaxed text-slate-400">
                  <Info className="mt-px h-3.5 w-3.5 shrink-0 text-slate-500" />
                  <span>
                    YouTube&apos;s Reporting API only serves complete days and lags roughly 2 days, so the
                    window is clamped to <strong className="text-slate-300">{rangeLabel}</strong>. This is
                    an API limitation, not missing data.
                  </span>
                </p>
              )}
              {data?.rawPlatformData?.reportErrors && (
                <p className="flex items-start gap-2 text-[11px] leading-relaxed text-amber-400/80">
                  <Info className="mt-px h-3.5 w-3.5 shrink-0" />
                  <span>
                    Some reports could not be retrieved:{" "}
                    {Object.keys(data.rawPlatformData.reportErrors).join(", ")}. Charts below explain each.
                  </span>
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Primary KPIs ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {primaryKPIs.map((kpi) => (
          <KpiCard key={kpi.title} {...kpi} />
        ))}
      </div>

      {/* ── Secondary KPIs ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {secondaryKPIs.map((kpi) => (
          <KpiCard key={kpi.title} {...kpi} />
        ))}
      </div>

      {/* ── Engagement insights ───────────────────────────────────────── */}
      {/* Built from per-video channel statistics (always measured) rather than
          the daily reporting API, which returns zero rows for low-traffic
          channels. Same panel as Facebook and Instagram. */}
      <EngagementInsights
        items={recentVideos}
        platform="youtube"
        accent={CHART_COLORS.tertiary}
        itemNoun="video"
        hasShares={false}
        hasViews
        map={(v) => ({
          id: v.id,
          label: v.title,
          date: v.publishedAt ? shortDate(v.publishedAt) : null,
          likes: v.likeCount ?? 0,
          comments: v.commentCount ?? 0,
          // YouTube exposes no share count in video statistics.
          shares: null,
          views: v.viewCount ?? 0,
        })}
      />

      {/* ── Overall channel composition ─────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">
        <ChartCard
          title="Channel Composition"
          subtitle="How the channel's measured interactions split between likes and comments"
          icon={<Activity className="h-4 w-4 text-violet-400" />}
          data={interactionSplit}
          valueKeys="value"
          height={260}
          emptyMessages={{
            noDataTitle: "No interactions",
            noDataDetail: "YouTube has not recorded any likes or comments on the channel's recent videos.",
            zeroTitle: "No interactions recorded",
            zeroDetail: "Likes and comments are both zero, so there is no split to display.",
          }}
        >
          {(rows) => (
            <DonutChart
              data={rows}
              height={260}
              outerRadius={92}
              innerRadius={60}
              tooltipFormat="number"
              centerLabel="interactions"
              centerValue={formatCompactNumber(overallInteractions)}
            />
          )}
        </ChartCard>

        <ChartCard
          title="Engagement Rate per Video"
          subtitle="Interactions divided by views for each video, using only measured counts"
          icon={<ThumbsUp className="h-4 w-4 text-emerald-400" />}
          data={videoChartData.filter((v) => v.views > 0)}
          valueKeys="engagementRate"
          height={Math.max(260, videoChartData.length * 32 + 40)}
          emptyMessages={{
            noDataTitle: "No rates to plot",
            noDataDetail: "None of the recent videos has a view count above zero, so no rate can be calculated.",
            zeroTitle: "No engagement yet",
            zeroDetail: "Every video with views has recorded zero likes and zero comments.",
          }}
        >
          {(rows) => (
            <ResponsiveContainer width="100%" height={Math.max(260, rows.length * 32 + 40)}>
              <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" horizontal={false} />
                <XAxis type="number" {...axisX({ tickFormatter: (v) => `${v}%`, dy: 0 })} />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={124}
                  {...axisY({ width: 124, tick: { fill: "#CBD5E1", fontSize: 11 }, dy: 0 })}
                />
                <Tooltip content={<ChartTooltip format="percent" />} cursor={CURSOR} />
                <Bar dataKey="engagementRate" name="Engagement" radius={[0, 4, 4, 0]} maxBarSize={20}>
                  {rows.map((row, i) => (
                    <Cell key={row.id || i} fill={CHART_COLORS.success} fillOpacity={1 - i * 0.08} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title="Views Concentration"
          subtitle="Share of measured views held by each recent video"
          icon={<Eye className="h-4 w-4 text-blue-400" />}
          data={videoShareData}
          valueKeys="value"
          height={260}
          emptyMessages={{
            noDataTitle: "No views to split",
            noDataDetail: "The channel's recent videos have no view counts recorded.",
            zeroTitle: "No views to split",
            zeroDetail: "Every recent video has zero views, so there is no distribution to chart.",
          }}
        >
          {(rows) => (
            <DonutChart
              data={rows}
              height={260}
              outerRadius={92}
              innerRadius={60}
              tooltipFormat="percent"
              tooltipSuffix=" of views"
              centerLabel="total views"
              centerValue={formatCompactNumber(overallViews)}
            />
          )}
        </ChartCard>
      </div>

      {/* ── Daily reporting charts ──────────────────────────────────── */}
      {/* Shown only when the Reporting API actually has a non-zero day to
          report. Rendering a month of flat zeros reads as "no engagement" when
          the truth is "the API had nothing to report", so the section collapses
          to an explanation instead of filling the page with empty charts. */}
      {dailyHasSignal ? (
        <>
      {/* ── Performance + Subscribers ───────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TimeSeriesChart
          platform="youtube"
          title="Performance Over Time"
          subtitle={`Daily views (left) against daily watch time in minutes (right). Average day: ${formatCompactNumber(avgDaily(dailyData, "views"))} views.`}
          icon={<Eye className="h-4 w-4 text-blue-400" />}
          data={dailyData}
          valueKeys={["views", "watchTime"]}
          technical={health.daily.reason}
          height={300}
          showAverage
          tickX={shortDate}
          series={[
            { key: "views", name: "Views", kind: "area", color: CHART_COLORS.info },
            { key: "watchTime", name: "Watch time (min)", kind: "line", color: CHART_COLORS.secondary, rightAxis: true },
          ]}
          emptyMessages={{
            noDataTitle: "No daily report",
            noDataDetail:
              "The YouTube Reporting API returned no daily rows for this window. This usually means the yt-analytics.readonly scope was never granted — reconnect the channel to grant it.",
          }}
        />

        <TimeSeriesChart
          platform="youtube"
          title="Subscriber Movement"
          subtitle="Daily gained vs unsubscribed, with running net total"
          icon={<Users className="h-4 w-4 text-emerald-400" />}
          data={subGrowth}
          valueKeys={["gained", "lostNeg", "cumulative"]}
          technical={health.daily.reason}
          height={300}
          initialType="bar"
          allowTypeSwitch={false}
          domainMode="signed"
          showAverage
          series={[
            { key: "gained", name: "Gained", kind: "bar", color: CHART_COLORS.success, radius: [3, 3, 0, 0] },
            { key: "lostNeg", name: "Unsubscribed", kind: "bar", color: CHART_COLORS.danger, radius: [0, 0, 3, 3] },
            { key: "cumulative", name: "Net total", kind: "line", color: CHART_COLORS.primary },
          ]}
          emptyMessages={{
            noDataTitle: "No subscriber data",
            noDataDetail:
              "The daily report carries no subscribersGained / subscribersLost rows. The metric only appears once YouTube has processed a full day of activity.",
          }}
        />
      </div>

      {/* ── Engagement mix + retention ──────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TimeSeriesChart
          platform="youtube"
          title="Engagement Mix"
          subtitle={`Daily likes, comments and shares. Averages per day: ${formatCompactNumber(avgDaily(dailyData, "likes"))} likes, ${formatCompactNumber(avgDaily(dailyData, "comments"))} comments, ${formatCompactNumber(avgDaily(dailyData, "shares"))} shares.`}
          icon={<ThumbsUp className="h-4 w-4 text-violet-400" />}
          data={dailyData}
          valueKeys={["likes", "comments", "shares"]}
          technical={health.daily.reason}
          height={280}
          initialType="line"
          series={[
            { key: "likes", name: "Likes", kind: "line", color: CHART_COLORS.primary },
            { key: "comments", name: "Comments", kind: "line", color: CHART_COLORS.secondary },
            { key: "shares", name: "Shares", kind: "line", color: CHART_COLORS.pink },
          ]}
          emptyMessages={{
            noDataTitle: "No engagement data",
            noDataDetail: "The daily report contains no likes, comments or shares rows for this window.",
          }}
        />

        <TimeSeriesChart
          platform="youtube"
          title="Average View Percentage"
          subtitle={`Share of each video watched, per day, measured by YouTube. Window average: ${avgDaily(dailyData, "avgViewPercentage").toFixed(1)}%.`}
          icon={<Clapperboard className="h-4 w-4 text-amber-400" />}
          data={dailyData}
          valueKeys={["avgViewPercentage"]}
          technical={health.daily.reason}
          height={280}
          format="percent"
          domainMode="percent"
          showAverage
          series={[
            { key: "avgViewPercentage", name: "Avg. viewed", kind: "area", color: CHART_COLORS.warning },
          ]}
          emptyMessages={{
            noDataTitle: "No retention data",
            noDataDetail:
              "averageViewPercentage is missing from the daily report, so watch-through cannot be charted for this window.",
          }}
        />
      </div>

      {/* ── Geography + Devices ─────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Top Countries by Views"
          subtitle={`Measured view count per country, ${formatCompactNumber(countryViewsTotal)} views across ${countryData.length} countries.`}
          icon={<Globe className="h-4 w-4 text-cyan-400" />}
          badge={
            countryData.length > 0 ? (
              <span className="shrink-0 rounded-md bg-white/5 px-2 py-1 text-[10px] font-medium text-slate-400 ring-1 ring-white/10">
                Top {countryData.length}
              </span>
            ) : null
          }
          data={countryData}
          valueKeys="views"
          technical={health.country.reason}
          height={Math.max(260, countryData.length * 30 + 40)}
          emptyMessages={{
            noDataTitle: "No geographic data",
            noDataDetail: "The country report returned no rows with views for this window.",
          }}
        >
          {(rows) => (
            <ResponsiveContainer width="100%" height={Math.max(260, rows.length * 30 + 40)}>
              <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" horizontal={false} />
                <XAxis type="number" {...axisX({ tickFormatter: compact, dy: 0 })} />
                <YAxis
                  type="category"
                  dataKey="country"
                  {...axisY({ width: 92, tick: { fill: "#CBD5E1", fontSize: 12 }, dy: 0 })}
                />
                <Tooltip content={<ChartTooltip />} cursor={CURSOR} />
                <Bar dataKey="views" name="Views" radius={[0, 4, 4, 0]} maxBarSize={20}>
                  {rows.map((row, i) => (
                    <Cell key={row.code || row.country || i} fill={CHART_COLORS.secondary} fillOpacity={1 - i * 0.07} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title="Viewing Devices"
          subtitle={`Share of ${formatCompactNumber(measuredSum(deviceData, "views"))} views by device type.`}
          icon={<Smartphone className="h-4 w-4 text-violet-400" />}
          badge={rangeBadge}
          data={deviceData}
          valueKeys="views"
          technical={health.device.reason}
          height={300}
          emptyMessages={{
            noDataTitle: "No device data",
            noDataDetail: "The deviceType report returned no rows for this window.",
          }}
        >
          {(rows) => (
            <DonutChart
              data={rows.map((d) => ({ ...d, name: d.device, value: d.views }))}
              height={300}
              outerRadius={96}
              innerRadius={64}
              centerLabel="Total Views"
            />
          )}
        </ChartCard>
      </div>

      {/* ── Age + Gender ────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Audience by Age"
          subtitle="Share of viewers per age group, as measured by YouTube"
          icon={<Users className="h-4 w-4 text-amber-400" />}
          badge={rangeBadge}
          data={ageData}
          valueKeys="percentage"
          technical={health.ageGender.reason}
          height={260}
          emptyMessages={{
            noDataTitle: "No age data",
            noDataDetail:
              "YouTube only returns age demographics for channels above its privacy threshold. Low-volume channels get no rows by design.",
          }}
        >
          {(rows) => (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={rows} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid {...GRID_PROPS} />
                <XAxis dataKey="group" {...axisX({ tick: { fill: "#CBD5E1", fontSize: 11 }, dy: 4 })} />
                <YAxis
                  {...axisY({ width: 44, domain: percentDomain, tickFormatter: (v) => `${v}%` })}
                />
                <Tooltip content={<ChartTooltip format="percent" />} cursor={CURSOR} />
                <Bar dataKey="percentage" name="Viewers" fill={CHART_COLORS.warning} radius={[4, 4, 0, 0]} maxBarSize={48}>
                  {rows.map((row, i) => (
                    <Cell key={row.group || i} fill={CHART_COLORS.warning} fillOpacity={1 - i * 0.09} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title="Audience by Gender"
          subtitle="Share of viewers per gender, as measured by YouTube"
          icon={<Users className="h-4 w-4 text-pink-400" />}
          badge={rangeBadge}
          data={genderData}
          valueKeys="percentage"
          technical={health.ageGender.reason}
          height={260}
          emptyMessages={{
            noDataTitle: "No gender data",
            noDataDetail:
              "YouTube withholds gender demographics below its privacy threshold, so no rows are available for this channel.",
          }}
        >
          {(rows) => (
            <DonutChart
              data={rows.map((g) => ({ ...g, name: g.label, value: g.percentage }))}
              height={260}
              outerRadius={88}
              innerRadius={58}
              tooltipFormat="percent"
              tooltipSuffix=" of viewers"
              centerLabel="of viewers"
            />
          )}
        </ChartCard>
      </div>
        </>
      ) : (
        <Card className="surface-card">
          <CardContent className="flex flex-col gap-2 py-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
              <Info className="h-4 w-4 text-amber-400" />
              No daily breakdown for this window
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              The YouTube Reporting API returned rows for this window, but every
              day measured zero. That means the channel recorded no views, watch
              time or engagement on those days — not that the overview is broken.
              The overall channel, composition and per-video figures above are the
              measured picture for this channel.
            </p>
            <p className="text-[11px] text-slate-500">
              Daily reporting needs the <code className="text-slate-400">yt-analytics.readonly</code>{" "}
              scope and at least 48 hours of processed activity. Reconnect the
              channel to refresh it.
            </p>
          </CardContent>
        </Card>
      )}

      {/* ── Per-video performance ───────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Views per Video"
          subtitle={`Lifetime view count for each of the ${videoChartData.length} most recent videos, straight from YouTube channel statistics.`}
          icon={<Play className="h-4 w-4 text-red-400" />}
          data={videoChartData}
          valueKeys="views"
          height={Math.max(260, videoChartData.length * 32 + 40)}
          emptyMessages={{
            noDataTitle: "No video views",
            noDataDetail: "YouTube reported no view count for any of the channel's recent videos.",
            zeroTitle: "No views recorded",
            zeroDetail:
              "Every recent video has a view count of 0, so there is nothing to compare yet.",
          }}
        >
          {(rows) => (
            <ResponsiveContainer width="100%" height={Math.max(260, rows.length * 32 + 40)}>
              <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 28, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" horizontal={false} />
                <XAxis type="number" {...axisX({ tickFormatter: compact, dy: 0 })} />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={124}
                  {...axisY({ width: 124, tick: { fill: "#CBD5E1", fontSize: 11 }, dy: 0 })}
                />
                <Tooltip content={<ChartTooltip />} cursor={CURSOR} />
                <Bar dataKey="views" name="Views" radius={[0, 4, 4, 0]} maxBarSize={20}>
                  {rows.map((row, i) => (
                    <Cell key={row.id || i} fill={CHART_COLORS.info} fillOpacity={1 - i * 0.08} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title="Interactions per Video"
          subtitle="Likes and comments for the same videos, as reported by YouTube"
          icon={<ThumbsUp className="h-4 w-4 text-violet-400" />}
          data={videoChartData}
          valueKeys={["likes", "comments"]}
          height={Math.max(260, videoChartData.length * 32 + 40)}
          emptyMessages={{
            noDataTitle: "No interactions",
            noDataDetail: "YouTube reported no likes or comments for the channel's recent videos.",
            zeroTitle: "No interactions recorded",
            zeroDetail: "None of the recent videos has received a like or a comment yet.",
          }}
        >
          {(rows) => (
            <ResponsiveContainer width="100%" height={Math.max(260, rows.length * 32 + 40)}>
              <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 28, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" horizontal={false} />
                <XAxis type="number" {...axisX({ dy: 0 })} />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={124}
                  {...axisY({ width: 124, tick: { fill: "#CBD5E1", fontSize: 11 }, dy: 0 })}
                />
                <Tooltip content={<ChartTooltip />} cursor={CURSOR} />
                <Legend wrapperStyle={{ fontSize: 11, color: "#94A3B8", paddingTop: 8 }} iconType="circle" iconSize={8} />
                <Bar dataKey="likes" name="Likes" stackId="a" fill={CHART_COLORS.primary} radius={[0, 0, 0, 0]} maxBarSize={20} />
                <Bar dataKey="comments" name="Comments" stackId="a" fill={CHART_COLORS.pink} radius={[0, 4, 4, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* ── Recent Videos ───────────────────────────────────────────── */}
      <Card className="surface-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-100">
              <Play className="h-4 w-4 text-red-400" />
              Recent Videos
            </CardTitle>
            <span className="rounded-md bg-white/5 px-2 py-1 text-[10px] font-medium text-slate-400 ring-1 ring-white/10">
              {recentVideos.length} from channel
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {recentVideos.length > 0 ? (
            <div className="space-y-2">
              {recentVideos.slice(0, 8).map((video) => {
                const engagements = (video.likeCount || 0) + (video.commentCount || 0);
                const er = video.viewCount > 0 ? (engagements / video.viewCount) * 100 : null;
                return (
                  <div
                    key={video.id}
                    className="group flex items-center gap-4 rounded-xl border border-transparent p-2.5 transition-colors hover:border-white/5 hover:bg-white/[0.03]"
                  >
                    {video.thumbnail ? (
                      <div className="relative shrink-0">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="h-14 w-24 rounded-lg object-cover ring-1 ring-white/10"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                          <Play className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-14 w-24 shrink-0 items-center justify-center rounded-lg bg-white/5">
                        <Play className="h-5 w-5 text-slate-500" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-sm font-medium text-slate-100">{video.title}</h4>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {formatCompactNumber(video.viewCount)}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {formatCompactNumber(video.likeCount)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {formatCompactNumber(video.commentCount)}
                        </span>
                        {er !== null && (
                          <span className="flex items-center gap-1 text-slate-500">
                            <Activity className="h-3 w-3" />
                            {er.toFixed(1)}% ER
                          </span>
                        )}
                        <span className="text-slate-500">{formatRelativeTime(video.publishedAt)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center text-sm text-slate-400">
              No recent videos found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
