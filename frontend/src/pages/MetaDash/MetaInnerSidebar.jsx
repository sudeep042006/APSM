// ── Meta Inner Sidebar ──────────────────────────────────────────────
// Reusable vertical sidebar for Facebook & Instagram dashboards.
// Accepts nav items, accent color, platform icon, and active tab state.

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Facebook, Instagram } from "@/components/icons/BrandIcons";
import {
  BarChart3, Users, Heart, FileText,
  ChevronDown, LogOut, PanelLeftClose, PanelLeft,
  ThumbsUp, Eye, Video, History, Target, Settings, HelpCircle,
  PlaySquare, TrendingUp, Hash, LayoutDashboard
} from "lucide-react";

// ── Nav item configs per platform ───────────────────────────────────
export const FB_NAV = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "content", label: "Content", icon: FileText },
  { id: "audience", label: "Audience", icon: Users },
  { id: "engagement", label: "Engagement", icon: Heart },
  { id: "page_likes", label: "Page Likes", icon: ThumbsUp },
  { id: "reach_views", label: "Reach & Views", icon: Eye },
  { id: "videos", label: "Videos", icon: Video },
  { id: "stories", label: "Stories", icon: History },
  { id: "groups", label: "Groups", icon: Users },
  { id: "ads", label: "Ads", icon: Target },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "insights", label: "Insights", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "help", label: "Help", icon: HelpCircle },
];

export const IG_NAV = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "content", label: "Content", icon: FileText },
  { id: "audience", label: "Audience", icon: Users },
  { id: "engagement", label: "Engagement", icon: Heart },
  { id: "stories", label: "Stories", icon: History },
  { id: "reels", label: "Reels", icon: PlaySquare },
  { id: "growth", label: "Growth", icon: TrendingUp },
  { id: "hashtags", label: "Hashtags", icon: Hash },
  { id: "ads", label: "Ads", icon: Target },
  { id: "insights", label: "Insights", icon: BarChart3 },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "help", label: "Help", icon: HelpCircle },
];

export default function MetaInnerSidebar({
  navItems,
  activeTab,
  onTabChange,
  platformIcon: PlatformIcon,
  platformLabel,
  accentColor = "blue",       // "blue" | "pink"
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Active styles based on platform
  const activeBg = accentColor === "pink" ? "bg-pink-500/10" : "bg-blue-500/10";
  const activeText = accentColor === "pink" ? "text-pink-500" : "text-blue-500";
  const activeBorder = accentColor === "pink" ? "border-pink-500" : "border-blue-500";
  const hoverBg = accentColor === "pink" ? "hover:bg-pink-500/5" : "hover:bg-blue-500/5";
  const hoverText = accentColor === "pink" ? "hover:text-pink-400" : "hover:text-blue-400";

  const isFacebook = location.pathname.includes("facebook");
  const isInstagram = location.pathname.includes("instagram");

  return (
    <aside
      className={`flex-shrink-0 border-r border-white/10 flex flex-col h-full overflow-y-auto bg-[#0B1121]/95 backdrop-blur-xl transition-all duration-300 z-40 custom-scrollbar ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Platform Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/5 flex-shrink-0">
        <div className={`flex items-center gap-3 overflow-hidden transition-opacity ${collapsed ? "opacity-0 w-0" : "opacity-100"}`}>
          <div className={`p-1.5 rounded-lg ${activeBg}`}>
            <PlatformIcon className={`h-5 w-5 ${activeText}`} />
          </div>
          <span className="font-semibold text-white truncate">{platformLabel}</span>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
        >
          {collapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
        {/* Platform Switcher */}
        {!collapsed && (
          <div className="bg-white/5 p-1 rounded-lg flex gap-1 mb-6">
            <button
              onClick={() => navigate('/dashboard/meta/facebook')}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-sm font-medium transition-all ${
                isFacebook 
                  ? "bg-[#1877F2] text-white shadow-sm" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Facebook className="h-4 w-4" /> Facebook
            </button>
            <button
              onClick={() => navigate('/dashboard/meta/instagram')}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-sm font-medium transition-all ${
                isInstagram 
                  ? "bg-[#E1306C] text-white shadow-sm" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Instagram className="h-4 w-4" /> Instagram
            </button>
          </div>
        )}

        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? `${activeBg} ${activeText} font-medium`
                  : `text-slate-400 ${hoverBg} ${hoverText}`
              }`}
              title={collapsed ? item.label : undefined}
            >
              {isActive && (
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full ${activeBorder}`} />
              )}
              <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? activeText : "text-slate-500 group-hover:text-slate-300"}`} />
              {!collapsed && (
                <span className="truncate text-sm">{item.label}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Profile Section (Bottom) */}
      <div className="p-4 border-t border-white/5 flex-shrink-0 relative">
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors"
        >
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 flex-shrink-0 flex items-center justify-center text-white font-medium text-sm">
            {user?.name?.charAt(0) || "U"}
          </div>
          {!collapsed && (
            <div className="flex-1 text-left overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user?.name || "User"}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          )}
          {!collapsed && <ChevronDown className="h-4 w-4 text-slate-500 flex-shrink-0" />}
        </button>

        {/* Profile Popover */}
        {profileOpen && !collapsed && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-[#161B22] border border-white/10 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2">
            <div className="p-3 border-b border-white/5">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
            <div className="p-1">
              <button 
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                onClick={() => navigate('/dashboard')}
              >
                <LayoutDashboard className="h-4 w-4" /> Switch Platform
              </button>
              <button 
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
