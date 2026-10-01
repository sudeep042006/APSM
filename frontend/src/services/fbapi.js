import api from "./api";
import {
  dailyFromInsights,
  joinDailySeries,
  withinRange,
  normaliseRange,
  groupByDay,
  hasMeasurements,
  followerSeriesFromHistory,
  endTimeToDate,
} from "./metaSeries";

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

// ── Post helpers ─────────────────────────────────────────────────────
const reactionsOf = (p) => p?.reactions?.summary?.total_count ?? p?.likes?.summary?.total_count ?? 0;
const commentsOf = (p) => p?.comments?.summary?.total_count ?? 0;
const sharesOf = (p) => p?.shares?.count ?? 0;
const dayOf = (p) => endTimeToDate(p?.created_time);

const classifyPost = (p) => {
  const attachment = p?.attachments?.data?.[0];
  const attachType = attachment?.type || "";
  if (attachType.includes("video") || attachment?.media_type === "video") return "Videos";
  if (attachType === "share" || attachType === "link") return "Links";
  return p?.full_picture || p?.picture ? "Photos" : "Text";
};

/** Meta's `page_impressions_unique` is the only real reach figure we have. */
const INSIGHT_METRICS = {
  impressions: "page_impressions",
  reach: "page_impressions_unique",
  engagements: "page_post_engagements",
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
      const pageId = fb.pageId || "";
      const username = fbStatus.username || "";

      return {
        isConnected,
        profile: {
          name: fb.pageName || fbStatus.username || "Facebook Page",
          pageId: pageId || fbStatus.pageId || "",
          // Derive the handle from the vanity URL Meta actually returned;
          // "@facebookpage" was a placeholder that looked identical for every page.
          handle: username ? (username.startsWith("@") ? username : `@${username}`) : "",
          category: "",
          avatar: fb.pagePicture?.data?.url || fb.picture || "",
          pageLikes: data.metrics?.followers || fb.fanCount || 0,
          followers: data.metrics?.followers || fb.fanCount || 0,
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
    const followers = fb.metrics?.followers || fb.rawPlatformData?.facebook?.fanCount || 0;
    const range = normaliseRange(dateRange);

    // ── Content table rows (all fields measured) ─────────────────────────
    // Reach/impressions/views are page-level metrics: Meta does not return
    // per-post breakdowns for this Page integration, so those columns are
    // left undefined instead of being filled with a fabricated ratio.
    const formattedPosts = rawPosts.map((p) => {
      const type = classifyPost(p);
      const reactions = reactionsOf(p);
      const comments = commentsOf(p);
      const shares = sharesOf(p);
      const engagements = reactions + comments + shares;
      return {
        id: p.id,
        title: p.message || p.story || (type === "Videos" ? "Video post" : "Post"),
        image: p.full_picture || p.picture || null,
        date: dayOf(p),
        engagements,
        reactions,
        likes: reactions,
        comments,
        shares,
        type,
        rate: followers > 0 ? `${((engagements / followers) * 100).toFixed(2)}%` : null,
      };
    });

    const inRange = (list) => withinRange(list.map((p) => ({ date: p.date, p })), range.start, range.end).map((r) => r.p);

    const allPosts = formattedPosts.filter((p) => p.type !== "Videos");
    const allVideos = formattedPosts.filter((p) => p.type === "Videos");
    const topPosts = inRange(allPosts);
    const topVideos = inRange(allVideos);

    // ── Real daily series from Meta's stored day-level insights ───────────
    // Before: fabricated a flat/zero series from post dates and multiplied
    // reach by 1.5 for impressions. Both were invented numbers.
    const daily = joinDailySeries(insights, [
      { metric: INSIGHT_METRICS.impressions, key: "impressions" },
      { metric: INSIGHT_METRICS.reach, key: "reach" },
      { metric: INSIGHT_METRICS.engagements, key: "engagements" },
    ]);
    const dailyWindowed = withinRange(daily, range.start, range.end);

    // Impressions, reach and engagements come straight from the insight rows.
    const seriesAvailable = hasMeasurements(dailyWindowed);

    const totalImpressions = dailyWindowed.reduce((a, d) => a + (d.impressions || 0), 0);
    const totalReach = dailyWindowed.reduce((a, d) => a + (d.reach || 0), 0);
    const totalInsightEngagements = dailyWindowed.reduce((a, d) => a + (d.engagements || 0), 0);

    // Per-post engagements are measured; they are used for the composition
    // breakdown. The page-level engagement total comes from insights.
    const totalPostEngagement =
      rawPosts.reduce((a, p) => a + reactionsOf(p) + commentsOf(p) + sharesOf(p), 0);

    // Engagement rate = measured engagements ÷ measured impressions, per day.
    const engagementRateData = dailyWindowed.map((d) => ({
      date: d.date,
      rate: d.impressions > 0 ? +((d.engagements / d.impressions) * 100).toFixed(2) : 0,
    }));

    // ── KPI totals ───────────────────────────────────────────────────────
    const totalReactions = rawPosts.reduce((a, p) => a + reactionsOf(p), 0);
    const totalComments = rawPosts.reduce((a, p) => a + commentsOf(p), 0);
    const totalShares = rawPosts.reduce((a, p) => a + sharesOf(p), 0);

    const reachValue = totalReach > 0 ? totalReach : fb.metrics?.reach || 0;
    const engagementsValue = totalInsightEngagements > 0 ? totalInsightEngagements : totalPostEngagement;

    return {
      kpis: {
        pageLikes: { value: followers || 0, change: 0 },
        postReach: { value: reachValue, change: 0 },
        postEngagements: { value: engagementsValue, change: 0 },
        // Impressions are reported by Meta directly — never reach × 1.5.
        impressions: { value: totalImpressions || fb.metrics?.impressions || 0, change: 0 },
        reactions: { value: totalReactions, change: 0 },
        comments: { value: totalComments, change: 0 },
        shares: { value: totalShares, change: 0 },
      },
      charts: {
        // Empty (not zero-filled) when Meta stored no day-level insight rows,
        // so the chart renders an honest explanation.
        reachOverTime: seriesAvailable ? dailyWindowed.map((d) => ({ date: d.date, value: d.reach })) : [],
        impressionsOverTime: seriesAvailable
          ? dailyWindowed.map((d) => ({ date: d.date, value: d.impressions }))
          : [],
        engagementsOverTime: seriesAvailable
          ? dailyWindowed.map((d) => ({ date: d.date, value: d.engagements }))
          : [],
        engagementRate: {
          rate:
            totalImpressions > 0
              ? `${((engagementsValue / totalImpressions) * 100).toFixed(2)}%`
              : null,
          change: 0,
          data: engagementRateData,
        },
        hasInsightSeries: seriesAvailable,
      },
      tables: { topPosts, topVideos },
      // `page_impressions` is not split by paid/organic through this
      // integration, so there is no real source breakdown to show.
      reachBySource: [],
      audience: {
        ageGender: (fb.demographics?.ageAndGender || []).map((a) => ({ group: a.group, value: a.count })),
        topCountries: (fb.demographics?.topCountries || []).map((c) => ({
          country: c.name,
          value: c.count,
        })),
      },
    };
  },

  getAudienceMetrics: async () => {
    const { snapshot: fb } = await getFbData();
    const demographics = fb.demographics || {};
    const details = fb.extended?.audienceDetails || {};

    // "F.18-24" → { group: "18-24", female, male } for side-by-side bars.
    const groups = {};
    (demographics.ageAndGender || []).forEach((item) => {
      const [gender, bracket] = String(item.group || "").split(".");
      const ageBracket = bracket || item.group;
      if (!ageBracket) return;
      if (!groups[ageBracket]) groups[ageBracket] = { group: ageBracket, female: 0, male: 0 };
      if (gender === "M") groups[ageBracket].male = item.count;
      else groups[ageBracket].female = item.count;
    });
    const ageAndGender = Object.values(groups);

    // Country shares are computed from the returned counts, not guessed.
    const countryRows = (demographics.topCountries || []).map((c) => ({
      location: c.name,
      value: Number(c.count) || 0,
    }));
    const countryTotal = countryRows.reduce((a, c) => a + c.value, 0);
    const topLocations = countryRows.map((c) => ({
      location: c.location,
      value: c.value,
      share: countryTotal > 0 ? +((c.value / countryTotal) * 100).toFixed(1) : 0,
    }));

    return {
      totalGrowth: typeof details.totalGrowth === "number" ? details.totalGrowth : null,
      ageAndGender,
      topLocations,
      topInterests: Array.isArray(details.topInterests) ? details.topInterests : [],
    };
  },

  getEngagementMetrics: async (months = 6) => {
    const { snapshot: fb } = await getFbData();
    const posts = fb.rawPlatformData?.facebook?.posts || [];
    const insights = fb.rawPlatformData?.facebook?.insights || [];

    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - months);
    const cutoffStr = cutoff.toISOString().split("T")[0];

    // ── Composition of engagement, measured per post ─────────────────────
    // Previously missing days were filled with a 70/20/10 split of the
    // daily total. Reactions, comments and shares now come only from each
    // post's own summary counts.
    const composition = groupByDay(
      posts.filter((p) => dayOf(p) && dayOf(p) >= cutoffStr),
      dayOf,
      (p) => reactionsOf(p) + commentsOf(p) + sharesOf(p)
    );

    const likesSeries = groupByDay(posts.filter((p) => dayOf(p) && dayOf(p) >= cutoffStr), dayOf, reactionsOf);
    const commentsSeries = groupByDay(posts.filter((p) => dayOf(p) && dayOf(p) >= cutoffStr), dayOf, commentsOf);
    const sharesSeries = groupByDay(posts.filter((p) => dayOf(p) && dayOf(p) >= cutoffStr), dayOf, sharesOf);

    // Align the three real post-level series on one axis by date.
    const dates = [...new Set([...likesSeries, ...commentsSeries, ...sharesSeries].map((r) => r.date))].sort();
    const engagementTrend = dates.map((date) => ({
      date,
      likes: likesSeries.find((r) => r.date === date)?.value || 0,
      comments: commentsSeries.find((r) => r.date === date)?.value || 0,
      shares: sharesSeries.find((r) => r.date === date)?.value || 0,
    }));

    // ── Page-level engagement volume over time (from stored insights) ────
    const dailyEngagements = withinRange(
      dailyFromInsights(insights, INSIGHT_METRICS.engagements),
      cutoffStr
    );

    const totalLikes = posts.reduce((a, p) => a + reactionsOf(p), 0);
    const totalComments = posts.reduce((a, p) => a + commentsOf(p), 0);
    const totalShares = posts.reduce((a, p) => a + sharesOf(p), 0);

    // Only list reaction types that actually have measured volume.
    const reactionTypes = [];
    if (totalLikes > 0) reactionTypes.push({ name: "Reactions", value: totalLikes });
    if (totalComments > 0) reactionTypes.push({ name: "Comments", value: totalComments });
    if (totalShares > 0) reactionTypes.push({ name: "Shares", value: totalShares });

    return {
      kpis: { totalLikes, totalComments, totalShares },
      // Empty rather than a single all-zero row when there is nothing real.
      engagementTrend,
      engagementVolume: dailyEngagements,
      reactionTypes,
      composition,
      dateRange: { start: cutoffStr, end: new Date().toISOString().split("T")[0] },
    };
  },

  getPageLikesMetrics: async () => {
    const { snapshot: fb, history } = await getFbData();
    const currentFollowers = fb.metrics?.followers || fb.rawPlatformData?.facebook?.fanCount || 0;

    // Built from consecutive real snapshots. With fewer than two snapshots
    // there is no growth to plot, so the series stays empty instead of
    // repeating today's fan count across 30 invented days.
    const timeline = followerSeriesFromHistory(history, (h) => h?.metrics?.followers ?? null);

    const gained = timeline.reduce((a, p) => a + Math.max(0, p.net || 0), 0);
    const lost = timeline.reduce((a, p) => a + Math.max(0, -(p.net || 0)), 0);

    return {
      gained,
      lost,
      net: gained - lost,
      kpis: { totalLikes: currentFollowers },
      followerGrowthTimeline: timeline,
      canShowGrowth: timeline.length > 1,
      growthNote:
        timeline.length > 1
          ? null
          : "Follower growth needs at least two stored daily snapshots. APSM records one snapshot per sync, so keep the integration connected and this chart will populate automatically.",
    };
  },

  getReachViewsMetrics: async (dateRange = null) => {
    const { snapshot: fb } = await getFbData();
    const insights = fb.rawPlatformData?.facebook?.insights || [];
    const range = normaliseRange(dateRange);

    // page_impressions_unique is reach. There is no paid/organic split or
    // video-view breakdown through this Page integration, so those series
    // are omitted rather than zero-filled.
    const timeline = withinRange(
      joinDailySeries(insights, [
        { metric: INSIGHT_METRICS.reach, key: "reach" },
        { metric: INSIGHT_METRICS.impressions, key: "impressions" },
      ]),
      range.start,
      range.end
    );

    const totalReach = timeline.reduce((a, d) => a + (d.reach || 0), 0);
    const totalImpressions = timeline.reduce((a, d) => a + (d.impressions || 0), 0);
    const hasSeries = hasMeasurements(timeline.map((d) => ({ value: d.reach })));

    return {
      kpis: {
        totalReach: { value: totalReach, change: 0 },
        impressions: { value: totalImpressions, change: 0 },
        // Frequency is genuinely unavailable for a Page — shown as null so
        // the KPI card can say "not available" instead of printing 0.
        frequency: { value: null, change: 0 },
      },
      timeline: hasSeries ? timeline : [],
      hasSeries,
    };
  },

  getVideosMetrics: async () => {
    const { snapshot: fb } = await getFbData();
    const posts = fb.rawPlatformData?.facebook?.posts || [];

    // Video-level playback counts and watch time are not exposed for Page
    // video posts via this integration, so those fields stay null and the UI
    // reports them as unavailable.
    const videos = posts
      .filter((p) => {
        const type = p?.attachments?.data?.[0]?.type;
        return type === "video_inline" || type === "video_autoplay";
      })
      .map((p) => ({
        id: p.id,
        title: p.message || "Untitled video",
        image: p.full_picture || "",
        date: dayOf(p),
        plays: null,
        watchTime: null,
        threeSecondViews: null,
        oneMinuteViews: null,
        rate: null,
        likes: reactionsOf(p),
        comments: commentsOf(p),
        shares: sharesOf(p),
        engagements: reactionsOf(p) + commentsOf(p) + sharesOf(p),
      }));

    const measuredEngagement = videos.reduce((a, v) => a + v.engagements, 0);

    return {
      kpis: {
        totalVideos: videos.length,
        totalPlays: null,
        avgWatchTime: null,
        topRetention: null,
        totalEngagements: measuredEngagement,
      },
      videos,
      apiLimitation: true,
      limitationMessage:
        "Meta does not expose per-video play counts or watch time for Page video posts through the Graph API. Engagement counts below are measured and live; playback metrics are unavailable.",
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
    // Group membership requires the `manage_groups` scope, which this
    // integration does not request, so every figure stays null.
    return {
      kpis: {
        totalMembers: null,
        activeMembers: null,
        postsCount: null,
      },
      apiLimitation: true,
      limitationMessage:
        "Facebook Groups require the `manage_groups` permission, which this app does not request. Nothing is shown here rather than reporting zero.",
      growthTimeline: [],
      recentPosts: [],
    };
  },

  getAdsMetrics: async () => {
    const { snapshot: fb } = await getFbData();
    const adsData = fb.ads || {};

    // Only render what Meta actually reported for ads; the rest are null.
    return {
      kpis: {
        totalSpend: adsData.totalSpend !== undefined ? adsData.totalSpend : null,
        impressions: adsData.adImpressions !== undefined ? adsData.adImpressions : null,
        linkClicks: null,
        avgCpc: adsData.costPerClick !== undefined ? adsData.costPerClick : null,
      },
      campaigns: Array.isArray(adsData.campaigns) ? adsData.campaigns : [],
    };
  },

  getReportsData: async () => {
    return {
      recentExports: [],
    };
  },

  getInsightsData: async () => {
    const { snapshot: fb } = await getFbData();
    const posts = fb.rawPlatformData?.facebook?.posts || [];
    const demographics = fb.demographics || {};

    // Best time to post, from real post timestamps weighted by real engagement.
    let bestTimeToPost = null;
    if (posts.length > 0) {
      const bySlot = {};
      posts.forEach((p) => {
        if (!p.created_time) return;
        const d = new Date(p.created_time);
        const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getUTCDay()];
        const hour = d.getUTCHours();
        const h12 = hour % 12 || 12;
        const key = `${dayName} ${h12}:00 ${hour >= 12 ? "PM" : "AM"}`;
        bySlot[key] = (bySlot[key] || 0) + reactionsOf(p) + commentsOf(p) + sharesOf(p);
      });
      const top = Object.entries(bySlot).sort((a, b) => b[1] - a[1])[0];
      if (top && top[1] > 0) bestTimeToPost = top[0];
    }

    // Best-performing format measured by engagement per post, not post count.
    let topPerformingFormat = null;
    const formatPerf = {};
    posts.forEach((p) => {
      const type = classifyPost(p);
      if (!formatPerf[type]) formatPerf[type] = { total: 0, count: 0 };
      formatPerf[type].total += reactionsOf(p) + commentsOf(p) + sharesOf(p);
      formatPerf[type].count += 1;
    });
    const ranked = Object.entries(formatPerf)
      .filter(([, v]) => v.count > 0 && v.total > 0)
      .map(([k, v]) => ({ name: k, avg: v.total / v.count }))
      .sort((a, b) => b.avg - a.avg);
    if (ranked.length > 0) topPerformingFormat = ranked[0].name;

    let topAudienceSegment = null;
    if (demographics.ageAndGender?.length > 0) {
      const sorted = [...demographics.ageAndGender].sort((a, b) => (b.count || 0) - (a.count || 0));
      if (sorted[0]) topAudienceSegment = sorted[0].group;
    }

    // Recommendations only when they follow from a measured number.
    const recommendations = [];
    if (posts.length > 0) {
      const totalEng = posts.reduce((a, p) => a + reactionsOf(p) + commentsOf(p) + sharesOf(p), 0);
      const avgEng = totalEng / posts.length;
      if (avgEng > 0 && avgEng < 5) {
        recommendations.push({
          type: "ENGAGEMENT",
          recommendation: `Average engagement is ${avgEng.toFixed(1)} per post across ${posts.length} posts. Lead with more visual content and keep testing.`,
        });
      }
      if (bestTimeToPost) {
        recommendations.push({
          type: "TIME",
          recommendation: `Posts published around ${bestTimeToPost} earned the most engagement. Schedule your strongest content near that time.`,
        });
      }
      if (topPerformingFormat) {
        recommendations.push({
          type: "CONTENT",
          recommendation: `${topPerformingFormat} posts average the highest engagement per post.`,
        });
      }
    }
    if (recommendations.length === 0) {
      recommendations.push({
        type: "GENERAL",
        recommendation:
          "No post activity is stored for this page yet. Keep the integration connected and recommendations will appear once posts accrue engagement.",
      });
    }

    return {
      highlights: {
        bestTimeToPost,
        topPerformingFormat,
        topAudienceSegment,
        // Not recommendable without evidence — null instead of a guess.
        recommendedContentType: null,
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