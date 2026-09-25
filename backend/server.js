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
import mlChatbotRouter from './modules/mlChatbot/mlChatbot.routes.js';
import reportsRouter from './modules/reports/reports.routes.js';
import recommendationRouter from './modules/recommendations/recommendation.routes.js';
import hybridAiRouter from './modules/hybridAi/hybridAi.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import connectRedis from './config/redis.js';
import './modules/automation/automation.worker.js'; // Start the cross-posting worker
import { startAnalyticsCron } from './modules/analytics/analytics.cron.js';

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
const frontendOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',').map(origin => origin.trim().replace(/\/$/, '')).filter(Boolean);
const localDevelopmentOrigins = process.env.NODE_ENV === 'production' ? [] : [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4174',
  'http://127.0.0.1:4174',
];
const allowedCorsOrigins = new Set([...frontendOrigins, ...localDevelopmentOrigins]);

app.use(cors({
  origin(origin, callback) {
    // Permit command-line checks (no Origin) and the explicitly configured UI origins.
    if (!origin || allowedCorsOrigins.has(origin)) return callback(null, true);
    return callback(new Error('CORS origin is not allowed.'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '256kb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/analytics', analyticsRouter);
app.use('/automation', automationRouter);
app.use('/chatbot', mlChatbotRouter);
app.use('/reports', reportsRouter);
// /api compatibility keeps the endpoint stable for existing frontend builds.
app.use(['/recommendations', '/api/recommendations'], recommendationRouter);
app.use('/api/v1', hybridAiRouter);

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
// connectRedis() is no longer needed since redis.js auto-initializes on import
startAnalyticsCron(); // Start the analytics 6-hour refresh cron job

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   Environment:  ${process.env.NODE_ENV || 'development'}\n`);
});

export default app;
