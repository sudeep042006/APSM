// ── Shadcn UI: Skeleton Loader Component ────────────────────────────
// Animated placeholder for content loading states.
// Uses the brand shimmer sweep rather than a flat opacity pulse.

import { cn } from "@/lib/utils";

// ── Skeleton Component ──────────────────────────────────────────────
function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("shimmer rounded-xl border border-white/[0.05]", className)}
      {...props}
    />
  );
}

export { Skeleton };
