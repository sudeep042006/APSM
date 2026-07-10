import api from "./api";

// ── Cross-Posting API Service ──────────────────────────────────────────
// Handles all backend communication for the cross-posting automation feature.

const crosspostApi = {
  /**
   * Fetches the connection status of all social platforms for the current user.
   * @returns {Promise<Array>} Array of platform connection statuses.
   */
  getConnectionStatus: async () => {
    const response = await api.get('/auth/status');
    const rawPayload = response.data;
    
    // Safely extract the array since backends wrap arrays differently
    return Array.isArray(rawPayload) 
      ? rawPayload 
      : (rawPayload?.data || rawPayload?.status || rawPayload?.connections || []);
  },

  /**
   * Submits a new cross-posting job to the automation engine.
   * @param {FormData} formData - Contains caption, platforms (JSON stringified array), 
   *                              scheduledDate (optional), and mediaFile (optional).
   * @returns {Promise<Object>} Response from the job submission.
   */
  submitJob: async (formData) => {
    const response = await api.post('/automation/jobs', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};

export default crosspostApi;
