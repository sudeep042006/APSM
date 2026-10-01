// ── Facebook Overview (legacy component) ──────────────────────────────────────
// Not wired into the router — `/dashboard/facebook` renders FacebookDash.jsx,
// which is the migrated overview page. Kept as an export because other code
// imports it by name, but its data handling is now honest.
//
// Fabrication removed in this file:
//   • "SUBSCRIBERS" fell back to the literal "2"
//   • "TOTAL VIEWS" and "REACH" fell back to the literal "0"
//   • "WATCH TIME" was the hard-coded string "1m" — a Facebook Page has no
//     watch-time metric at all
//   • "ENGAGEMENT RATE" fell back to `56.52%`
//   • "VIDEOS" fell back to "4" and "TOTAL ENGAGEMENT" to "5"
//   • the local MetricCard carried a green "Active" tick for any value above
//     zero, and all four primary tiles passed `showActive` unconditionally
//
// Every tile now renders a dash with an explicit reason when the API has no
// figure, using the shared KpiCard.

import React from "react";
import fbapi from "@/services/fbapi";
import { KpiCard } from "./MetaSharedComponents";
import { Users, Eye, Heart, ThumbsUp, Globe, FileText, Activity } from "lucide-react";

const formatNumber = (value) =>
  value === null || value === undefined
    ? "—"
    : new Intl.NumberFormat("en-US", {
        notation: "compact",
        compactDisplay: "short",
        maximumFractionDigits: 1,
      }).format(Number(value));

/**
 * @param {object} props
 * @param {object} [props.data]  a getOverviewMetrics() result, if the caller
 *   already has one. When omitted the component fetches it itself.
 */
export function FacebookOverview({ data }) {
  const [fetched, setFetched] = React.useState(data || null);

  React.useEffect(() => {
    if (data) {
      setFetched(data);
      return;
    }
    let mounted = true;
    fbapi
      .getOverviewMetrics()
      .then((result) => {
        if (mounted) setFetched(result);
      })
      .catch(() => {
        if (mounted) setFetched(null);
      });
    return () => {
      mounted = false;
    };
  }, [data]);

  const kpis = fetched?.kpis || {};
  const charts = fetched?.charts || {};
  const hasSeries = charts.hasInsightSeries === true;
  const rate = charts.engagementRate?.rate;

  const primaryKpis = [
    {
      title: "Page Likes",
      value: formatNumber(kpis.pageLikes?.value),
      icon: Users,
      hint: "Fan count from Meta",
      unavailable: kpis.pageLikes?.value === null || kpis.pageLikes?.value === undefined,
    },
    {
      title: "Total Reach",
      value: formatNumber(kpis.postReach?.value),
      icon: Eye,
      hint: hasSeries ? "Unique accounts reached" : "No insight rows stored",
      unavailable: !hasSeries,
    },
    {
      title: "Interactions",
      value: formatNumber(kpis.postEngagements?.value),
      icon: Heart,
      hint: hasSeries ? "page_post_engagements" : "No insight rows stored",
      unavailable: !hasSeries,
    },
    {
      title: "Engagement Rate",
      // Facebook Pages have no watch-time metric; that tile is gone entirely.
      value: rate ?? "—",
      icon: Activity,
      hint: hasSeries ? "Interactions ÷ impressions" : "No insight rows stored",
      unavailable: !hasSeries || !rate,
    },
  ];

  const secondaryKpis = [
    {
      title: "Impressions",
      value: formatNumber(kpis.impressions?.value),
      icon: Eye,
      hint: hasSeries ? "Times content was displayed" : "No insight rows stored",
      unavailable: !hasSeries,
    },
    {
      title: "Reach",
      value: formatNumber(kpis.postReach?.value),
      icon: Globe,
      hint: hasSeries ? "Unique accounts reached" : "No insight rows stored",
      unavailable: !hasSeries,
    },
    {
      title: "Posts",
      value: String(fetched?.tables?.topPosts?.length ?? "—"),
      icon: FileText,
      hint: "Published in range",
      unavailable: !fetched?.tables?.topPosts?.length,
    },
    {
      title: "Total Engagement",
      value: formatNumber(kpis.postEngagements?.value),
      icon: ThumbsUp,
      hint: hasSeries ? "page_post_engagements" : "No insight rows stored",
      unavailable: !hasSeries,
    },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {primaryKpis.map((kpi) => (
          <KpiCard key={kpi.title} {...kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {secondaryKpis.map((kpi) => (
          <KpiCard key={kpi.title} {...kpi} />
        ))}
      </div>
    </div>
  );
}

export default FacebookOverview;