import api from "./api";
import { instagramMockData } from "@/mocks/dashboardData";

// ── Global Mock Toggle ───────────────────────────────────────────────
const USE_MOCKS = true;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
      const response = await api.get("/analytics/instagram/profile");
      return response.data;
    }
  },

  // 2. Fetch Overview Metrics (Used by InstagramDash)
  getOverviewMetrics: async () => {
    if (USE_MOCKS) {
      await delay(800);
      return {
        // ── KPI data (passthrough from centralized mock) ──────────────
        kpis: instagramMockData.kpis,
        profileViews: instagramMockData.profileViews,
        saves: instagramMockData.saves,
        totalPosts: instagramMockData.totalPosts,
        // ── Chart data (passthrough) ──────────────────────────────────
        reachTrend: instagramMockData.reachTrend,
        followerGrowth: instagramMockData.followerGrowth,
        engagementTrend: instagramMockData.engagementTrend,
        // ── Demographics (passthrough) ────────────────────────────────
        audience: instagramMockData.audience,
        // ── Table data (passthrough) ──────────────────────────────────
        contentPerformance: instagramMockData.contentPerformance,
        topReels: instagramMockData.topReels,
      };
    } else {
      const response = await api.get("/analytics/instagram/overview");
      return response.data;
    }
  },

  // 3. Fetch Deep History for a Specific Metric
  getMetricHistory: async (metricId) => {
    if (USE_MOCKS) {
      await delay(700);
      const history = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return {
          date: date.toISOString().split('T')[0],
          value: Math.floor(Math.random() * 5000) + 10000 + (i * 200)
        };
      });
      return { metricId, history };
    } else {
      const response = await api.get(`/analytics/instagram/metrics/${metricId}`);
      return response.data;
    }
  },

  // 4. Fetch Content Performance
  getContent: async () => {
    if (USE_MOCKS) {
      await delay(800);
      return {
        posts: instagramMockData.contentPerformance
      };
    } else {
      const response = await api.get("/analytics/instagram/content");
      return response.data;
    }
  },

  // 5. Fetch Audience Demographics
  getAudience: async () => {
    if (USE_MOCKS) {
      await delay(800);
      return {
        demographics: instagramMockData.audience,
        activeTimes: Array.from({ length: 7 }, (_, day) => ({
          day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][day],
          hours: Array.from({ length: 24 }, () => Math.floor(Math.random() * 100))
        }))
      };
    } else {
      const response = await api.get("/analytics/instagram/audience");
      return response.data;
    }
  },

  // 6. Fetch Engagement
  getEngagement: async () => {
    if (USE_MOCKS) {
      await delay(800);
      return {
        interactions: instagramMockData.interactionsByType,
        trend: instagramMockData.reachTrend.map(d => ({ date: d.date, rate: (Math.random() * 3 + 2).toFixed(1) }))
      };
    } else {
      const response = await api.get("/analytics/instagram/engagement");
      return response.data;
    }
  },

  // Stub endpoints for the remaining pages
  getStories: async () => { await delay(800); return { items: [] }; },
  getReels: async () => { await delay(800); return { items: [] }; },
  getGrowth: async () => { await delay(800); return { history: [] }; },
  getHashtags: async () => { await delay(800); return { tags: [] }; },
  getInsights: async () => { await delay(800); return { actions: [] }; },
};

export default igapi;
