// ── 404 Not Found Page ──────────────────────────────────────────────
// Fallback error view for undefined routes.

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center">
        {/* ── Icon ────────────────────────────────────────────────────── */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10">
          <AlertTriangle className="h-10 w-10 text-destructive" />
        </div>

        {/* ── Error Text ─────────────────────────────────────────────── */}
        <h1 className="mb-2 text-6xl font-extrabold tracking-tighter text-foreground">
          404
        </h1>
        <p className="mb-6 text-lg text-muted-foreground">
          Page not found. The route you're looking for doesn't exist.
        </p>

        {/* ── Action Buttons ─────────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-3">
          <Link to="/">
            <Button className="gap-2" id="notfound-home-btn">
              <Home className="h-4 w-4" /> Back to Home
            </Button>
          </Link>
          <Link to="/dashboard/youtube">
            <Button variant="outline" id="notfound-dashboard-btn">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
