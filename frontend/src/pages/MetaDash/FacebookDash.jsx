import { useState, useEffect } from "react";
import { mockFacebookData } from "@/utils/metaMockData";
import { Facebook } from "@/components/icons/BrandIcons";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import MetaInnerSidebar, { FB_NAV } from "./MetaInnerSidebar";
import DateRangePicker from "@/components/DateRangePicker";

import { FacebookOverview } from "./FacebookOverview";
import { FacebookContent } from "./FacebookContent";
import { FacebookAudience } from "./FacebookAudience";
import { FacebookEngagement } from "./FacebookEngagement";
import { FacebookPageLikes } from "./FacebookPageLikes";
import { FacebookReachViews } from "./FacebookReachViews";
import { FacebookVideos } from "./FacebookVideos";
import { FacebookStories } from "./FacebookStories";
import { FacebookGroups } from "./FacebookGroups";
import { FacebookAds } from "./FacebookAds";
import { FacebookReports } from "./FacebookReports";
import { FacebookInsights } from "./FacebookInsights";
import { FacebookSettings } from "./FacebookSettings";
import { FacebookHelp } from "./FacebookHelp";

const FB_BLUE = "#1877F2";

export default function FacebookDash() {
  const [activeTab, setActiveTab] = useState("overview");
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Default to Last 7 Days
  const d = new Date();
  d.setDate(d.getDate() - 7);
  const defaultStart = d.toISOString().split('T')[0];
  const defaultEnd = new Date().toISOString().split('T')[0];
  
  const [dateRange, setDateRange] = useState({ start: defaultStart, end: defaultEnd });

  // Simulate API fetch
  useEffect(() => {
    const fetchFacebookData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      setAnalyticsData(mockFacebookData);
      setIsLoading(false);
    };
    fetchFacebookData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setAnalyticsData({...mockFacebookData}); // force re-render
    setIsRefreshing(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0B1121]">
        <div className="relative w-12 h-12">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500/20 rounded-full" />
          <div className="absolute top-0 left-0 w-full h-full border-4 border-t-blue-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!analyticsData) return null;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0B1121]">
      <MetaInnerSidebar
        navItems={FB_NAV}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        platformIcon={Facebook}
        platformLabel="Facebook Page"
        accentColor="blue"
      />
      
      <main className="flex-1 min-w-0 overflow-y-auto bg-[#0B1121]">
        {/* Header */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-8 py-4 bg-[#0B1121]/95 backdrop-blur-xl border-b border-white/5">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Facebook Analytics</h1>
            <p className="text-sm text-slate-400 mt-1">Deep dive into your page performance.</p>
          </div>
          <div className="flex items-center gap-3">
            <DateRangePicker 
              startDate={dateRange.start} 
              endDate={dateRange.end} 
              onChange={setDateRange} 
            />
            <Button 
              size="sm" 
              className="text-sm text-white gap-2 rounded-md h-9 px-4 hover:bg-blue-600 transition-colors" 
              style={{ background: FB_BLUE }}
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} /> Refresh Data
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 flex flex-col gap-6">
          {activeTab === "overview" && <FacebookOverview data={analyticsData} dateRange={dateRange} />}
          {activeTab === "content" && <FacebookContent data={analyticsData.extended.contentData.posts} dateRange={dateRange} />}
          {activeTab === "audience" && <FacebookAudience data={analyticsData.extended.audienceDetails} dateRange={dateRange} />}
          {activeTab === "engagement" && <FacebookEngagement data={analyticsData.extended.engagementDetails} dateRange={dateRange} />}
          {activeTab === "page_likes" && <FacebookPageLikes data={analyticsData.extended.growth} dateRange={dateRange} />}
          {activeTab === "reach_views" && <FacebookReachViews data={analyticsData.extended.reachAndViews} dateRange={dateRange} />}
          {activeTab === "videos" && <FacebookVideos data={analyticsData.extended.contentData.videos} dateRange={dateRange} />}
          {activeTab === "stories" && <FacebookStories data={analyticsData.extended.contentData.stories} dateRange={dateRange} />}
          {activeTab === "groups" && <FacebookGroups data={analyticsData.extended.groups} dateRange={dateRange} />}
          {activeTab === "ads" && <FacebookAds data={analyticsData.extended.ads} dateRange={dateRange} />}
          {activeTab === "reports" && <FacebookReports data={analyticsData.extended.utilityData.recentExports} dateRange={dateRange} />}
          {activeTab === "insights" && <FacebookInsights data={analyticsData.extended.insights} dateRange={dateRange} />}
          {activeTab === "settings" && <FacebookSettings />}
          {activeTab === "help" && <FacebookHelp />}
        </div>
      </main>
    </div>
  );
}
