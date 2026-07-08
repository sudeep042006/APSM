import api from "./api";
import { mockDatabase } from "@/mocks/dashboardData";

// Transient Cache Setup
let linkedinCache = null;
let linkedinCacheTime = 0;
const CACHE_TTL = 5000; // 5 seconds to prevent rapid concurrent fetches

const linkedinApi = {
  // Fetch LinkedIn analytics snapshot
  getLinkedInAnalytics: async (dateRange = null) => {
    const now = Date.now();
    
    // 1. Deduplication Cache Check
    if (linkedinCache && (now - linkedinCacheTime < CACHE_TTL)) {
      return linkedinCache;
    }

    try {
      // 2. Fetch Live Snapshot
      const response = await api.get("/analytics/linkedin");
      const dbSnapshots = response.data?.data || [];
      const dbSnapshot = (Array.isArray(dbSnapshots) ? dbSnapshots[0] : dbSnapshots) || {};

      // 3. Fallback / Template Definition
      // Ensure we have a deeply nested skeleton to prevent UI crashes
      const baseMock = mockDatabase.linkedin || {
          metrics: { followers: 0, impressions: 0, clicks: 0, shares: 0, engagementRate: "0%" },
          demographics: { seniority: [], industry: [], companySize: [] },
          content: { posts: [], articles: [], documents: [] },
          trends: []
      };

      // 4. Data Merging (Live -> Mock Fallback)
      const mergedData = {
        ...baseMock,
        metrics: {
          ...baseMock.metrics,
          ...(dbSnapshot.metrics || {})
        },
        demographics: {
          ...baseMock.demographics,
          ...(dbSnapshot.demographics || {})
        },
        // If the DB snapshot lacks trend vectors or content (e.g., skeleton snapshots),
        // we fall back to the mock lists so charts and tables render safely.
        content: (dbSnapshot.content && dbSnapshot.content.posts?.length > 0) 
                   ? dbSnapshot.content 
                   : baseMock.content,
        trends: (dbSnapshot.trends && dbSnapshot.trends.length > 0) 
                   ? dbSnapshot.trends 
                   : baseMock.trends,
      };

      // Apply date filtering if dateRange is provided
      let filteredLI = { ...mergedData };
      if (dateRange) {
        const start = new Date(dateRange.start);
        const end = new Date(dateRange.end);

        // Filter trends
        const filterTrend = (trend) => (trend || []).filter(item => {
          const d = new Date(item.day);
          return d >= start && d <= end;
        });

        // Filter content lists
        const filterContent = (list) => (list || []).filter(item => {
          const d = new Date(item.date);
          return d >= start && d <= end;
        });

        filteredLI = {
          ...mergedData,
          metrics: {
            ...mergedData.metrics,
            impressionsTrend: filterTrend(mergedData.metrics?.impressionsTrend),
            engagementTrend: filterTrend(mergedData.metrics?.engagementTrend),
            growthTrend: filterTrend(mergedData.metrics?.growthTrend)
          },
          content: {
            posts: filterContent(mergedData.content?.posts),
            articles: filterContent(mergedData.content?.articles),
            documents: filterContent(mergedData.content?.documents)
          }
        };
      }

      // 5. Update Cache
      const wrappedRes = { data: [filteredLI] };
      linkedinCache = wrappedRes;
      linkedinCacheTime = now;

      return wrappedRes;
      
    } catch (error) {
      console.error("Failed to fetch LinkedIn analytics:", error);
      
      const baseMock = mockDatabase.linkedin;
      let filteredLI = { ...baseMock };
      if (dateRange) {
        const start = new Date(dateRange.start);
        const end = new Date(dateRange.end);

        // Filter trends
        const filterTrend = (trend) => (trend || []).filter(item => {
          const d = new Date(item.day);
          return d >= start && d <= end;
        });

        // Filter content lists
        const filterContent = (list) => (list || []).filter(item => {
          const d = new Date(item.date);
          return d >= start && d <= end;
        });

        filteredLI = {
          ...baseMock,
          metrics: {
            ...baseMock.metrics,
            impressionsTrend: filterTrend(baseMock.metrics?.impressionsTrend),
            engagementTrend: filterTrend(baseMock.metrics?.engagementTrend),
            growthTrend: filterTrend(baseMock.metrics?.growthTrend)
          },
          content: {
            posts: filterContent(baseMock.content?.posts),
            articles: filterContent(baseMock.content?.articles),
            documents: filterContent(baseMock.content?.documents)
          }
        };
      }
      
      return { data: [filteredLI] }; 
    }
  },

  // Get the connection status for all platforms
  getAuthStatus: async () => {
    const response = await api.get("/auth/status");
    return response.data;
  },

  // Revoke LinkedIn access
  revokeLinkedIn: async () => {
    const response = await api.delete("/auth/linkedin/revoke");
    return response.data;
  },
};

export default linkedinApi;
