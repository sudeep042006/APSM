import api from "./api";
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

      const mergedData = {
        metrics: dbSnapshot.metrics || { followers: 0, impressions: 0, clicks: 0, shares: 0, engagementRate: "0%" },
        demographics: dbSnapshot.demographics || { seniority: [], industry: [], companySize: [] },
        content: dbSnapshot.content || { posts: [], articles: [], documents: [] },
        trends: dbSnapshot.trends || [],
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
      return { data: [] }; 
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
