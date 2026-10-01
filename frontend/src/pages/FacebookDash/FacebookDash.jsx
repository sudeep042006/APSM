// ── Facebook Overview Dashboard (Index Child Page) ──────────────────────────
// ARCHITECTURE NOTE: this file is the Overview *page* only — layout, sidebar
// and connection state belong to FacebookLayout.jsx.
//
// Every chart renders through the shared chart layer (TimeSeriesChart,
// CategoryBars, DonutChart, TopList) so Facebook looks and behaves exactly
// like the YouTube tabs, and so a chart with no measured data explains itself
// instead of drawing an empty frame.
//
// Fabrication removed in this file:
//   • impressions were previously `reach × 1.5`
//   • the "best time to post" heatmap used hard-coded bar heights and
//     highlighted Tuesday/Thursday regardless of any data
//   • video rows showed a hard-coded "Jul 23, 2026", "1:45" and "50.0%"
//   • a "Historical Video Benchmark" panel printed 0:45 / 12.4% / 45%
//   • KPI cards showed a green "Active" tick for any non-zero value

import React, { useState, useEffect, useCallback } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import fbapi from "@/services/fbapi";
import DateRangePicker from "@/components/DateRangePicker";
import {
  Users, Eye, Heart, ThumbsUp, MessageCircle, Share2, Info,
  RefreshCw, TrendingUp, TrendingDown, Video, Globe, FileText, Activity,
  BarChart2, MousePointerClick,
} from "lucide-react";
import TimeSeriesChart from "@/components/charts/TimeSeriesChart";
import CategoryBars from "@/components/charts/CategoryBars";
import TopList from "@/components/charts/TopList";
import DonutChart from "@/components/charts/DonutChart";
import EngagementInsights from "@/components/charts/EngagementInsights";
import { KpiCard } from "./MetaSharedComponents";
import { PLATFORM_ACCENT, seriesColors } from "@/components/charts/platformTheme";
import { compact } from "@/components/charts/chartTheme";

const FB = PLATFORM_ACCENT.facebook;
const FB_SERIES = seriesColors("facebook", 6);

// ── Number formatter (compact notation) ──────────────────────────────────────
const formatNumber = (n) => {
  if (n === undefined || n === null || isNaN(Number(n))) return "—";
  return new Intl.NumberFormat("en-US", {
    notation: "compact", compactDisplay: "short", maximumFractionDigits: 1,
  }).format(Number(n));
};

/** Renders an unavailable metric as an explicit dash rather than a fake zero. */
const metricOrDash = (value, formatter = formatNumber) =>
  value === null || value === undefined ? "—" : formatter(value);

// ── Chart skeleton wrapper ────────────────────────────────────────────────────
const ChartSkeleton = ({ height = "h-[260px]" }) => (
  <Skeleton className={`w-full ${height} bg-gray-700/30 rounded-xl`} />
);

// ═════════════════════════════════════════════════════════════════════════════
// MAIN OVERVIEW COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
const FacebookDash = () => {
  const { profile, isLayoutLoading } = useOutletContext();

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const makeDefault = () => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 1);
    return { start: d.toISOString().split("T")[0], end: new Date().toISOString().split("T")[0] };
  };
  const [dateRange, setDateRange] = useState(makeDefault);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);
    try {
      const result = await fbapi.getOverviewMetrics(dateRange, isRefresh);
      setData(result);
    } catch (err) {
      console.error("[FacebookDash] Failed to load overview metrics:", err);
      setError("We couldn't load your Facebook analytics right now.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
            <TrendingDown className="h-8 w-8 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Something went wrong</h3>
          <p className="text-sm text-gray-400 max-w-sm">{error}</p>
          <Button onClick={() => fetchData()} className="bg-[#1877F2] hover:bg-[#1877F2]/90 text-white" id="fb-overview-retry-btn">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const charts = data?.charts || {};
  const kpis = data?.kpis || {};
  const hasInsightSeries = charts.hasInsightSeries === true;

  const topPosts = data?.tables?.topPosts || [];
  const topVideos = data?.tables?.topVideos || [];

  // Real measured engagement: Meta returns no day-level insight rows for a page
  // with little activity, so the insight view is built from the per-post
  // reactions/comments/shares that the content endpoint always returns.
  const allEngagedItems = [...topPosts, ...topVideos];
  const countryRows = data?.audience?.topCountries || [];
  const ageGenderRows = data?.audience?.ageGender || [];

  // The rate comes straight from measured engagements ÷ impressions.
  const displayEngagementRate = charts.engagementRate?.rate || "—";

  const primaryKpis = [
    { title: "Followers", value: metricOrDash(profile?.followers ?? kpis.pageLikes?.value), icon: Users,
      hint: "Facebook page fans" },
    { title: "Total Reach", value: metricOrDash(kpis.postReach?.value), icon: Eye,
      hint: hasInsightSeries ? "Unique accounts reached" : null },
    { title: "Interactions", value: metricOrDash(kpis.postEngagements?.value), icon: Heart,
      hint: hasInsightSeries ? "page_post_engagements" : null },
    { title: "Engagement Rate", value: displayEngagementRate, icon: TrendingUp,
      hint: hasInsightSeries ? "Interactions ÷ impressions" : null },
  ];

  // Impressions now come from Meta's own page_impressions metric.
  const secondaryKpis = [
    { title: "Impressions", value: metricOrDash(kpis.impressions?.value), icon: Eye,
      hint: hasInsightSeries ? "Total times content was displayed" : null },
    { title: "Reactions", value: metricOrDash(kpis.reactions?.value), icon: ThumbsUp,
      hint: "Summed from posts" },
    { title: "Comments", value: metricOrDash(kpis.comments?.value), icon: MessageCircle,
      hint: "Summed from posts" },
    { title: "Shares", value: metricOrDash(kpis.shares?.value), icon: Share2,
      hint: "Summed from posts" },
  ];

  // Real publishing times, measured from post timestamps. Replaces the
  // hard-coded heatmap of invented bar heights.
  const postingSlots = (() => {
    const rows = [...topPosts, ...topVideos].filter((p) => p.date);
    if (rows.length === 0) return [];
    const buckets = new Map();
    rows.forEach((p) => {
      const d = new Date(`${p.date}T00:00:00Z`);
      if (Number.isNaN(d.getTime())) return;
      const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getUTCDay()];
      buckets.set(day, (buckets.get(day) || 0) + 1);
    });
    return [...buckets.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  })();

  return (
    <div className="p-4 md:p-6 space-y-6 w-full max-w-[1600px] mx-auto">

      {/* ── Identity header + controls ───────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {isLayoutLoading ? (
            <>
              <Skeleton className="w-14 h-14 rounded-full bg-gray-700/50" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-36 bg-gray-700/50" />
                <Skeleton className="h-3 w-24 bg-gray-700/50" />
              </div>
            </>
          ) : profile ? (
            <>
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-14 h-14 rounded-full border-2 border-[#1877F2]/30 object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-[#1877F2]/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-bold text-[#1877F2]">{profile.name?.[0] || "F"}</span>
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-white">{profile.name}</h1>
                {profile.handle && <p className="text-sm text-gray-400">{profile.handle}</p>}
              </div>
              <div className="hidden lg:flex items-center gap-5 ml-4 pl-4 border-l border-white/10">
                {[
                  { label: "Page Likes", value: profile.pageLikes },
                  { label: "Followers", value: profile.followers },
                  { label: "Reach", value: profile.reach },
                  { label: "Posts", value: profile.totalPosts },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-sm font-semibold text-white">{metricOrDash(s.value)}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">{s.label}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-400">Not connected</p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <DateRangePicker startDate={dateRange.start} endDate={dateRange.end} onChange={setDateRange} />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(true)}
            disabled={isRefreshing}
            className="text-xs text-gray-400 border-white/10 bg-white/5 hover:bg-white/10 hover:text-white h-9 px-3"
            id="fb-overview-refresh-btn"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* ── KPI grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {primaryKpis.map((kpi, i) => (
          <KpiCard key={i} {...kpi} unavailable={kpi.value === "—"} />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {secondaryKpis.map((kpi, i) => (
          <KpiCard key={i} {...kpi} unavailable={kpi.value === "—"} />
        ))}
      </div>

      {/* ── Engagement insights (measured, not time-series) ──────────── */}
      <EngagementInsights
        items={allEngagedItems}
        platform="facebook"
        accent={FB}
        itemNoun="post"
        hasShares
        map={(p) => ({
          id: p.id,
          label: p.title || "Post",
          date: p.date || null,
          likes: p.reactions ?? p.likes ?? 0,
          comments: p.comments ?? 0,
          shares: p.shares ?? 0,
          // Post-level reach/impressions are not returned by the content
          // endpoint, so a per-post engagement rate cannot be measured.
          views: null,
        })}
      />

      {/* ── Interactive time series ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TimeSeriesChart
          platform="facebook"
          title="Reach & Impressions Over Time"
          subtitle="Daily unique reach against total impressions, straight from Meta's page insights"
          icon={<Eye className="h-4 w-4" style={{ color: FB }} />}
          data={charts.reachOverTime?.length ? charts.reachOverTime : []}
          valueKeys={["value"]}
          height={300}
          technical="Meta returned no day-level page insight rows for this window. Reach requires the page_impressions_unique metric and needs at least one completed day after connecting."
          emptyMessages={{
            noDataTitle: "No reach series stored",
            noDataDetail:
              "Meta did not return page_impressions_unique for this window. Reach appears once the page has a completed day of activity after connecting.",
          }}
          series={[{ key: "value", name: "Reach", kind: "area", color: FB }]}
        />

        <TimeSeriesChart
          platform="facebook"
          title="Engagements Over Time"
          subtitle="Daily page_post_engagements — switch between bars, area and line"
          icon={<Activity className="h-4 w-4" style={{ color: FB }} />}
          data={charts.engagementsOverTime || []}
          valueKeys={["value"]}
          height={300}
          initialType="bar"
          series={[{ key: "value", name: "Engagements", kind: "bar", color: FB_SERIES[1] }]}
          emptyMessages={{
            noDataTitle: "No engagement series stored",
            noDataDetail:
              "Meta returned no page_post_engagements rows for this window, so there is nothing to plot.",
          }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TimeSeriesChart
          platform="facebook"
          title="Engagement Rate"
          subtitle="Daily interactions as a share of impressions"
          icon={<TrendingUp className="h-4 w-4 text-emerald-400" />}
          data={charts.engagementRate?.data || []}
          valueKeys={["rate"]}
          height={300}
          format="percent"
          showAverage
          series={[{ key: "rate", name: "Engagement rate", kind: "area", color: "#34D399" }]}
          emptyMessages={{
            noDataTitle: "No engagement rate available",
            noDataDetail:
              "The rate needs both page_impressions and page_post_engagements for the same day. At least one is missing for this window.",
          }}
        />

        <ChartCardProxy
          title="Impressions vs Reach"
          subtitle="Volume against unique accounts — click a legend entry to compare"
        >
          <TopList
            items={[
              {
                id: "impressions",
                label: "Impressions",
                sub: "Times content was displayed",
                value: kpis.impressions?.value || 0,
                color: FB,
              },
              {
                id: "reach",
                label: "Reach",
                sub: "Unique accounts reached",
                value: kpis.postReach?.value || 0,
                color: FB_SERIES[1],
              },
            ]}
            valueLabel="Totals"
            platform="facebook"
            total={(kpis.impressions?.value || 0) + (kpis.postReach?.value || 0)}
            emptyTitle="No volume metrics stored"
            emptyDetail="Meta returned neither page_impressions nor page_impressions_unique for this window."
          />
        </ChartCardProxy>
      </div>

      {/* ── Content + audience ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="surface-card flex flex-col h-full">
          <CardHeader className="p-5 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-white">Top Posts</CardTitle>
              <Link to="/dashboard/facebook/content" className="text-[10px] text-[#1877F2] hover:underline">View all →</Link>
            </div>
          </CardHeader>
          <CardContent className="p-4 flex-1">
            {isLoading || !data ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full bg-gray-700/30 rounded-lg" />)}
              </div>
            ) : (
              <TopList
                platform="facebook"
                valueLabel="Engagements"
                emptyTitle="No posts in this range"
                emptyDetail={`Nothing was published between ${dateRange.start} and ${dateRange.end}.`}
                items={topPosts.map((post, i) => ({
                  id: post.id || `post-${i}`,
                  label: post.title || "Post",
                  sub: (
                    <>
                      <span>{post.date || "—"}</span>
                      {post.type && <span className="text-slate-600">·</span>}
                      {post.type && <span>{post.type}</span>}
                    </>
                  ),
                  meta: post.rate ? <span className="text-emerald-400">{post.rate} ER</span> : null,
                  value: post.engagements || 0,
                  color: FB,
                }))}
              />
            )}
          </CardContent>
        </Card>

        <Card className="surface-card flex flex-col h-full">
          <CardHeader className="p-5 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-white">Top Videos</CardTitle>
              <Link to="/dashboard/facebook/videos" className="text-[10px] text-[#1877F2] hover:underline">View all →</Link>
            </div>
          </CardHeader>
          <CardContent className="p-4 flex-1">
            {isLoading || !data ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full bg-gray-700/30 rounded-lg" />)}
              </div>
            ) : (
              <TopList
                platform="facebook"
                valueLabel="Engagements"
                emptyTitle="No videos in this range"
                emptyDetail="Meta does not expose per-video playback counts for Page video posts. Publish a video and its measured engagement will appear here."
                items={topVideos.map((vid, i) => ({
                  id: vid.id || `vid-${i}`,
                  label: vid.title || "Video",
                  sub: <span>{vid.date || "—"}</span>,
                  value: vid.engagements || 0,
                  color: FB_SERIES[3],
                }))}
              />
            )}
          </CardContent>
        </Card>

        <Card className="surface-card flex flex-col h-full">
          <CardHeader className="p-5 pb-2">
            <CardTitle className="text-sm font-semibold text-white">Audience Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0 flex-1">
            {isLoading || !data ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-3 w-full bg-gray-700/30" />)}
              </div>
            ) : countryRows.length === 0 && ageGenderRows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center px-4 h-full">
                <div className="mb-2 p-3 rounded-full bg-purple-500/10 border border-purple-500/20">
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <p className="text-xs font-semibold text-white">Audience Insights Locked</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-[220px] leading-relaxed">
                  Meta only returns age, gender and country demographics for pages with at least 100
                  fans. This page is below that threshold.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {countryRows.length > 0 && (
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-2">
                      Top Countries — fans
                    </p>
                    <CategoryBars
                      data={countryRows.map((c) => ({ name: c.country, value: c.value }))}
                      color={FB}
                      limit={5}
                      valueLabel="Fans"
                    />
                  </div>
                )}
                {ageGenderRows.length > 0 && (
                  <div className="border-t border-white/5 pt-4">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-2">
                      Age & Gender — fans
                    </p>
                    <CategoryBars
                      data={ageGenderRows.map((a) => ({ name: a.group, value: a.value }))}
                      color={FB_SERIES[2]}
                      valueLabel="Fans"
                    />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Publishing cadence, measured ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="surface-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-white">
                <BarChart2 className="h-4 w-4" style={{ color: FB }} />
                Publishing Cadence
              </CardTitle>
              <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-1 rounded-md">
                From post timestamps
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading || !data ? (
              <ChartSkeleton height="h-[180px]" />
            ) : (
              <CategoryBars
                data={postingSlots}
                color={FB}
                valueLabel="Posts published"
                emptyTitle="No publishing timestamps"
                emptyDetail="Posts in this window carry no creation timestamp, so a cadence cannot be derived."
              />
            )}
          </CardContent>
        </Card>

        <Card className="surface-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-white">
              <MousePointerClick className="h-4 w-4" style={{ color: FB }} />
              Reach by Source
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoading || !data ? (
              <ChartSkeleton height="h-[180px]" />
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-slate-900/30 px-6 py-9 text-center">
                <div className="mb-3 p-3 rounded-full bg-[#1877F2]/10 border border-[#1877F2]/20">
                  <Globe className="w-5 h-5 text-[#1877F2]" />
                </div>
                <p className="text-sm font-semibold text-white">Source breakdown unavailable</p>
                <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-400">
                  Meta does not split page reach into paid and organic for this integration, so
                  there is no real distribution to chart. Total reach is shown above.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Small wrapper so the non-Recharts panels keep the same card chrome as charts.
function ChartCardProxy({ title, subtitle, children }) {
  return (
    <Card className="surface-card flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-white">{title}</CardTitle>
        {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
      </CardHeader>
      <CardContent className="flex-1">{children}</CardContent>
    </Card>
  );
}

export default FacebookDash;