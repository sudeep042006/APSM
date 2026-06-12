// ── Navbar Component ────────────────────────────────────────────────
// Top navigation bar for the dashboard. Shows the current page title,
// a theme toggle button, and search placeholder.

import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun, Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar({ title = "Dashboard" }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card/80 px-6 backdrop-blur-md">
      {/* ── Page Title ────────────────────────────────────────────────── */}
      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>

      {/* ── Right-side Actions ────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        {/* ── Search Button (placeholder) ──────────────────────────────── */}
        <Button variant="ghost" size="icon" id="navbar-search-btn">
          <Search className="h-4 w-4" />
        </Button>

        {/* ── Notifications Button (placeholder) ──────────────────────── */}
        <Button variant="ghost" size="icon" id="navbar-notifications-btn">
          <Bell className="h-4 w-4" />
        </Button>

        {/* ── Theme Toggle ──────────────────────────────────────────────── */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          id="navbar-theme-toggle"
          aria-label="Toggle theme"
        >
          {isDark ? (
            <Sun className="h-4 w-4 transition-transform duration-300" />
          ) : (
            <Moon className="h-4 w-4 transition-transform duration-300" />
          )}
        </Button>
      </div>
    </header>
  );
}
