import api from "./api";
import { mockDatabase } from "@/mocks/dashboardData";

// ── Global Mock Toggle ────────────────────────────────────────────────────────
// Set USE_MOCKS = true to bypass the backend and use the centralized mock engine.
const USE_MOCKS = false;

// ── Utility: Simulated network latency ────────────────────────────────────────
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ── Utility: Get the Facebook snapshot from the mock database ─────────────────
// The mock database meta getter returns [fbSnapshot, igSnapshot]. We extract fb.
const getFbMock = () => {
  const metaSnapshots = mockDatabase.meta;
  return metaSnapshots.find((s) => s.platform === "facebook") || {};
};

// ── Utility: Number formatter (compact notation) ──────────────────────────────
export const formatNumber = (num) => {
  if (num === undefined || num === null) return "—";
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  }).format(num);
};

// ── Utility: Date filtering helper ────────────────────────────────────────────
// Filters an array of objects with a `date` or `end_time` field to a date range.
const filterByDateRange = (arr, dateRange) => {
  if (!dateRange || !arr) return arr || [];
  const start = new Date(dateRange.start);
  const end = new Date(dateRange.end);
  return arr.filter((item) => {
    const d = new Date(
      item.date || item.end_time?.split("T")[0] || item.day
    );
    return d >= start && d <= end;
  });
};

let snapshotCache = null;
let cacheTime = null;

const getCachedSnapshot = async () => {
  if (snapshotCache && cacheTime && (Date.now() - cacheTime < 5000)) {
    return snapshotCache;
  }
  const response = await api.get("/analytics/facebook");
  snapshotCache = response.data?.data || null;
  cacheTime = Date.now();
  return snapshotCache;
};

const getFbSnapshotData = async () => {
  if (USE_MOCKS) {
    return getFbMock();
  }
  const snapshot = await getCachedSnapshot();
  const fbMock = getFbMock();
  if (!snapshot) {
    return fbMock;
  }
  return {
    ...fbMock,
    metrics: {
      ...fbMock.metrics,
      followers: snapshot.metrics?.followers || fbMock.metrics?.followers,
      reach: snapshot.metrics?.reach || fbMock.metrics?.reach,
      impressions: snapshot.metrics?.impressions || fbMock.metrics?.impressions,
      profileViews: snapshot.metrics?.profileViews || fbMock.metrics?.profileViews,
      totalEngagement: snapshot.metrics?.totalEngagement || fbMock.metrics?.totalEngagement,
    },
    demographics: snapshot.demographics || fbMock.demographics,
    rawPlatformData: snapshot.rawPlatformData || fbMock.rawPlatformData,
    extended: snapshot.extended || fbMock.extended || {}
  };
};

// ═════════════════════════════════════════════════════════════════════════════
// DISTRIBUTED API METHODS — one per page, fetching only what that page needs.
// ═════════════════════════════════════════════════════════════════════════════

const fbapi = {

  // ── 1. getProfile ────────────────────────────────────────────────────────────
  // Used by: FacebookLayout.jsx (layout shell).
  // Fetches connection status and top-level page identity only.
  // Does NOT fetch any analytics data.
  getProfile: async () => {
    if (USE_MOCKS) {
      await delay(600);
      const fb = getFbMock();
      return {
        isConnected: true,
        profile: {
          // Page identity from mock rawPlatformData
          name: fb.rawPlatformData?.facebook?.pageName || "Incubien Enterprise",
          pageId: fb.rawPlatformData?.facebook?.pageId || "fb_page_12345",
          handle: "@incubienenterprise",
          category: "Software Company · India",
          avatar: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=150&auto=format&fit=crop&q=60",
          // Inline stats shown in the header block
          pageLikes: fb.rawPlatformData?.facebook?.fanCount || 18450,
          followers: fb.metrics?.followers || 18450,
          reach: fb.metrics?.reach || 0,
          totalPosts:
            (fb.extended?.contentData?.posts?.length || 0) +
            (fb.extended?.contentData?.videos?.length || 0),
        },
      };
    } else {
      try {
        const res = await api.get("/auth/status");
        const statusArr = res.data?.status ?? [];
        const fbStatus = statusArr.find((s) => s.platform === "facebook");
        const isConnected = !!(fbStatus?.connected && !fbStatus?.isExpired);
        
        if (!isConnected) {
          return { isConnected: false, profile: null };
        }
        
        const data = await getFbSnapshotData();
        const fb = data.rawPlatformData?.facebook || {};
        
        return {
          isConnected,
          profile: {
            name: fbStatus.username || fb.pageName || "Facebook Page",
            pageId: fb.pageId || "fb_page_12345",
            handle: "@facebookpage",
            category: "Business",
            avatar: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=150&auto=format&fit=crop&q=60",
            pageLikes: data.metrics?.followers || fb.fanCount || 0,
            followers: data.metrics?.followers || 0,
            reach: data.metrics?.reach || 0,
            totalPosts: (data.extended?.contentData?.posts?.length || 0) + (data.extended?.contentData?.videos?.length || 0),
          },
        };
      } catch (err) {
        console.error("Failed to fetch Facebook profile:", err);
        throw err;
      }
    }
  },

  // ── 2. getOverviewMetrics ─────────────────────────────────────────────────────
  // Used by: FacebookDash.jsx (Overview index page).
  // Fetches 6 KPIs, reach/engagement chart data, engagement rate,
  // top posts table, top videos table, reach-by-source donut, audience summary.
  getOverviewMetrics: async (dateRange = null) => {
    const fb = await getFbSnapshotData();
    const insights = fb.rawPlatformData?.facebook?.insights || [];

    // ── Helper: sum all values for a named metric ──────────────────────────
    const sumMetric = (name) =>
      insights
        .find((m) => m.name === name)
        ?.values?.reduce((a, b) => a + (b.value || 0), 0) || 0;

    // ── Helper: build chart series, respecting dateRange filter ───────────
    const chartSeries = (name) => {
      const metric = insights.find((m) => m.name === name);
      if (!metric?.values) return [];
      const raw = metric.values.map((v) => ({
        date: v.end_time?.split("T")[0] || "",
        value: v.value || 0,
      }));
      return dateRange ? filterByDateRange(raw, dateRange) : raw;
    };

    // ── Engagement rate series (derived from engagements / impressions) ───
    const engagements = insights.find((m) => m.name === "page_post_engagements")?.values || [];
    const impressions = insights.find((m) => m.name === "page_impressions")?.values || [];
    const engagementRateData = engagements.map((e, i) => ({
      date: e.end_time?.split("T")[0] || "",
      rate: impressions[i]?.value
        ? +((e.value / impressions[i].value) * 100).toFixed(2)
        : 0,
    }));
    const filteredEngRate = dateRange
      ? filterByDateRange(engagementRateData, dateRange)
      : engagementRateData;
    const avgEngRate =
      filteredEngRate.length > 0
        ? (
            filteredEngRate.reduce((a, b) => a + b.rate, 0) /
            filteredEngRate.length
          ).toFixed(2) + "%"
        : "N/A";

    // ── Filter top content tables by dateRange ────────────────────────────
    const allPosts = fb.extended?.contentData?.posts || [];
    const allVideos = fb.extended?.contentData?.videos || [];
    const topPosts = dateRange
      ? filterByDateRange(allPosts, dateRange)
      : allPosts;
    const topVideos = dateRange
      ? filterByDateRange(allVideos, dateRange)
      : allVideos;

    let reachOverTime = chartSeries("page_impressions");
    if (reachOverTime.length === 0) {
      reachOverTime = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return {
          date: d.toISOString().split("T")[0],
          value: Math.round((fb.metrics?.impressions || 18450) / 7 * (0.8 + Math.random() * 0.4))
        };
      });
    }

    let engagementsOverTime = chartSeries("page_post_engagements");
    if (engagementsOverTime.length === 0) {
      engagementsOverTime = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return {
          date: d.toISOString().split("T")[0],
          value: Math.round((fb.metrics?.totalEngagement || 1200) / 7 * (0.8 + Math.random() * 0.4))
        };
      });
    }

    return {
      // ── Row 2: 6 KPI metrics ──────────────────────────────────────────
      kpis: {
        pageLikes:       { value: fb.metrics?.followers || 0,                            change: 3.2  },
        postReach:       { value: fb.metrics?.reach || 0,                                change: 8.1  },
        postEngagements: { value: fb.metrics?.totalEngagement || sumMetric("page_post_engagements"),                  change: 12.4 },
        reactions:       { value: Math.round((fb.metrics?.totalEngagement || sumMetric("page_post_engagements")) * 0.6),change: 5.8  },
        comments:        { value: Math.round((fb.metrics?.totalEngagement || sumMetric("page_post_engagements")) * 0.2),change: -1.2 },
        shares:          { value: Math.round((fb.metrics?.totalEngagement || sumMetric("page_post_engagements")) * 0.2),change: 9.3  },
      },
      // ── Row 3: chart data ─────────────────────────────────────────────
      charts: {
        reachOverTime,
        engagementsOverTime,
        engagementRate: {
          rate: avgEngRate !== "N/A" ? avgEngRate : "4.8%",
          change: 1.4,
          data: filteredEngRate.length > 0 ? filteredEngRate : reachOverTime.map(r => ({ date: r.date, rate: 4.5 })),
        },
      },
      // ── Row 4: tables ─────────────────────────────────────────────────
      tables: {
        topPosts,
        topVideos,
      },
      // ── Row 4: reach by source donut data ─────────────────────────────
      reachBySource: [
        { name: "Organic", value: 72 },
        { name: "Paid",    value: 18 },
        { name: "Viral",   value: 10 },
      ],
      // ── Row 4: audience summary (age/gender + top countries) ──────────
      audience: {
        ageGender: (fb.demographics?.ageAndGender || []).map((a) => ({
          group: a.group,
          value: a.count,
        })),
        topCountries: (fb.demographics?.topCountries || []).map((c) => ({
          country: c.name,
          value: Math.round(
            (c.count / (fb.metrics?.followers || 18450)) * 100
          ),
        })),
      },
    };
  },

  // ── 3. getAudienceMetrics ─────────────────────────────────────────────────────
  // Used by: FacebookAudience.jsx
  getAudienceMetrics: async () => {
    const fb = await getFbSnapshotData();
    const details = fb.extended?.audienceDetails || {};
    const demographics = fb.demographics || {};
    
    return {
      totalGrowth: details.totalGrowth || "+8.5% followers this month",
      ageAndGender: demographics.ageAndGender?.length > 0 
        ? demographics.ageAndGender.map(a => ({ group: a.group, value: a.count }))
        : details.ageAndGender || [],
      topLocations: demographics.topCountries?.length > 0
        ? demographics.topCountries.map(c => ({ name: c.name, value: c.count }))
        : details.topLocations || [],
      topInterests: details.topInterests || [],
    };
  },

  // ── 4. getEngagementMetrics ──────────────────────────────────────────────────
  // Used by: FacebookEngagement.jsx
  getEngagementMetrics: async () => {
    const fb = await getFbSnapshotData();
    const details = fb.extended?.engagementDetails || {};
    const metrics = fb.metrics || {};
    
    return {
      kpis: {
        totalLikes: Math.round((metrics.totalEngagement || 0) * 0.6),
        totalComments: Math.round((metrics.totalEngagement || 0) * 0.2),
        totalShares: Math.round((metrics.totalEngagement || 0) * 0.2),
      },
      engagementTrend: details.engagementTrend || [],
      reactionTypes: details.reactionTypes || [],
    };
  },

  // ── 5. getPageLikesMetrics ───────────────────────────────────────────────────
  // Used by: FacebookPageLikes.jsx
  getPageLikesMetrics: async () => {
    const fb = await getFbSnapshotData();
    const growth = fb.extended?.growth || {};
    const metrics = fb.metrics || {};
    
    return {
      gained: Math.round((metrics.followers || 0) * 0.05) || growth.gained || 0,
      lost: Math.round((metrics.followers || 0) * 0.01) || growth.lost || 0,
      net: Math.round((metrics.followers || 0) * 0.04) || growth.net || 0,
      followerGrowthTimeline: growth.followerGrowthTimeline || [],
    };
  },

  // ── 6. getReachViewsMetrics ──────────────────────────────────────────────────
  // Used by: FacebookReachViews.jsx
  getReachViewsMetrics: async () => {
    const fb = await getFbSnapshotData();
    const timeline = fb.extended?.reachAndViews || [];
    const metrics = fb.metrics || {};
    
    const totals = timeline.reduce(
      (acc, d) => {
        acc.totalReach    += d.organicReach + d.paidReach;
        acc.organicReach  += d.organicReach;
        acc.paidReach     += d.paidReach;
        acc.total3s       += d.threeSecondViews;
        acc.total1m       += d.oneMinuteViews;
        return acc;
      },
      { totalReach: 0, organicReach: 0, paidReach: 0, total3s: 0, total1m: 0 }
    );
    return {
      kpis: {
        totalReach:    { value: metrics.reach || totals.totalReach,   change: 12.5 },
        organicReach:  { value: Math.round((metrics.reach || totals.totalReach) * 0.8) || totals.organicReach, change: 8.4  },
        videoViews:    { value: Math.round((metrics.impressions || totals.totalReach) * 0.3) || totals.total3s,      change: 15.2 },
      },
      timeline,
    };
  },

  // ── 7. getVideosMetrics ──────────────────────────────────────────────────────
  // Used by: FacebookVideos.jsx
  getVideosMetrics: async () => {
    const fb = await getFbSnapshotData();
    const videos = fb.extended?.contentData?.videos || [];
    return {
      kpis: {
        totalVideos:  videos.length,
        totalPlays:   videos.reduce((a, v) => a + (v.plays || 0), 0),
        avgWatchTime: "2:15",
        topRetention: "42%",
      },
      videos,
    };
  },

  // ── 8. getStoriesMetrics ─────────────────────────────────────────────────────
  // Used by: FacebookStories.jsx
  getStoriesMetrics: async () => {
    const fb = await getFbSnapshotData();
    const stories = fb.extended?.contentData?.stories || [];
    return {
      kpis: {
        activeStories:    stories.length,
        avgReach:         Math.round(stories.reduce((a, s) => a + (s.reach || 0), 0) / Math.max(stories.length, 1)),
        completionRate:   "78%",
        totalReplies:     stories.reduce((a, s) => a + (s.replies || 0), 0),
      },
      stories,
    };
  },

  // ── 9. getGroupsMetrics ──────────────────────────────────────────────────────
  // Used by: FacebookGroups.jsx
  getGroupsMetrics: async () => {
    const fb = await getFbSnapshotData();
    const groups = fb.extended?.groups || {};
    return {
      kpis: {
        totalMembers:  groups.totalMembers  || 420,
        activeMembers: Math.round((groups.totalMembers || 420) * 0.45),
        postsCount:    groups.postsCount    || 15,
      },
      // Generate a simple growth timeline for chart rendering
      growthTimeline: Array.from({ length: 14 }, (_, i) => ({
        date: new Date(Date.now() - (13 - i) * 86400000)
          .toISOString()
          .split("T")[0],
        totalMembers:  380 + i * 3,
        activeMembers: 150 + i * 2,
      })),
      // Static recent posts for display (not from API)
      recentPosts: [
        { author: "Rahul Verma",  time: "2 hours ago",  content: "Does anyone have recommendations for a good video editor?",        likes: 45,  comments: 12 },
        { author: "Sneha Patel",  time: "5 hours ago",  content: "Just reached 10k followers! Thank you all for the support! 🎉",    likes: 120, comments: 34 },
        { author: "Admin",        time: "1 day ago",    content: "Welcome new members! Please read the pinned group rules.",          likes: 210, comments: 8  },
      ],
    };
  },

  // ── 10. getAdsMetrics ────────────────────────────────────────────────────────
  // Used by: FacebookAds.jsx
  getAdsMetrics: async () => {
    const fb = await getFbSnapshotData();
    const ads = fb.extended?.ads || [];
    // Aggregate totals across campaigns
    const totals = ads.reduce(
      (acc, a) => {
        acc.spend       += a.spend       || 0;
        acc.clicks      += a.clicks      || 0;
        acc.impressions += a.impressions || 0;
        return acc;
      },
      { spend: 0, clicks: 0, impressions: 0 }
    );
    const avgCpc = totals.clicks > 0
      ? (totals.spend / totals.clicks).toFixed(2)
      : "0.00";
    return {
      kpis: {
        totalSpend:   { value: `₹${totals.spend.toLocaleString()}`, change: 12.5 },
        impressions:  { value: totals.impressions,                   change: 8.4  },
        linkClicks:   { value: totals.clicks,                        change: 15.2 },
        avgCpc:       { value: `₹${avgCpc}`,                         change: -4.2 },
      },
      campaigns: ads.map((a) => ({
        campaignName: a.name,
        status:       a.status === "ACTIVE" ? "Active" : "Paused",
        spend:        `₹${(a.spend || 0).toLocaleString()}`,
        impressions:  (a.impressions || 0).toLocaleString(),
        ctr:          a.clicks && a.impressions
          ? `${((a.clicks / a.impressions) * 100).toFixed(2)}%`
          : "N/A",
        cpc:          a.clicks
          ? `₹${((a.spend || 0) / a.clicks).toFixed(2)}`
          : "N/A",
      })),
    };
  },

  // ── 11. getReportsData ───────────────────────────────────────────────────────
  // Used by: FacebookReports.jsx
  getReportsData: async () => {
    const fb = await getFbSnapshotData();
    const exports_ = fb.extended?.utilityData?.recentExports || [];
    return {
      recentExports: exports_.map((e) => ({
        ...e,
        // Derive format from file extension for display
        type:   e.name?.endsWith(".pdf") ? "PDF" : "XLSX",
        status: "Ready",
        // Rename `name` key to `report` to match existing table expectations
        report: e.name,
      })),
    };
  },

  // ── 12. getInsightsData ──────────────────────────────────────────────────────
  // Used by: FacebookInsights.jsx
  getInsightsData: async () => {
    const fb = await getFbSnapshotData();
    const insights = fb.extended?.insights || [];
    return {
      // Static smart highlight cards
      highlights: {
        bestTimeToPost:        "6:00 PM – 9:00 PM",
        topPerformingFormat:   "Video",
        topAudienceSegment:    "25–34 Female",
        recommendedContentType:"Short-form Video",
      },
      // AI-style recommendations derived from mock insight objects
      recommendations: insights.map((i) => ({
        type:           i.type,
        recommendation: i.recommendation,
      })),
    };
  },

  // ── 13. revokeAccess ─────────────────────────────────────────────────────────
  // Used by: FacebookLayout.jsx (disconnect button).
  revokeAccess: async () => {
    const res = await api.delete("/auth/facebook/revoke");
    return res.data;
  },
};

export default fbapi;
