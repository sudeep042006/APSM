// ── Facebook Page Likes Page ──────────────────────────────────────────────────
// Reads fbapi.getPageLikesMetrics(), which returns:
//
//   { gained, lost, net,
//     kpis: { totalLikes },
//     followerGrowthTimeline: [{ date, followers, net }],
//     canShowGrowth, growthNote }
//
// `followerGrowthTimeline` is built from consecutive stored daily snapshots and
// is empty when fewer than two exist. One reading cannot describe growth, so
// the page says so rather than drawing a curve.
//
// Fabrication removed in this file:
//   • a hard-coded "Retention 100%" chip — always 100%, always, for every page
//   • the footer claimed "Daily follower gain/loss requires Meta Business API
//     advanced access" and printed "✓ Live Total" / "Baseline Active" while the
//     chart above it was empty
//   • `currentFollowers ?? 0` and `data?.net ?? 0` printed a literal 0 for
//     metrics the API had not measured
//   • the local `ChartEmptyState`, `GlassTooltip`, `sanitizeChartData` and the
//     local "domain scale if no data" hack that forced a 0–5 axis when a page
//     had no follower history, making an empty series look like a flat chart
//   • `gained` / `unfollows` were plotted from timeline keys that do not exist;
//     the real per-snapshot key is `net`, so the "Gained vs. Lost (Daily)" chart
//     was always blank. Both panels now plot the measured `net`.

import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import fbapi from "@/services/fbapi";
import { KpiCard } from "./MetaSharedComponents";
import { ThumbsUp, UserMinus, TrendingUp, Users, TrendingDown, Info } from "lucide-react";
import TimeSeriesChart from "@/components/charts/TimeSeriesChart";
import ChartCard from "@/components/charts/ChartCard";
import { PLATFORM_ACCENT, seriesColors } from "@/components/charts/platformTheme";

const FB = PLATFORM_ACCENT.facebook;
const FB_SERIES = seriesColors("facebook", 3);

const fmt = (n) =>
  n === null || n === undefined
    ? "—"
    : new Intl.NumberFormat("en-US", {
        notation: "compact",
        compactDisplay: "short",
        maximumFractionDigits: 1,
      }).format(Number(n));

const FacebookPageLikes = () => {
  const { isConnected } = useOutletContext();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        const result = await fbapi.getPageLikesMetrics();
        if (mounted) setData(result);
      } catch (e) {
        if (mounted) setError("Could not load page likes data.");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetch();
    return () => {
      mounted = false;
    };
  }, []);

  if (error)
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-3">
          <TrendingDown className="h-10 w-10 text-red-400 mx-auto" />
          <p className="text-sm text-gray-400">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-[#1877F2] hover:bg-[#1877F2]/90 text-white text-xs"
          >
            Retry
          </Button>
        </div>
      </div>
    );

  const timeline = data?.followerGrowthTimeline || [];
  const canShowGrowth = data?.canShowGrowth === true && timeline.length > 1;
  const currentFollowers = data?.kpis?.totalLikes;

  // Retention requires two measured readings on the same page; with fewer than
  // two there is no denominator, so it is not reported at all.
  const retention =
    canShowGrowth && Number(currentFollowers) > 0
      ? ((Number(data.gained) / Number(currentFollowers)) * 100).toFixed(1)
      : null;

  const kpis = [
    {
      label: "Total Page Likes",
      value: fmt(currentFollowers),
      icon: Users,
      hint: "Live fan count from Meta",
      unavailable: currentFollowers === null || currentFollowers === undefined,
    },
    {
      label: "Total Gained",
      value: canShowGrowth ? fmt(data.gained) : "—",
      icon: ThumbsUp,
      hint: canShowGrowth ? "Summed from snapshot deltas" : "Needs two snapshots",
      unavailable: !canShowGrowth,
    },
    {
      label: "Total Lost",
      value: canShowGrowth ? fmt(data.lost) : "—",
      icon: UserMinus,
      hint: canShowGrowth ? "Summed from snapshot deltas" : "Needs two snapshots",
      unavailable: !canShowGrowth,
    },
    {
      label: "Net Growth",
      value: canShowGrowth ? fmt(data.net) : "—",
      icon: TrendingUp,
      hint: canShowGrowth ? "Gained minus lost" : "Needs two snapshots",
      unavailable: !canShowGrowth,
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {kpis.map((k, i) =>
          isLoading ? (
            <Card key={i} className="surface-card p-5">
              <Skeleton className="h-3 w-20 bg-gray-700/50" />
              <Skeleton className="h-7 w-24 bg-gray-700/50 mt-2" />
            </Card>
          ) : (
            <KpiCard
              key={i}
              title={k.label}
              value={k.value}
              icon={k.icon}
              hint={k.hint}
              unavailable={k.unavailable}
            />
          )
        )}
      </div>

      {retention !== null && (
        <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5">
          <Info className="h-4 w-4 shrink-0 text-slate-500" />
          <p className="text-[11px] text-slate-400">
            Gained fans as a share of the current page likes:{" "}
            <span className="font-semibold text-slate-200 tabular-nums">{retention}%</span> — measured
            from stored daily snapshots, not a Meta-reported retention figure.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <TimeSeriesChart
          platform="facebook"
          title="Follower Growth Timeline"
          subtitle="Fan count on each stored daily snapshot — click a legend entry or switch to bars"
          icon={<Users className="h-4 w-4" style={{ color: FB }} />}
          data={timeline}
          valueKeys={["followers"]}
          height={360}
          showAverage
          series={[{ key: "followers", name: "Page likes", kind: "area", color: FB }]}
          technical={data?.growthNote || undefined}
          emptyMessages={{
            noDataTitle: "Not enough snapshots to show growth",
            noDataDetail:
              data?.growthNote ||
              "Follower growth needs at least two stored daily snapshots. APSM records one snapshot per sync, so keep the integration connected and this chart will populate automatically.",
          }}
        />

        <TimeSeriesChart
          platform="facebook"
          title="Daily Net Change"
          subtitle="Difference between consecutive snapshots — negative days mean fans left"
          icon={<TrendingUp className="h-4 w-4" style={{ color: FB_SERIES[1] }} />}
          data={timeline}
          valueKeys={["net"]}
          height={360}
          domainMode="signed"
          initialType="bar"
          series={[{ key: "net", name: "Net change", kind: "bar", color: FB_SERIES[1] }]}
          technical={data?.growthNote || undefined}
          emptyMessages={{
            noDataTitle: "No day-over-day change to plot",
            noDataDetail:
              data?.growthNote ||
              "Daily net change is a difference between two stored fan counts. With a single snapshot there is no previous reading to subtract.",
          }}
        />
      </div>

      {/* Retention is a derived ratio, not a Meta metric. It only appears once
          two snapshots exist; before that it is explained, never guessed. */}
      {!canShowGrowth && !isLoading && (
        <ChartCard
          title="Retention"
          subtitle="Fans gained as a share of the page"
          icon={<ThumbsUp className="h-4 w-4 text-emerald-400" />}
          data={[]}
          valueKeys={["value"]}
          technical="Meta's Graph API does not expose a follower-retention metric for Pages. Retention here is derived from consecutive stored fan counts, which requires at least two snapshots."
          emptyMessages={{
            noDataTitle: "Retention not measurable yet",
            noDataDetail:
              "Retention is derived by dividing fans gained by the current page likes. That needs at least two stored snapshots; there is currently only one, so no ratio is shown rather than a fabricated percentage.",
          }}
        >
          {() => null}
        </ChartCard>
      )}
    </div>
  );
};

export default FacebookPageLikes;