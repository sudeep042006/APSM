// ── Facebook Stories Page ─────────────────────────────────────────────────────
// Reads fbapi.getStoriesMetrics(), which returns all-null KPIs plus
// `apiLimitation: true` and a `limitationMessage`.
//
// Facebook Page Story analytics (reach, taps, completion, replies, exits) are
// not accessible through the public Meta Graph API. The /{page-id}/stories edge
// returns page text-mention stories, not the ephemeral 24-hour Stories feature,
// and Meta publishes Story insights only inside Meta Business Suite.
//
// Fabrication removed in this file:
//   • four KPI tiles rendered null directly. "Active Stories", "Completion Rate"
//     and the others rendered as an empty line where a number should be —
//     indistinguishable from a page with zero stories
//   • the whole table (Opens, Reach, Exits, Replies, Completion) was rendered
//     against an always-empty `stories` array, presenting seven columns of
//     unavailable metrics as if they were a live report
//   • the KPI cards were hand-rolled and ignored the shared KpiCard, so the
//     "unavailable" state had nowhere to render
//
// The page now states the platform restriction once and links to where the real
// data lives, rather than showing empty measurements.

import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Button } from "@/components/ui/button";
import fbapi from "@/services/fbapi";
import { KpiCard } from "./MetaSharedComponents";
import { History, Eye, TrendingUp, MessageCircle, TrendingDown, ShieldAlert } from "lucide-react";

const fmt = (n) =>
  n === null || n === undefined
    ? "—"
    : new Intl.NumberFormat("en-US", {
        notation: "compact",
        compactDisplay: "short",
        maximumFractionDigits: 1,
      }).format(Number(n));

const FacebookStories = () => {
  const { isConnected } = useOutletContext();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        const result = await fbapi.getStoriesMetrics();
        if (mounted) setData(result);
      } catch (e) {
        if (mounted) setError("Could not load stories data.");
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
  const apiLimitation = data?.apiLimitation !== false;

  const cards = [
    { label: "Active Stories", value: fmt(kpis.activeStories), icon: History, unavailable: true },
    { label: "Avg. Reach", value: fmt(kpis.avgReach), icon: Eye, unavailable: true },
    { label: "Completion Rate", value: fmt(kpis.completionRate), icon: TrendingUp, unavailable: true },
    { label: "Total Replies", value: fmt(kpis.totalReplies), icon: MessageCircle, unavailable: true },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-start gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
          <ShieldAlert className="h-5 w-5 text-amber-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-white">Story analytics are not available on this platform</h2>
          <p className="text-xs leading-relaxed text-slate-400">
            {data?.limitationMessage ||
              "Facebook Page Story analytics are not accessible through the public Meta Graph API. Meta only exposes Story insights through Meta Business Suite."}
          </p>
          <p className="text-xs leading-relaxed text-slate-500">
            To see Story performance, open your Page in Meta Business Suite → Content → Stories. The
            metrics below are reported as unavailable rather than as zero, because a zero here would
            claim your Stories reached nobody when in fact the API never returned a figure.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((k, i) => (
          <KpiCard
            key={i}
            title={k.label}
            value={k.value}
            icon={k.icon}
            hint={apiLimitation ? "Not exposed by the Meta Graph API" : null}
            unavailable={k.unavailable}
          />
        ))}
      </div>
    </div>
  );
};

export default FacebookStories;