// ── Facebook Engagement Page ────────────────────────────────────────────────
// Composition of engagement, measured per post.
//
// Previously this page filled any day missing from the post list with a
// 70 / 20 / 10 split of that day's total, and it rendered seven hard-coded
// reaction types with zero counts. Both are gone: reactions, comments and
// shares now come only from each post's own summary counts, and the reaction
// breakdown lists only types that actually carry volume.

import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import fbapi from "@/services/fbapi";
import { KpiCard } from "./MetaSharedComponents";
import { ThumbsUp, MessageCircle, Share2, TrendingDown, Activity, Heart } from "lucide-react";
import TimeSeriesChart from "@/components/charts/TimeSeriesChart";
import CategoryBars from "@/components/charts/CategoryBars";
import DonutChart from "@/components/charts/DonutChart";
import { PLATFORM_ACCENT, seriesColors } from "@/components/charts/platformTheme";

const FB = PLATFORM_ACCENT.facebook;
const [C_LIKE, C_COMMENT, C_SHARE] = seriesColors("facebook", 3);

/**
 * Stable colour per interaction type. Keyed by name rather than by array
 * position so "Shares" stays the same colour on the donut and on the bars
 * even when a type carries no volume and is left out of the list.
 */
const INTERACTION_COLORS = {
  Reactions: C_LIKE,
  Comments: C_COMMENT,
  Shares: C_SHARE,
};

const fmt = (n) =>
  n == null ? "—" : new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);

const fmtRange = (dateRange) => {
  if (!dateRange?.start || !dateRange?.end) return "Last 6 months";
  const opts = { month: "short", year: "numeric" };
  const s = new Date(`${dateRange.start}T00:00:00`).toLocaleDateString("en-US", opts);
  const e = new Date(`${dateRange.end}T00:00:00`).toLocaleDateString("en-US", opts);
  return `${s} – ${e}`;
};

const shortDay = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(`${dateStr}T00:00:00`);
  return Number.isNaN(d.getTime())
    ? dateStr
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const FacebookEngagement = () => {
  const { isConnected } = useOutletContext();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const result = await fbapi.getEngagementMetrics(6);
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

  const trend = data?.engagementTrend || [];
  const volume = data?.engagementVolume || [];
  const reactionTypes = data?.reactionTypes || [];

  // Stats are measured across the same rows the chart plots.
  const totals = trend.reduce(
    (acc, d) => ({
      likes: acc.likes + (d.likes || 0),
      comments: acc.comments + (d.comments || 0),
      shares: acc.shares + (d.shares || 0),
    }),
    { likes: 0, comments: 0, shares: 0 }
  );
  const totalEngagement = totals.likes + totals.comments + totals.shares;
  const avgPerDay = trend.length > 0 ? totalEngagement / trend.length : 0;
  const peakDay = trend.length > 0
    ? trend.reduce((best, d) => {
        const t = (d.likes || 0) + (d.comments || 0) + (d.shares || 0);
        const bt = (best.likes || 0) + (best.comments || 0) + (best.shares || 0);
        return t > bt ? d : best;
      }, trend[0])
    : null;
  const peakTotal = peakDay ? (peakDay.likes || 0) + (peakDay.comments || 0) + (peakDay.shares || 0) : 0;

  const kpis = [
    { label: "Total Reactions", value: fmt(totals.likes), icon: ThumbsUp, hint: "Summed from posts" },
    { label: "Total Comments", value: fmt(totals.comments), icon: MessageCircle, hint: "Summed from posts" },
    { label: "Total Shares", value: fmt(totals.shares), icon: Share2, hint: "Summed from posts" },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading
          ? [1, 2, 3].map((i) => (
              <Card key={i} className="surface-card p-5">
                <Skeleton className="h-3 w-20 bg-gray-700/50" />
                <Skeleton className="h-7 w-24 bg-gray-700/50 mt-2" />
              </Card>
            ))
          : kpis.map((k, i) => (
              <KpiCard key={i} title={k.label} value={k.value} icon={k.icon} hint={k.hint} />
            ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <TimeSeriesChart
          platform="facebook"
          title="Engagement Composition"
          subtitle="Reactions, comments and shares per publishing day — click a series to isolate it"
          icon={<Activity className="h-4 w-4" style={{ color: FB }} />}
          data={trend}
          valueKeys={["likes", "comments", "shares"]}
          height={420}
          initialType="area"
          badge={
            <span className="shrink-0 whitespace-nowrap rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-slate-300">
              {isLoading ? "Loading…" : fmtRange(data?.dateRange)}
            </span>
          }
          series={[
            { key: "likes", name: "Reactions", kind: "area", color: C_LIKE },
            { key: "comments", name: "Comments", kind: "area", color: C_COMMENT, opacity: 0.26 },
            { key: "shares", name: "Shares", kind: "area", color: C_SHARE, opacity: 0.26 },
          ]}
          technical="Facebook's published_posts edge exposes per-post reaction, comment and share summaries. No day in this window had a post with any interaction."
          emptyMessages={{
            noDataTitle: "No engagement data",
            noDataDetail:
              "No post in the last six months has recorded a reaction, comment or share. Reactions, comments and shares are read from each post directly — nothing is estimated.",
          }}
        />

        <div className="flex flex-col gap-6">
          {/* Measured stats — replaces the hard-coded stat strip. */}
          <Card className="surface-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-white">Engagement Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4">
              {[
                { label: "Total", value: fmt(totalEngagement) },
                { label: "Avg / day", value: trend.length > 0 ? avgPerDay.toFixed(1) : "—" },
                { label: "Peak day", value: peakDay ? `${fmt(peakTotal)}` : "—" },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">{s.label}</p>
                  <p className="mt-0.5 text-lg font-bold text-white tabular-nums">{s.value}</p>
                  {s.label === "Peak day" && peakDay && (
                    <p className="text-[10px] text-slate-500">{shortDay(peakDay.date)}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="surface-card flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-white">Interaction Mix</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {isLoading ? (
                <Skeleton className="h-[220px] w-full bg-gray-700/30 rounded-xl" />
              ) : reactionTypes.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-slate-900/30 px-6 py-10 text-center">
                  <div className="mb-3 rounded-full bg-white/5 p-3 ring-1 ring-white/10">
                    <Heart className="h-6 w-6 text-slate-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-200">No interactions recorded</p>
                  <p className="mt-1 max-w-xs text-xs text-slate-400">
                    This page has no reactions, comments or shares in the selected period, so there is
                    no split to show.
                  </p>
                </div>
              ) : (
                <DonutChart
                  data={reactionTypes}
                  dataKey="value"
                  nameKey="name"
                  height={220}
                  outerRadius={84}
                  innerRadius={56}
                  centerLabel="Interactions"
                  colors={[C_LIKE, C_COMMENT, C_SHARE]}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Page-level engagement volume from Meta's own insight rows. */}
      <TimeSeriesChart
        platform="facebook"
        title="Page Engagement Volume"
        subtitle="page_post_engagements per day, as reported by Meta — independent of individual posts"
        icon={<Activity className="h-4 w-4" style={{ color: FB }} />}
        data={volume}
        valueKeys={["value"]}
        height={300}
        initialType="bar"
        series={[{ key: "value", name: "Page engagements", kind: "bar", color: FB }]}
        emptyMessages={{
          noDataTitle: "No page-level engagement series",
          noDataDetail:
            "Meta returned no page_post_engagements rows for this window. This metric only appears after the page has completed a day of activity following connection.",
        }}
      />

      <Card className="surface-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-white">Interaction Types</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryBars
            data={reactionTypes.map((r) => ({ name: r.name, value: r.value }))}
            colors={reactionTypes.map((r) => INTERACTION_COLORS[r.name] || C_LIKE)}
            valueLabel="Interactions"
            emptyTitle="No interaction types recorded"
            emptyDetail="Reactions, comments and shares are summed from each published post. Nothing has been recorded in this period."
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default FacebookEngagement;