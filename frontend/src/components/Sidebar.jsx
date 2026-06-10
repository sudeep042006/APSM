// ── Sidebar Component ───────────────────────────────────────────────
// Global navigation sidebar for the dashboard. Renders platform links,
// a branding header, and a logout action at the bottom.

import { NavLink } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Share2,
  Send,
  LogOut,
  BarChart3,
} from "lucide-react";
import { Youtube, Linkedin } from "@/components/icons/BrandIcons";
import { Button } from "@/components/ui/button";

// ── Navigation link items ───────────────────────────────────────────
const navItems = [
  { label: "YouTube", path: "/dashboard/youtube", icon: Youtube },
  { label: "LinkedIn", path: "/dashboard/linkedin", icon: Linkedin },
  { label: "Meta (FB + IG)", path: "/dashboard/meta", icon: Share2 },
  { label: "Cross-Posting", path: "/dashboard/crosspost", icon: Send },
];

export default function Sidebar() {
  const { logout, user } = useAuth();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r bg-card transition-all duration-300">
      {/* ── Branding Header ──────────────────────────────────────────── */}
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
          <BarChart3 className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight">Incubein</span>
      </div>

      {/* ── Navigation Links ─────────────────────────────────────────── */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* ── User Info & Logout ────────────────────────────────────────── */}
      <div className="border-t p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-xs font-bold text-white">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 truncate">
            <p className="text-sm font-medium truncate">{user?.name || "User"}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email || "user@example.com"}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
          onClick={logout}
          id="sidebar-logout-btn"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
