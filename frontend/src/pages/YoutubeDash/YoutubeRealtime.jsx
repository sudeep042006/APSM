// ── YouTube Realtime Page ───────────────────────────────────────────
// Professional empty state for realtime analytics.
// Realtime viewer data is not yet available from the backend API.
// Shows an animated placeholder with live-themed visual design.

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  Radio,
  Eye,
  TrendingUp,
  Zap,
  Play,
} from "lucide-react";

// ── Skeleton loading state ──────────────────────────────────────────
function RealtimeSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-white/10">
            <CardContent className="p-5">
              <Skeleton className="h-3 w-20 mb-2" />
              <Skeleton className="h-10 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-white/10">
        <CardContent className="p-5">
          <Skeleton className="h-[300px] w-full rounded-lg" />
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main Realtime Component ─────────────────────────────────────────
export default function YoutubeRealtime({ loading }) {
  // ── Loading state ─────────────────────────────────────────────────
  if (loading) return <RealtimeSkeleton />;

  // ── Preview cards for upcoming realtime features ──────────────────
  const realtimeFeatures = [
    {
      icon: Eye,
      title: "Active Viewers",
      description: "See how many people are watching your content right now.",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      icon: Activity,
      title: "Last 48 Hours",
      description: "Real-time views graph showing performance over the last 48 hours.",
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      icon: Zap,
      title: "Trending Content",
      description: "Identify which videos are currently gaining the most traction.",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      icon: Play,
      title: "Current Top Videos",
      description: "Your top-performing videos at this moment ranked by active views.",
      color: "text-red-400",
      bg: "bg-red-500/10",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Realtime Hero Section ─────────────────────────────────────── */}
      <div className="flex flex-col items-center justify-center text-center py-12">
        {/* Animated pulse icon */}
        <div className="relative mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/10 ring-1 ring-emerald-500/20">
            <Radio className="h-10 w-10 text-emerald-400" />
          </div>
          {/* Live pulse animation */}
          <div className="absolute -top-1 -right-1 flex items-center gap-1">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
          </div>
        </div>
        <h2 className="text-xl font-bold">Realtime Analytics</h2>
        <p className="mt-2 text-sm text-slate-400 max-w-md leading-relaxed">
          Realtime analytics synchronization is currently in progress. You will soon be able to monitor live viewer counts,
          trending content, and minute-by-minute performance metrics for your channel.
        </p>
      </div>

      {/* ── Simulated Live Metrics (disabled) ─────────────────────────── */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        {/* Active viewers placeholder */}
        <Card className="border-emerald-500/10 bg-white/5 dark:backdrop-blur-sm shadow-sm shadow-none col-span-2 lg:col-span-1 opacity-50">
          <CardContent className="p-6 text-center">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
              Active Viewers
            </p>
            <p className="text-4xl font-bold text-slate-400/50">--</p>
            <p className="mt-1 text-xs text-slate-400">Right now</p>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/5 dark:backdrop-blur-sm shadow-sm shadow-none opacity-50">
          <CardContent className="p-6 text-center">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
              Views (Last 48h)
            </p>
            <p className="text-4xl font-bold text-slate-400/50">--</p>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/5 dark:backdrop-blur-sm shadow-sm shadow-none opacity-50">
          <CardContent className="p-6 text-center">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
              Watch Time (Last 48h)
            </p>
            <p className="text-4xl font-bold text-slate-400/50">--</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Feature Preview Cards ─────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        {realtimeFeatures.map((feature) => (
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
