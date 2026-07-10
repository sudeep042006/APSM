// ── Cross-Post Layout Shell ─────────────────────────────────────────
// Wraps all /dashboard/crosspost/* routes with the CrossPostProvider.
// This ensures the post history state survives navigation between
// the Workspace Hub (/crosspost) and the Create Interface (/crosspost/new).

import { Outlet } from "react-router-dom";
import { CrossPostProvider } from "./CrossPostContext";

export default function CrossPostLayout() {
  return (
    // ── Context boundary: history persists across child route transitions ──
    <CrossPostProvider>
      <Outlet />
    </CrossPostProvider>
  );
}
