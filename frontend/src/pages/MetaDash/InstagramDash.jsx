// ── Instagram Dashboard ──────────────────────────────────────────────
// Layout shell for the Instagram Analytics experience.
// Structural clone of YoutubeDash.jsx — same layout, same header,
// same sidebar integration. Only brand accent (pink) differs from YT red.
//
// Features: live API → mock fallback, date-range filtering,
// CSV export, 800ms skeleton refresh, disconnect (Meta-only),
// OAuth connection audit logging, YT-identical empty state.

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Instagram } from "@/components/icons/BrandIcons";
import { RefreshCw, Download } from "lucide-react";
import metaApi from "@/services/metaApi";
import { igMockData } from "@/data/metaMockData";
import MetaInnerSidebar from "./MetaInnerSidebar";
import { IG_NAV } from "./metaNavConfig";
import DateRangePicker from "@/components/DateRangePicker";
import ConfirmDisconnectModal from "@/components/ConfirmDisconnectModal";
import { DashEmptyState } from "@/components/ui/DashboardShared";

// ── Sub-page imports ─────────────────────────────────────────────────
import { InstagramOverview }    from "./InstagramOverview";
import { InstagramContent }     from "./InstagramContent";
import { InstagramAudience }    from "./InstagramAudience";
import { InstagramEngagement }  from "./InstagramEngagement";
import { InstagramStories }     from "./InstagramStories";
import { InstagramReels }       from "./InstagramReels";
import { InstagramGrowth }      from "./InstagramGrowth";
import { InstagramHashtags }    from "./InstagramHashtags";
import { InstagramAds }         from "./InstagramAds";
import { InstagramInsights }    from "./InstagramInsights";
import { InstagramReports }     from "./InstagramReports";
import { InstagramSettings }    from "./InstagramSettings";
import { InstagramHelp }        from "./InstagramHelp";

// ── Date filter helper ───────────────────────────────────────────────
function filterByDateRange(arr, start, end) {
  if (!arr || !start || !end) return arr || [];
  const s = new Date(start);
  const e = new Date(end);
  e.setHours(23, 59, 59, 999);
  return arr.filter(item => {
    if (!item.date) return true;
    const d = new Date(item.date);
    return d >= s && d <= e;
  });
}

// ── CSV export helper ────────────────────────────────────────────────
function exportToCSV(data, filename = "export") {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]);
  const rows    = data.map(row => headers.map(h => JSON.stringify(row[h] ?? "")).join(","));
  const csv     = [headers.join(","), ...rows].join("\n");
  const blob    = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url     = URL.createObjectURL(blob);
  const link    = document.createElement("a");
  link.href     = url;
  link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// ── Branded loading spinner (matches YTSpinner, pink accent) ─────────
function IGSpinner() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 border-4 border-pink-500/20 rounded-full" />
        <div className="absolute inset-0 border-4 border-t-pink-500 rounded-full animate-spin" />
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────
export default function InstagramDash() {
  // ── State ───────────────────────────────────────────────────────────
  const [activePage,    setActivePage]    = useState("overview");
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [refreshing,    setRefreshing]    = useState(false);
  const [showDisconnect, setShowDisconnect] = useState(false);
  const [revokeLoading, setRevokeLoading] = useState(false);
  const [username,      setUsername]      = useState("Connected");

  // ── Default date range: last 7 days ─────────────────────────────────
  const today = new Date().toISOString().split("T")[0];
  const sevenDaysAgo = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split("T")[0];
  })();
  const [dateRange, setDateRange] = useState({ start: sevenDaysAgo, end: today });

  // ── Data fetch: Strict Mock Data Phase ────────────────────────────────
  const loadAnalytics = useCallback(async (force = false) => {
    // 1000ms skeleton delay for refresh (matches UX spec)
    if (force) {
      setRefreshing(true);
      await new Promise(r => setTimeout(r, 1000));
    } else {
      setLoading(true);
    }
    try {
      const hasToken = !!localStorage.getItem('metaToken');
      setAnalyticsData(hasToken ? igMockData : null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ── Initial load ─────────────────────────────────────────────────────
  useEffect(() => { loadAnalytics(); }, [loadAnalytics]);

  // ── OAuth Audit ──────────────────────────────────────────────────────
  useEffect(() => {
    console.group("Meta OAuth Connection Audit");
    console.log("Token Status:", localStorage.getItem('metaToken') ? "EXISTS" : "MISSING");
    console.log("Current URL Path:", window.location.pathname);
    console.groupEnd();
  }, []);

  // ── Disconnect handler (Meta-only, does NOT touch global auth) ────────
  const handleRevoke = async () => {
    setRevokeLoading(true);
    localStorage.removeItem('metaToken');
    setAnalyticsData(null);
    setRevokeLoading(false);
  };

  // ── CSV export ────────────────────────────────────────────────────────
  const handleExport = () => {
    const src = analyticsData?.charts?.reachOverTime || [];
    const filtered = filterByDateRange(src, dateRange.start, dateRange.end);
    exportToCSV(filtered.length > 0 ? filtered : src, "instagram_reach");
  };

  // ── Date-filtered chart data ─────────────────────────────────────────
  const filteredData = analyticsData ? {
    ...analyticsData,
    charts: {
      ...analyticsData.charts,
      reachOverTime:       filterByDateRange(analyticsData.charts?.reachOverTime,       dateRange.start, dateRange.end),
      engagementsOverTime: filterByDateRange(analyticsData.charts?.engagementsOverTime, dateRange.start, dateRange.end),
    }
  } : null;

  // ── Render active sub-page ────────────────────────────────────────────
  const renderPage = () => {
    if (loading || refreshing) return null;
    switch (activePage) {
      case "overview":   return <InstagramOverview   data={filteredData}  loading={loading} />;
      case "content":    return <InstagramContent    data={analyticsData?.extended?.contentData?.posts} />;
      case "audience":   return <InstagramAudience   data={analyticsData?.extended?.audienceDetails} />;
      case "engagement": return <InstagramEngagement data={analyticsData?.extended?.engagementDetails} />;
      case "stories":    return <InstagramStories    data={analyticsData?.extended?.contentData?.stories} />;
      case "reels":      return <InstagramReels      data={analyticsData?.extended?.contentData?.reels} />;
      case "growth":     return <InstagramGrowth     data={analyticsData?.extended?.growth} />;
      case "hashtags":   return <InstagramHashtags   data={analyticsData?.extended?.hashtags} />;
      case "ads":        return <InstagramAds        data={analyticsData?.extended?.ads} />;
      case "insights":   return <InstagramInsights   data={analyticsData?.extended?.insights} />;
      case "reports":    return <InstagramReports    data={analyticsData?.extended?.utilityData?.recentExports} />;
      case "settings":   return <InstagramSettings />;
      case "help":       return <InstagramHelp />;
      default:           return <InstagramOverview   data={filteredData}  loading={loading} />;
    }
  };

  // ── Initial loading spinner ───────────────────────────────────────────
  if (loading) return <IGSpinner />;

  // ── Disconnected empty state ──────────────────────────────────────────
  if (!analyticsData) {
    return (
      <div className="flex gap-0 -m-6 min-h-[calc(100vh-4rem)] bg-[#0B1121] text-slate-100">
        <MetaInnerSidebar
          navItems={IG_NAV}
          activeTab={activePage}
          onTabChange={setActivePage}
          platformIcon={Instagram}
          platformLabel="Instagram"
          platformSub="Not connected"
          accentColor="pink"
        />
        <div className="flex-1 min-w-0">
          <DashEmptyState
            title="Instagram Not Connected"
            description="Connect your Instagram Business Account to view analytics."
            icon={Instagram}
            iconBg="bg-pink-500/10"
            iconColor="text-pink-400"
          />
        </div>
      </div>
    );
  }

  // ── Active page label (for header) ────────────────────────────────────
  const activeLabel = IG_NAV.find(n => n.key === activePage)?.label || "Overview";

  return (
    // ── Root layout — exact clone of YoutubeDash root ────────────────
    <div className="flex gap-0 -m-6 min-h-[calc(100vh-4rem)] bg-[#0B1121] text-slate-100">

      {/* ── YT-identical sidebar (pink accent) ────────────────────── */}
      <MetaInnerSidebar
        navItems={IG_NAV}
        activeTab={activePage}
        onTabChange={setActivePage}
        platformIcon={Instagram}
        platformLabel="Instagram"
        platformSub={username}
        accentColor="pink"
      />

      {/* ── Main content area ─────────────────────────────────────── */}
      <div className="flex-1 min-w-0 overflow-y-auto relative">

        {/* Disconnect confirm modal */}
        <ConfirmDisconnectModal
          isOpen={showDisconnect}
          onClose={() => setShowDisconnect(false)}
          onConfirm={() => { setShowDisconnect(false); handleRevoke(); }}
        />

        {/* ── Page Header — exact YT header clone (pink accent) ───── */}
        <div className="sticky top-0 z-10 border-b border-white/10 bg-[#0B1121]/80 backdrop-blur-md px-6 py-3">
          <div className="flex items-center justify-between">

            {/* Left: icon + title + subtitle */}
            <div className="flex items-center gap-3">
              {/* Pink brand icon pill */}
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-pink-500/10">
                <Instagram className="h-4 w-4 text-pink-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100">{activeLabel}</h2>
                {/* Subtitle matches YT "Channel: username" pattern */}
                <p className="text-xs text-slate-400">Profile: {username}</p>
              </div>
            </div>

            {/* Right controls — identical to YT + Facebook */}
            <div className="flex items-center gap-2">

              <DateRangePicker
                startDate={dateRange.start}
                endDate={dateRange.end}
                onChange={setDateRange}
              />

              {/* Export CSV — outline */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="text-xs text-slate-400 border-white/10 bg-white/5 hover:bg-white/10 hover:text-slate-100 h-9 px-3"
              >
                <Download className="h-3.5 w-3.5 mr-2" />
                Export CSV
              </Button>

              {/* Refresh Data — outline (matches YT exactly) */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadAnalytics(true)}
                disabled={refreshing}
                className="text-xs text-slate-400 border-white/10 bg-white/5 hover:bg-white/10 hover:text-slate-100 h-9 px-3"
              >
                <RefreshCw className={`h-3.5 w-3.5 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? "Refreshing…" : "Refresh Data"}
              </Button>

              {/* Disconnect — ghost button (matches YT exactly) */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDisconnect(true)}
                disabled={revokeLoading}
                className="text-xs text-slate-400 hover:text-red-400 h-9"
              >
                {revokeLoading ? "Revoking…" : "Disconnect"}
              </Button>
            </div>
          </div>
        </div>

        {/* ── Active page content — standard SaaS dimensions ──────────── */}
        <div className="max-w-7xl mx-auto w-full p-6 flex flex-col gap-6">
          {renderPage()}
        </div>
      </div>
    </div>
  );
}
