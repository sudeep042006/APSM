// ── Dashboard Header Component ────────────────────────────────────────
// A brand-aware header component rendering title, subtitle, and a
// branded icon box.

import React from "react";

export default function DashboardHeader({
  title,
  subtitle,
  icon,
  brandBgClass,
  brandTextClass,
}) {
  return (
    <div className="flex min-w-0 items-center gap-3.5">
      {/* ── Branded Icon Box ─────────────────────────────────────────── */}
      <div
        className={`flex shrink-0 items-center justify-center rounded-xl border border-white/[0.07] p-2.5 shadow-inner-glow ${brandBgClass} ${brandTextClass}`}
      >
        {icon}
      </div>

      {/* ── Header Title & Subtitle ───────────────────────────────────── */}
      <div className="min-w-0">
        <h1 className="truncate font-display text-xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}
