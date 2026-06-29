// server.js — entry point
import dotenv from 'dotenv';
dotenv.config();

// ES modules
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import { authRouter, userRouter } from './modules/auth/auth.routes.js';
import analyticsRouter from './modules/analytics/analytics.routes.js';
import automationRouter from './modules/automation/automation.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import connectRedis from './config/redis.js';

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
// ── CORS: allow requests from the Vite dev frontend (port 5173) ──────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/analytics', analyticsRouter);
app.use('/automation', automationRouter);

// Health check — visit http://localhost:5000/health to confirm server is alive
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

// Central error handler (must be last)
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────
connectDB();
connectRedis();

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   Environment:  ${process.env.NODE_ENV || 'development'}\n`);
});

export default app;
