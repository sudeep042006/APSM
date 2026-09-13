import api from "./api";

// ── Cache management and fetch wrapper ────────────────────────────────
let responseCache = null; // stores { snapshot, history }

const getCachedResponse = async (forceRefresh = false) => {
  if (!forceRefresh && responseCache) {
    return responseCache;
  }
  try {
    const url = forceRefresh ? "/analytics/meta/facebook?forceRefresh=true" : "/analytics/meta/facebook";
    const response = await api.get(url);
    responseCache = {
      snapshot: response.data?.data || null,
      history: response.data?.history || []
    };
    return responseCache;
  } catch (err) {
    console.warn("Failed to fetch Facebook analytics from API:", err.message);
    return { snapshot: null, history: [] };
  }
};

const getFbData = async (forceRefresh = false) => {
  const { snapshot, history } = await getCachedResponse(forceRefresh);
  return { snapshot: snapshot || {}, history: history || [] };
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

      const { snapshot: data } = await getFbData();
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
          totalPosts: fb.posts?.length || 0,
        },
      };
    } catch (err) {
      console.error("Failed to fetch Facebook profile:", err);
      throw err;
    }
  },

  getOverviewMetrics: async (dateRange = null, forceRefresh = false) => {
    const { snapshot: fb, history } = await getFbData(forceRefresh);
    const insights = fb.rawPlatformData?.facebook?.insights || [];

    const rawPosts = fb.rawPlatformData?.facebook?.posts || [];
    const followers = fb.metrics?.followers || fb.rawPlatformData?.facebook?.fanCount || 1;

    // ── Build formatted posts list ─────────────────────────────────────
    const formattedPosts = rawPosts.map((p) => {
      const attachType = p.attachments?.data?.[0]?.type || "";
      const isVideo = attachType.includes("video") || p.attachments?.data?.[0]?.media_type === "video";
      const isLink = attachType === "share" || attachType === "link";
      const type = isVideo ? "Videos" : (isLink ? "Links" : (p.full_picture || p.picture ? "Photos" : "Text"));
      const postReactions = p.reactions?.summary?.total_count ?? p.likes?.summary?.total_count ?? 0;
      const postComments = p.comments?.summary?.total_count || 0;
      const postShares = p.shares?.count || 0;
      const postEngagements = postReactions + postComments + postShares;
      return {
        id: p.id,
        title: p.message || p.story || (isVideo ? "Video Post" : "Post"),
        image: p.full_picture || p.picture || null,
        date: p.created_time ? new Date(p.created_time).toISOString().split("T")[0] : "",
        reach: 0,
        impressions: 0,
        engagements: postEngagements,
        reactions: postReactions,
        likes: postReactions,
        comments: postComments,
        shares: postShares,
        type,
        rate: followers ? `${((postEngagements / followers) * 100).toFixed(1)}%` : "0%",
        duration: isVideo ? "0:00" : undefined,
        views: 0,
        watchTime: "0:00"
      };
    });

    // ── Filter posts by date range for Top Posts table ─────────────────
    const allPosts = formattedPosts.filter(p => p.type !== "Videos");
    const allVideos = formattedPosts.filter(p => p.type === "Videos");
    const topPosts = dateRange ? filterByDateRange(allPosts, dateRange) : allPosts;
    const topVideos = dateRange ? filterByDateRange(allVideos, dateRange) : allVideos;

    // ── Build REAL time-series from history (daily snapshots from DB) ──
    // history is an array of snapshot docs sorted ascending by snapshotDate
    let reachOverTime = [];
    let engagementsOverTime = [];
    let finalEngRateData = [];

    if (history && history.length > 0) {
      // Filter history by date range
      const filteredHistory = dateRange
        ? history.filter(h => {
            const d = h.snapshotDate?.split?.("T")[0] || new Date(h.snapshotDate).toISOString().split("T")[0];
            return d >= dateRange.start && d <= dateRange.end;
          })
        : history;

      reachOverTime = filteredHistory.map(h => ({
        date: h.snapshotDate?.split?.("T")[0] || new Date(h.snapshotDate).toISOString().split("T")[0],
        value: h.metrics?.impressions || h.metrics?.reach || 0
      }));

      engagementsOverTime = filteredHistory.map(h => ({
        date: h.snapshotDate?.split?.("T")[0] || new Date(h.snapshotDate).toISOString().split("T")[0],
        value: h.metrics?.totalEngagement || 0
      }));

      finalEngRateData = filteredHistory.map(h => {
        const eng = h.metrics?.totalEngagement || 0;
        const imp = h.metrics?.impressions || h.metrics?.reach || 1;
        return {
          date: h.snapshotDate?.split?.("T")[0] || new Date(h.snapshotDate).toISOString().split("T")[0],
          rate: imp > 0 ? +((eng / imp) * 100).toFixed(2) : 0
        };
      });
    }

    // ── Fallback: derive from posts if history is empty ────────────────
    if (reachOverTime.length === 0) {
      // Show unique post dates with 0 reach (accurate — no reach data available)
      const uniquePostDates = [...new Set(formattedPosts.map(p => p.date).filter(Boolean))].sort();
      reachOverTime = uniquePostDates.length > 0
        ? uniquePostDates.map(d => ({ date: d, value: 0 }))
        : [{ date: new Date().toISOString().split("T")[0], value: 0 }];
    }

    if (engagementsOverTime.length === 0) {
      const byDate = {};
      formattedPosts.forEach(p => {
        if (p.date) byDate[p.date] = (byDate[p.date] || 0) + p.engagements;
      });
      const sortedDates = Object.keys(byDate).sort();
      engagementsOverTime = sortedDates.length > 0
        ? sortedDates.map(d => ({ date: d, value: byDate[d] }))
        : [{ date: new Date().toISOString().split("T")[0], value: 0 }];
    }

    if (finalEngRateData.length === 0) {
      const byDate = {};
      formattedPosts.forEach(p => {
        if (p.date) byDate[p.date] = (byDate[p.date] || 0) + p.engagements;
      });
      finalEngRateData = Object.keys(byDate).sort().map(date => ({
        date,
        rate: followers > 0 ? +((byDate[date] / followers) * 100).toFixed(2) : 0
      }));
      if (finalEngRateData.length === 0) {
        finalEngRateData = [{ date: new Date().toISOString().split("T")[0], rate: 0 }];
      }
    }

    // ── KPI totals from posts ──────────────────────────────────────────
    const totalPostLikes = rawPosts.reduce((sum, p) => sum + (p.reactions?.summary?.total_count ?? p.likes?.summary?.total_count ?? 0), 0);
    const totalPostComments = rawPosts.reduce((sum, p) => sum + (p.comments?.summary?.total_count || 0), 0);
    const totalPostShares = rawPosts.reduce((sum, p) => sum + (p.shares?.count || 0), 0);
    const totalPostEngagement = totalPostLikes + totalPostComments + totalPostShares;

    const avgEngRate = followers && totalPostEngagement
      ? ((totalPostEngagement / followers) * 100).toFixed(2) + "%"
      : "0.00%";

    return {
      kpis: {
        pageLikes: { value: fb.metrics?.followers || fb.rawPlatformData?.facebook?.fanCount || 0, change: 0 },
        postReach: { value: fb.metrics?.reach || 0, change: 0 },
        postEngagements: { value: fb.metrics?.totalEngagement || totalPostEngagement || 0, change: 0 },
        reactions: { value: totalPostLikes, change: 0 },
        comments: { value: totalPostComments, change: 0 },
        shares: { value: totalPostShares, change: 0 },
      },
      charts: {
        reachOverTime,
        engagementsOverTime,
        engagementRate: { rate: avgEngRate, change: 0, data: finalEngRateData },
      },
      tables: { topPosts, topVideos },
      reachBySource: [],
      audience: {
        ageGender: (fb.demographics?.ageAndGender || []).map((a) => ({ group: a.group, value: a.count })),
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
    const { snapshot: fb } = await getFbData();
    const demographics = fb.demographics || {};
    const details = fb.extended?.audienceDetails || {};

    // Process Age & Gender: split "F.18-24" into female/male properties for Recharts side-by-side bars
    let ageAndGender = [];
    if (demographics.ageAndGender?.length > 0) {
      const groups = {};
      demographics.ageAndGender.forEach(item => {
        const [gender, bracket] = item.group.split('.'); // e.g., F, 18-24
        const ageBracket = bracket || item.group;
        if (!groups[ageBracket]) {
          groups[ageBracket] = { group: ageBracket, female: 0, male: 0 };
        }
        if (gender === 'F') {
          groups[ageBracket].female = item.count;
        } else if (gender === 'M') {
          groups[ageBracket].male = item.count;
        } else {
          groups[ageBracket].female = item.count;
        }
      });
      ageAndGender = Object.values(groups);
    }

    // Process Top Locations: compute percentage and return key "location" expected by FacebookAudience.jsx
    const totalCount = demographics.topCountries?.reduce((sum, c) => sum + (c.count || 0), 0) || 1;
    let topLocations = [];
    if (demographics.topCountries?.length > 0) {
      topLocations = demographics.topCountries.map(c => ({
        location: c.name === 'IN' ? 'India' : (c.name === 'US' ? 'United States' : c.name),
        value: Math.round((c.count / totalCount) * 100)
      }));
    }

    return {
      totalGrowth: details.totalGrowth || "",
      ageAndGender,
      topLocations,
      topInterests: details.topInterests || [],
    };
  },
  getEngagementMetrics: async (months = 6) => {
    const { snapshot: fb, history } = await getFbData();
    const metrics = fb.metrics || {};
    const posts = fb.rawPlatformData?.facebook?.posts || [];

    // ── 6-month cutoff ─────────────────────────────────────────────────
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - months);
    const cutoffStr = cutoff.toISOString().split("T")[0];

    // ── Build per-day breakdown from posts (likes / comments / shares) ──
    const byDate = {};
    posts.forEach(p => {
      const date = p.created_time ? new Date(p.created_time).toISOString().split("T")[0] : null;
      if (!date || date < cutoffStr) return;
      if (!byDate[date]) byDate[date] = { date, likes: 0, comments: 0, shares: 0, total: 0 };
      const likes    = p.reactions?.summary?.total_count ?? p.likes?.summary?.total_count ?? 0;
      const comments = p.comments?.summary?.total_count || 0;
      const shares   = p.shares?.count || 0;
      byDate[date].likes    += likes;
      byDate[date].comments += comments;
      byDate[date].shares   += shares;
      byDate[date].total    += likes + comments + shares;
    });

    // ── Merge history snapshots: add days that have snapshot but no posts ──
    // History gives us totalEngagement per snapshot day from the DB.
    // Use it to fill in days where history exists but posts list doesn't cover.
    if (history && history.length > 0) {
      history
        .filter(h => {
          const d = h.snapshotDate?.split?.("T")[0] || new Date(h.snapshotDate).toISOString().split("T")[0];
          return d >= cutoffStr;
        })
        .forEach(h => {
          const date = h.snapshotDate?.split?.("T")[0] || new Date(h.snapshotDate).toISOString().split("T")[0];
          if (!byDate[date]) {
            // Fill from snapshot metrics if no post-level data exists for that day
            const eng = h.metrics?.totalEngagement || 0;
            byDate[date] = {
              date,
              likes:    Math.round(eng * 0.7),  // proportional estimate from total
              comments: Math.round(eng * 0.2),
              shares:   Math.round(eng * 0.1),
              total:    eng
            };
          }
        });
    }

    let engagementTrend = Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));

    // ── Fallback: show post dates if nothing from history either ────────
    if (engagementTrend.length === 0) {
      engagementTrend = [{ date: new Date().toISOString().split("T")[0], likes: 0, comments: 0, shares: 0, total: 0 }];
    }

    // ── Real totals from ALL posts (not date-filtered, for KPI display) ──
    const totalLikes    = posts.reduce((a, p) => a + (p.reactions?.summary?.total_count ?? p.likes?.summary?.total_count ?? 0), 0);
    const totalComments = posts.reduce((a, p) => a + (p.comments?.summary?.total_count || 0), 0);
    const totalShares   = posts.reduce((a, p) => a + (p.shares?.count || 0), 0);

    const reactionTypes = [];
    if (totalLikes    > 0) reactionTypes.push({ name: "Likes",    value: totalLikes });
    if (totalComments > 0) reactionTypes.push({ name: "Comments", value: totalComments });
    if (totalShares   > 0) reactionTypes.push({ name: "Shares",   value: totalShares });

    return {
      kpis: {
        totalLikes,
        totalComments,
        totalShares,
      },
      engagementTrend,
      reactionTypes,
      dateRange: { start: cutoffStr, end: new Date().toISOString().split("T")[0] },
    };
  },

  getPageLikesMetrics: async () => {
    const { snapshot: fb } = await getFbData();
    const metrics = fb.metrics || {};
    const currentFollowers = metrics.followers || fb.rawPlatformData?.facebook?.fanCount || 0;

    // Build a flat timeline using the real fan count as the baseline.
    // Meta doesn't expose page_fan_adds/page_fan_removes in the current API call,
    // so we show the stable fan count as the accurate current total.
    const followerGrowthTimeline = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return {
        date: d.toISOString().split("T")[0],
        gained: 0,
        lost: 0,
        unfollows: 0,
        net: 0,
        followers: currentFollowers
      };
    });

    return {
      gained: 0,
      lost: 0,
      net: 0,
      kpis: {
        totalLikes: currentFollowers,
      },
      followerGrowthTimeline,
    };
  },

  getReachViewsMetrics: async () => {
    const { snapshot: fb } = await getFbData();
    const insights = fb.rawPlatformData?.facebook?.insights || [];
    const metrics = fb.metrics || {};

    // Derive reach timeline from page_impressions insight daily values
    const impressionsMetric = insights.find(m => m.name === "page_impressions");
    let timeline = [];
    if (impressionsMetric?.values?.length > 0) {
      timeline = impressionsMetric.values.map(v => ({
        date: v.end_time?.split("T")[0] || "",
        organicReach: v.value || 0,
        paidReach: 0,
        threeSecondViews: 0,
        oneMinuteViews: 0
      }));
    }

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

    const totals = timeline.reduce(
      (acc, d) => {
        acc.totalReach += (d.organicReach || 0) + (d.paidReach || 0);
        acc.organicReach += d.organicReach || 0;
        return acc;
      },
      { totalReach: 0, organicReach: 0 }
    );

    return {
      kpis: {
        totalReach: { value: metrics.reach || totals.totalReach, change: 0 },
        organicReach: { value: metrics.reach || totals.organicReach, change: 0 },
        videoViews: { value: metrics.impressions || 0, change: 0 },
      },
      timeline,
    };
  },

  getVideosMetrics: async () => {
    const { snapshot: fb } = await getFbData();
    const posts = fb.rawPlatformData?.facebook?.posts || [];

    // Extract video posts from raw posts data
    const videos = posts
      .filter(p => {
        const type = p.attachments?.data?.[0]?.type;
        return type === "video_inline" || type === "video_autoplay";
      })
      .map(p => ({
        id: p.id,
        title: p.message || "Untitled Video",
        image: p.full_picture || "",
        date: p.created_time ? new Date(p.created_time).toISOString().split("T")[0] : "",
        plays: 0,
        watchTime: "0:00",
        threeSecondViews: 0,
        oneMinuteViews: 0,
        rate: "N/A",
        likes: p.likes?.summary?.total_count || 0,
        comments: p.comments?.summary?.total_count || 0,
        shares: p.shares?.count || 0,
      }));

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
    // Facebook Page Story metrics (reach, taps, completion, replies, exits) are NOT
    // available through the public Meta Graph API. The /{page-id}/stories edge returns
    // page text-mention stories — not the ephemeral 24-hour Stories feature.
    // Meta only exposes Story analytics through Meta Business Suite's internal systems.
    return {
      kpis: {
        activeStories: null,
        avgReach: null,
        completionRate: null,
        totalReplies: null,
      },
      apiLimitation: true,
      limitationMessage: "Facebook Page Story analytics are not accessible through the public Meta Graph API. Meta only exposes Story insights through Meta Business Suite. This is a platform-level restriction, not an app limitation.",
      stories: [],
    };
  },

  getGroupsMetrics: async () => {
    // Groups data is not available through the current Graph API calls
    return {
      kpis: {
        totalMembers: 0,
        activeMembers: 0,
        postsCount: 0,
      },
      growthTimeline: [],
      recentPosts: [],
    };
  },

  getAdsMetrics: async () => {
    const { snapshot: fb } = await getFbData();
    const adsData = fb.ads || {};

    return {
      kpis: {
        totalSpend: { value: `₹${(adsData.totalSpend || 0).toLocaleString()}`, change: 0 },
        impressions: { value: adsData.adImpressions || 0, change: 0 },
        linkClicks: { value: 0, change: 0 },
        avgCpc: { value: `₹${(adsData.costPerClick || 0).toFixed(2)}`, change: 0 },
      },
      campaigns: [],
    };
  },

  getReportsData: async () => {
    // No report generation system exists yet
    return {
      recentExports: [],
    };
  },

  getInsightsData: async () => {
    const { snapshot: fb } = await getFbData();
    const posts = fb.rawPlatformData?.facebook?.posts || [];
    const demographics = fb.demographics || {};

    // Compute best time to post from actual post timestamps
    let bestTimeToPost = "N/A";
    if (posts.length > 0) {
      const hourCounts = {};
      posts.forEach(p => {
        if (!p.created_time) return;
        const date = new Date(p.created_time);
        const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getUTCDay()];
        const hour = date.getUTCHours();
        const ampm = hour >= 12 ? "PM" : "AM";
        const h12 = hour % 12 || 12;
        const key = `${dayName} ${h12}:00 ${ampm}`;
        const eng = (p.likes?.summary?.total_count || 0) + (p.comments?.summary?.total_count || 0);
        hourCounts[key] = (hourCounts[key] || 0) + eng;
      });
      const sorted = Object.entries(hourCounts).sort((a, b) => b[1] - a[1]);
      if (sorted.length > 0) bestTimeToPost = sorted[0][0];
    }

    // Compute top performing format
    let topPerformingFormat = "N/A";
    if (posts.length > 0) {
      const formatCounts = { Photos: 0, Videos: 0, Text: 0 };
      posts.forEach(p => {
        const type = p.attachments?.data?.[0]?.type;
        if (type === "video_inline" || type === "video_autoplay") formatCounts.Videos++;
        else if (p.full_picture) formatCounts.Photos++;
        else formatCounts.Text++;
      });
      const sorted = Object.entries(formatCounts).sort((a, b) => b[1] - a[1]);
      if (sorted[0][1] > 0) topPerformingFormat = sorted[0][0];
    }

    // Compute top audience segment from demographics
    let topAudienceSegment = "N/A";
    if (demographics.ageAndGender?.length > 0) {
      const sorted = [...demographics.ageAndGender].sort((a, b) => (b.count || 0) - (a.count || 0));
      if (sorted[0]) topAudienceSegment = sorted[0].group;
    }

    // Generate actionable recommendations from real data
    const recommendations = [];
    if (posts.length > 0) {
      const totalEng = posts.reduce((a, p) => a + (p.likes?.summary?.total_count || 0) + (p.comments?.summary?.total_count || 0) + (p.shares?.count || 0), 0);
      const avgEng = totalEng / posts.length;

      if (avgEng < 5) {
        recommendations.push({ type: "ENGAGEMENT", recommendation: "Your average engagement per post is low. Try posting more visual content like photos and short videos." });
      }
      if (bestTimeToPost !== "N/A") {
        recommendations.push({ type: "TIME", recommendation: `Your posts get the most engagement around ${bestTimeToPost}. Consider scheduling future posts at this time.` });
      }
      if (topPerformingFormat !== "N/A") {
        recommendations.push({ type: "CONTENT", recommendation: `${topPerformingFormat} are your most-posted format. Diversify your content mix for broader reach.` });
      }
    }
    if (recommendations.length === 0) {
      recommendations.push({ type: "GENERAL", recommendation: "Start posting regularly to generate insights and recommendations for your page." });
    }

    return {
      highlights: {
        bestTimeToPost,
        topPerformingFormat,
        topAudienceSegment,
        recommendedContentType: topPerformingFormat === "Photos" ? "Videos" : "Photos",
      },
      recommendations,
    };
  },

  revokeAccess: async () => {
    const res = await api.delete("/auth/facebook/revoke");
    return res.data;
  },
};

export default fbapi;
