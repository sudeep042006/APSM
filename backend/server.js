// ── Incubein Analytics Dashboard — Express API Server ────────────────
// Main entry point for the backend. Loads environment, connects to
// MongoDB, mounts feature module routes, and starts the HTTP listener.

// ── Load environment variables FIRST ────────────────────────────────
import env from "./config/env.js";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

// ── Database & Cache connections ────────────────────────────────────
import connectDB from "./config/db.js";

// ── Feature Module Routes ───────────────────────────────────────────
import authRoutes from "./src/modules/auth/auth.routes.js";
import analyticsRoutes from "./src/modules/analytics/analytics.routes.js";
import automationRoutes from "./src/modules/automation/automation.routes.js";

// ── Global Middleware ───────────────────────────────────────────────
import errorMiddleware from "./middleware/error.middleware.js";

// ── Initialize Express Application ──────────────────────────────────
const app = express();

// ── Security & Parsing Middleware ───────────────────────────────────
app.use(helmet()); // Security headers
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "10mb" })); // JSON body parser
app.use(express.urlencoded({ extended: true })); // URL-encoded body parser

// ── Request Logging (development only) ──────────────────────────────
if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ── Health Check Endpoint ───────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Incubein API is running.",
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── Mount Feature Module Routes ─────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/automation", automationRoutes);

// ── 404 Catch-All for Undefined Routes ──────────────────────────────
app.use((_req, _res, next) => {
  const error = new Error("Route not found.");
  error.statusCode = 404;
  next(error);
});

// ── Global Error Handler (MUST be last middleware) ──────────────────
app.use(errorMiddleware);

// ── Start Server ────────────────────────────────────────────────────
const startServer = async () => {
  try {
    // ── Connect to MongoDB ──────────────────────────────────────────
    await connectDB();

    // ── Bind to configured port ─────────────────────────────────────
    app.listen(env.PORT, () => {
      console.log(`\n🚀 Incubein API Server running on port ${env.PORT}`);
      console.log(`   Environment: ${env.NODE_ENV}`);
      console.log(`   Client URL:  ${env.CLIENT_URL}\n`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
