// ── DashboardShared.jsx ──────────────────────────────────────────────
// Shared UI primitives extracted from the YouTube Analytics design system.
// Used by ALL analytics dashboards (YouTube, Facebook, Instagram) to ensure
// visual consistency. Only brand accent colors differ between platforms.
//
// Components:
//   DashKpiCard        — Primary KPI metric card (YT-style left-text / right-icon)
//   DashEmptyState     — Centered empty state (icon box + h3 + descriptive text)
//   DashChartCard      — Chart container with consistent header + body styling
//   DashCustomTooltip  — Dark-themed recharts tooltip
//   DashSkeleton       — Full-page skeleton rows for analytics pages

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";

// ── DashKpiCard ──────────────────────────────────────────────────────
// Primary KPI card matching the YouTube design:
// Left column: uppercase label + large bold value + trend indicator
// Right column: icon inside rounded-xl coloured background
//
// Props:
//   title        {string}    — Metric name (rendered uppercase)
//   value        {string|number}
//   icon         {Component} — Lucide icon component
//   color        {string}    — Tailwind text class e.g. "text-blue-400"
//   bg           {string}    — Tailwind bg class e.g. "bg-blue-500/10"
//   trend        {boolean}   — true → green TrendingUp, false → gray TrendingDown
//   trendLabel   {string}    — Optional label after the trend icon
export function DashKpiCard({ title, value, icon: Icon, color, bg, trend, trendLabel }) {
  return (
    <Card className="bg-[#161B22] border border-white/5 rounded-xl hover:shadow-lg hover:shadow-black/5 transition-all duration-300 group">
      <CardContent className="p-5">
        {/* Top row: label left, icon right */}
        <div className="flex items-center justify-between">
          <div>
            {/* Uppercase tracking-wider label — matches YT exactly */}
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              {title}
            </p>
            {/* Large bold value */}
            <p className="mt-1.5 text-2xl font-bold tracking-tight">
              {typeof value === "number" ? value.toLocaleString() : value}
            </p>
          </div>
          {/* Icon in rounded-xl coloured pill — scales on hover */}
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg || "bg-slate-500/10"} group-hover:scale-110 transition-transform duration-300`}>
            {Icon && <Icon className={`h-5 w-5 ${color || "text-slate-400"}`} />}
          </div>
        </div>
        {/* Trend indicator row */}
        <div className="mt-3 flex items-center gap-1">
          {trend !== undefined ? (
            trend ? (
              <>
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-xs font-medium text-emerald-400">{trendLabel || "Active"}</span>
              </>
            ) : (
              <>
                <TrendingDown className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-xs font-medium text-slate-400">{trendLabel || "No data"}</span>
              </>
            )
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

// ── DashEmptyState ───────────────────────────────────────────────────
// Centered empty state matching YoutubeAudience / YoutubePlaylists pattern.
// Large icon in a rounded-2xl pill, bold h3 title, descriptive gray text.
//
// Props:
//   title       {string}    — Bold white heading
//   description {string}    — Gray supporting text
//   icon        {Component} — Lucide icon
//   iconBg      {string}    — e.g. "bg-blue-500/10"
//   iconColor   {string}    — e.g. "text-blue-400"
export function DashEmptyState({
  title = "No data available yet",
  description = "Data will appear here once available.",
  icon: Icon,
  iconBg = "bg-slate-500/10",
  iconColor = "text-slate-400",
}) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center animate-fade-in">
      <div className="text-center max-w-md">
        {/* Icon box — rounded-2xl like YT */}
        {Icon && (
          <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${iconBg}`}>
            <Icon className={`h-8 w-8 ${iconColor}`} />
          </div>
        )}
        {/* Bold title */}
        <h3 className="text-lg font-semibold">{title}</h3>
        {/* Gray descriptive text */}
        <p className="mt-2 text-sm text-slate-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// ── DashChartCard ────────────────────────────────────────────────────
// Chart container with YT-style header and glassmorphism background.
//
// Props:
//   title        {string}    — Chart heading text
//   titleIcon    {Component} — Lucide icon before the title
//   iconColor    {string}    — e.g. "text-blue-400"
//   children     {ReactNode} — Chart content (ResponsiveContainer etc.)
//   className    {string}    — Additional classes
export function DashChartCard({ title, titleIcon: TitleIcon, iconColor = "text-slate-400", children, className = "" }) {
  return (
    <Card className={`bg-[#161B22] border border-white/5 rounded-xl shadow-sm ${className}`}>
      {title && (
        <CardHeader className="pb-2 p-5">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            {TitleIcon && <TitleIcon className={`h-4 w-4 ${iconColor}`} />}
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </Card>
  );
}

// ── DashCustomTooltip ────────────────────────────────────────────────
// Dark-themed recharts tooltip — glassmorphism style matching YT exactly.
export function DashCustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-lg px-3 py-2 shadow-xl">
      <p className="mb-1 text-xs font-medium text-slate-400">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: entry.color }}>
          {entry.name}: <span>{typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}</span>
        </p>
      ))}
    </div>
  );
}

// ── DashOverviewSkeleton ─────────────────────────────────────────────
// Full-page skeleton placeholder while analytics data is being fetched.
// Matches the YoutubeOverview skeleton structure exactly.
export function DashOverviewSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI cards skeleton row */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-white/10">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-7 w-24" />
                </div>
                <Skeleton className="h-10 w-10 rounded-xl" />
              </div>
              <Skeleton className="mt-3 h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Charts skeleton row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i} className="border-white/10">
            <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
            <CardContent><Skeleton className="h-[280px] w-full rounded-lg" /></CardContent>
          </Card>
        ))}
      </div>
      {/* Table skeleton */}
      <Card className="border-white/10">
        <CardHeader><Skeleton className="h-5 w-28" /></CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-12 w-20 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
