// ── Cross-Post Layout Shell ──────────────────────────────────────────
// Wraps every /dashboard/crosspost/* route in the CrossPostProvider and
// renders the section's own sub-navigation, matching the pattern used by the
// YouTube / Instagram / Facebook dashboards: a collapsible inner sidebar with
// the page content scrolling beside it.
//
// The sidebar reads its pending-request count from the same context the
// requests inbox uses, so the badge can never disagree with the list.

import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { CrossPostProvider, useCrossPost } from "./CrossPostContext";
import DashboardHeader from "@/components/DashboardHeader";
import {
  Send,
  LayoutDashboard,
  Inbox,
  PenSquare,
  History,
  PanelLeft,
  PanelLeftClose,
  Menu,
  X,
} from "lucide-react";

// Section accent — matches the Cross-Posting tint in the main sidebar.
// Written as literals so Tailwind can generate the arbitrary-value classes.
const ACCENT = "#22D3EE";
const ACCENT_TEXT = "text-[#22D3EE]";
const ACCENT_BG = "bg-[#22D3EE]/10";
const ACCENT_ACTIVE = "border-[#22D3EE]/25 bg-[#22D3EE]/10";

const NAV_ITEMS = [
  { to: "/dashboard/crosspost", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/dashboard/crosspost/requests", label: "Incoming Requests", icon: Inbox, showPending: true },
  { to: "/dashboard/crosspost/new", label: "Compose", icon: PenSquare },
  { to: "/dashboard/crosspost/history", label: "Publishing History", icon: History },
];

const SidebarLink = ({ to, icon: Icon, label, end, pending, onClick, isCollapsed }) => (
  <NavLink
    to={to}
    end={end}
    onClick={onClick}
    title={isCollapsed ? label : undefined}
    className={({ isActive }) =>
      `group relative flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] font-semibold tracking-[-0.01em] transition-all duration-300 ease-smooth ${
        isCollapsed ? "justify-center" : ""
      } ${
        isActive
          ? `${ACCENT_ACTIVE} text-white`
          : "border border-transparent text-muted-foreground hover:translate-x-0.5 hover:bg-white/[0.05] hover:text-white"
      }`
    }
  >
    {({ isActive }) => (
      <>
        {isActive && (
          <span
            className="absolute inset-y-1/2 left-0 h-5 w-[2px] -translate-y-1/2 rounded-r-full bg-[#22D3EE]"
            style={{ boxShadow: `0 0 10px ${ACCENT}` }}
          />
        )}
        <Icon className={`h-4 w-4 shrink-0 transition-transform duration-300 ${isActive ? "" : "group-hover:scale-110"}`} />
        {!isCollapsed && (
          <>
            <span className="truncate">{label}</span>
            {pending > 0 && (
              <span className="ml-auto rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-400 ring-1 ring-inset ring-amber-500/25">
                {pending}
              </span>
            )}
          </>
        )}
      </>
    )}
  </NavLink>
);

const Sidebar = ({ collapsed, setCollapsed, isMobileOpen, closeMobile, pending }) => (
  <aside
    className={`
      fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/[0.07]
      bg-surface/80 backdrop-blur-2xl lg:bg-surface lg:backdrop-blur-none
      transition-all duration-300 ease-in-out
      lg:static lg:translate-x-0
      ${isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"}
      ${collapsed ? "lg:w-[72px]" : "lg:w-64"}
    `}
  >
    <div className="flex justify-end border-b border-white/5 p-4 lg:hidden">
      <button onClick={closeMobile} className={`${ACCENT_TEXT} transition-colors`}>
        <X className="h-5 w-5" />
      </button>
    </div>

    {/* Brand header */}
    <div className="flex h-16 items-center justify-between border-b border-white/[0.07] p-3">
      <div className={`flex items-center gap-2 overflow-hidden ${collapsed ? "w-0 opacity-0" : "opacity-100"}`}>
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${ACCENT_BG}`}>
          <Send className={`h-4 w-4 ${ACCENT_TEXT}`} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-white">Cross-Posting</p>
          <p className="truncate text-[10px] text-muted-foreground">Publish everywhere</p>
        </div>
      </div>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-white/5 hover:text-white lg:flex"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
      </button>
    </div>

    <nav className="flex-1 space-y-0.5 overflow-y-auto px-1.5 py-2">
      {NAV_ITEMS.map((item) => (
        <SidebarLink
          key={item.to}
          to={item.to}
          icon={item.icon}
          label={item.label}
          end={item.end}
          pending={item.showPending ? pending : 0}
          onClick={closeMobile}
          isCollapsed={collapsed}
        />
      ))}
    </nav>
  </aside>
);

const Shell = () => {
  const { pendingCount } = useCrossPost();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const closeMobile = () => setIsMobileOpen(false);

  const activeItem =
    NAV_ITEMS.find((n) => (n.end ? location.pathname === n.to : location.pathname.startsWith(n.to))) || NAV_ITEMS[0];

  return (
    <div className="relative -m-6 flex h-[calc(100vh-4rem)] overflow-hidden bg-background text-white">
      {/* Ambient washes, matching the other dashboards */}
      <div className="pointer-events-none absolute -right-40 -top-40 z-0 h-96 w-96 animate-aurora rounded-full bg-[radial-gradient(circle,hsl(var(--brand-violet)/0.16),transparent_65%)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 z-0 h-96 w-96 animate-aurora rounded-full bg-[radial-gradient(circle,hsl(var(--brand-blue)/0.13),transparent_65%)] blur-3xl [animation-delay:-10s]" />

      {isMobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden" onClick={closeMobile} />
      )}

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        isMobileOpen={isMobileOpen}
        closeMobile={closeMobile}
        pending={pendingCount}
      />

      <div className="relative min-w-0 flex-1 overflow-y-auto">
        {/* Mobile header */}
        <div className="flex items-center border-b border-white/[0.07] bg-surface/70 p-4 backdrop-blur-2xl lg:hidden">
          <button onClick={() => setIsMobileOpen(true)} className={ACCENT_TEXT}>
            <Menu className="h-5 w-5" />
          </button>
          <span className="ml-4 font-semibold text-white">Cross-Posting</span>
        </div>

        {/* Sticky page header, titled after the active nav item */}
        <div className="sticky top-0 z-10 border-b border-white/[0.07] bg-surface/70 px-6 py-3 backdrop-blur-2xl">
          <DashboardHeader
            title={activeItem.label}
            subtitle="Compose once, review what creators send, publish everywhere"
            icon={<Send className="h-5 w-5" />}
            brandBgClass={ACCENT_BG}
            brandTextClass={ACCENT_TEXT}
          />
        </div>

        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default function CrossPostLayout() {
  return (
    // Context boundary: connections, history and pending requests load once and
    // stay consistent across every child route.
    <CrossPostProvider>
      <Shell />
    </CrossPostProvider>
  );
}