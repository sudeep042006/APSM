// ── Navbar Component ────────────────────────────────────────────────
// Top navigation bar for the dashboard. Shows the current page title
// and right-side actions in a frosted, brand-tinted sticky header.

import { useTheme } from "@/context/ThemeContext";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Navbar({ title = "Dashboard" }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.07] bg-surface/70 px-6 text-white backdrop-blur-2xl">
      {/* ── Page Title ────────────────────────────────────────────────── */}
      <div className="flex min-w-0 items-center gap-3">
        <h1 className="truncate font-display text-lg font-semibold tracking-tight text-white">
          {title}
        </h1>
        <span className="hidden items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-primary sm:inline-flex">
          <span className="status-dot bg-emerald-400" />
          Live
        </span>
      </div>

      {/* ── Right-side Actions ────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        {/* ── Notifications Button (placeholder) ──────────────────────── */}
        <Link to="/notifications">
          <Button
            variant="ghost"
            size="icon"
            id="navbar-notifications-btn"
            aria-label="Notifications"
            className="relative text-muted-foreground hover:bg-white/[0.07] hover:text-white"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
          </Button>
        </Link>
      </div>
    </header>
  );
}
