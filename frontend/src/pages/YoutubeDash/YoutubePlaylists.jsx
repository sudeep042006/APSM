// ── YouTube Playlists Page ──────────────────────────────────────────
// Professional empty state for playlist analytics.
// Playlist-level performance data is not yet available from the backend.
// This page displays a polished placeholder with helpful messaging.

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ListVideo, Play, Clock, Eye, TrendingUp } from "lucide-react";

// ── Skeleton loading state ──────────────────────────────────────────
function PlaylistsSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-white/10">
            <CardContent className="p-5">
              <Skeleton className="h-32 w-full rounded-lg mb-3" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Main Playlists Component ────────────────────────────────────────
export default function YoutubePlaylists({ loading }) {
  // ── Loading state ─────────────────────────────────────────────────
  if (loading) return <PlaylistsSkeleton />;

  // ── Feature preview cards (coming soon state) ─────────────────────
  const upcomingFeatures = [
    {
      icon: ListVideo,
      title: "Playlist Performance",
      description: "Track views, watch time, and engagement for each of your playlists.",
      color: "text-violet-400",
      bg: "bg-violet-500/10",
    },
    {
      icon: Eye,
      title: "Playlist Views",
      description: "See total views and unique viewers per playlist over time.",
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      icon: Clock,
      title: "Playlist Watch Time",
      description: "Monitor total watch time and average session length for playlists.",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      icon: TrendingUp,
      title: "Playlist Engagement",
      description: "Compare engagement rates across your different playlists.",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Empty State Hero ──────────────────────────────────────────── */}
      <div className="flex flex-col items-center justify-center text-center py-12">
        {/* Animated icon */}
        <div className="relative mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-violet-500/10 ring-1 ring-violet-500/20">
            <ListVideo className="h-10 w-10 text-violet-400" />
          </div>
          {/* Decorative dot */}
          <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-violet-500/30 animate-pulse" />
        </div>
        <h2 className="text-xl font-bold">Playlist Analytics</h2>
        <p className="mt-2 text-sm text-slate-400 max-w-md leading-relaxed">
          Playlist-level analytics are coming soon. You'll be able to track performance,
          views, watch time, and engagement for each of your YouTube playlists.
        </p>
      </div>

      {/* ── Feature Preview Cards ─────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        {upcomingFeatures.map((feature) => (
          <Card
            key={feature.title}
            className="border-white/10 bg-white/5 dark:backdrop-blur-sm shadow-sm shadow-none opacity-60 hover:opacity-80 transition-opacity duration-300"
          >
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${feature.bg}`}>
                  <feature.icon className={`h-5 w-5 ${feature.color}`} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{feature.title}</h3>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
