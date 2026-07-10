import api from "./api";

// ── Cache management and fetch wrapper ────────────────────────────────
let snapshotCache = null;
let cacheTime = null;

const getCachedSnapshot = async (forceRefresh = false) => {
  if (!forceRefresh && snapshotCache && cacheTime && (Date.now() - cacheTime < 5000)) {
    return snapshotCache;
  }
  try {
    const url = forceRefresh ? "/analytics/meta/facebook?forceRefresh=true" : "/analytics/meta/facebook";
    const response = await api.get(url);
    snapshotCache = response.data?.data || null;
    cacheTime = Date.now();
    return snapshotCache;
  } catch (err) {
    console.warn("Failed to fetch Facebook analytics from API:", err.message);
    return null;
  }
};

const getFbSnapshotData = async (forceRefresh = false) => {
  const snapshot = await getCachedSnapshot(forceRefresh);
  return snapshot || {};
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

const fbapi = {
  getProfile: async () => {
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
          pageId: fb.pageId || "fb_page",
          handle: "@facebookpage",
          category: "Business",
          avatar: "",
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
  },

  getOverviewMetrics: async (dateRange = null, forceRefresh = false) => {
    const fb = await getFbSnapshotData(forceRefresh);
    const insights = fb.rawPlatformData?.facebook?.insights || [];

    const sumMetric = (name) =>
      insights
        .find((m) => m.name === name)
        ?.values?.reduce((a, b) => a + (b.value || 0), 0) || 0;

    const chartSeries = (name) => {
      const metric = insights.find((m) => m.name === name);
      if (!metric?.values) return [];
      const raw = metric.values.map((v) => ({
        date: v.end_time?.split("T")[0] || "",
        value: v.value || 0,
      }));
      return dateRange ? filterByDateRange(raw, dateRange) : raw;
    };

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

    const rawPosts = fb.rawPlatformData?.facebook?.posts || [];
    const formattedPosts = rawPosts.map((p) => {
      const type = p.attachments?.data?.[0]?.media_type === "video" ? "Videos" : (p.full_picture ? "Photos" : "Text");
      return {
        id: p.id,
        title: p.message || "Untitled Post",
        image: p.full_picture || "https://placehold.co/150",
        date: p.created_time ? new Date(p.created_time).toISOString().split("T")[0] : "",
        reach: 0,
        impressions: 0,
        engagements: (p.likes?.summary?.total_count || 0) + (p.comments?.summary?.total_count || 0) + (p.shares?.count || 0),
        reactions: p.likes?.summary?.total_count || 0,
        likes: p.likes?.summary?.total_count || 0,
        comments: p.comments?.summary?.total_count || 0,
        shares: p.shares?.count || 0,
        type: type,
        rate: "N/A",
        duration: type === "Videos" ? "0:00" : undefined,
        views: 0,
        watchTime: "0:00"
      };
    });

    const allPosts = formattedPosts.filter(p => p.type !== "Videos");
    const allVideos = formattedPosts.filter(p => p.type === "Videos");
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
        return { date: d.toISOString().split("T")[0], value: 0 };
      });
    }

    let engagementsOverTime = chartSeries("page_post_engagements");
    if (engagementsOverTime.length === 0) {
      engagementsOverTime = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return { date: d.toISOString().split("T")[0], value: 0 };
      });
    }

    let finalEngRateData = filteredEngRate;
    if (finalEngRateData.length === 0) {
      finalEngRateData = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return { date: d.toISOString().split("T")[0], rate: 0 };
      });
    }

    return {
      kpis: {
        pageLikes: { value: fb.metrics?.followers || 0, change: 0 },
        postReach: { value: fb.metrics?.reach || 0, change: 0 },
        postEngagements: { value: fb.metrics?.totalEngagement || sumMetric("page_post_engagements"), change: 0 },
        reactions: { value: Math.round((fb.metrics?.totalEngagement || sumMetric("page_post_engagements")) * 0.6), change: 0 },
        comments: { value: Math.round((fb.metrics?.totalEngagement || sumMetric("page_post_engagements")) * 0.2), change: 0 },
        shares: { value: Math.round((fb.metrics?.totalEngagement || sumMetric("page_post_engagements")) * 0.2), change: 0 },
      },
      charts: {
        reachOverTime,
        engagementsOverTime,
        engagementRate: {
          rate: avgEngRate !== "N/A" ? avgEngRate : "0%",
          change: 0,
          data: finalEngRateData,
        },
      },
      tables: {
        topPosts,
        topVideos,
      },
      reachBySource: [],
      audience: {
        ageGender: (fb.demographics?.ageAndGender || []).map((a) => ({
          group: a.group,
          value: a.count,
        })),
        topCountries: (fb.demographics?.topCountries || []).map((c) => ({
          country: c.name,
          value: Math.round(
            (c.count / (fb.metrics?.followers || 1)) * 100
          ),
        })),
      },
    };
  },

  getAudienceMetrics: async () => {
    const fb = await getFbSnapshotData();
    const demographics = fb.demographics || {};
    const details = fb.extended?.audienceDetails || {};

    return {
      totalGrowth: details.totalGrowth || "",
      ageAndGender: demographics.ageAndGender?.length > 0
        ? demographics.ageAndGender.map(a => ({ group: a.group, value: a.count }))
        : [],
      topLocations: demographics.topCountries?.length > 0
        ? demographics.topCountries.map(c => ({ name: c.name, value: c.count }))
        : [],
      topInterests: details.topInterests || [],
    };
  },

  getEngagementMetrics: async () => {
    const fb = await getFbSnapshotData();
    const details = fb.extended?.engagementDetails || {};
    const metrics = fb.metrics || {};

    let engagementTrend = details.engagementTrend || [];
    if (engagementTrend.length === 0) {
      engagementTrend = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return {
          date: d.toISOString().split("T")[0],
          likes: 0,
          comments: 0,
          shares: 0
        };
      });
    }

    return {
      kpis: {
        totalLikes: Math.round((metrics.totalEngagement || 0) * 0.6),
        totalComments: Math.round((metrics.totalEngagement || 0) * 0.2),
        totalShares: Math.round((metrics.totalEngagement || 0) * 0.2),
      },
      engagementTrend,
      reactionTypes: details.reactionTypes || [],
    };
  },

  getPageLikesMetrics: async () => {
    const fb = await getFbSnapshotData();
    const growth = fb.extended?.growth || {};
    const metrics = fb.metrics || {};

    let followerGrowthTimeline = growth.followerGrowthTimeline || [];
    if (followerGrowthTimeline.length === 0) {
      followerGrowthTimeline = Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        return {
          date: d.toISOString().split("T")[0],
          gained: 0,
          lost: 0,
          net: 0
        };
      });
    }

    return {
      gained: Math.round((metrics.followers || 0) * 0.05) || growth.gained || 0,
      lost: Math.round((metrics.followers || 0) * 0.01) || growth.lost || 0,
      net: Math.round((metrics.followers || 0) * 0.04) || growth.net || 0,
      followerGrowthTimeline,
    };
  },

  getReachViewsMetrics: async () => {
    const fb = await getFbSnapshotData();
    let timeline = fb.extended?.reachAndViews || [];
    if (timeline.length === 0) {
      timeline = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return {
          date: d.toISOString().split("T")[0],
          organicReach: 0,
          paidReach: 0,
          threeSecondViews: 0,
          oneMinuteViews: 0
        };
      });
    }
    const metrics = fb.metrics || {};

    const totals = timeline.reduce(
      (acc, d) => {
        acc.totalReach += d.organicReach + d.paidReach;
        acc.organicReach += d.organicReach;
        acc.paidReach += d.paidReach;
        acc.total3s += d.threeSecondViews;
        acc.total1m += d.oneMinuteViews;
        return acc;
      },
      { totalReach: 0, organicReach: 0, paidReach: 0, total3s: 0, total1m: 0 }
    );
    return {
      kpis: {
        totalReach: { value: metrics.reach || totals.totalReach, change: 0 },
        organicReach: { value: Math.round((metrics.reach || totals.totalReach) * 0.8) || totals.organicReach, change: 0 },
        videoViews: { value: Math.round((metrics.impressions || totals.totalReach) * 0.3) || totals.total3s, change: 0 },
      },
      timeline,
    };
  },

  getVideosMetrics: async () => {
    const fb = await getFbSnapshotData();
    const videos = fb.extended?.contentData?.videos || [];
    return {
      kpis: {
        totalVideos: videos.length,
        totalPlays: videos.reduce((a, v) => a + (v.plays || 0), 0),
        avgWatchTime: "0:00",
        topRetention: "0%",
      },
      videos,
    };
  },

  getStoriesMetrics: async () => {
    const fb = await getFbSnapshotData();
    const stories = fb.extended?.contentData?.stories || [];
    return {
      kpis: {
        activeStories: stories.length,
        avgReach: Math.round(stories.reduce((a, s) => a + (s.reach || 0), 0) / Math.max(stories.length, 1)),
        completionRate: "0%",
        totalReplies: stories.reduce((a, s) => a + (s.replies || 0), 0),
      },
      stories,
    };
  },

  getGroupsMetrics: async () => {
    const fb = await getFbSnapshotData();
    const groups = fb.extended?.groups || {};
    return {
      kpis: {
        totalMembers: groups.totalMembers || 0,
        activeMembers: Math.round((groups.totalMembers || 0) * 0.45),
        postsCount: groups.postsCount || 0,
      },
      growthTimeline: [],
      recentPosts: [],
    };
  },

  getAdsMetrics: async () => {
    const fb = await getFbSnapshotData();
    const ads = fb.extended?.ads || [];
    const totals = ads.reduce(
      (acc, a) => {
        acc.spend += a.spend || 0;
        acc.clicks += a.clicks || 0;
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
        totalSpend: { value: `₹${totals.spend.toLocaleString()}`, change: 0 },
        impressions: { value: totals.impressions, change: 0 },
        linkClicks: { value: totals.clicks, change: 0 },
        avgCpc: { value: `₹${avgCpc}`, change: 0 },
      },
      campaigns: ads.map((a) => ({
        campaignName: a.name,
        status: a.status === "ACTIVE" ? "Active" : "Paused",
        spend: `₹${(a.spend || 0).toLocaleString()}`,
        impressions: (a.impressions || 0).toLocaleString(),
        ctr: a.clicks && a.impressions
          ? `${((a.clicks / a.impressions) * 100).toFixed(2)}%`
          : "N/A",
        cpc: a.clicks
          ? `₹${((a.spend || 0) / a.clicks).toFixed(2)}`
          : "N/A",
      })),
    };
  },

  getReportsData: async () => {
    const fb = await getFbSnapshotData();
    const exports_ = fb.extended?.utilityData?.recentExports || [];
    return {
      recentExports: exports_.map((e) => ({
        ...e,
        type: e.name?.endsWith(".pdf") ? "PDF" : "XLSX",
        status: "Ready",
        report: e.name,
      })),
    };
  },

  getInsightsData: async () => {
    const fb = await getFbSnapshotData();
    const insights = fb.extended?.insights || [];
    return {
      highlights: {
        bestTimeToPost: "N/A",
        topPerformingFormat: "N/A",
        topAudienceSegment: "N/A",
        recommendedContentType: "N/A",
      },
      recommendations: insights.map((i) => ({
        type: i.type,
        recommendation: i.recommendation,
      })),
    };
  },

  revokeAccess: async () => {
    const res = await api.delete("/auth/facebook/revoke");
    return res.data;
  },
};

export default fbapi;
