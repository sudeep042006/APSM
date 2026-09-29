// ── 404 Not Found Page ──────────────────────────────────────────────
// Fallback error view for undefined routes.

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, AlertTriangle, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="aurora-bg relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div className="noise-overlay" />

      <div className="relative z-10 text-center">
        {/* ── Icon ────────────────────────────────────────────────── */}
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl border border-primary/25 bg-primary/10 shadow-glow-sm">
          <AlertTriangle className="h-9 w-9 text-primary" />
        </div>

        {/* ── Error Text ──────────────────────────────────────────── */}
        <p className="mb-2 font-display text-7xl font-extrabold tracking-tightest text-gradient sm:text-8xl">
          404
        </p>
        <h1 className="mb-3 font-display text-2xl font-bold tracking-tight text-white">
          This route went off-script
        </h1>
        <p className="mx-auto mb-9 max-w-md text-base leading-relaxed text-muted-foreground">
          Page not found. The route you're looking for doesn't exist — but your
          analytics are still right where you left them.
        </p>

        {/* ── Action Buttons ──────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to="/">
            <Button size="lg" className="gap-2" id="notfound-home-btn">
              <Home className="h-4 w-4" /> Back to Home
            </Button>
          </Link>
          <Link to="/dashboard/youtube">
            <Button variant="outline" size="lg" id="notfound-dashboard-btn" className="gap-2">
              <Compass className="h-4 w-4" /> Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
