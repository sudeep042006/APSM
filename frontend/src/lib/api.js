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

// ── Response Interceptor: Catch 401s and redirect to login ──────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // ── Clear stale credentials ─────────────────────────────────────
      localStorage.removeItem("incubein_token");
      localStorage.removeItem("incubein_user");

      // ── Redirect to login (unless already there) ────────────────────
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
