// ── Shadcn UI: Skeleton Loader Component ────────────────────────────
// Animated placeholder for content loading states.

import { cn } from "@/lib/utils";

// ── Skeleton Component ──────────────────────────────────────────────
function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };
