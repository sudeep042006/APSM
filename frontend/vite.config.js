// ── Vite Configuration ──────────────────────────────────────────────
// React SPA setup with HMR and path aliasing for clean imports.

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  // ── Plugins ─────────────────────────────────────────────────────────
  plugins: [react()],

  // ── Path Resolution Aliases ─────────────────────────────────────────
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // ── Dev Server Configuration ────────────────────────────────────────
  server: {
    port: 5173,
    proxy: {
      // Proxy API requests to the Express backend during development
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
