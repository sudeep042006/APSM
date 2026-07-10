// ── Dashboard Header Component ────────────────────────────────────────
// A theme-aware header component rendering title, subtitle, and branded icon box.
// Supports Light/Dark modes.

import React from "react";

export default function DashboardHeader({
  title,
  subtitle,
  icon,
  brandBgClass,
  brandTextClass,
}) {
  return (
    <div className="flex items-center gap-3">
      {/* ── Branded Icon Box ─────────────────────────────────────────── */}
      <div className={`p-3 rounded-xl flex items-center justify-center shrink-0 ${brandBgClass} ${brandTextClass}`}>
        {icon}
      </div>

      {/* ── Header Title & Subtitle ───────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-wide">
          {title}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          {subtitle}
        </p>
      </div>
    </div>
  );
}
