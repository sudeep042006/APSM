// ── Facebook Ads Page ─────────────────────────────────────────────────────────
// Fetches data independently via fbapi.getAdsMetrics() on mount.
// Shows 4 KPI cards + active campaigns table.

import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

import fbapi from "@/services/fbapi";
import { Target, Eye, MousePointerClick, DollarSign, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";

const FacebookAds = () => {
  const { isConnected } = useOutletContext();
  const [data, setData]     = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]   = useState(null);

  // ── Fetch ads metrics independently on mount ──────────────────────────────
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
    return () => { mounted = false; };
  }, []);

  if (error) return (
    <div className="p-6 flex items-center justify-center min-h-[50vh]">
      <div className="text-center space-y-3">
        <TrendingDown className="h-10 w-10 text-red-400 mx-auto" />
        <p className="text-sm text-gray-400">{error}</p>
        <Button onClick={() => window.location.reload()} className="bg-[#1877F2] hover:bg-[#1877F2]/90 text-white text-xs">Retry</Button>
      </div>
    </div>
  );

  // ── KPI definitions ────────────────────────────────────────────────────────
  const kpis = [
    { label: "Total Spend",   value: data?.kpis?.totalSpend?.value,  change: data?.kpis?.totalSpend?.change,  icon: DollarSign,       color: "bg-amber-500/10 text-amber-400"    },
    { label: "Impressions",   value: data?.kpis?.impressions?.value, change: data?.kpis?.impressions?.change, icon: Eye,              color: "bg-[#1877F2]/10 text-[#1877F2]"   },
    { label: "Link Clicks",   value: data?.kpis?.linkClicks?.value,  change: data?.kpis?.linkClicks?.change,  icon: MousePointerClick, color: "bg-emerald-500/10 text-emerald-400" },
    { label: "Avg. CPC",      value: data?.kpis?.avgCpc?.value,      change: data?.kpis?.avgCpc?.change,      icon: Target,           color: "bg-indigo-500/10 text-indigo-400"  },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">

      {/* ── KPI Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <Card key={i} className="bg-[#161B22]/90 backdrop-blur-md rounded-xl border border-white/5 p-5">
            <CardContent className="p-0">
              {isLoading ? (
                <><Skeleton className="h-10 w-10 rounded-full bg-gray-700/50 mb-3" /><Skeleton className="h-3 w-16 bg-gray-700/50 mb-2" /><Skeleton className="h-8 w-20 bg-gray-700/50" /></>
              ) : (
                <>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${k.color} mb-3`}>
                    <k.icon className="h-5 w-5" />
                  </div>
                  <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">{k.label}</p>
                  <p className="text-2xl font-bold text-white mt-2">{k.value}</p>
                  {k.change !== undefined && (
                    <div className={`text-xs font-medium flex items-center gap-0.5 mt-1 ${(k.change||0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {(k.change||0) >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {(k.change||0) >= 0 ? "+" : ""}{k.change}%
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Active Campaigns Table ────────────────────────────────────────── */}
      <Card className="bg-[#161B22]/90 backdrop-blur-md rounded-xl border border-white/5">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-white">Active Campaigns</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-6">
              {[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full bg-gray-700/30 rounded-lg" />)}
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
                  {(!data?.campaigns?.length) ? (
                    <tr><td colSpan={6} className="py-12 text-center text-gray-500 text-sm">No campaigns found</td></tr>
                  ) : data.campaigns.map((c, i) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-xs font-medium text-gray-200 truncate max-w-[200px]">{c.campaignName}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full inline-block
                          ${c.status === "Active"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-gray-500/10 text-gray-400"}`}
                      >
                        {c.status}
                      </span>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-200 text-xs font-medium">{c.spend}</td>
                      <td className="px-6 py-4 text-right text-gray-200 text-xs">{c.impressions}</td>
                      <td className="px-6 py-4 text-right text-[#1877F2] text-xs font-medium">{c.ctr}</td>
                      <td className="px-6 py-4 text-right text-gray-200 text-xs">{c.cpc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FacebookAds;