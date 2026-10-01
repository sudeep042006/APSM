// ── Facebook Reach & Views Page ───────────────────────────────────────────────
// Reads fbapi.getReachViewsMetrics(), which returns only what Meta actually
// reported for the window:
//
//   { kpis: { totalReach, impressions, frequency: null },
//     timeline: [{ date, reach, impressions }],
//     hasSeries }
//
// Fabrication removed in this file:
//   • the "Organic vs. Paid Reach" stacked bar chart read `organicReach` and
//     `paidReach` keys that no response has ever contained — the two series
//     were always absent and the chart silently drew an empty frame. Meta does
//     not split page reach into paid/organic through this integration, so the
//     panel now explains that instead of plotting zeros.
//   • the "3s vs 1-Minute Views" area chart read `threeSecondViews` /
//     `oneMinuteViews`, which are equally absent. Per-video view funnels are
//     not exposed for Page video posts through the Graph API.
//   • when the API returned nothing, both charts were replaced by a single
//     hand-written all-zero row (`[{ date: '', organicReach: 0, paidReach: 0 }]`)
//   • the KPI row read `kpis.organicReach` and `kpis.videoViews`, which do not
//     exist, and stamped a green "Active" badge on every tile via showActive
//
// Frequency is reported as `null` rather than 0: Meta exposes no
// impressions-per-user figure for a Page, so there is no ratio to divide.

import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import fbapi from "@/services/fbapi";
import { KpiCard } from "./MetaSharedComponents";
import { Eye, Layers, Repeat, TrendingDown, Globe } from "lucide-react";
import TimeSeriesChart from "@/components/charts/TimeSeriesChart";
import ChartCard from "@/components/charts/ChartCard";
import { PLATFORM_ACCENT, seriesColors } from "@/components/charts/platformTheme";

const FB = PLATFORM_ACCENT.facebook;
const FB_SERIES = seriesColors("facebook", 3);

/** Compact number, or an explicit dash when the API returned null. */
const metricOrDash = (value) =>
  value === null || value === undefined
    ? "—"
    : new Intl.NumberFormat("en-US", {
        notation: "compact",
        compactDisplay: "short",
        maximumFractionDigits: 1,
      }).format(Number(value));

const FacebookReachViews = () => {
  const { isConnected } = useOutletContext();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        const result = await fbapi.getReachViewsMetrics();
        if (mounted) setData(result);
      } catch (e) {
        if (mounted) setError("Could not load reach data.");
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

  const kpis = data?.kpis || {};
  const timeline = data?.timeline || [];
  const hasSeries = data?.hasSeries === true;

  // Frequency is genuinely unavailable — never rendered as 0.
  const frequency = kpis.frequency?.value;
  const frequencyAvailable = frequency !== null && frequency !== undefined;

  const cards = [
    {
      label: "Total Reach",
      value: metricOrDash(kpis.totalReach?.value),
      icon: Eye,
      hint: hasSeries ? "page_impressions_unique" : "No insight rows stored",
      unavailable: !hasSeries,
    },
    {
      label: "Impressions",
      value: metricOrDash(kpis.impressions?.value),
      icon: Layers,
      hint: hasSeries ? "page_impressions" : "No insight rows stored",
      unavailable: !hasSeries,
    },
    {
      label: "Frequency",
      value: metricOrDash(frequency),
      icon: Repeat,
      hint: frequencyAvailable ? "Impressions per reached account" : "Not reported for Pages",
      unavailable: !frequencyAvailable,
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((k, i) =>
          isLoading ? (
            <Card key={i} className="surface-card p-5">
              <Skeleton className="h-3 w-20 bg-gray-700/50" />
              <Skeleton className="h-7 w-24 bg-gray-700/50 mt-2" />
            </Card>
          ) : (
            <KpiCard key={i} title={k.label} value={k.value} icon={k.icon} hint={k.hint} unavailable={k.unavailable} />
          )
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <TimeSeriesChart
          platform="facebook"
          title="Reach & Impressions"
          subtitle="Daily unique accounts reached against total impressions, straight from Meta's page insights"
          icon={<Eye className="h-4 w-4" style={{ color: FB }} />}
          data={timeline}
          valueKeys={["reach", "impressions"]}
          height={330}
          showAverage
          series={[
            { key: "reach", name: "Reach", kind: "area", color: FB },
            { key: "impressions", name: "Impressions", kind: "line", color: FB_SERIES[1] },
          ]}
          technical="Meta returned no day-level page insight rows for this window. Reach requires page_impressions_unique and impressions requires page_impressions; at least one completed day after connecting is needed."
          emptyMessages={{
            noDataTitle: "No reach series stored",
            noDataDetail:
              "Meta did not return page_impressions_unique or page_impressions for this window, so there is no measured reach to plot.",
            zeroTitle: "Zero reach recorded",
            zeroDetail:
              "Meta returned rows for this window, but every day reported 0 reach and 0 impressions. The page genuinely had no impressions recorded.",
          }}
        />

        {/* The two panels Meta cannot answer for a Page. Both previously drew
            all-zero placeholder rows; both now explain the API limitation. */}
        <div className="flex flex-col gap-6">
          <ChartCard
            title="Reach by Source"
            subtitle="Paid vs. organic split"
            icon={<Globe className="h-4 w-4" style={{ color: FB }} />}
            data={[]}
            valueKeys={["value"]}
            technical="page_impressions is not split by paid/organic for a Page token; the breakdown lives in the Marketing API reporting surface, not this integration."
            emptyMessages={{
              noDataTitle: "Source breakdown unavailable",
              noDataDetail:
                "Meta does not split page reach into paid and organic for this integration, so there is no real distribution to chart. Total reach and impressions are shown alongside.",
            }}
          >
            {() => null}
          </ChartCard>

          <ChartCard
            title="Video View Funnel"
            subtitle="3-second and 1-minute views"
            icon={<Layers className="h-4 w-4" style={{ color: FB_SERIES[1] }} />}
            data={[]}
            valueKeys={["value"]}
            technical="video_views and video_1_min_view_total are Instagram/Reels video-insight metrics. The Graph API does not expose them for Facebook Page video posts."
            emptyMessages={{
              noDataTitle: "View funnel unavailable",
              noDataDetail:
                "Meta does not expose per-video 3-second or 1-minute view counts for Facebook Page video posts. Measured engagement per video is available on the Videos tab.",
            }}
          >
            {() => null}
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

export default FacebookReachViews;