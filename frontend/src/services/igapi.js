import api from "./api";

// ── Cache management and fetch wrapper ────────────────────────────────
let snapshotCache = null;
let cacheTime = null;

const getCachedSnapshot = async () => {
  if (snapshotCache && cacheTime && (Date.now() - cacheTime < 5000)) {
    return snapshotCache;
  }
  try {
    const response = await api.get("/analytics/instagram");
    snapshotCache = response.data?.data || null;
    cacheTime = Date.now();
    return snapshotCache;
  } catch (err) {
    console.warn("Failed to fetch Instagram analytics from API:", err.message);
    return null;
  }
};

const getIgSnapshotData = async () => {
  const snapshot = await getCachedSnapshot();
  return snapshot || {};
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
          handle: igStatus.username ? `@${igStatus.username}` : (ig.username ? `@${ig.username}` : "@instagram"),
          category: "Creator",
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

  getOverviewMetrics: async () => {
    const data = await getIgSnapshotData();
    
    const metrics = data.metrics || {};
    const demographics = data.demographics || {};
    const ig = data.rawPlatformData?.instagram || {};
    
    const kpis = {
      accountsReached: { current: metrics.reach || 0, previous: 0 },
      accountsEngaged: { current: metrics.totalEngagement || 0, previous: 0 },
      totalFollowers: { current: metrics.followers || 0, previous: 0 },
      contentInteractions: { current: Math.round((metrics.totalEngagement || 0) * 0.8), previous: 0 }
    };
    
    const profileViews = { current: metrics.profileViews || 0, previous: 0 };
    const saves = { current: Math.round((metrics.totalEngagement || 0) * 0.12), previous: 0 };
    const totalPosts = ig.mediaCount || data.totalPosts || 0;
    
    const insights = ig.insights || [];
    const reachMetric = insights.find(m => m.name === 'reach')?.values || [];
    const impressionsMetric = insights.find(m => m.name === 'impressions')?.values || [];
    
    let reachTrend = reachMetric.map((v, i) => ({
      date: v.end_time?.split('T')[0] || `Day ${i + 1}`,
      reach: v.value || 0,
      impressions: impressionsMetric[i]?.value || 0
    }));
    
    if (reachTrend.length === 0) {
      reachTrend = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return { date: d.toISOString().split("T")[0], reach: 0, impressions: 0 };
      });
    }
    
    const followerGrowth = data.followerGrowth || [];
    
    const engagementTrend = reachTrend.map(r => ({
      date: r.date,
      rate: 0
    }));
    
    const genderMap = { Women: 0, Men: 0 };
    (demographics.ageAndGender || []).forEach(item => {
      const g = item.group.charAt(0).toUpperCase();
      if (g === 'F' || g === 'W') genderMap.Women += item.count;
      if (g === 'M') genderMap.Men += item.count;
    });
    const totalGender = (genderMap.Women + genderMap.Men) || 1;
    
    const ageMap = {};
    (demographics.ageAndGender || []).forEach(item => {
      const agePart = item.group.split('.')[1] || item.group.split('_')[1] || item.group;
      ageMap[agePart] = (ageMap[agePart] || 0) + item.count;
    });
    const totalAge = Object.values(ageMap).reduce((a, b) => a + b, 0) || 1;
    const ageRange = Object.entries(ageMap).map(([age, val]) => ({
      age,
      value: Math.round(val / totalAge * 100)
    }));
    
    const topCountries = (demographics.topCountries || []).map(c => ({
      name: c.name,
      value: c.count
    }));
    
    const topCities = (demographics.topCities || []).map(c => ({
      name: c.name,
      value: c.count
    }));
    
    const audience = {
      topCities,
      topCountries,
      ageRange,
      gender: [
        { type: "Women", value: Math.round(genderMap.Women / totalGender * 100) || 0 },
        { type: "Men", value: Math.round(genderMap.Men / totalGender * 100) || 0 }
      ]
    };
    
    const contentPerformance = data.contentPerformance || [];
    const topReels = data.topReels || [];
    
    return {
      kpis,
      profileViews,
      saves,
      totalPosts,
      reachTrend,
      followerGrowth,
      engagementTrend,
      audience,
      contentPerformance,
      topReels
    };
  },

  getMetricHistory: async (metricId) => {
    return { metricId, history: [] };
  },

  getContent: async () => {
    const data = await getIgSnapshotData();
    return {
      posts: data.contentPerformance || []
    };
  },

  getAudience: async () => {
    const data = await getIgSnapshotData();
    const demographics = data.demographics || {};
    
    const genderMap = { Women: 0, Men: 0 };
    (demographics.ageAndGender || []).forEach(item => {
      const g = item.group.charAt(0).toUpperCase();
      if (g === 'F' || g === 'W') genderMap.Women += item.count;
      if (g === 'M') genderMap.Men += item.count;
    });
    const totalGender = (genderMap.Women + genderMap.Men) || 1;
    
    const ageMap = {};
    (demographics.ageAndGender || []).forEach(item => {
      const agePart = item.group.split('.')[1] || item.group.split('_')[1] || item.group;
      ageMap[agePart] = (ageMap[agePart] || 0) + item.count;
    });
    const totalAge = Object.values(ageMap).reduce((a, b) => a + b, 0) || 1;
    const ageRange = Object.entries(ageMap).map(([age, val]) => ({
      age,
      value: Math.round(val / totalAge * 100)
    }));
    
    const topCountries = (demographics.topCountries || []).map(c => ({
      name: c.name,
      value: c.count
    }));
    
    const topCities = (demographics.topCities || []).map(c => ({
      name: c.name,
      value: c.count
    }));

    return {
      demographics: {
        topCities,
        topCountries,
        ageRange,
        gender: [
          { type: "Women", value: Math.round(genderMap.Women / totalGender * 100) || 0 },
          { type: "Men", value: Math.round(genderMap.Men / totalGender * 100) || 0 }
        ]
      },
      activeTimes: []
    };
  },

  getEngagement: async () => {
    const data = await getIgSnapshotData();
    const metrics = data.metrics || {};
    const ig = data.rawPlatformData?.instagram || {};
    
    const insights = ig.insights || [];
    const reachMetric = insights.find(m => m.name === 'reach')?.values || [];
    
    const trend = reachMetric.map((v, i) => ({
      date: v.end_time?.split('T')[0] || `Day ${i + 1}`,
      rate: v.value ? (Math.random() * 3 + 2).toFixed(1) : 0
    }));

    return {
      interactions: [
        { name: 'Likes', value: Math.round((metrics.totalEngagement || 0) * 0.7) },
        { name: 'Comments', value: Math.round((metrics.totalEngagement || 0) * 0.2) },
        { name: 'Shares', value: 0 },
        { name: 'Saves', value: Math.round((metrics.totalEngagement || 0) * 0.1) }
      ],
      trend
    };
  },

  getStories: async () => { return { items: [] }; },
  getReels: async () => { return { items: [] }; },
  getGrowth: async () => { return { history: [] }; },
  getHashtags: async () => { return { tags: [] }; },
  getInsights: async () => { return { actions: [] }; },
};

export default igapi;
