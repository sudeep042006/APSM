// ── Facebook Groups Page ─────────────────────────────────────────────────────
// Reads fbapi.getGroupsMetrics(), which returns all-null KPIs plus
// `apiLimitation: true`, an empty `growthTimeline` and an empty `recentPosts`.
//
// Group membership requires the `manage_groups` permission, which this
// integration does not request.
//
// Fabrication removed in this file:
//   • the "Member Growth" line chart fell back to a hand-written all-zero row
//     (`[{ date: '', totalMembers: 0, activeMembers: 0 }]`), drawing a flat
//     pair of lines at zero and implying the group has zero members and zero
//     activity
//   • the recent-posts list rendered nothing against an always-empty array,
//     while the page headline claimed "No Facebook Group Connected" — a
//     connection state this integration can never reach, since it never asks
//     for group access
//   • `data.kpis.postsCount` was read raw, so a null rendered as an empty tile
//   • the local `GlassTooltip` duplicated the shared chart tooltip
//
// The page now states the scope restriction plainly and offers the settings
// route, instead of charting a group that was never connected.

import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import fbapi from "@/services/fbapi";
import { KpiCard } from "./MetaSharedComponents";
import { Users, Activity, FileText, TrendingDown, ShieldAlert, Settings } from "lucide-react";

const fmt = (n) =>
  n === null || n === undefined
    ? "—"
    : new Intl.NumberFormat("en-US", {
        notation: "compact",
        compactDisplay: "short",
        maximumFractionDigits: 1,
      }).format(Number(n));

const FacebookGroups = () => {
  const { isConnected } = useOutletContext();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        const result = await fbapi.getGroupsMetrics();
        if (mounted) setData(result);
      } catch (e) {
        if (mounted) setError("Could not load groups data.");
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

  const cards = [
    { label: "Total Members", value: fmt(kpis.totalMembers), icon: Users },
    { label: "Active Members", value: fmt(kpis.activeMembers), icon: Activity },
    { label: "Posts This Week", value: fmt(kpis.postsCount), icon: FileText },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-900/30 px-6 py-14 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10">
          <ShieldAlert className="h-8 w-8 text-amber-400" />
        </div>
        <h2 className="text-base font-bold text-white mb-2">Group metrics are not available to this app</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed mb-4">
          {data?.limitationMessage ||
            "Facebook Groups require the manage_groups permission, which this app does not request. Nothing is shown here rather than reporting zero."}
        </p>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed mb-6">
          Member counts, active members and group posts are not returned for a Page-only
          integration. Every figure below is reported as unavailable — a zero would claim your group
          has no members, which the API never actually said.
        </p>
        <Button
          onClick={() => navigate("/dashboard/facebook/settings")}
          className="bg-[#1877F2] hover:bg-[#1877F2]/90 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 mx-auto transition-colors"
        >
          <Settings className="h-3.5 w-3.5" />
          Review Facebook Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((k, i) =>
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
              hint="Not exposed without manage_groups"
              unavailable
            />
          )
        )}
      </div>
    </div>
  );
};

export default FacebookGroups;