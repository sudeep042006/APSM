// ── Environment Variable Loader ─────────────────────────────────────
// Loads .env file via dotenv and validates that all required keys exist.
// Should be imported at the very top of server.js before anything else.

import dotenv from "dotenv";

dotenv.config();

// ── Required environment variable keys ──────────────────────────────
const REQUIRED_VARS = ["MONGO_URI", "JWT_SECRET"];

// ── Validate that all critical env vars are present ─────────────────
const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(
    `❌ Missing required environment variables: ${missing.join(", ")}`
  );
  process.exit(1);
}

export default {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGO_URI: process.env.MONGO_URI,
  REDIS_HOST: process.env.REDIS_HOST || "127.0.0.1",
  REDIS_PORT: process.env.REDIS_PORT || 6379,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
};
