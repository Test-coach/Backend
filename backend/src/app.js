import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { Pool } from 'pg';
import Redis from 'ioredis';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import authRoutes from './auth/routes/auth.route.js';
import { authenticateJWT } from './middleware/auth.middleware.js';
import { requestLogger } from './middleware/logger.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import { postgresConfig, redisConfig } from './config/database.config.js';
import { serverConfig, rateLimitConfig } from './config/server.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../config/env/development.env') });

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Initialize WebSocket server
const wss = new WebSocketServer({ server: httpServer });

// Initialize PostgreSQL pool
const pgPool = new Pool(postgresConfig);

// Initialize Redis client
const redis = new Redis(redisConfig);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit(rateLimitConfig);
app.use(limiter);

app.use(requestLogger);

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    db: 'PostgreSQL',
    cache: 'Redis',
    timestamp: new Date().toISOString(),
    environment: serverConfig.env
  });
});

app.get('/test-db', async (req, res) => {
  try {
    const client = await pgPool.connect();
    try {
      const { rows } = await client.query('SELECT NOW() as time, current_database() as db');
      res.json(rows[0]);
    } finally {
      client.release();
    }
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/protected', authenticateJWT, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

app.use('/auth', authRoutes);

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    redis.publish('ws:messages', message.toString());
  });

  redis.subscribe('ws:messages', (err) => {
    if (err) ws.close(1011, 'Subscription failed');
  });

  redis.on('message', (channel, msg) => {
    if (channel === 'ws:messages') {
      ws.send(`Broadcast: ${msg}`);
    }
  });
});

app.use(errorHandler);

const gracefulShutdown = async () => {
  console.log('Shutting down gracefully...');
  await pgPool.end();
  await redis.quit();
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

httpServer.listen(serverConfig.port, () => {
  console.log(`Server ready on port ${serverConfig.port} in ${serverConfig.env} mode`);
  console.log(`WebSocket endpoint: ws://localhost:${serverConfig.port}`);
});