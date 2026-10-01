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
let snapshotCache = null;
let cacheTime = null;
let cacheToken = null;

const getCachedSnapshot = async (forceRefresh = false, dateRange = null) => {
  const currentToken = localStorage.getItem("incubein_token");

  if (!forceRefresh && !dateRange && snapshotCache && cacheTime && cacheToken === currentToken && (Date.now() - cacheTime < 5000)) {
    return snapshotCache;
  }
  try {
    let url = "/analytics/meta/instagram";
    const params = new URLSearchParams();
    if (forceRefresh) params.append("forceRefresh", "true");
    if (dateRange && dateRange.from) params.append("startDate", dateRange.from.toISOString());
    if (dateRange && dateRange.to) params.append("endDate", dateRange.to.toISOString());

    if (params.toString()) url += "?" + params.toString();

    const response = await api.get(url);
    const data = response.data?.data || null;
    if (data) {
      data.history = response.data?.history || [];
    }

    if (!dateRange) {
      snapshotCache = data;
      cacheTime = Date.now();
      cacheToken = currentToken;
    }
    return data;
  } catch (err) {
    console.warn("Failed to fetch Instagram analytics from API:", err.message);
    return null;
  }
};

const getIgSnapshotData = async (forceRefresh = false, dateRange = null) => {
  const snapshot = await getCachedSnapshot(forceRefresh, dateRange);
  return snapshot || {};
};

// ── Media helpers ────────────────────────────────────────────────────
const likesOf = (m) => m?.like_count ?? 0;
const commentsOf = (m) => m?.comments_count ?? 0;
const dayOf = (m) => endTimeToDate(m?.timestamp);

const mediaType = (m) =>
  m?.media_type === "VIDEO" ? "Reel" : m?.media_type === "CAROUSEL_ALBUM" ? "Carousel" : "Post";

/**
 * Instagram's public media endpoint returns like and comment counts but no
 * share, save, reach or view counts — those require per-media insights
 * endpoints that this integration does not call. Returning null (rather than
 * 0) lets the UI say "not available" instead of implying a measured zero.
 */
const measuredMedia = (m) => {
  const likes = likesOf(m);
  const comments = commentsOf(m);
  const type = mediaType(m);
  return {
    id: m.id,
    image: m.thumbnail_url || m.media_url || null,
    permalink: m.permalink || null,
    type,
    caption: m.caption || null,
    date: dayOf(m),
    likes,
    comments,
    engagement: likes + comments,
    shares: null,
    saves: null,
    reach: null,
    impressions: null,
    views: null,
    watchTime: null,
  };
};

/** Real hashtags parsed out of stored media captions. */
const hashtagsFrom = (media) => {
  const counts = new Map();
  (Array.isArray(media) ? media : []).forEach((m) => {
    const caption = m?.caption;
    if (!caption) return;
    const matches = String(caption).match(/#[\p{L}\p{N}_]+/gu) || [];
    matches.forEach((tag) => counts.set(tag, (counts.get(tag) || 0) + 1));
  });
  return [...counts.entries()]
    .map(([tag, posts]) => ({ tag, posts }))
    .sort((a, b) => b.posts - a.posts || a.tag.localeCompare(b.tag));
};

const genderBreakdown = (ageAndGender) => {
  const map = { Women: 0, Men: 0 };
  (ageAndGender || []).forEach((item) => {
    const g = String(item.group || "").charAt(0).toUpperCase();
    if (g === "F" || g === "W") map.Women += Number(item.count) || 0;
    if (g === "M") map.Men += Number(item.count) || 0;
  });
  const total = map.Women + map.Men;
  return {
    // Absolute counts, plus a share only when there is a real denominator.
    total,
    rows: [
      { name: "Women", value: map.Women },
      { name: "Men", value: map.Men },
    ].filter((r) => r.value > 0),
    share: total > 0 ? { Women: +((map.Women / total) * 100).toFixed(1), Men: +((map.Men / total) * 100).toFixed(1) } : null,
  };
};

const ageBreakdown = (ageAndGender) => {
  const map = {};
  (ageAndGender || []).forEach((item) => {
    const age = String(item.group || "").split(".")[1] || String(item.group || "").split("_")[1];
    if (!age) return;
    map[age] = (map[age] || 0) + (Number(item.count) || 0);
  });
  return Object.entries(map).map(([age, count]) => ({ age, count }));
};

const igapi = {
  getProfile: async () => {
    try {
      const res = await api.get("/auth/status");
      const statusArr = res.data?.status ?? [];
      const igStatus = statusArr.find((s) => s.platform === "instagram");
      const isConnected = !!(igStatus?.connected && !igStatus?.isExpired);

      if (!isConnected) {
        return { isConnected: false, profile: null };
      }

      const data = await getIgSnapshotData();
      const ig = data.rawPlatformData?.instagram || {};

      return {
        isConnected,
        profile: {
          name: igStatus.username || ig.username || "Instagram Account",
          handle: igStatus.username ? `@${igStatus.username}` : ig.username ? `@${ig.username}` : "",
          category: "",
          totalFollowers: data.metrics?.followers || 0,
          totalFollowing: ig.followingCount || 0,
          profilePicture: ig.profilePicture || "",
          bio: ig.bio || ""
        }
      };
    } catch (err) {
      console.error("Failed to fetch Instagram profile:", err);
      throw err;
    }
  },

  getOverviewMetrics: async (forceRefresh = false, dateRange = null) => {
    const data = await getIgSnapshotData(forceRefresh, dateRange);

    const metrics = data.metrics || {};
    const demographics = data.demographics || {};
    const ig = data.rawPlatformData?.instagram || {};
    const rawMedia = ig.media || [];
    const history = data.history || [];

    const contentPerformance = rawMedia.map(measuredMedia);
    const totalLikes = contentPerformance.reduce((a, m) => a + m.likes, 0);
    const totalComments = contentPerformance.reduce((a, m) => a + m.comments, 0);
    const totalMeasuredEngagement = totalLikes + totalComments;

    // ── Real daily series from stored IG insights (reach, profile_views) ──
    const daily = joinDailySeries(ig.insights || [], [
      { metric: "reach", key: "reach" },
      { metric: "profile_views", key: "profileViews" },
    ]);

    // Post-level engagement is measured per media; align it onto the same days.
    const likesSeries = groupByDay(rawMedia, dayOf, likesOf);
    const commentsSeries = groupByDay(rawMedia, dayOf, commentsOf);
    const union = [...new Set([...daily.map((r) => r.date), ...likesSeries.map((r) => r.date), ...commentsSeries.map((r) => r.date)])].sort();

    const timeline = union.map((date) => {
      const dv = daily.find((r) => r.date === date);
      const lv = likesSeries.find((r) => r.date === date);
      const cv = commentsSeries.find((r) => r.date === date);
      const likes = lv?.value ?? 0;
      const comments = cv?.value ?? 0;
      return {
        date,
        reach: dv?.value ?? 0,
        profileViews: dv?.profileViews ?? 0,
        likes,
        comments,
        engagements: likes + comments,
      };
    });

    const hasSeries = hasMeasurements(daily);

    // ── Follower growth from consecutive measured snapshots ──────────────
    const followerTimeline = followerSeriesFromHistory(history, (h) => h?.metrics?.followers ?? null);
    const followerGrowth = followerTimeline.map((p) => ({
      date: p.date,
      gained: Math.max(0, p.net),
      lost: Math.max(0, -p.net),
      net: p.net,
      followers: p.followers,
    }));

    // ── Engagement rate = measured (likes + comments) ÷ measured followers ─
    const followersNow = metrics.followers || 0;
    const engagementTrend = timeline
      .filter((r) => r.likes > 0 || r.comments > 0)
      .map((r) => ({
        date: r.date,
        rate: followersNow > 0 ? +((r.engagements / followersNow) * 100).toFixed(2) : 0,
        engagements: r.engagements,
      }));

    const gender = genderBreakdown(demographics.ageAndGender);
    const ageRows = ageBreakdown(demographics.ageAndGender);
    const ageTotal = ageRows.reduce((a, r) => a + r.count, 0);

    return {
      kpis: {
        accountsReached: { current: metrics.reach || 0, previous: 0 },
        accountsEngaged: { current: metrics.totalEngagement || totalMeasuredEngagement || 0, previous: 0 },
        totalFollowers: { current: followersNow, previous: 0 },
        // Previously engagement × 0.8. Interactions are simply the measured
        // likes + comments across the stored media.
        contentInteractions: { current: totalMeasuredEngagement, previous: 0 },
        totalLikes: { current: totalLikes, previous: 0 },
        totalComments: { current: totalComments, previous: 0 },
        profileViews: { current: metrics.profileViews || 0, previous: 0 },
      },
      profileViews: { current: metrics.profileViews || 0, previous: 0 },
      // Saves require the per-media saves insight, which is not fetched.
      saves: { current: null, previous: 0 },
      totalPosts: rawMedia.length,
      reachTrend: hasSeries ? timeline.filter((r) => r.reach > 0 || r.profileViews > 0) : [],
      timeline,
      hasSeries,
      followerGrowth,
      followerTimeline,
      canShowGrowth: followerTimeline.length > 1,
      engagementTrend,
      audience: {
        topCities: (demographics.topCities || []).map((c) => ({ name: c.name, count: Number(c.count) || 0 })),
        topCountries: (demographics.topCountries || []).map((c) => ({ name: c.name, count: Number(c.count) || 0 })),
        ageRange: ageRows.map((r) => ({
          age: r.age,
          value: r.count,
          share: ageTotal > 0 ? +((r.count / ageTotal) * 100).toFixed(1) : 0,
        })),
        gender: gender.rows.map((r) => ({ type: r.name, value: r.value })),
        genderShare: gender.share,
      },
      contentPerformance,
      topReels: contentPerformance.filter((m) => m.type === "Reel"),
    };
  },

  getMetricHistory: async (metricId) => {
    const data = await getIgSnapshotData();
    const history = data.history || [];
    const pick = {
      "total-followers": (m) => m?.followers,
      "accounts-reached": (m) => m?.reach,
      "accounts-engaged": (m) => m?.totalEngagement,
      impressions: (m) => m?.impressions,
      "profile-views": (m) => m?.profileViews,
    }[metricId];

    // Previously `saves` was engagement × 0.12. It is a distinct Meta metric
    // that was never fetched, so it now reports no history rather than one.
    if (!pick) return { metricId, history: [], available: false };

    const rows = history
      .map((snap) => ({ date: endTimeToDate(snap.snapshotDate), value: Number(pick(snap.metrics || {})) || 0 }))
      .filter((r) => r.date)
      .sort((a, b) => a.date.localeCompare(b.date));

    return { metricId, history: rows, available: rows.length > 0 };
  },

  getContent: async (dateRange = null) => {
    const ov = await igapi.getOverviewMetrics(false, dateRange);
    return { posts: ov.contentPerformance || [] };
  },

  getAudience: async () => {
    const data = await getIgSnapshotData();
    const demographics = data.demographics || {};

    const gender = genderBreakdown(demographics.ageAndGender);
    const ageRows = ageBreakdown(demographics.ageAndGender);
    const ageTotal = ageRows.reduce((a, r) => a + r.count, 0);

    return {
      demographics: {
        topCities: (demographics.topCities || []).map((c) => ({ name: c.name, count: Number(c.count) || 0 })),
        topCountries: (demographics.topCountries || []).map((c) => ({ name: c.name, count: Number(c.count) || 0 })),
        // Counts, not fabricated percentages, and no zero-filled placeholder row.
        ageRange: ageRows.map((r) => ({
          age: r.age,
          value: r.count,
          share: ageTotal > 0 ? +((r.count / ageTotal) * 100).toFixed(1) : 0,
        })),
        gender: gender.rows.map((r) => ({ type: r.name, value: r.value })),
        genderShare: gender.share,
        hasData: ageRows.length > 0 || gender.rows.length > 0,
      },
      activeTimes: []
    };
  },

  getEngagement: async (dateRange = null) => {
    const data = await getIgSnapshotData(false, dateRange);
    const metrics = data.metrics || {};
    const rawMedia = data.rawPlatformData?.instagram?.media || [];

    // Only days that actually contain a published item are emitted — no
    // zero-filled calendar of days the account never posted on.
    const likesSeries = groupByDay(rawMedia, dayOf, likesOf);
    const commentsSeries = groupByDay(rawMedia, dayOf, commentsOf);
    const dates = [...new Set([...likesSeries.map((r) => r.date), ...commentsSeries.map((r) => r.date)])].sort();

    const totalLikes = likesSeries.reduce((a, r) => a + r.value, 0);
    const totalComments = commentsSeries.reduce((a, r) => a + r.value, 0);
    const followers = metrics.followers || 0;

    const trend = dates.map((date) => {
      const likes = likesSeries.find((r) => r.date === date)?.value || 0;
      const comments = commentsSeries.find((r) => r.date === date)?.value || 0;
      const engagements = likes + comments;
      return {
        date,
        likes,
        comments,
        shares: null,
        engagements,
        rate: followers > 0 ? +((engagements / followers) * 100).toFixed(2) : 0,
      };
    });

    // Only measured interaction types are listed. Shares and saves are not
    // returned by the media endpoint, so they are absent rather than 0.
    const interactions = [];
    if (totalLikes > 0) interactions.push({ name: "Likes", value: totalLikes });
    if (totalComments > 0) interactions.push({ name: "Comments", value: totalComments });

    return {
      interactions,
      interactionsAvailable: interactions.length > 0,
      unavailable: ["Shares", "Saves"],
      limitationMessage:
        "Instagram shares and saves are only exposed through per-media insights endpoints, which this integration does not call. Likes and comments below are measured and live.",
      trend,
    };
  },

  getStories: async () => ({ items: [] }),

  getReels: async (dateRange = null) => {
    const ov = await igapi.getOverviewMetrics(false, dateRange);
    return { items: ov.topReels || [] };
  },

  getGrowth: async (dateRange = null) => {
    const ov = await igapi.getOverviewMetrics(false, dateRange);
    return { history: ov.followerGrowth || [] };
  },

  getHashtags: async () => {
    const data = await getIgSnapshotData();
    const media = data.rawPlatformData?.instagram?.media || [];

    // Parsed from real captions. Previously this returned an empty array and
    // the page rendered five hardcoded example hashtags.
    const tags = hashtagsFrom(media);

    const engagementsByTag = {};
    media.forEach((m) => {
      if (!m?.caption) return;
      const found = String(m.caption).match(/#[\p{L}\p{N}_]+/gu) || [];
      const eng = likesOf(m) + commentsOf(m);
      found.forEach((tag) => {
        if (!engagementsByTag[tag]) engagementsByTag[tag] = { engagements: 0, likes: 0, comments: 0 };
        engagementsByTag[tag].engagements += eng;
        engagementsByTag[tag].likes += likesOf(m);
        engagementsByTag[tag].comments += commentsOf(m);
      });
    });

    return {
      tags: tags.map((t) => ({
        tag: t.tag,
        posts: t.posts,
        engagements: engagementsByTag[t.tag]?.engagements || 0,
        likes: engagementsByTag[t.tag]?.likes || 0,
        comments: engagementsByTag[t.tag]?.comments || 0,
      })),
      available: tags.length > 0,
    };
  },

  getInsights: async () => {
    const data = await getIgSnapshotData();
    const insights = data.rawPlatformData?.instagram?.insights || [];
    const media = data.rawPlatformData?.instagram?.media || [];
    const demographics = data.demographics || {};

    const getVal = (name) => {
      const metric = insights.find((m) => m.name === name);
      return metric?.values?.reduce((acc, v) => acc + (Number(v.value) || 0), 0) || 0;
    };

    // ── Highlights computed from measured data ───────────────────────────
    let bestTimeToPost = null;
    if (media.length > 0) {
      const bySlot = {};
      media.forEach((m) => {
        if (!m.timestamp) return;
        const d = new Date(m.timestamp);
        const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getUTCDay()];
        const hour = d.getUTCHours();
        const key = `${dayName} ${hour % 12 || 12}:00 ${hour >= 12 ? "PM" : "AM"}`;
        bySlot[key] = (bySlot[key] || 0) + likesOf(m) + commentsOf(m);
      });
      const top = Object.entries(bySlot).sort((a, b) => b[1] - a[1])[0];
      if (top && top[1] > 0) bestTimeToPost = top[0];
    }

    // Best format by engagement per post, not by a hardcoded preference.
    const byType = {};
    media.forEach((m) => {
      const t = mediaType(m);
      if (!byType[t]) byType[t] = { total: 0, count: 0 };
      byType[t].total += likesOf(m) + commentsOf(m);
      byType[t].count += 1;
    });
    const ranked = Object.entries(byType)
      .filter(([, v]) => v.count > 0 && v.total > 0)
      .map(([name, v]) => ({ name, avg: v.total / v.count }))
      .sort((a, b) => b.avg - a.avg);

    const topPerformingFormat = ranked.length > 0 ? ranked[0].name : null;

    let topAudienceSegment = null;
    const ageRows = ageBreakdown(demographics.ageAndGender);
    if (ageRows.length > 0) {
      const topAge = ageRows.reduce((a, b) => (b.count > a.count ? b : a));
      const gender = genderBreakdown(demographics.ageAndGender);
      const lead = gender.share && gender.share.Women > gender.share.Men ? "Women" : "Men";
      topAudienceSegment = `${lead} ${topAge.age}`;
    }

    // ── Recommendations only where a measured number supports them ──────
    const recommendations = [];
    if (ranked.length > 0) {
      recommendations.push({
        type: "CONTENT",
        recommendation: `${topPerformingFormat} average the most engagement per post (${ranked[0].avg.toFixed(1)} interactions).`,
      });
    }
    if (bestTimeToPost) {
      recommendations.push({
        type: "TIME",
        recommendation: `Posts around ${bestTimeToPost} earned the most interactions. Schedule important content near that time.`,
      });
    }
    if (topAudienceSegment) {
      recommendations.push({
        type: "AUDIENCE",
        recommendation: `${topAudienceSegment} is your largest stored audience segment. Tailor captions to that group.`,
      });
    }
    if (recommendations.length === 0) {
      recommendations.push({
        type: "GENERAL",
        recommendation:
          "No post activity or demographics are stored yet. Keep the integration connected and recommendations will appear once real data arrives.",
      });
    }

    // Contact actions are returned only when Meta actually reported them.
    const actionDefs = [
      { id: "website_clicks", title: "Website Taps", metric: "website_clicks" },
      { id: "email_clicks", title: "Email Button Taps", metric: "email_contacts" },
      { id: "call_clicks", title: "Call Button Taps", metric: "phone_call_clicks" },
      { id: "direction_clicks", title: "Get Directions Taps", metric: "get_directions_clicks" },
    ];
    const actions = actionDefs
      .map((a) => ({ id: a.id, title: a.title, value: getVal(a.metric), available: insights.some((m) => m.name === a.metric) }))
      .filter((a) => a.available);

    return {
      actions,
      highlights: {
        bestTimeToPost,
        topPerformingFormat,
        topAudienceSegment,
        recommendedContentType: null,
      },
      recommendations,
    };
  },

  revokeAccess: async () => {
    const response = await api.delete("/auth/instagram/revoke");
    return response.data;
  },
};

export default igapi;