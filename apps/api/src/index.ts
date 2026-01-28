import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';

import { authRoutes } from './routes/auth';
import { petRoutes } from './routes/pet';
import { missionsRoutes } from './routes/missions';
import { rewardsRoutes } from './routes/rewards';
import { webhooksRoutes } from './routes/webhooks';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use(
  '*',
  cors({
    origin: ['http://localhost:8081', 'http://localhost:3000'], // Expo dev, web
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
  });
});

// API routes
app.route('/api/auth', authRoutes);
app.route('/api/pet', petRoutes);
app.route('/api/missions', missionsRoutes);
app.route('/api/rewards', rewardsRoutes);
app.route('/api/webhooks', webhooksRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found', path: c.req.path }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json(
    {
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    },
    500
  );
});

// Start server
const port = parseInt(process.env.PORT || '3001', 10);

console.log(`🚀 CryptoPet API starting on port ${port}`);

export default {
  port,
  fetch: app.fetch,
};
