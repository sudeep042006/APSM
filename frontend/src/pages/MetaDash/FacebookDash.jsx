import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate, NavLink } from "react-router-dom";
import metaApi from "@/services/metaApi";
import { Facebook, Instagram } from "@/components/icons/BrandIcons";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FB_NAV } from "./MetaInnerSidebar";
import DateRangePicker from "@/components/DateRangePicker";
import ConfirmDisconnectModal from "@/components/ConfirmDisconnectModal";
import { EmptyDataState } from "./MetaSharedComponents";
// ── Component Imports ──
import ConnectCard from "@/components/ConnectCard";
import DashboardHeader from "@/components/DashboardHeader";

import { FacebookOverview }   from "./FacebookOverview";
import { FacebookContent }    from "./FacebookContent";
import { FacebookAudience }   from "./FacebookAudience";
import { FacebookEngagement } from "./FacebookEngagement";
import { FacebookPageLikes }  from "./FacebookPageLikes";
import { FacebookReachViews } from "./FacebookReachViews";
import { FacebookVideos }     from "./FacebookVideos";
import { FacebookStories }    from "./FacebookStories";
import { FacebookGroups }     from "./FacebookGroups";
import { FacebookAds }        from "./FacebookAds";
import { FacebookReports }    from "./FacebookReports";
import { FacebookInsights }   from "./FacebookInsights";
import { FacebookSettings }   from "./FacebookSettings";
import { FacebookHelp }       from "./FacebookHelp";

export default function FacebookDash() {
  // ── Active sub-page tab state ─────────────────────────────────────
  const [activeTab, setActiveTab] = useState("overview");
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [revokeLoading, setRevokeLoading] = useState(false);

  // isConnected is driven ONLY by /auth/status — never inferred from analytics shape.
  const [isConnected, setIsConnected] = useState(false);
  const [username, setUsername] = useState("");

  // Ref set to true on disconnect — gates the analytics auto-fetch from
  // re-running and calling setIsConnected(true) after user has left.
  const disconnectedRef = useRef(false);

  // Default to Last 7 Days
  const d = new Date();
  d.setDate(d.getDate() - 7);
  const defaultStart = d.toISOString().split('T')[0];
  const defaultEnd   = new Date().toISOString().split('T')[0];
  const [dateRange, setDateRange] = useState({ start: defaultStart, end: defaultEnd });

  const location = useLocation();
  const navigate = useNavigate();

  // ── Sanitize OAuth redirect URL ──────────────────────────────────
  // Strip ?connected=... / ?error=... so they cannot re-trigger on back-nav.
  useEffect(() => {
    if (location.search.includes("connected=") || location.search.includes("error=")) {
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  // ── Check Facebook connection status via /auth/status ────────────
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res = await metaApi.getAuthStatus();
        const statusArray = res?.status ?? [];
        const fbStatus = statusArray.find(s => s.platform === "facebook");
        if (fbStatus?.connected && !fbStatus?.isExpired) {
          setIsConnected(true);
          setUsername(fbStatus.username || "");
        } else {
          setIsConnected(false);
          setAnalyticsData(null);
          setUsername("");
        }
      } catch (err) {
        console.error("Error checking Facebook auth status:", err);
        setIsConnected(false);
        setUsername("");
      } finally {
        setIsLoading(false);
      }
    };
    checkAuthStatus();
  }, []);

  // ── Fetch analytics (only when confirmed connected) ───────────────
  // Fetches analytics data from metaApi, passing the current dateRange.
  // When dateRange changes, this callback is re-created and triggers the auto-fetch.
  const fetchFacebookData = useCallback(async (isRefresh = false) => {
    if (disconnectedRef.current) return;
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);
    try {
      const res = await metaApi.getMetaAnalytics(isRefresh, dateRange);
      if (!disconnectedRef.current) {
        setAnalyticsData(res?.facebook ?? {});
      }
    } catch (err) {
      console.error("Error fetching Facebook data:", err);
      setError("Failed to load Facebook analytics.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [dateRange]);

  // Auto-fetch after connection confirmed or when date range changes
  useEffect(() => {
    if (isConnected) fetchFacebookData();
  }, [isConnected, fetchFacebookData]);

  // ── Refresh Control ────────────────────────────────────────────────
  // Clears the state first (to trigger loading animations/skeletons) and refetches.
  const handleRefresh = () => {
    setAnalyticsData(null);
    fetchFacebookData(true);
  };

  // ── Initiate Facebook OAuth redirection ──
  // Redirects the browser to the backend OAuth initialization route for Facebook,
  // passing the current JWT session token and saving the return path.
  const handleFacebookConnect = () => {
    const token = localStorage.getItem("incubein_token");
    localStorage.setItem("returnPath", window.location.pathname);
    window.location.href = `${import.meta.env.VITE_BASE_URL || "http://localhost:5000"}/auth/facebook?token=${token}`;
  };

  // ── Deep-clean disconnect ─────────────────────────────────────────
  const handleRevoke = async () => {
    setRevokeLoading(true);
    disconnectedRef.current = true; // block any racing fetch
    try {
      await metaApi.revokeFacebook();
    } catch (err) {
      console.error("Facebook revoke error:", err);
    } finally {
      setIsConnected(false);
      setAnalyticsData(null);
      setRevokeLoading(false);
      localStorage.removeItem('facebookToken');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  // ── Loading spinner ───────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-[#0B1121]">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // ── Data availability guard ───────────────────────────────────────
  // Only render charts if at least one KPI is non-zero.
  const hasData = isConnected && analyticsData && (
    analyticsData.kpis?.some(k => (k.value ?? 0) > 0) ||
    analyticsData.charts?.reachOverTime?.length > 0
  );

  // ── Render Page Layout ──
  // Render switcher tabs unconditionally so user is never trapped in disconnected state.

  return (
    // Full-width container — no vertical inner sidebar
    <div className="flex flex-col h-[calc(100vh-4rem)] w-full overflow-hidden bg-slate-50 dark:bg-[#0B1121] text-slate-900 dark:text-slate-100 transition-colors duration-200 -m-6">

      <ConfirmDisconnectModal
        isOpen={showDisconnectModal}
        onClose={() => setShowDisconnectModal(false)}
        onConfirm={() => { setShowDisconnectModal(false); handleRevoke(); }}
      />

      {/* ── Sticky Header ─────────────────────────────────────────── */}
      {/* Row 1: Unified Page Header Component + Date & Data controls */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-[#0B1121]/90 backdrop-blur-md border-b border-slate-200 dark:border-white/10 px-6 flex flex-col gap-0">

        {/* Platform switcher + controls row */}
        <div className="flex items-center justify-between py-3">

          {/* Left: Standard Header Component */}
          <DashboardHeader
            title="Facebook Analytics"
            subtitle={username ? `Page: ${username}` : "Track page growth, post reach, and visual trends."}
            icon={<Facebook className="h-5 w-5" />}
            brandBgClass="bg-[#1877F2]/10"
            brandTextClass="text-[#1877F2]"
          />

          {/* Right: data controls — only rendered after successful OAuth */}
          {isConnected && (
            <div className="flex items-center gap-2">
              <DateRangePicker
                startDate={dateRange.start}
                endDate={dateRange.end}
                onChange={setDateRange}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="text-xs text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-slate-100 h-9 px-3"
              >
                <RefreshCw className={`h-3.5 w-3.5 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                Refresh Data
              </Button>
              {/* Disconnect — fires the deep-clean revoke via confirmation modal */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDisconnectModal(true)}
                disabled={revokeLoading}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 h-9"
              >
                {revokeLoading ? "Revoking..." : "Disconnect"}
              </Button>
            </div>
          )}
        </div>

        {/* Sub-navigation tab bar — only shown when connected */}
        {isConnected && (
          <div className="flex items-center gap-1 pb-0 overflow-x-auto no-scrollbar">
            {FB_NAV.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium whitespace-nowrap transition-all duration-150 border-b-2 -mb-px ${
                    isActive
                      ? "border-[#1877F2] text-[#1877F2]"
                      : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-200 dark:hover:border-white/20"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Main Content Area ─────────────────────────────────────── */}
      {/* Main container rendering the connection prompt or the active sub-tabs based on state */}
      <div className={`flex-1 overflow-y-auto ${!isConnected ? "flex flex-col" : ""}`}>
        <div className={`p-6 flex flex-col gap-6 ${!isConnected ? "flex-1 justify-center" : ""}`}>
          {!isConnected ? (
            /* ── Facebook Connection Card Empty State ── */
            /* Centers the ConnectCard in the remaining height of the viewport */
            <div className="flex-1 flex items-center justify-center">
              <ConnectCard
                icon={<Facebook className="h-8 w-8" />}
                cardTitle="Connect Facebook Page"
                cardDescription="Connect your Facebook account to view reach, engagement, followers, and detailed visual performance graphs."
                onConnect={handleFacebookConnect}
                buttonText="Connect Facebook"
                brandBgClass="bg-[#1877F2]/10"
                brandTextClass="text-[#1877F2]"
                brandButtonClass="bg-[#1877F2] hover:bg-[#1877F2]/90"
              />
            </div>
          ) : !hasData ? (
            // Connected but API returned no meaningful data
            <EmptyDataState platform="Facebook" />
          ) : (
            // Connected and has data → render active sub-page
            <>
              {activeTab === "overview"    && <FacebookOverview   data={analyticsData}                                      dateRange={dateRange} />}
              {activeTab === "content"     && <FacebookContent    data={analyticsData?.extended?.contentData?.posts}         dateRange={dateRange} />}
              {activeTab === "audience"    && <FacebookAudience   data={analyticsData?.extended?.audienceDetails}            dateRange={dateRange} />}
              {activeTab === "engagement"  && <FacebookEngagement data={analyticsData?.extended?.engagementDetails}          dateRange={dateRange} />}
              {activeTab === "page_likes"  && <FacebookPageLikes  data={analyticsData?.extended?.growth}                     dateRange={dateRange} />}
              {activeTab === "reach_views" && <FacebookReachViews data={analyticsData?.extended?.reachAndViews}              dateRange={dateRange} />}
              {activeTab === "videos"      && <FacebookVideos     data={analyticsData?.extended?.contentData?.videos}        dateRange={dateRange} />}
              {activeTab === "stories"     && <FacebookStories    data={analyticsData?.extended?.contentData?.stories}       dateRange={dateRange} />}
              {activeTab === "groups"      && <FacebookGroups     data={analyticsData?.extended?.groups}                     dateRange={dateRange} />}
              {activeTab === "ads"         && <FacebookAds        data={analyticsData?.extended?.ads}                        dateRange={dateRange} />}
              {activeTab === "reports"     && <FacebookReports    data={analyticsData?.extended?.utilityData?.recentExports} dateRange={dateRange} />}
              {activeTab === "insights"    && <FacebookInsights   data={analyticsData?.extended?.insights}                   dateRange={dateRange} />}
              {activeTab === "settings"    && <FacebookSettings />}
              {activeTab === "help"        && <FacebookHelp />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
