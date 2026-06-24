import api from "./api";

const linkedinApi = {
  // Fetch LinkedIn analytics snapshot
  getLinkedInAnalytics: async () => {
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
