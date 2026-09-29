// ── Sidebar Component ───────────────────────────────────────────────
// Global navigation sidebar for the dashboard. Renders platform links,
// a branding header, and a logout action at the bottom.

import { NavLink } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  LogOut,
  Menu,
  LayoutDashboard,
  Send,
  ChevronLeft,
} from "lucide-react";
import { Youtube, Linkedin, Facebook, Instagram } from "@/components/icons/BrandIcons";
import { Button } from "@/components/ui/button";
import ApsmLogo from "@/assets/images/apsm-logo.svg";

// ── Navigation Link Items ───────────────────────────────────────────
// Defines the left-hand menu navigation links. Unbundled Meta into
// separate Facebook and Instagram entries.
const navItems = [
  { label: "Combined Overview", path: "/dashboard/combined", icon: LayoutDashboard, isNew: true },
  { label: "YouTube", path: "/dashboard/youtube", icon: Youtube, tint: "#FF4E45" },
  { label: "LinkedIn", path: "/dashboard/linkedin", icon: Linkedin, tint: "#5C8DFA" },
  { label: "Facebook", path: "/dashboard/facebook", icon: Facebook, tint: "#8F73F2" },
  { label: "Instagram", path: "/dashboard/instagram", icon: Instagram, tint: "#C86DD7" },
  { label: "Cross-Posting", path: "/dashboard/crosspost", icon: Send, tint: "#22D3EE" },
];

// ── Small section label above the platform group ─────────────────────
function SectionLabel({ children, collapsed }) {
  if (collapsed) {
    return <div className="mx-auto my-3 h-px w-6 bg-gradient-to-r from-transparent via-white/15 to-transparent" />;
  }
  return (
    <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/60">
      {children}
    </p>
  );
}

export default function Sidebar({ isCollapsed, setIsCollapsed }) {
  const { logout, user } = useAuth();
  const initials = user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-white/[0.07] bg-surface/80 text-white backdrop-blur-2xl transition-all duration-300 ease-smooth ${
        isCollapsed ? "w-[72px]" : "w-64"
      }`}
    >
      {/* ── Subtle brand bloom anchored to the sidebar ───────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(120%_100%_at_0%_0%,hsl(var(--brand-violet)/0.14),transparent_70%)]"
      />

      {/* ── Branding Header ──────────────────────────────────────────── */}
      <div
        className={`relative flex h-16 items-center border-b border-white/[0.07] px-4 ${
          isCollapsed ? "justify-center" : "justify-between"
        }`}
      >
        {isCollapsed ? (
          <button
            onClick={() => setIsCollapsed(false)}
            title="Expand sidebar"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-[linear-gradient(135deg,hsl(var(--brand-violet)),hsl(var(--brand-indigo)))] shadow-glow-sm transition-transform duration-300 hover:scale-105 active:scale-95"
          >
            <img src={ApsmLogo} alt="APSM" className="h-5 w-5 object-contain brightness-0 invert" />
          </button>
        ) : (
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[linear-gradient(135deg,hsl(var(--brand-violet)),hsl(var(--brand-indigo))_55%,hsl(var(--brand-blue)))] shadow-glow-sm">
              <div className="noise-overlay" />
              <img
                src={ApsmLogo}
                alt="APSM Logo"
                className="relative h-5 w-5 object-contain brightness-0 invert"
              />
            </div>
            <div className="min-w-0">
              <p className="font-display text-[15px] font-bold leading-none tracking-tight text-white">
                APSM
              </p>
              <p className="mt-0.5 truncate text-[10px] font-medium leading-none text-muted-foreground">
                Social Media OS
              </p>
            </div>
          </div>
        )}

        {!isCollapsed && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setIsCollapsed(true)}
            title="Collapse sidebar"
            className="text-muted-foreground hover:bg-white/[0.07] hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* ── Navigation Links ─────────────────────────────────────────── */}
      <nav className="relative flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-3 py-4">
        <SectionLabel collapsed={isCollapsed}>Workspace</SectionLabel>

        {navItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={item.path}>
              {idx === 1 && <SectionLabel collapsed={isCollapsed}>Platforms</SectionLabel>}
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `group relative flex items-center rounded-xl py-2.5 text-sm font-semibold tracking-[-0.01em] transition-all duration-300 ease-smooth ${
                    isCollapsed ? "justify-center px-0" : "gap-3 px-3"
                  } ${
                    isActive
                      ? "border border-primary/25 bg-[linear-gradient(100deg,hsl(var(--brand-violet)/0.20),hsl(var(--brand-blue)/0.08))] text-white shadow-glow-sm"
                      : "border border-transparent text-muted-foreground hover:translate-x-0.5 hover:bg-white/[0.05] hover:text-white"
                  }`
                }
                title={isCollapsed ? item.label : undefined}
              >
                {({ isActive }) => (
                  <>
                    {/* Active indicator rail */}
                    {isActive && (
                      <span className="absolute inset-y-1/2 left-0 h-6 w-[2px] -translate-y-1/2 rounded-r-full bg-[linear-gradient(180deg,hsl(var(--brand-violet)),hsl(var(--brand-blue)))] shadow-[0_0_12px_hsl(var(--primary)/0.9)]" />
                    )}

                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all duration-300 ${
                        isActive
                          ? "bg-white/[0.08] text-white shadow-inner"
                          : "text-muted-foreground group-hover:text-white"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>

                    {!isCollapsed && (
                      <>
                        <span className="whitespace-nowrap">{item.label}</span>
                        {item.isNew && (
                          <span className="ml-auto rounded-md bg-[linear-gradient(120deg,hsl(var(--brand-violet)),hsl(var(--brand-blue)))] px-1.5 py-0.5 text-[9px] font-extrabold tracking-[0.12em] text-white shadow-glow-sm">
                            NEW
                          </span>
                        )}
                      </>
                    )}
                  </>
                )}
              </NavLink>
            </div>
          );
        })}
      </nav>

      {/* ── User Info & Logout ────────────────────────────────────────── */}
      <div className="relative border-t border-white/[0.07] p-3">
        <div
          className={`mb-2 flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-2 ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,hsl(var(--brand-purple)),hsl(var(--brand-blue)))] text-xs font-bold text-white shadow-glow-sm">
            {initials}
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold leading-tight text-white">
                {user?.name || "User"}
              </p>
              <p className="truncate text-[11px] leading-tight text-muted-foreground">
                {user?.email || "user@example.com"}
              </p>
            </div>
          )}
        </div>

        {isCollapsed ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            id="sidebar-logout-btn"
            title="Logout"
            className="w-full text-muted-foreground hover:bg-destructive/10 hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground hover:bg-destructive/10 hover:text-red-400"
            onClick={logout}
            id="sidebar-logout-btn"
          >
            <LogOut className="h-4 w-4" />
            <span>Log out</span>
          </Button>
        )}
      </div>

      {/* ── Collapsed-state expander ──────────────────────────────────── */}
      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          title="Expand sidebar"
          className="absolute -right-3 top-[70px] z-50 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-surface-overlay text-muted-foreground shadow-lg transition-all duration-300 ease-smooth hover:scale-110 hover:border-primary/40 hover:text-white"
        >
          <Menu className="h-3 w-3" />
        </button>
      )}
    </aside>
  );
}
