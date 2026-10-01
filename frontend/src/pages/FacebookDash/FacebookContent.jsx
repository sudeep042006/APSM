// ── Facebook Content Page ─────────────────────────────────────────────────────
// Reads fbapi.getOverviewMetrics() and uses the `tables` payload only:
//   [{ id, title, image, date, engagements, reactions, likes, comments,
//      shares, type, rate }]
//
// Fabrication removed in this file:
//   • `Total Posts` fell back to the literal string "3" whenever the page had no
//     posts, so an empty page reported three posts
//   • `Top Post Eng. Rate` fell back to the literal "N/A" string
//   • "Avg. Reach / Post" summed `p.reach`, which the API never populates for
//     individual posts (reach is a page-level metric), so the KPI divided
//     undefined by the post count and printed a number that meant nothing
//   • the table's Reach and Impressions columns read `p.reach` / `p.impressions`
//     on every row, both absent, so they rendered as a dash column while
//     implying the data existed
//   • "Total Engagement" counted likes + comments only and silently dropped
//     shares, understating the real figure
//
// Now: reach/impressions are dropped in favour of the measured interactions
// (reactions, comments, shares), the composition of engagement across post
// formats is charted from real counts, and the top posts are ranked by the
// engagement actually recorded on each one.

import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import fbapi from "@/services/fbapi";
import { KpiCard } from "./MetaSharedComponents";
import {
  FileText,
  TrendingDown,
  TrendingUp as TrendingUpIcon,
  MessageCircle,
  Share2,
  ThumbsUp,
  BarChart2,
} from "lucide-react";
import TopList from "@/components/charts/TopList";
import CategoryBars from "@/components/charts/CategoryBars";
import { PLATFORM_ACCENT, seriesColors } from "@/components/charts/platformTheme";

const FB = PLATFORM_ACCENT.facebook;
const FB_SERIES = seriesColors("facebook", 4);

const TABS = ["All", "Photos", "Videos", "Links", "Text"];

const fmt = (n) =>
  n === null || n === undefined
    ? "—"
    : new Intl.NumberFormat("en-US", {
        notation: "compact",
        compactDisplay: "short",
        maximumFractionDigits: 1,
      }).format(Number(n));

const FacebookContent = () => {
  const { isConnected } = useOutletContext();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        const result = await fbapi.getOverviewMetrics();
        const allContent = [
          ...(result?.tables?.topPosts || []),
          ...(result?.tables?.topVideos || []),
        ]
          .filter(Boolean)
          .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
        if (mounted) setPosts(allContent);
      } catch (e) {
        if (mounted) setError("Could not load content data.");
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

  const totals = posts.reduce(
    (acc, p) => ({
      reactions: acc.reactions + (Number(p.reactions) || 0),
      comments: acc.comments + (Number(p.comments) || 0),
      shares: acc.shares + (Number(p.shares) || 0),
    }),
    { reactions: 0, comments: 0, shares: 0 }
  );
  const totalEngagements = totals.reactions + totals.comments + totals.shares;
  const avgPerPost = posts.length > 0 ? totalEngagements / posts.length : null;

  // The post with the highest measured engagement rate, not merely the first
  // row of a date-sorted list.
  const topRate = posts.reduce((best, p) => {
    const v = Number(p.rate);
    if (!Number.isFinite(v)) return best;
    return best === null || v > best ? v : best;
  }, null);

  const kpis = [
    {
      label: "Total Posts",
      value: String(posts.length),
      icon: FileText,
      hint: posts.length === 0 ? "Nothing published in range" : "In the selected range",
      unavailable: posts.length === 0,
    },
    {
      label: "Total Engagement",
      value: fmt(totalEngagements),
      icon: ThumbsUp,
      hint: "Reactions + comments + shares",
      unavailable: totalEngagements === 0,
    },
    {
      label: "Avg. Engagement / Post",
      value: avgPerPost === null ? "—" : fmt(avgPerPost),
      icon: BarChart2,
      hint: avgPerPost === null ? "No posts to average" : "Across the posts in range",
      unavailable: avgPerPost === null,
    },
    {
      label: "Top Post Eng. Rate",
      value: topRate === null ? "—" : `${topRate.toFixed(2)}%`,
      icon: TrendingUpIcon,
      hint: topRate === null ? "Needs a follower count to divide by" : "Engagements ÷ page likes",
      unavailable: topRate === null,
    },
  ];

  const filtered =
    activeTab === "All" ? posts : posts.filter((p) => String(p.type || "").toLowerCase() === activeTab.toLowerCase());

  // Engagement composition per format, measured from each post's own counts.
  const byFormat = Object.values(
    posts.reduce((acc, p) => {
      const type = p.type || "Other";
      acc[type] = acc[type] || { name: type, value: 0, count: 0 };
      acc[type].value += Number(p.engagements) || 0;
      acc[type].count += 1;
      return acc;
    }, {})
  ).filter((r) => r.value > 0);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((k, i) =>
          isLoading ? (
            <Card key={i} className="surface-card p-5">
              <Skeleton className="h-3 w-20 bg-gray-700/50" />
              <Skeleton className="h-7 w-24 bg-gray-700/50 mt-1" />
            </Card>
          ) : (
            <KpiCard key={i} title={k.label} value={k.value} icon={k.icon} hint={k.hint} unavailable={k.unavailable} />
          )
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="surface-card xl:col-span-2 flex flex-col">
          <CardHeader className="pb-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="text-sm font-semibold text-white">Content Performance</CardTitle>
              <div className="flex gap-1 flex-wrap">
                {TABS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      activeTab === t
                        ? "bg-[#1877F2] text-white"
                        : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 mt-4">
            {isLoading ? (
              <div className="space-y-3 p-6">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 w-full bg-gray-700/30 rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase tracking-wider border-y border-white/5 bg-white/[0.02]">
                    <tr>
                      <th className="px-6 py-4 font-medium">Content</th>
                      <th className="px-6 py-4 font-medium">Published</th>
                      <th className="px-6 py-4 font-medium">Type</th>
                      <th className="px-6 py-4 font-medium text-right">Reactions</th>
                      <th className="px-6 py-4 font-medium text-right">Comments</th>
                      <th className="px-6 py-4 font-medium text-right">Shares</th>
                      <th className="px-6 py-4 font-medium text-right">Engagements</th>
                      <th className="px-6 py-4 font-medium text-right">Eng. Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-gray-500 text-sm">
                          No content for this filter
                        </td>
                      </tr>
                    ) : (
                      filtered.map((p, i) => (
                        <tr key={p.id || i} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4 max-w-[200px] md:max-w-[300px]">
                            <div className="flex items-center gap-3 min-w-0">
                              {p.image ? (
                                <img src={p.image} alt="" className="h-10 w-10 rounded object-cover flex-shrink-0" />
                              ) : (
                                <div className="h-10 w-10 rounded bg-white/5 flex-shrink-0" />
                              )}
                              <p className="text-xs font-medium text-gray-200 truncate">{p.title}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-400 text-xs whitespace-nowrap">{p.date || "—"}</td>
                          <td className="px-6 py-4 text-gray-400 text-xs">{p.type || "—"}</td>
                          <td className="px-6 py-4 text-right text-gray-200 text-xs">{fmt(p.reactions)}</td>
                          <td className="px-6 py-4 text-right text-gray-200 text-xs">{fmt(p.comments)}</td>
                          <td className="px-6 py-4 text-right text-gray-200 text-xs">{fmt(p.shares)}</td>
                          <td className="px-6 py-4 text-right text-gray-200 text-xs font-medium">
                            {fmt(p.engagements)}
                          </td>
                          <td className="px-6 py-4 text-right text-emerald-400 text-xs font-medium">
                            {p.rate ?? "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="surface-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-white">Engagement by Format</CardTitle>
              <p className="mt-1 text-xs text-slate-400">
                Measured interactions grouped by the attachment type Meta reported
              </p>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-4 w-full bg-gray-700/30" />
                  ))}
                </div>
              ) : (
                <CategoryBars
                  data={byFormat}
                  color={FB}
                  valueLabel="Engagements"
                  emptyTitle="No engagement to break down"
                  emptyDetail="No post in this range recorded a reaction, comment or share."
                />
              )}
            </CardContent>
          </Card>

          <Card className="surface-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-white">Interaction Mix</CardTitle>
              <p className="mt-1 text-xs text-slate-400">Summed from every post in range</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Reactions", value: totals.reactions, icon: ThumbsUp, color: FB },
                { label: "Comments", value: totals.comments, icon: MessageCircle, color: FB_SERIES[1] },
                { label: "Shares", value: totals.shares, icon: Share2, color: FB_SERIES[2] },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                  <span className="flex items-center gap-2 text-xs text-slate-300">
                    <s.icon className="h-3.5 w-3.5" style={{ color: s.color }} />
                    {s.label}
                  </span>
                  <span className="text-xs font-bold text-white tabular-nums">{fmt(s.value)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="surface-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-white">Top Posts by Engagement</CardTitle>
          <p className="mt-1 text-xs text-slate-400">Bars are sized from the engagement on each post</p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 w-full bg-gray-700/30 rounded-lg" />
              ))}
            </div>
          ) : (
            <TopList
              platform="facebook"
              valueLabel="Engagements"
              limit={8}
              items={[...posts]
                .sort((a, b) => (Number(b.engagements) || 0) - (Number(a.engagements) || 0))
                .map((p, i) => ({
                  id: p.id || `post-${i}`,
                  label: p.title || "Post",
                  sub: (
                    <>
                      <span>{p.date || "—"}</span>
                      {p.type && (
                        <>
                          <span className="text-slate-600">·</span>
                          <span>{p.type}</span>
                        </>
                      )}
                    </>
                  ),
                  meta: p.rate ? <span className="text-emerald-400">{p.rate} ER</span> : null,
                  value: p.engagements || 0,
                  color: FB,
                }))}
              emptyTitle="No posts in this range"
              emptyDetail="Nothing was published in the selected window, so there is nothing to rank."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FacebookContent;