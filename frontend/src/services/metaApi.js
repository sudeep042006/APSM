import api from "./api";

const metaApi = {
  // Fetch Meta (Facebook & Instagram) analytics unified snapshot
  getMetaAnalytics: async () => {
    const response = await api.get("/analytics/meta");
    return response.data;
  },

  // Get the connection status for all platforms
  getAuthStatus: async () => {
    const response = await api.get("/auth/status");
    return response.data;
  },

  // Revoke Facebook access
  revokeFacebook: async () => {
    const response = await api.delete("/auth/facebook/revoke");
    return response.data;
  },

  // Revoke Instagram access
  revokeInstagram: async () => {
    const response = await api.delete("/auth/instagram/revoke");
    return response.data;
  },
};

export default metaApi;
