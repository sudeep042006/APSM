// ── Facebook Videos Page ─────────────────────────────────────────────────────
// Reads fbapi.getVideosMetrics(), which returns:
//
//   { kpis: { totalVideos, totalPlays: null, avgWatchTime: null,
//             topRetention: null, totalEngagements },
//     videos: [{ id, title, image, date, plays: null, watchTime: null,
//                threeSecondViews: null, oneMinuteViews: null, rate: null,
//                likes, comments, shares, engagements }],
//     apiLimitation: true, limitationMessage }
//
// Fabrication removed in this file:
//   • three of the four KPI tiles rendered `data?.kpis?.avgWatchTime` and
//     `topRetention` directly. Both are null, so they rendered as a blank
//     element that looked like a broken card rather than an unavailable metric
//   • the table printed Plays, Watch Time, 3s Views and 1m Views columns that
//     are all null for every row, plus an Eng. Rate column that was also null —
//     five columns of empty cells implying Meta had returned playback data
//   • hand-rolled KPI cards ignored the shared KpiCard, so the "unavailable"
//     state had nowhere to go
//
// Meta's Graph API does not expose per-video play counts or watch time for
// Facebook Page video posts. Those metrics are stated as unavailable, and the
// measured interactions each video actually earned are ranked instead.

import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import fbapi from "@/services/fbapi";
import { KpiCard } from "./MetaSharedComponents";
import { Video, Play, Clock, Heart, TrendingDown, AlertTriangle, BarChart2 } from "lucide-react";
import TopList from "@/components/charts/TopList";
import CategoryBars from "@/components/charts/CategoryBars";
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

const FacebookVideos = () => {
  const { isConnected } = useOutletContext();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        const result = await fbapi.getVideosMetrics();
        if (mounted) setData(result);
      } catch (e) {
        if (mounted) setError("Could not load video data.");
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
  const videos = data?.videos || [];
  const apiLimitation = data?.apiLimitation === true;

  const totalEngagements = Number(kpis.totalEngagements) || 0;
  const totalLikes = videos.reduce((a, v) => a + (Number(v.likes) || 0), 0);
  const totalComments = videos.reduce((a, v) => a + (Number(v.comments) || 0), 0);
  const totalShares = videos.reduce((a, v) => a + (Number(v.shares) || 0), 0);

  const cards = [
    {
      label: "Total Videos",
      value: fmt(kpis.totalVideos),
      icon: Video,
      hint: "Video posts found on the page",
      unavailable: !kpis.totalVideos,
    },
    {
      label: "Total Plays",
      value: fmt(kpis.totalPlays),
      icon: Play,
      hint: apiLimitation ? "Not exposed by Meta for Page videos" : "Reported by Meta",
      unavailable: kpis.totalPlays === null || kpis.totalPlays === undefined,
    },
    {
      label: "Avg. Watch Time",
      value: fmt(kpis.avgWatchTime),
      icon: Clock,
      hint: apiLimitation ? "Not exposed by Meta for Page videos" : "Reported by Meta",
      unavailable: kpis.avgWatchTime === null || kpis.avgWatchTime === undefined,
    },
    {
      label: "Total Engagement",
      value: fmt(totalEngagements),
      icon: Heart,
      hint: "Reactions + comments + shares",
      unavailable: totalEngagements === 0,
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {apiLimitation && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <p className="text-xs leading-relaxed text-amber-200/90">
            {data?.limitationMessage}
          </p>
        </div>
      )}

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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="surface-card xl:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-white">Video Performance</CardTitle>
            <p className="mt-1 text-xs text-slate-400">
              Measured interactions per video — playback metrics are unavailable through the Graph API
            </p>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-3 p-6">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 w-full bg-gray-700/30 rounded-lg" />
                ))}
              </div>
            ) : videos.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                <div className="mb-3 rounded-full bg-white/5 p-3 ring-1 ring-white/10">
                  <Video className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-200">No video posts found</p>
                <p className="mt-1 max-w-xs text-xs text-slate-400">
                  No post on this page carries a video attachment. Nothing is estimated here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase tracking-wider border-y border-white/5 bg-white/[0.02]">
                    <tr>
                      <th className="px-6 py-4 font-medium">Video</th>
                      <th className="px-6 py-4 font-medium">Published</th>
                      <th className="px-6 py-4 font-medium text-right">Reactions</th>
                      <th className="px-6 py-4 font-medium text-right">Comments</th>
                      <th className="px-6 py-4 font-medium text-right">Shares</th>
                      <th className="px-6 py-4 font-medium text-right">Engagements</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {videos.map((vid, i) => (
                      <tr key={vid.id || i} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 max-w-[200px] md:max-w-[300px]">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative h-10 w-16 rounded overflow-hidden flex-shrink-0">
                              {vid.image ? (
                                <img src={vid.image} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full bg-white/5" />
                              )}
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <Play className="h-3 w-3 text-white fill-white" />
                              </div>
                            </div>
                            <p className="text-xs font-medium text-gray-200 truncate">{vid.title}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-xs whitespace-nowrap">{vid.date || "—"}</td>
                        <td className="px-6 py-4 text-right text-gray-200 text-xs">{fmt(vid.likes)}</td>
                        <td className="px-6 py-4 text-right text-gray-200 text-xs">{fmt(vid.comments)}</td>
                        <td className="px-6 py-4 text-right text-gray-200 text-xs">{fmt(vid.shares)}</td>
                        <td className="px-6 py-4 text-right text-gray-200 text-xs font-medium">
                          {fmt(vid.engagements)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="surface-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-white">Interaction Mix</CardTitle>
              <p className="mt-1 text-xs text-slate-400">Summed across every video post</p>
            </CardHeader>
            <CardContent>
              <CategoryBars
                data={[
                  { name: "Reactions", value: totalLikes },
                  { name: "Comments", value: totalComments },
                  { name: "Shares", value: totalShares },
                ]}
                color={FB}
                valueLabel="Interactions"
                emptyTitle="No interactions recorded"
                emptyDetail="No video post on this page has a reaction, comment or share."
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="surface-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-white">
            <BarChart2 className="h-4 w-4" style={{ color: FB }} />
            Videos Ranked by Engagement
          </CardTitle>
          <p className="mt-1 text-xs text-slate-400">
            Bar widths and shares are computed from the engagement recorded on each video
          </p>
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
              items={[...videos]
                .sort((a, b) => (Number(b.engagements) || 0) - (Number(a.engagements) || 0))
                .map((v, i) => ({
                  id: v.id || `video-${i}`,
                  label: v.title || "Video",
                  sub: <span>{v.date || "—"}</span>,
                  value: v.engagements || 0,
                  color: FB_SERIES[1],
                }))}
              emptyTitle="No videos to rank"
              emptyDetail="This page has no video posts, so there is nothing to rank by engagement."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FacebookVideos;