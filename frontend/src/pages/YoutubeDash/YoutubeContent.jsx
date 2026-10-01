// ── YouTube Content Page ────────────────────────────────────────────
// Content management view with tabbed navigation (Videos, Shorts, Live,
// Posts, Playlists, Promotions). Displays video table with search,
// sort, and filter controls. Handles loading, empty, and error states.

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import {
  Search,
  Play,
  Eye,
  ThumbsUp,
  MessageSquare,
  Clock,
  ArrowUpDown,
  Film,
  Radio,
  FileText,
  ListVideo,
  Megaphone,
  Video,
  BarChart3,
  Activity,
  Gauge,
} from "lucide-react";
import ChartCard from "@/components/charts/ChartCard";
import ChartTooltip from "@/components/charts/ChartTooltip";
import DonutChart from "@/components/charts/DonutChart";
import { CHART_COLORS, CURSOR, axisX, axisY, compact } from "@/components/charts/chartTheme";
import {
  parseRecentVideos,
  formatCompactNumber,
  formatDuration,
  formatRelativeTime,
} from "@/services/ytapi";

// ── Skeleton Loading State ──────────────────────────────────────────
function ContentSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Tab bar skeleton */}
      <Skeleton className="h-10 w-full max-w-xl rounded-lg" />
      {/* Search bar skeleton */}
      <Skeleton className="h-10 w-full max-w-sm rounded-lg" />
      {/* Table skeleton */}
      <Card className="border-white/10">
        <CardContent className="p-0">
          <div className="space-y-0 divide-y divide-border/30">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <Skeleton className="h-14 w-24 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <Skeleton className="h-4 w-16 hidden sm:block" />
                <Skeleton className="h-4 w-12 hidden md:block" />
                <Skeleton className="h-4 w-12 hidden md:block" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Empty Tab State ─────────────────────────────────────────────────
// Reusable empty state for tabs without data (Shorts, Live, Posts, etc).
function EmptyTabState({ icon: Icon, title, description }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center animate-fade-in">
      <div className="text-center max-w-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50">
          <Icon className="h-7 w-7 text-slate-400" />
        </div>
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-slate-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// ── Sort Options ────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { key: "date", label: "Date" },
  { key: "views", label: "Views" },
  { key: "likes", label: "Likes" },
  { key: "comments", label: "Comments" },
];

// ── Main Content Component ──────────────────────────────────────────
export default function YoutubeContent({ data, loading }) {
  // ── Local state for search, sort, and active tab ──────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  // ── Filter and sort videos (hook must be above any early return) ──
  const filteredVideos = useMemo(() => {
    if (!data) return [];
    const allVideos = parseRecentVideos(data);
    let filtered = [...allVideos];

    // Apply search filter (case-insensitive title search)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((v) =>
        v.title.toLowerCase().includes(q)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let valA, valB;
      switch (sortBy) {
        case "views":
          valA = a.viewCount;
          valB = b.viewCount;
          break;
        case "likes":
          valA = a.likeCount;
          valB = b.likeCount;
          break;
        case "comments":
          valA = a.commentCount;
          valB = b.commentCount;
          break;
        default: // date
          valA = new Date(a.publishedAt).getTime();
          valB = new Date(b.publishedAt).getTime();
      }
      return sortOrder === "desc" ? valB - valA : valA - valB;
    });

    return filtered;
  }, [data, searchQuery, sortBy, sortOrder]);

  // ── Library performance, derived from each video's own statistics ───
  // The channel reports its most recent uploads, each with its own measured
  // view / like / comment counts. Every figure below is a ratio or sum of
  // those measured values. Declared above the early return to respect the
  // Rules of Hooks.
  const libraryStats = useMemo(() => {
    const all = parseRecentVideos(data);
    const withViews = all.filter((v) => v.viewCount > 0);
    const totalViews = withViews.reduce((a, v) => a + v.viewCount, 0);
    const totalLikes = all.reduce((a, v) => a + (v.likeCount || 0), 0);
    const totalComments = all.reduce((a, v) => a + (v.commentCount || 0), 0);
    const totalEngagements = totalLikes + totalComments;

    const topByViews = [...withViews]
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 10)
      .map((v) => ({
        id: v.id,
        title: v.title,
        views: v.viewCount,
        likes: v.likeCount || 0,
        comments: v.commentCount || 0,
        likesPer1k: v.viewCount > 0 ? ((v.likeCount || 0) / v.viewCount) * 1000 : 0,
      }));

    // A ratio is meaningless on tiny denominators: 1 like on 4 views reads as
    // 25%. Require a real sample before ranking by rate.
    const topByRate = [...withViews]
      .filter((v) => v.viewCount >= 50)
      .map((v) => ({
        id: v.id,
        title: v.title,
        rate: v.viewCount > 0 ? (((v.likeCount || 0) + (v.commentCount || 0)) / v.viewCount) * 100 : 0,
      }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 8);

    const formatSplit = [
      { name: "Long-form", value: all.filter((v) => !v.isShort).reduce((a, v) => a + v.viewCount, 0) },
      { name: "Shorts", value: all.filter((v) => v.isShort).reduce((a, v) => a + v.viewCount, 0) },
    ].filter((f) => f.value > 0);

    return {
      total: all.length,
      totalViews,
      totalEngagements,
      avgViews: withViews.length > 0 ? Math.round(totalViews / withViews.length) : 0,
      avgRate: totalViews > 0 ? (totalEngagements / totalViews) * 100 : 0,
      topByViews,
      topByRate,
      formatSplit,
    };
  }, [data]);

  // ── Loading state (placed AFTER all hooks) ────────────────────────
  if (loading) return <ContentSkeleton />;

  // ── Toggle sort order ─────────────────────────────────────────────
  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
    } else {
      setSortBy(key);
      setSortOrder("desc");
    }
  };

  const regularVideos = filteredVideos.filter((v) => !v.isShort);
  const shortVideos = filteredVideos.filter((v) => v.isShort);

  const renderVideoList = (videoList, emptyIcon, emptyTitle, emptyDesc) => {
    return videoList.length > 0 ? (
      <Card className="border-white/10 bg-white/5 backdrop-blur-lg shadow-sm shadow-none overflow-hidden">
        <CardContent className="p-0">
          <div className="hidden md:grid grid-cols-[1fr_80px_80px_80px_80px_100px] gap-4 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-white/10 bg-muted/20">
            <span>Video</span>
            <span className="text-center">Views</span>
            <span className="text-center">Likes</span>
            <span className="text-center">Comments</span>
            <span className="text-center">Duration</span>
            <span className="text-right">Published</span>
          </div>
          <div className="divide-y divide-border/20">
            {videoList.map((video) => (
              <div
                key={video.id}
                className="flex flex-col md:grid md:grid-cols-[1fr_80px_80px_80px_80px_100px] gap-2 md:gap-4 items-start md:items-center p-4 hover:bg-accent/30 transition-colors duration-200 group"
              >
                <div className="flex items-center gap-3 min-w-0 w-full md:w-auto">
                  {video.thumbnail ? (
                    <div className="relative shrink-0">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="h-12 w-20 rounded-md object-cover ring-1 ring-border/20"
                      />
                      <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-12 w-20 shrink-0 items-center justify-center rounded-md bg-muted">
                      <Play className="h-4 w-4 text-slate-400" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{video.title}</p>
                    <div className="flex items-center gap-2 md:hidden mt-1 text-xs text-slate-400">
                      <span>{formatCompactNumber(video.viewCount)} views</span>
                      <span>•</span>
                      <span>{formatRelativeTime(video.publishedAt)}</span>
                    </div>
                  </div>
                </div>
                <span className="hidden md:flex items-center justify-center gap-1 text-sm">
                  <Eye className="h-3 w-3 text-blue-400" />
                  {formatCompactNumber(video.viewCount)}
                </span>
                <span className="hidden md:flex items-center justify-center gap-1 text-sm">
                  <ThumbsUp className="h-3 w-3 text-emerald-400" />
                  {formatCompactNumber(video.likeCount)}
                </span>
                <span className="hidden md:flex items-center justify-center gap-1 text-sm">
                  <MessageSquare className="h-3 w-3 text-amber-400" />
                  {formatCompactNumber(video.commentCount)}
                </span>
                <span className="hidden md:flex items-center justify-center gap-1 text-xs text-slate-400">
                  <Clock className="h-3 w-3" />
                  {formatDuration(video.duration)}
                </span>
                <span className="hidden md:block text-right text-xs text-slate-400">
                  {formatRelativeTime(video.publishedAt)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    ) : (
      <EmptyTabState icon={emptyIcon} title={emptyTitle} description={emptyDesc} />
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Content Type Tabs ─────────────────────────────────────────── */}
      <Tabs defaultValue="videos" className="w-full">
        <TabsList className="bg-muted/50 h-auto flex-wrap gap-1 p-1">
          <TabsTrigger value="videos" className="gap-1.5 text-xs sm:text-sm">
            <Video className="h-3.5 w-3.5" />
            Videos
          </TabsTrigger>
          <TabsTrigger value="shorts" className="gap-1.5 text-xs sm:text-sm">
            <Film className="h-3.5 w-3.5" />
            Shorts
          </TabsTrigger>
          <TabsTrigger value="live" className="gap-1.5 text-xs sm:text-sm">
            <Radio className="h-3.5 w-3.5" />
            Live
          </TabsTrigger>
          <TabsTrigger value="posts" className="gap-1.5 text-xs sm:text-sm">
            <FileText className="h-3.5 w-3.5" />
            Posts
          </TabsTrigger>
          <TabsTrigger value="playlists" className="gap-1.5 text-xs sm:text-sm">
            <ListVideo className="h-3.5 w-3.5" />
            Playlists
          </TabsTrigger>
          <TabsTrigger value="promotions" className="gap-1.5 text-xs sm:text-sm">
            <Megaphone className="h-3.5 w-3.5" />
            Promotions
          </TabsTrigger>
        </TabsList>

        {/* ── Videos Tab Content ───────────────────────────────────────── */}
        <TabsContent value="videos" className="mt-4">
          {/* ── Library performance (measured per video) ──────────────── */}
          <div className="mb-6 space-y-4">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                {
                  title: "Videos Analysed",
                  value: formatCompactNumber(libraryStats.total),
                  icon: Video,
                  hint: "Most recent uploads from the channel",
                },
                {
                  title: "Combined Views",
                  value: formatCompactNumber(libraryStats.totalViews),
                  icon: Eye,
                  hint: "Sum across the listed videos",
                },
                {
                  title: "Avg Views / Video",
                  value: formatCompactNumber(libraryStats.avgViews),
                  icon: BarChart3,
                  hint: "Measured mean, videos with views only",
                },
                {
                  title: "Avg Engagement Rate",
                  value: `${libraryStats.avgRate.toFixed(2)}%`,
                  icon: Activity,
                  hint: "Likes + comments ÷ views",
                },
              ].map((kpi) => (
                <Card key={kpi.title} className="surface-card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                        {kpi.title}
                      </p>
                      <p className="mt-2 text-[26px] font-bold leading-none tracking-tight text-white tabular-nums">
                        {kpi.value}
                      </p>
                      <p className="mt-2 text-[10px] leading-relaxed text-slate-500">{kpi.hint}</p>
                    </div>
                    <span className="rounded-lg bg-white/5 p-1.5 ring-1 ring-white/10">
                      <kpi.icon className="h-3.5 w-3.5 text-slate-300" />
                    </span>
                  </div>
                </Card>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <ChartCard
                title="Top Videos by Views"
                subtitle="Measured lifetime views for the highest-performing uploads"
                icon={<Eye className="h-4 w-4 text-blue-400" />}
                data={libraryStats.topByViews}
                valueKeys="views"
                height={Math.max(280, libraryStats.topByViews.length * 30 + 40)}
                emptyMessages={{
                  noDataTitle: "No video view data",
                  noDataDetail: "The channel returned no uploads with a public view count.",
                }}
              >
                {(rows) => (
                  <ResponsiveContainer width="100%" height={Math.max(280, rows.length * 30 + 40)}>
                    <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 32, left: 8, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" horizontal={false} />
                      <XAxis type="number" {...axisX({ tickFormatter: compact, dy: 0 })} />
                      <YAxis
                        type="category"
                        dataKey="title"
                        {...axisY({
                          width: 150,
                          tick: { fill: "#CBD5E1", fontSize: 11 },
                          dy: 0,
                          tickFormatter: (v) => (String(v).length > 24 ? `${String(v).slice(0, 24)}…` : v),
                        })}
                      />
                      <Tooltip content={<ChartTooltip />} cursor={CURSOR} labelFormatter={(l) => String(l)} />
                      <Bar dataKey="views" name="Views" radius={[0, 4, 4, 0]} maxBarSize={22}>
                        {rows.map((row, i) => (
                          <Cell key={row.id || i} fill={CHART_COLORS.info} fillOpacity={1 - i * 0.08} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>

              <div className="grid gap-6">
                <ChartCard
                  title="Like-to-View Ratio"
                  subtitle="Likes per 1,000 views, highest first"
                  icon={<Gauge className="h-4 w-4 text-emerald-400" />}
                  data={libraryStats.topByRate}
                  valueKeys="rate"
                  height={Math.max(240, libraryStats.topByRate.length * 28 + 40)}
                  emptyMessages={{
                    noDataTitle: "Not enough signal",
                    noDataDetail:
                      "This ratio is only meaningful for videos with at least 50 views, otherwise a single like would read as a 20% rate.",
                  }}
                >
                  {(rows) => (
                    <ResponsiveContainer width="100%" height={Math.max(240, rows.length * 28 + 40)}>
                      <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 32, left: 8, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" horizontal={false} />
                        <XAxis type="number" {...axisX({ tickFormatter: (v) => `${v.toFixed(0)}`, dy: 0 })} />
                        <YAxis
                          type="category"
                          dataKey="title"
                          {...axisY({
                            width: 150,
                            tick: { fill: "#CBD5E1", fontSize: 11 },
                            dy: 0,
                            tickFormatter: (v) => (String(v).length > 24 ? `${String(v).slice(0, 24)}…` : v),
                          })}
                        />
                        <Tooltip content={<ChartTooltip format="number" />} cursor={CURSOR} labelFormatter={(l) => String(l)} />
                        <Bar dataKey="rate" name="Likes per 1K views" radius={[0, 4, 4, 0]} maxBarSize={18}>
                          {rows.map((row, i) => (
                            <Cell key={row.id || i} fill={CHART_COLORS.success} fillOpacity={1 - i * 0.1} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </ChartCard>

                {libraryStats.formatSplit.length > 1 && (
                  <ChartCard
                    title="Format Split"
                    subtitle="Views by long-form vs Shorts"
                    icon={<Film className="h-4 w-4 text-violet-400" />}
                    data={libraryStats.formatSplit}
                    valueKeys="value"
                    height={200}
                  >
                    {(rows) => (
                      <DonutChart
                        data={rows}
                        height={200}
                        outerRadius={78}
                        innerRadius={52}
                        centerLabel="Views"
                        colors={[CHART_COLORS.primary, CHART_COLORS.pink]}
                      />
                    )}
                  </ChartCard>
                )}
              </div>
            </div>
          </div>

          {/* Search and Sort Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
            {/* Search bar */}
            <div className="relative flex-1 w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-lg border border-white/10 bg-card/50 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all"
                id="yt-content-search"
              />
            </div>
            {/* Sort buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {SORT_OPTIONS.map((opt) => (
                <Button
                  key={opt.key}
                  variant={sortBy === opt.key ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => handleSort(opt.key)}
                  className="gap-1 text-xs h-8"
                  id={`yt-sort-${opt.key}`}
                >
                  {opt.label}
                  {sortBy === opt.key && (
                    <ArrowUpDown className="h-3 w-3" />
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* Video Table */}
          {renderVideoList(
            regularVideos,
            Video,
            searchQuery ? "No matching videos" : "No videos found",
            searchQuery ? `No videos match "${searchQuery}". Try a different search term.` : "Your uploaded videos will appear here once analytics data is available."
          )}
        </TabsContent>

        {/* ── Shorts Tab ──────────────────────────────────────────────── */}
        <TabsContent value="shorts" className="mt-4">
          {renderVideoList(
            shortVideos,
            Film,
            searchQuery ? "No matching Shorts" : "No Shorts found",
            searchQuery ? `No Shorts match "${searchQuery}". Try a different search term.` : "Your YouTube Shorts will appear here once analytics data is available."
          )}
        </TabsContent>

        {/* ── Live Tab ────────────────────────────────────────────────── */}
        <TabsContent value="live" className="mt-4">
          <EmptyTabState
            icon={Radio}
            title="Live Stream Analytics Processing"
            description="Metrics for live streams, including concurrent viewers and chat activity, will populate as data is aggregated."
          />
        </TabsContent>

        {/* ── Posts Tab ───────────────────────────────────────────────── */}
        <TabsContent value="posts" className="mt-4">
          <EmptyTabState
            icon={FileText}
            title="Community Posts Analytics Processing"
            description="Performance metrics for your community posts and polls will be available here."
          />
        </TabsContent>

        {/* ── Playlists Tab ───────────────────────────────────────────── */}
        <TabsContent value="playlists" className="mt-4">
          <EmptyTabState
            icon={ListVideo}
            title="Playlist Analytics Processing"
            description="Playlist-level metrics, such as views and watch time, will be displayed upon data synchronization."
          />
        </TabsContent>

        {/* ── Promotions Tab ──────────────────────────────────────────── */}
        <TabsContent value="promotions" className="mt-4">
          <EmptyTabState
            icon={Megaphone}
            title="Promotion Analytics Processing"
            description="Campaign performance metrics are currently being tracked and will be visualized upon initial sync completion."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
