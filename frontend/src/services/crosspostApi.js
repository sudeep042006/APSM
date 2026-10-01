import api from "./api";

// ── Cross-Posting API Service ────────────────────────────────────────
// Every call here maps to a route that actually exists on the backend:
//
//   GET    /auth/status              → connected social accounts
//   GET    /auth/:platform/revoke    → disconnect one platform
//   GET    /automation/jobs          → publishing history for this user
//   POST   /automation/jobs          → queue a new post (multipart/form-data)
//   GET    /creator-posts/incoming   → submissions awaiting this admin's review
//   POST   /creator-posts/:id/approve→ approve, creates the Automation job
//   POST   /creator-posts/:id/reject → reject, with feedback for the creator
//
// The last three are guarded by `requireAuth` plus a role check on the server
// (admin only), so a 403 here means the signed-in user is not an admin — it is
// handled as a state, not treated as a network failure.

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
  },

  /**
   * Fetches the user's past automation jobs (history).
   * The controller maps the Automation status enum onto display labels
   * (Published / Failed / Partial / Scheduled / Processing), so the labels
   * below must match what the server sends.
   * @returns {Promise<Array>} Array of automation job histories.
   */
  getHistory: async () => {
    const response = await api.get('/automation/jobs');
    return Array.isArray(response.data) ? response.data : (response.data?.jobs || []);
  },

  /**
   * Revoke access for a specific platform.
   */
  revokeAccess: async (platformId) => {
    const response = await api.delete(`/auth/${platformId}/revoke`);
    return response.data;
  },

  /**
   * Admin: fetches every creator submission routed to this admin, newest first.
   * Each post carries a populated `creatorId` ({ _id, name, email }) because the
   * controller populates it.
   * @returns {Promise<Array>} Creator submissions.
   */
  getIncomingRequests: async () => {
    const response = await api.get('/creator-posts/incoming');
    const data = response.data;
    const posts = Array.isArray(data) ? data : (data?.posts || []);
    return posts;
  },

  /**
   * Admin: approves a pending submission. The server creates the Automation job
   * on the admin's own credentials and links it back via `automationJobId`.
   * @returns {Promise<Object>} The updated post.
   */
  approveRequest: async (postId) => {
    const response = await api.post(`/creator-posts/${postId}/approve`);
    return response.data?.post || response.data;
  },

  /**
   * Admin: rejects a pending submission, sending feedback back to the creator.
   * @param {string} postId
   * @param {string} feedback - Shown to the creator on their submissions list.
   * @returns {Promise<Object>} The updated post.
   */
  rejectRequest: async (postId, feedback) => {
    const response = await api.post(`/creator-posts/${postId}/reject`, { feedback });
    return response.data?.post || response.data;
  },
};

export default crosspostApi;