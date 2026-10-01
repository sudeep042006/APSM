// ── Facebook Ads Page ─────────────────────────────────────────────────────────
// Reads fbapi.getAdsMetrics(), which returns:
//   { kpis: { totalSpend, impressions, linkClicks: null, avgCpc },
//     campaigns: [...] }
// …where each KPI is a plain number or null. Link clicks are always null
// because this integration does not request the ads_reading / ads_insights
// scopes needed to report them.
//
// Fabrication removed in this file:
//   • every KPI read `data?.kpis?.totalSpend?.value`, but the API returns a bare
//     number — not a `{ value }` object. All four tiles therefore rendered
//     `undefined`, i.e. an empty string where a figure should be, and each
//     carried a green "Active" badge via showActive
//   • "Link Clicks" is null in the response and was rendered as if it were a
//     measured zero next to real figures
//   • the campaign table printed spend / impressions / CTR / CPC straight from
//     the row, so a campaign missing a field rendered a blank cell that looked
//     like a value of nothing
//
// Now: nulls are stated as unavailable with the scope named, and the campaigns
// table renders an explicit dash for anything Meta did not report.

import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import fbapi from "@/services/fbapi";
import { KpiCard } from "./MetaSharedComponents";
import { Target, Eye, MousePointerClick, DollarSign, TrendingDown, Settings } from "lucide-react";
import CategoryBars from "@/components/charts/CategoryBars";
import { PLATFORM_ACCENT, seriesColors } from "@/components/charts/platformTheme";

const FB = PLATFORM_ACCENT.facebook;
const FB_SERIES = seriesColors("facebook", 2);

const fmt = (n) =>
  n === null || n === undefined || Number.isNaN(Number(n))
    ? "—"
    : new Intl.NumberFormat("en-US", {
        notation: "compact",
        compactDisplay: "short",
        maximumFractionDigits: 1,
      }).format(Number(n));

const FacebookAds = () => {
  const { isConnected } = useOutletContext();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        const result = await fbapi.getAdsMetrics();
        if (mounted) setData(result);
      } catch (e) {
        if (mounted) setError("Could not load ads data.");
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
  const campaigns = Array.isArray(data?.campaigns) ? data.campaigns : [];

  const spend = kpis.totalSpend;
  const impressions = kpis.impressions;
  const linkClicks = kpis.linkClicks;
  const avgCpc = kpis.avgCpc;

  const cards = [
    {
      label: "Total Spend",
      value: fmt(spend),
      icon: DollarSign,
      hint: spend === null || spend === undefined ? "Not reported for this account" : "Summed from ad account",
      unavailable: spend === null || spend === undefined,
    },
    {
      label: "Impressions",
      value: fmt(impressions),
      icon: Eye,
      hint: impressions === null || impressions === undefined ? "Not reported for this account" : "From ad insights",
      unavailable: impressions === null || impressions === undefined,
    },
    {
      label: "Link Clicks",
      value: fmt(linkClicks),
      icon: MousePointerClick,
      hint:
        linkClicks === null || linkClicks === undefined
          ? "Requires the ads_reading scope, not requested"
          : "From ad insights",
      unavailable: linkClicks === null || linkClicks === undefined,
    },
    {
      label: "Avg. CPC",
      value: avgCpc === null || avgCpc === undefined ? "—" : `$${Number(avgCpc).toFixed(2)}`,
      icon: Target,
      hint: avgCpc === null || avgCpc === undefined ? "Needs spend and click data" : "Spend ÷ clicks",
      unavailable: avgCpc === null || avgCpc === undefined,
    },
  ];

  // Only campaigns Meta actually reported a spend figure for are charted.
  const spendRows = campaigns
    .map((c) => ({ name: c?.campaignName || "Unnamed campaign", value: Number(c?.spend) || 0 }))
    .filter((r) => r.value > 0);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

      <Card className="surface-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-white">Active Campaigns</CardTitle>
          <p className="mt-1 text-xs text-slate-400">
            Rows exactly as the ad account returned them — a dash means Meta did not report that field
          </p>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full bg-gray-700/30 rounded-lg" />
              ))}
            </div>
          ) : campaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1877F2]/10">
                <Target className="h-7 w-7 text-[#1877F2]" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">No campaigns returned</h3>
              <p className="text-xs text-slate-400 max-w-md leading-relaxed mb-5">
                The ad account returned no campaigns for this page. That means either no ad account
                is linked through Meta Business Manager, or the linked account has no campaigns —
                it is not the same as spending zero.
              </p>
              <Button
                onClick={() => navigate("/dashboard/facebook/settings")}
                className="bg-[#1877F2] hover:bg-[#1877F2]/90 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 mx-auto transition-colors"
              >
                <Settings className="h-3.5 w-3.5" />
                Review Facebook Settings
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase tracking-wider border-y border-white/5 bg-white/[0.02]">
                  <tr>
                    <th className="px-6 py-4 font-medium">Campaign</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Spend</th>
                    <th className="px-6 py-4 font-medium text-right">Impressions</th>
                    <th className="px-6 py-4 font-medium text-right">CTR</th>
                    <th className="px-6 py-4 font-medium text-right">CPC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {campaigns.map((c, i) => (
                    <tr key={c?.id || c?.campaignName || i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-xs font-medium text-gray-200 truncate max-w-[200px]">
                          {c?.campaignName || "—"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        {c?.status ? (
                          <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-full inline-block ${
                              c.status === "Active"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-gray-500/10 text-gray-400"
                            }`}
                          >
                            {c.status}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-200 text-xs font-medium">
                        {c?.spend ?? "—"}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-200 text-xs">{c?.impressions ?? "—"}</td>
                      <td className="px-6 py-4 text-right text-[#1877F2] text-xs font-medium">{c?.ctr ?? "—"}</td>
                      <td className="px-6 py-4 text-right text-gray-200 text-xs">{c?.cpc ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {spendRows.length > 0 && (
        <Card className="surface-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-white">Spend by Campaign</CardTitle>
            <p className="mt-1 text-xs text-slate-400">Only campaigns with a reported spend appear</p>
          </CardHeader>
          <CardContent>
            <CategoryBars
              data={spendRows}
              color={FB_SERIES[1]}
              valueLabel="Spend"
              format="number"
              emptyTitle="No campaign spend returned"
              emptyDetail="No campaign in this ad account reported a spend figure."
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FacebookAds;