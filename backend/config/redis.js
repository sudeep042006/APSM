// ── Redis Cache Client Configuration ────────────────────────────────
// Initializes an ioredis client for caching external API responses.
// TTL enforcement (30-60 min) is handled at the route/controller level.

import Redis from "ioredis";

// ── Create Redis client with environment-driven host/port ───────────
const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    // Exponential backoff capped at 2 seconds
    const delay = Math.min(times * 200, 2000);
    return delay;
  },
});

// ── Connection event listeners ──────────────────────────────────────
redis.on("connect", () => {
  console.log("✅ Redis Cache Client Connected");
});

redis.on("error", (err) => {
  console.error(`❌ Redis Error: ${err.message}`);
});

export default redis;
