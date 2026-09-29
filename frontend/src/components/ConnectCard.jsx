// ── Connect Card Component ───────────────────────────────────────────
// A standardized, brand-aware connection prompt card.
// Renders when a platform account is disconnected.

import React from "react";

export default function ConnectCard({
  icon,
  cardTitle,
  cardDescription,
  onConnect,
  buttonText,
  brandBgClass,
  brandTextClass,
  brandButtonClass,
}) {
  return (
    <div className="flex w-full min-h-[50vh] items-center justify-center py-6">
      {/* ── Card Container ────────────────────────────────────────────── */}
      <div className="border-gradient surface-card flex w-full max-w-[440px] flex-col items-center rounded-2xl p-10 text-center">
        {/* ── Card Icon Box ────────────────────────────────────────────── */}
        <div
          className={`mb-6 flex shrink-0 items-center justify-center rounded-2xl border border-white/[0.07] p-4 shadow-inner-glow ${brandBgClass} ${brandTextClass}`}
        >
          {icon}
        </div>

        {/* ── Card Title ────────────────────────────────────────────────── */}
        <h2 className="mb-3 font-display text-2xl font-bold tracking-tight text-foreground">
          {cardTitle}
        </h2>

        {/* ── Card Description ──────────────────────────────────────────── */}
        <p className="mb-8 px-4 text-sm leading-relaxed text-muted-foreground">
          {cardDescription}
        </p>

        {/* ── CTA Button ────────────────────────────────────────────────── */}
        <button
          onClick={onConnect}
          className={`shine w-full rounded-xl px-4 py-3 font-semibold text-white shadow-lg transition-all duration-300 ease-smooth hover:brightness-110 hover:shadow-xl active:scale-[0.98] ${brandButtonClass}`}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
