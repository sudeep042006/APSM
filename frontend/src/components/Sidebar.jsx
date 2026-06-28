// ── Sidebar Component ───────────────────────────────────────────────
// Global navigation sidebar for the dashboard. Renders platform links,
// a branding header, and a logout action at the bottom.

import { NavLink } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Share2,
  Send,
  LogOut,
  Menu,
  Bell
} from "lucide-react";
import { Youtube, Linkedin } from "@/components/icons/BrandIcons";
import { Button } from "@/components/ui/button";
import ApsmLogo from "@/assets/images/apsm-logo.svg";
// ── Navigation link items ───────────────────────────────────────────
const navItems = [
  { label: "YouTube", path: "/dashboard/youtube", icon: Youtube },
  { label: "LinkedIn", path: "/dashboard/linkedin", icon: Linkedin },
  { label: "Meta (FB + IG)", path: "/dashboard/meta", icon: Share2 },
  { label: "Cross-Posting", path: "/dashboard/crosspost", icon: Send },
];

export default function Sidebar({ isCollapsed, setIsCollapsed }) {
  const { logout, user } = useAuth();

  return (
    <aside className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B1121] transition-all duration-300 ${isCollapsed ? "w-16" : "w-64"}`}>
      {/* ── Branding Header ──────────────────────────────────────────── */}
      <div className={`flex h-16 items-center border-b border-gray-200 dark:border-white/10 px-4 ${isCollapsed ? "justify-center" : "justify-between"}`}>
        <div className={`flex items-center gap-3 ${isCollapsed ? "hidden" : "flex"}`}>
          <img src={ApsmLogo} alt="APSM Logo" className="h-8 w-auto object-contain shrink-0" />
          <span className="text-xl font-bold tracking-wide text-gray-900 dark:text-white whitespace-nowrap">APSM</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white">
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* ── Navigation Links ─────────────────────────────────────────── */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center rounded-lg py-2.5 text-sm font-medium transition-all duration-200 ${
                isCollapsed ? "justify-center px-0" : "gap-3 px-3"
              } ${
                isActive
                  ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-slate-100 shadow-sm"
                  : "text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white"
              }`
            }
            title={isCollapsed ? item.label : undefined}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* ── User Info & Logout ────────────────────────────────────────── */}
      <div className={`border-t border-gray-200 dark:border-white/10 p-4 ${isCollapsed ? "flex flex-col items-center gap-4" : ""}`}>
        <div className={`mb-3 flex items-center gap-3 ${isCollapsed ? "justify-center mb-0" : ""}`}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-xs font-bold text-white">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          {!isCollapsed && (
            <div className="flex-1 truncate">
              <p className="text-sm font-medium truncate">{user?.name || "User"}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                {user?.email || "user@example.com"}
              </p>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className={`text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-red-500 dark:hover:text-red-400 ${isCollapsed ? "w-10 h-10 p-0 justify-center" : "w-full justify-start gap-2"}`}
          onClick={logout}
          id="sidebar-logout-btn"
          title={isCollapsed ? "Logout" : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </Button>
      </div>
    </aside>
  );
}
