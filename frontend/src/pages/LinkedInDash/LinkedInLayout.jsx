import { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Linkedin } from "@/components/icons/BrandIcons";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import ConnectCard from "@/components/ConnectCard";
import linkedinApi from "@/services/linkedinApi";
import DateRangePicker from "@/components/DateRangePicker";

export default function LinkedInLayout() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);

  // Default to Last 7 Days
  const d = new Date();
  d.setDate(d.getDate() - 7);
  const defaultStart = d.toISOString().split('T')[0];
  const defaultEnd = new Date().toISOString().split('T')[0];
  
  const [dateRange, setDateRange] = useState({ start: defaultStart, end: defaultEnd });

  const [isConnected, setIsConnected] = useState(false);
  const [username, setUsername] = useState("");
  const [revokeLoading, setRevokeLoading] = useState(false);

  const fetchData = async (isRefresh = false) => {
    setLoading(true);
    setError(null);
    if (isRefresh) {
      setAnalyticsData(null);
    }
    try {
      const statusRes = await linkedinApi.getAuthStatus();
      const statusArray = Array.isArray(statusRes) ? statusRes : (statusRes?.data || statusRes?.status || statusRes?.connections || []);
      const lnStatus = statusArray.find((p) => String(p.platform).toLowerCase() === "linkedin");

      setIsConnected(!!lnStatus?.connected);
      setUsername(lnStatus?.username || "");

      if (lnStatus?.connected) {
        const analyticsRes = await linkedinApi.getLinkedInAnalytics(dateRange);
        const dataArray = Array.isArray(analyticsRes?.data) ? analyticsRes.data : [];
        setAnalyticsData(dataArray[0] || null);
      } else {
        setAnalyticsData(null);
      }
    } catch (err) {
      console.error("Error fetching LinkedIn data:", err);
      setError("Failed to load LinkedIn analytics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const handleRefresh = () => {
    fetchData(true);
  };

  const handleConnect = () => {
    const token = localStorage.getItem("incubein_token");
    const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5000";
    window.location.href = `${baseUrl}/auth/linkedin?token=${token}`;
  };

  const handleRevoke = async () => {
    setRevokeLoading(true);
    try {
      await linkedinApi.revokeLinkedIn();
      setIsConnected(false);
      setUsername("");
      fetchData(); 
    } catch (err) {
      console.error("Error revoking LinkedIn access:", err);
    } finally {
      setRevokeLoading(false);
    }
  };

  // ── Render States ──────────────────────────────────────────────────
  const renderLoading = () => (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
      <Loader2 className="h-10 w-10 animate-spin text-[#0A66C2]" />
      <p className="text-muted-foreground animate-pulse">Fetching LinkedIn Analytics...</p>
    </div>
  );

  const renderError = () => (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-lg border border-red-500/30 rounded-xl p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4 mx-auto" />
        <h3 className="text-lg font-bold text-white mb-2">Data Load Failed</h3>
        <p className="text-sm text-gray-400 mb-6">{error}</p>
        <Button onClick={fetchData} variant="outline" className="border-white/10 text-white hover:bg-white/10">
          Try Again
        </Button>
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="p-4 md:p-6">
      <ConnectCard
        icon={<Linkedin className="h-8 w-8" />}
        cardTitle="Connect LinkedIn Profile"
        cardDescription="Connect your LinkedIn account to view followers, post impressions, engagement rates, and detailed demographic metrics."
        onConnect={handleConnect}
        buttonText="Connect LinkedIn Account"
        brandBgClass="bg-[#0A66C2]/10"
        brandTextClass="text-[#0A66C2]"
        brandButtonClass="bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1121] text-slate-900 dark:text-white transition-colors duration-200">
      
      {/* ── Global Header ──────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#0B1121]/80 backdrop-blur-md px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <DashboardHeader
            title="LinkedIn Analytics"
            subtitle="Profile insights and engagement"
            icon={<Linkedin className="h-6 w-6" />}
            brandBgClass="bg-[#0A66C2]/10"
            brandTextClass="text-[#0A66C2]"
          />
          {isConnected && (
            <div className="flex items-center gap-2 flex-wrap">
              <DateRangePicker 
                startDate={dateRange.start} 
                endDate={dateRange.end} 
                onChange={setDateRange} 
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
                className="text-xs text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-slate-100 h-9 px-3"
              >
                <RefreshCw className={`h-3.5 w-3.5 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh Data
              </Button>
            </div>
          )}
        </div>

        {/* ── Top Level Navigation Tabs ────────────────────────────────── */}
        <div className="flex items-center gap-6 mt-6 border-b border-white/5">
          <NavLink 
            to="/dashboard/linkedin" 
            end
            className={({ isActive }) => 
              `pb-3 text-sm font-medium transition-colors border-b-2 ${
                isActive ? "border-[#0A66C2] text-white" : "border-transparent text-gray-400 hover:text-white"
              }`
            }
          >
            Dashboard
          </NavLink>
          <NavLink 
            to="/dashboard/linkedin/settings" 
            className={({ isActive }) => 
              `pb-3 text-sm font-medium transition-colors border-b-2 ${
                isActive ? "border-[#0A66C2] text-white" : "border-transparent text-gray-400 hover:text-white"
              }`
            }
          >
            Settings
          </NavLink>
          <NavLink 
            to="/dashboard/linkedin/help" 
            className={({ isActive }) => 
              `pb-3 text-sm font-medium transition-colors border-b-2 ${
                isActive ? "border-[#0A66C2] text-white" : "border-transparent text-gray-400 hover:text-white"
              }`
            }
          >
            Help
          </NavLink>
        </div>
      </div>

      {/* ── Main Content Area ────────────────────────────────────────── */}
      <div className="min-w-0">
        {loading ? renderLoading() : error ? renderError() : !isConnected ? renderEmptyState() : (
          <Outlet context={{ 
            analyticsData, 
            loading, 
            username, 
            isConnected, 
            handleRevoke 
          }} />
        )}
      </div>
    </div>
  );
}
