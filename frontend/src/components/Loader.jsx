// ── Loader Component ────────────────────────────────────────────────
// Full-screen loading spinner used during auth checks and data fetching.

import { BarChart3 } from "lucide-react";

export default function Loader() {
  return (
    <div className="aurora-bg flex h-screen w-full items-center justify-center bg-background">
      {/* ── Animated brand icon ──────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-5">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,hsl(var(--brand-violet)),hsl(var(--brand-indigo))_55%,hsl(var(--brand-blue)))] shadow-glow-lg">
          <div className="noise-overlay" />
          <BarChart3 className="relative h-7 w-7 text-white animate-pulse" />
        </div>

        {/* ── Progress rail ───────────────────────────────────────────── */}
        <div className="relative h-1 w-44 overflow-hidden rounded-full bg-white/[0.07]">
          <div className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-[linear-gradient(90deg,transparent,hsl(var(--brand-violet)),hsl(var(--brand-cyan)),transparent)] animate-beam-sweep" />
        </div>

        <p className="text-sm font-medium tracking-wide text-muted-foreground animate-pulse">
          Loading APSM...
        </p>
      </div>
    </div>
  );
}
