// ── Meta Inner Sidebar ──────────────────────────────────────────────
// Structural clone of the YoutubeDash sidebar.
// Identical layout shell — only accent colors (active state) differ:
//   Facebook → blue-500    Instagram → pink-500
//
// Nav configs (FB_NAV, IG_NAV) live in metaNavConfig.js — import them
// directly from there (not from this file) to satisfy Vite Fast Refresh.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Facebook, Instagram } from "@/components/icons/BrandIcons";
import {
  ChevronLeft, ChevronRight,
} from "lucide-react";

// ── MetaInnerSidebar ─────────────────────────────────────────────────
// Props:
//   navItems       {Array}     — FB_NAV or IG_NAV
//   activeTab      {string}    — currently active nav key
//   onTabChange    {Function}  — called with new key on nav click
//   platformIcon   {Component} — Facebook or Instagram icon component
//   platformLabel  {string}    — "Facebook Page" | "Instagram Profile"
//   platformSub    {string}    — page/username subtitle
//   accentColor    {"blue"|"pink"} — brand accent
export default function MetaInnerSidebar({
  navItems,
  activeTab,
  onTabChange,
  platformIcon: PlatformIcon,
  platformLabel,
  platformSub = "Connected",
  accentColor = "blue",
}) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  // ── Derive active state classes from accent color ─────────────────
  // Mirrors YT: `bg-red-500/10 text-red-500` — but for brand color
  const activeBg   = accentColor === "pink" ? "bg-pink-500/10"   : "bg-blue-500/10";
  const activeText = accentColor === "pink" ? "text-pink-500"    : "text-blue-500";
  const iconColor  = accentColor === "pink" ? "text-pink-400"    : "text-blue-400";
  const iconBg     = accentColor === "pink" ? "bg-pink-500/10"   : "bg-blue-500/10";

  return (
    // ── Root aside — exact clone of YT aside classes ─────────────────
    <aside
      className={`shrink-0 border-r border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 flex flex-col h-full ${
        collapsed ? "w-14" : "w-52"
      }`}
    >
      <div className="sticky top-0 flex flex-col h-full overflow-hidden">

        {/* ── Top Platform Switcher ────────────────────────────────────── */}
        <div className={`p-3 border-b border-white/10 ${collapsed ? "flex flex-col items-center gap-2" : "grid grid-cols-2 gap-2"}`}>
          <button
            onClick={() => navigate("/dashboard/meta/facebook")}
            className={`flex items-center justify-center gap-2 rounded-lg p-2 transition-all duration-200 ${
              platformLabel === "Facebook"
                ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-100 border border-transparent"
            }`}
            title="Facebook Dashboard"
          >
            <Facebook className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="text-xs font-semibold">Facebook</span>}
          </button>
          
          <button
            onClick={() => navigate("/dashboard/meta/instagram")}
            className={`flex items-center justify-center gap-2 rounded-lg p-2 transition-all duration-200 ${
              platformLabel === "Instagram"
                ? "bg-pink-500/10 text-pink-500 border border-pink-500/20"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-100 border border-transparent"
            }`}
            title="Instagram Dashboard"
          >
            <Instagram className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="text-xs font-semibold">Instagram</span>}
          </button>
        </div>

        {/* ── Collapse toggle — identical to YT collapse button ────── */}
        <div className="p-2 border-b border-white/10">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-400 hover:bg-white/10 hover:text-slate-100 transition-all duration-200 ${
              collapsed ? "justify-center" : ""
            }`}
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4 shrink-0" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 shrink-0" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>

        {/* ── Navigation links — exact YT nav item pattern ─────────── */}
        <nav className="flex-1 py-2 px-1.5 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onTabChange(item.key)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-all duration-200 ${
                  collapsed ? "justify-center" : ""
                } ${
                  isActive
                    ? `${activeBg} ${activeText} shadow-sm`
                    : "text-slate-400 hover:bg-white/10 hover:text-slate-100"
                }`}
                title={collapsed ? item.label : undefined}
              >
                {/* Icon — tinted when active, same as YT red-400 tint */}
                <item.icon className={`h-4 w-4 shrink-0 ${isActive ? iconColor : ""}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
