// ── Chart Empty State ────────────────────────────────────────────────
// Replaces the "chart frame renders but shows nothing" failure mode with an
// explicit, honest explanation. Previously pages rendered an all-zero chart
// with no message at all, so users could not tell a real zero from a bug.

import { DatabaseZap, Info } from "lucide-react";

export default function ChartEmptyState({ title, detail, height = 240, technical }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-6 text-center"
      style={{ minHeight: height }}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
        <DatabaseZap className="h-5 w-5 text-slate-400" />
      </div>

      <div className="space-y-1">
        <p className="text-sm font-semibold text-slate-200">{title}</p>
        {detail && <p className="mx-auto max-w-sm text-xs leading-relaxed text-slate-400">{detail}</p>}
      </div>

      {technical && (
        <p className="flex max-w-sm items-start gap-1.5 rounded-lg bg-black/30 px-2.5 py-1.5 text-left font-mono text-[10px] leading-relaxed text-slate-500">
          <Info className="mt-px h-3 w-3 shrink-0" />
          <span>{technical}</span>
        </p>
      )}
    </div>
  );
}
