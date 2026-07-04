import React, { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { 
  Home, Grid, Users, Activity, Clock, PlaySquare, 
  TrendingUp, Hash, BarChart, FileText, Settings, HelpCircle,
  Menu, X
} from 'lucide-react';
import igapi from '@/services/igapi';

const navItems = [
  { path: "/dashboard/instagram", label: "Overview", icon: Home, end: true },
  { path: "/dashboard/instagram/content", label: "Content", icon: Grid },
  { path: "/dashboard/instagram/audience", label: "Audience", icon: Users },
  { path: "/dashboard/instagram/engagement", label: "Engagement", icon: Activity },
  { path: "/dashboard/instagram/stories", label: "Stories", icon: Clock },
  { path: "/dashboard/instagram/reels", label: "Reels", icon: PlaySquare },
  { path: "/dashboard/instagram/growth", label: "Growth", icon: TrendingUp },
  { path: "/dashboard/instagram/hashtags", label: "Hashtags", icon: Hash },
  { path: "/dashboard/instagram/insights", label: "Insights", icon: BarChart },
  { path: "/dashboard/instagram/reports", label: "Reports", icon: FileText },
];

const bottomItems = [
  { path: "/dashboard/instagram/settings", label: "Settings", icon: Settings },
  { path: "/dashboard/instagram/help", label: "Help", icon: HelpCircle },
];

const SidebarLink = ({ to, icon: Icon, label, end, onClick }) => {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
          isActive 
            ? 'bg-[#E1306C]/10 text-[#E1306C]' 
            : 'text-gray-400 hover:text-white hover:bg-white/5'
        }`
      }
    >
      <Icon className="w-5 h-5" />
      {label}
    </NavLink>
  );
};

const InstagramLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch only top-level layout data (Connection State & Identity)
  useEffect(() => {
    let isMounted = true;
    
    const fetchLayoutData = async () => {
      try {
        const data = await igapi.getProfile();
        if (isMounted) {
          setProfileData(data);
        }
      } catch (error) {
        console.error("Failed to fetch Instagram profile", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchLayoutData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex h-full w-full bg-[#0B1121] text-white overflow-hidden relative">
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* INNER SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 border-r border-white/10 flex flex-col 
        bg-[#0B1121]/90 backdrop-blur-xl lg:bg-[#0B1121] lg:backdrop-blur-none
        transition-transform duration-300 ease-in-out lg:static lg:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Mobile Close Button */}
        <div className="lg:hidden flex justify-end p-4 border-b border-white/5">
          <button 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="text-gray-400 hover:text-[#E1306C] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-1">
          {navItems.map((item) => (
            <SidebarLink 
              key={item.path} 
              to={item.path} 
              icon={item.icon} 
              label={item.label} 
              end={item.end} 
              onClick={() => setIsMobileMenuOpen(false)}
            />
          ))}
        </div>
        
        <div className="p-4 border-t border-white/5 space-y-1 mt-auto bg-transparent">
          {bottomItems.map((item) => (
            <SidebarLink 
              key={item.path} 
              to={item.path} 
              icon={item.icon} 
              label={item.label} 
              onClick={() => setIsMobileMenuOpen(false)}
            />
          ))}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Mobile Header Toggle */}
        <div className="lg:hidden flex items-center p-4 border-b border-white/10 bg-[#0B1121]">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="text-gray-400 hover:text-[#E1306C] transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="ml-4 font-semibold text-white">Instagram Dashboard</span>
        </div>

        <main className="flex-1 overflow-y-auto">
          {/* Outlet is wrapped in a container that passes the localized context */}
          <Outlet context={{ 
            profile: profileData?.profile, 
            isConnected: profileData?.isConnected, 
            isLayoutLoading: isLoading 
          }} />
        </main>
      </div>
    </div>
  );
};

export default InstagramLayout;
