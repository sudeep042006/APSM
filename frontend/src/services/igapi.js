import api from "./api";
import { instagramMockData } from "@/mocks/dashboardData";

// ── Global Mock Toggle ───────────────────────────────────────────────
const USE_MOCKS = false;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let snapshotCache = null;
let cacheTime = null;

const getCachedSnapshot = async () => {
  if (snapshotCache && cacheTime && (Date.now() - cacheTime < 5000)) {
    return snapshotCache;
  }
  const response = await api.get("/analytics/instagram");
  snapshotCache = response.data?.data || null;
  cacheTime = Date.now();
  return snapshotCache;
};

const getIgSnapshotData = async () => {
  if (USE_MOCKS) {
    return instagramMockData;
  }
  const snapshot = await getCachedSnapshot();
  if (!snapshot) {
    return instagramMockData;
  }
  return {
    ...instagramMockData,
    metrics: {
      ...instagramMockData.metrics,
      followers: snapshot.metrics?.followers || instagramMockData.metrics?.followers,
      reach: snapshot.metrics?.reach || instagramMockData.metrics?.reach,
      impressions: snapshot.metrics?.impressions || instagramMockData.metrics?.impressions,
      profileViews: snapshot.metrics?.profileViews || instagramMockData.metrics?.profileViews,
      totalEngagement: snapshot.metrics?.totalEngagement || instagramMockData.metrics?.totalEngagement,
    },
    demographics: snapshot.demographics || instagramMockData.demographics,
    rawPlatformData: snapshot.rawPlatformData || instagramMockData.rawPlatformData,
    extended: snapshot.extended || instagramMockData.extended || {}
  };
};

const igapi = {
  // 1. Fetch Global Connection State & Profile (Used by Layout)
  getProfile: async () => {
    if (USE_MOCKS) {
      await delay(600);
      return {
        isConnected: true,
        profile: instagramMockData.profile
      };
    } else {
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
            profilePicture: ig.profilePicture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
            bio: ig.bio || "Connected Instagram account analytics"
          }
        };
      } catch (err) {
        console.error("Failed to fetch Instagram profile:", err);
        throw err;
      }
    }
  },

  // 2. Fetch Overview Metrics (Used by InstagramDash)
  getOverviewMetrics: async () => {
    const data = await getIgSnapshotData();
    
    // Calculate KPIs
    const metrics = data.metrics || {};
    const demographics = data.demographics || {};
    const ig = data.rawPlatformData?.instagram || {};
    
    const kpis = {
      accountsReached: { current: metrics.reach || 0, previous: Math.round((metrics.reach || 0) * 0.9) },
      accountsEngaged: { current: metrics.totalEngagement || 0, previous: Math.round((metrics.totalEngagement || 0) * 0.88) },
      totalFollowers: { current: metrics.followers || 0, previous: Math.round((metrics.followers || 0) * 0.98) },
      contentInteractions: { current: Math.round((metrics.totalEngagement || 0) * 0.8), previous: Math.round((metrics.totalEngagement || 0) * 0.7) }
    };
    
    const profileViews = { current: metrics.profileViews || 0, previous: Math.round((metrics.profileViews || 0) * 0.92) };
    const saves = { current: Math.round((metrics.totalEngagement || 0) * 0.12), previous: Math.round((metrics.totalEngagement || 0) * 0.1) };
    const totalPosts = ig.mediaCount || data.totalPosts || 0;
    
    // Build reachTrend from insights values
    const insights = ig.insights || [];
    const reachMetric = insights.find(m => m.name === 'reach')?.values || [];
    const impressionsMetric = insights.find(m => m.name === 'impressions')?.values || [];
    
    const reachTrend = reachMetric.map((v, i) => ({
      date: v.end_time?.split('T')[0] || `Day ${i + 1}`,
      reach: v.value || 0,
      impressions: impressionsMetric[i]?.value || 0
    }));
    
    // Fallback trend if empty
    if (reachTrend.length === 0) {
      const dates = ['Oct 1', 'Oct 2', 'Oct 3', 'Oct 4', 'Oct 5', 'Oct 6', 'Oct 7'];
      dates.forEach((date, i) => {
        reachTrend.push({
          date,
          reach: Math.round((metrics.reach || 45200) / 7 * (0.8 + (i * 0.05) + Math.random() * 0.15)),
          impressions: Math.round((metrics.impressions || 34100) / 7 * (0.8 + (i * 0.05) + Math.random() * 0.15))
        });
      });
    }
    
    // Dummy followerGrowth breakdown if not present
    const followerGrowth = data.followerGrowth || [];
    if (followerGrowth.length === 0) {
      const dates = ['Oct 1', 'Oct 2', 'Oct 3', 'Oct 4', 'Oct 5', 'Oct 6', 'Oct 7'];
      dates.forEach((date) => {
        followerGrowth.push({
          date,
          gained: Math.floor(Math.random() * 40) + 10,
          lost: Math.floor(Math.random() * 10) + 2
        });
      });
    }
    
    // engagementTrend rates
    const engagementTrend = reachTrend.map(r => ({
      date: r.date,
      rate: parseFloat((Math.random() * 3 + 2).toFixed(1))
    }));
    
    // Map demographics
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
    if (ageRange.length === 0) {
      ageRange.push(
        { age: "18-24", value: 35 },
        { age: "25-34", value: 45 },
        { age: "35-44", value: 20 }
      );
    }
    
    const topCountries = (demographics.topCountries || []).map(c => ({
      name: c.name,
      value: c.count
    }));
    if (topCountries.length === 0) {
      topCountries.push({ name: "India", value: 68 }, { name: "United States", value: 12 });
    }
    
    const topCities = (demographics.topCities || []).map(c => ({
      name: c.name,
      value: c.count
    }));
    if (topCities.length === 0) {
      topCities.push({ name: "Mumbai", value: 35 }, { name: "Delhi", value: 20 });
    }
    
    const audience = {
      topCities,
      topCountries,
      ageRange,
      gender: [
        { type: "Women", value: Math.round(genderMap.Women / totalGender * 100) || 68 },
        { type: "Men", value: Math.round(genderMap.Men / totalGender * 100) || 32 }
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

  // 3. Fetch Deep History for a Specific Metric
  getMetricHistory: async (metricId) => {
    const data = await getIgSnapshotData();
    const baseValue = data.metrics?.[metricId] || 1000;
    const history = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        value: Math.round(baseValue * (0.8 + (i * 0.007) + Math.random() * 0.1))
      };
    });
    return { metricId, history };
  },

  // 4. Fetch Content Performance
  getContent: async () => {
    const data = await getIgSnapshotData();
    return {
      posts: data.contentPerformance || []
    };
  },

  // 5. Fetch Audience Demographics
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
    if (ageRange.length === 0) {
      ageRange.push(
        { age: "18-24", value: 35 },
        { age: "25-34", value: 45 },
        { age: "35-44", value: 20 }
      );
    }
    
    const topCountries = (demographics.topCountries || []).map(c => ({
      name: c.name,
      value: c.count
    }));
    if (topCountries.length === 0) {
      topCountries.push({ name: "India", value: 68 }, { name: "United States", value: 12 });
    }
    
    const topCities = (demographics.topCities || []).map(c => ({
      name: c.name,
      value: c.count
    }));
    if (topCities.length === 0) {
      topCities.push({ name: "Mumbai", value: 35 }, { name: "Delhi", value: 20 });
    }

    return {
      demographics: {
        topCities,
        topCountries,
        ageRange,
        gender: [
          { type: "Women", value: Math.round(genderMap.Women / totalGender * 100) || 68 },
          { type: "Men", value: Math.round(genderMap.Men / totalGender * 100) || 32 }
        ]
      },
      activeTimes: Array.from({ length: 7 }, (_, day) => ({
        day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][day],
        hours: Array.from({ length: 24 }, () => Math.floor(Math.random() * 100))
      }))
    };
  },

  // 6. Fetch Engagement
  getEngagement: async () => {
    const data = await getIgSnapshotData();
    const metrics = data.metrics || {};
    const ig = data.rawPlatformData?.instagram || {};
    
    const insights = ig.insights || [];
    const reachMetric = insights.find(m => m.name === 'reach')?.values || [];
    
    const trend = reachMetric.map((v, i) => ({
      date: v.end_time?.split('T')[0] || `Day ${i + 1}`,
      rate: (Math.random() * 3 + 2).toFixed(1)
    }));
    
    if (trend.length === 0) {
      const dates = ['Oct 1', 'Oct 2', 'Oct 3', 'Oct 4', 'Oct 5', 'Oct 6', 'Oct 7'];
      dates.forEach((date) => {
        trend.push({
          date,
          rate: (Math.random() * 3 + 2).toFixed(1)
        });
      });
    }

    return {
      interactions: {
        likes: Math.round((metrics.totalEngagement || 0) * 0.7),
        comments: Math.round((metrics.totalEngagement || 0) * 0.2),
        saves: Math.round((metrics.totalEngagement || 0) * 0.1),
        shares: 0
      },
      trend
    };
  },

  // Stub endpoints for the remaining pages
  getStories: async () => { await delay(800); return { items: [] }; },
  getReels: async () => { await delay(800); return { items: [] }; },
  getGrowth: async () => { await delay(800); return { history: [] }; },
  getHashtags: async () => { await delay(800); return { tags: [] }; },
  getInsights: async () => { await delay(800); return { actions: [] }; },
};

export default igapi;
