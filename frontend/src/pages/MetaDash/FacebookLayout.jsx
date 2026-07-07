// ── Facebook Layout Shell ─────────────────────────────────────────────────────
// Mirrors the InstagramLayout.jsx architecture.
// Responsibilities:
//   1. Fetch ONLY connection status + profile identity (fbapi.getProfile)
//   2. Render a self-contained Facebook-only collapsible sidebar
//   3. Render a mobile hamburger overlay for tablet/mobile
//   4. Pass { profile, isConnected, isLayoutLoading } down via <Outlet context>
// IMPORTANT: Does NOT import or modify MetaInnerSidebar.jsx
// IMPORTANT: Contains NO analytics data fetching — only identity/connection.

import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import fbapi from "@/services/fbapi";
import {
  BarChart3, Users, Heart, FileText,
  ThumbsUp, Eye, Video, History, Target, Settings, HelpCircle,
  ChevronLeft, ChevronRight, Menu, X, RefreshCw, LogOut,
  PlaySquare, TrendingUp,
} from "lucide-react";

// ── Facebook brand color ──────────────────────────────────────────────────────
const FB_BLUE = "#1877F2";

// ── Sidebar navigation items (main) ──────────────────────────────────────────
// Mapped directly in this file — no shared component dependency.
const FB_NAV_ITEMS = [
  { path: "/dashboard/facebook",             label: "Overview",      icon: BarChart3,  end: true },
  { path: "/dashboard/facebook/content",     label: "Content",       icon: FileText              },
  { path: "/dashboard/facebook/audience",    label: "Audience",      icon: Users                 },
  { path: "/dashboard/facebook/engagement",  label: "Engagement",    icon: Heart                 },
  { path: "/dashboard/facebook/page_likes",  label: "Page Likes",    icon: ThumbsUp              },
  { path: "/dashboard/facebook/reach_views", label: "Reach & Views", icon: Eye                   },
  { path: "/dashboard/facebook/videos",      label: "Videos",        icon: Video                 },
  { path: "/dashboard/facebook/stories",     label: "Stories",       icon: History               },
  { path: "/dashboard/facebook/groups",      label: "Groups",        icon: Users                 },
  { path: "/dashboard/facebook/ads",         label: "Ads",           icon: Target                },
  { path: "/dashboard/facebook/reports",     label: "Reports",       icon: FileText              },
  { path: "/dashboard/facebook/insights",    label: "Insights",      icon: BarChart3             },
];

// ── Sidebar bottom-pinned items (Settings & Help — no profile block) ──────────
const FB_NAV_BOTTOM = [
  { path: "/dashboard/facebook/settings", label: "Settings", icon: Settings    },
  { path: "/dashboard/facebook/help",     label: "Help",     icon: HelpCircle  },
];

// ── Reusable Sidebar Link ─────────────────────────────────────────────────────
// Highlights active route with Facebook Blue accent + left border strip.
const SidebarLink = ({ to, icon: Icon, label, end, onClick, isCollapsed }) => (
  <NavLink
    to={to}
    end={end}
    onClick={onClick}
    className={({ isActive }) =>
      `relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium
       transition-all duration-200 group
       ${isCollapsed ? "justify-center" : ""}
       ${
         isActive
           ? "bg-[#1877F2]/10 text-[#1877F2] font-semibold"
           : "text-slate-400 hover:bg-[#1877F2]/5 hover:text-[#1877F2]"
       }`
    }
    title={isCollapsed ? label : undefined}
  >
    {/* Active left-border accent strip (hidden in collapsed mode) */}
    {!isCollapsed && (
      <span
        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full
                   bg-[#1877F2] opacity-0 group-[.active]:opacity-100 transition-opacity"
        style={{ opacity: "inherit" }}
      />
    )}
    <Icon className="h-[18px] w-[18px] flex-shrink-0" />
    {!isCollapsed && <span className="truncate">{label}</span>}
  </NavLink>
);

// ── Main Layout Component ─────────────────────────────────────────────────────
const FacebookLayout = () => {
  // ── Sidebar collapse state (desktop only) ─────────────────────────────────
  const [isCollapsed, setIsCollapsed] = useState(false);
  // ── Mobile overlay open/close ─────────────────────────────────────────────
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  // ── Top-level identity/connection state — passed via Outlet context ────────
  const [profileData, setProfileData] = useState(null);
  const [isLayoutLoading, setIsLayoutLoading] = useState(true);

  // ── Fetch ONLY profile/connection on mount ────────────────────────────────
  useEffect(() => {
    let mounted = true;
    const fetchProfile = async () => {
      try {
        const data = await fbapi.getProfile();
        if (mounted) setProfileData(data);
      } catch (err) {
        console.error("[FacebookLayout] Failed to fetch profile:", err);
      } finally {
        if (mounted) setIsLayoutLoading(false);
      }
    };
    fetchProfile();
    return () => { mounted = false; };
  }, []);

  // ── Close mobile overlay when route changes ───────────────────────────────
  const closeMobile = () => setIsMobileOpen(false);

  // ── Resolved profile shorthand ────────────────────────────────────────────
  const profile     = profileData?.profile;
  const isConnected = profileData?.isConnected ?? false;

  return (
    <div className="flex gap-0 -m-6 h-[calc(100vh-4rem)] bg-[#0B1121] text-white overflow-hidden relative">

      {/* ── Mobile Backdrop ───────────────────────────────────────────────── */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* INNER SIDEBAR — Facebook-only, fully self-contained               */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/[0.06]
          bg-[#0B1121]/95 backdrop-blur-xl
          transition-all duration-300 ease-in-out
          lg:static lg:translate-x-0
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          ${isCollapsed ? "lg:w-[72px]" : "lg:w-64"}
          w-64
        `}
      >
        {/* ── Brand Header ─────────────────────────────────────────────── */}
        <div className="flex h-16 items-center gap-3 px-4 border-b border-white/[0.06] flex-shrink-0">
          {/* Facebook icon badge */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1877F2]/10">
            <svg className="h-5 w-5 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </div>
          {/* Page name — hidden in collapsed mode */}
          {!isCollapsed && (
            <div className="min-w-0 flex-1 hidden lg:block">
              <p className="text-xs font-bold text-white truncate">Facebook Analytics</p>
              <p className="text-[10px] text-gray-400 truncate">
                {isLayoutLoading ? "Loading..." : profile?.name || "Not connected"}
              </p>
            </div>
          )}
          {/* Mobile close button */}
          <button
            onClick={closeMobile}
            className="lg:hidden ml-auto p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          {/* Always show text on mobile overlay */}
          <div className="min-w-0 flex-1 lg:hidden">
            <p className="text-xs font-bold text-white truncate">Facebook Analytics</p>
            <p className="text-[10px] text-gray-400 truncate">
              {profile?.name || "Facebook Page"}
            </p>
          </div>
        </div>

        {/* ── Desktop Collapse Toggle ───────────────────────────────────── */}
        <div className="hidden lg:block px-3 py-2 border-b border-white/[0.06]">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2
                        text-xs font-medium text-gray-400 hover:bg-white/5 hover:text-white
                        transition-all duration-200 ${isCollapsed ? "justify-center" : ""}`}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            id="fb-collapse-btn"
          >
            {isCollapsed
              ? <ChevronRight className="h-4 w-4 shrink-0" />
              : <><ChevronLeft className="h-4 w-4 shrink-0" /><span>Collapse</span></>
            }
          </button>
        </div>

        {/* ── Main Navigation Links ─────────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {FB_NAV_ITEMS.map((item) => (
            <SidebarLink
              key={item.path}
              to={item.path}
              icon={item.icon}
              label={item.label}
              end={item.end}
              onClick={closeMobile}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>

        {/* ── Bottom-pinned Settings & Help (NO profile block) ──────────── */}
        <div className="px-2 py-3 border-t border-white/[0.06] space-y-0.5 mt-auto">
          {FB_NAV_BOTTOM.map((item) => (
            <SidebarLink
              key={item.path}
              to={item.path}
              icon={item.icon}
              label={item.label}
              onClick={closeMobile}
              isCollapsed={isCollapsed}
            />
          ))}
        </div>
      </aside>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MAIN CONTENT AREA                                                 */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">

        {/* ── Mobile Header (hamburger toggle) ─────────────────────────── */}
        {/* Hidden on desktop (lg+), shown on tablet/mobile */}
        <div className="lg:hidden flex items-center gap-3 px-4 h-14 border-b border-white/[0.06] bg-[#0B1121] flex-shrink-0">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-1.5 text-gray-400 hover:text-[#1877F2] rounded-lg hover:bg-white/5 transition-colors"
            id="fb-mobile-menu-btn"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-[#1877F2]/10 flex items-center justify-center">
              <svg className="h-3.5 w-3.5 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </div>
            <span className="font-semibold text-sm text-white">Facebook Analytics</span>
          </div>
        </div>

        {/* ── Scrollable Outlet Area ────────────────────────────────────── */}
        {/* Passes layout context to all child pages via Outlet context */}
        <main className="flex-1 overflow-y-auto">
          <Outlet
            context={{
              profile,
              isConnected,
              isLayoutLoading,
            }}
          />
        </main>
      </div>
    </div>
  );
};

export default FacebookLayout;
