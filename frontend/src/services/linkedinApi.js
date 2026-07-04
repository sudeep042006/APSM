import api from "./api";
import { mockDatabase } from "@/mocks/dashboardData";

// ── Global Mock Toggle ───────────────────────────────────────────────
// Set USE_MOCKS to true to bypass backend APIs and use localized mock data.
const USE_MOCKS = true;

const linkedinApi = {
  // Fetch LinkedIn analytics snapshot
  getLinkedInAnalytics: async (dateRange = null) => {
    if (USE_MOCKS) {
      console.log("[linkedinApi] Using Mock Data Engine with 800ms latency...");
      return new Promise((resolve) => {
        setTimeout(() => {
          const rawLI = mockDatabase.linkedin;
          
          if (!dateRange) {
            resolve({ data: [rawLI] });
            return;
          }

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

          const filteredLI = {
            ...rawLI,
            metrics: {
              ...rawLI.metrics,
              impressionsTrend: filterTrend(rawLI.metrics?.impressionsTrend),
              engagementTrend: filterTrend(rawLI.metrics?.engagementTrend),
              growthTrend: filterTrend(rawLI.metrics?.growthTrend)
            },
            content: {
              posts: filterContent(rawLI.content?.posts),
              articles: filterContent(rawLI.content?.articles),
              documents: filterContent(rawLI.content?.documents)
            }
          };

          resolve({ data: [filteredLI] });
        }, 800);
      });
    }
    const response = await api.get("/analytics/linkedin");
    return response.data;
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
