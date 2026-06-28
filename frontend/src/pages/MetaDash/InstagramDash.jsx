import { useState, useEffect } from "react";
import { mockInstagramData } from "@/utils/metaMockData";
import { Instagram } from "@/components/icons/BrandIcons";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import MetaInnerSidebar, { IG_NAV } from "./MetaInnerSidebar";
import DateRangePicker from "@/components/DateRangePicker";

import { InstagramOverview } from "./InstagramOverview";
import { InstagramContent } from "./InstagramContent";
import { InstagramAudience } from "./InstagramAudience";
import { InstagramEngagement } from "./InstagramEngagement";
import { InstagramStories } from "./InstagramStories";
import { InstagramReels } from "./InstagramReels";
import { InstagramGrowth } from "./InstagramGrowth";
import { InstagramHashtags } from "./InstagramHashtags";
import { InstagramAds } from "./InstagramAds";
import { InstagramInsights } from "./InstagramInsights";
import { InstagramReports } from "./InstagramReports";
import { InstagramSettings } from "./InstagramSettings";
import { InstagramHelp } from "./InstagramHelp";

const IG_PINK = "#E1306C";

export default function InstagramDash() {
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
    const fetchInstagramData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      setAnalyticsData(mockInstagramData);
      setIsLoading(false);
    };
    fetchInstagramData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setAnalyticsData({...mockInstagramData}); // force re-render
    setIsRefreshing(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0B1121]">
        <div className="relative w-12 h-12">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-pink-500/20 rounded-full" />
          <div className="absolute top-0 left-0 w-full h-full border-4 border-t-pink-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!analyticsData) return null;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0B1121]">
      <MetaInnerSidebar
        navItems={IG_NAV}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        platformIcon={Instagram}
        platformLabel="Instagram Profile"
        accentColor="pink"
      />
      
      <main className="flex-1 min-w-0 overflow-y-auto bg-[#0B1121]">
        {/* Header */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-8 py-4 bg-[#0B1121]/95 backdrop-blur-xl border-b border-white/5">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Instagram Analytics</h1>
            <p className="text-sm text-slate-400 mt-1">Track your profile growth and content engagement.</p>
          </div>
          <div className="flex items-center gap-3">
            <DateRangePicker 
              startDate={dateRange.start} 
              endDate={dateRange.end} 
              onChange={setDateRange} 
            />
            <Button 
              size="sm" 
              className="text-sm text-white gap-2 rounded-md h-9 px-4 hover:bg-pink-600 transition-colors" 
              style={{ background: IG_PINK }}
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} /> Refresh Data
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 flex flex-col gap-6">
          {activeTab === "overview" && <InstagramOverview data={analyticsData} dateRange={dateRange} />}
          {activeTab === "content" && <InstagramContent data={analyticsData.extended.contentData.posts} dateRange={dateRange} />}
          {activeTab === "audience" && <InstagramAudience data={analyticsData.extended.audienceDetails} dateRange={dateRange} />}
          {activeTab === "engagement" && <InstagramEngagement data={analyticsData.extended.engagementDetails} dateRange={dateRange} />}
          {activeTab === "stories" && <InstagramStories data={analyticsData.extended.contentData.stories} dateRange={dateRange} />}
          {activeTab === "reels" && <InstagramReels data={analyticsData.extended.contentData.reels} dateRange={dateRange} />}
          {activeTab === "growth" && <InstagramGrowth data={analyticsData.extended.growth} dateRange={dateRange} />}
          {activeTab === "hashtags" && <InstagramHashtags data={analyticsData.extended.hashtags} dateRange={dateRange} />}
          {activeTab === "ads" && <InstagramAds data={analyticsData.extended.ads} dateRange={dateRange} />}
          {activeTab === "insights" && <InstagramInsights data={analyticsData.extended.insights} dateRange={dateRange} />}
          {activeTab === "reports" && <InstagramReports data={analyticsData.extended.utilityData.recentExports} dateRange={dateRange} />}
          {activeTab === "settings" && <InstagramSettings />}
          {activeTab === "help" && <InstagramHelp />}
        </div>
      </main>
    </div>
  );
}
