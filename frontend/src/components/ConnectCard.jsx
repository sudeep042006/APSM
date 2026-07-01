// ── Connect Card Component ───────────────────────────────────────────
// A standardized, theme-aware connection prompt card.
// Renders when a platform account is disconnected. Supports Light/Dark modes.

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
    <div className="flex min-h-[50vh] items-center justify-center py-6 w-full">
      {/* ── Card Container ────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-white/5 rounded-2xl p-10 max-w-[440px] w-full text-center shadow-lg dark:shadow-2xl flex flex-col items-center transition-colors duration-200">
        
        {/* ── Card Icon Box ────────────────────────────────────────────── */}
        <div className={`p-4 rounded-2xl mb-6 flex items-center justify-center shrink-0 ${brandBgClass} ${brandTextClass}`}>
          {icon}
        </div>

        {/* ── Card Title ────────────────────────────────────────────────── */}
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          {cardTitle}
        </h2>

        {/* ── Card Description ──────────────────────────────────────────── */}
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed px-4">
          {cardDescription}
        </p>

        {/* ── CTA Button ────────────────────────────────────────────────── */}
        <button
          onClick={onConnect}
          className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 shadow-md ${brandButtonClass}`}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
