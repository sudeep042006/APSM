// ── Axios API Client ────────────────────────────────────────────────
// Pre-configured Axios instance with base URL and interceptors.
// Catches 401 responses to trigger re-authentication flows.

import axios from "axios";

// ── Create the API client instance ──────────────────────────────────
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request Interceptor: Attach JWT token to every request ──────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("incubein_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: Catch auth failures globally ───────────────
// Dispatches a 'sessionExpired' window event on 401/403 so AuthContext
// can render the re-authentication modal without a page flash or hard redirect.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      console.warn(`[lib/api] ${status} detected — dispatching sessionExpired event.`);

      // ── Dispatch global event to trigger AuthContext modal ───────────
      window.dispatchEvent(new CustomEvent('sessionExpired', {
        detail: { status, url: error.config?.url }
      }));

      // ── Clear stale credentials from storage ─────────────────────────
      localStorage.removeItem("incubein_token");
      localStorage.removeItem("incubein_user");
    }

    // ── Always reject so callers can handle gracefully ───────────────
    return Promise.reject(error);
  }
);

export default api;
