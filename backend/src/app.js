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

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../config/env/development.env') });

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Initialize WebSocket server
const wss = new WebSocketServer({ server: httpServer });

// Initialize PostgreSQL pool
const pgPool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
});

// Initialize Redis client
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

app.use(requestLogger);

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    db: 'PostgreSQL',
    cache: 'Redis',
    timestamp: new Date().toISOString()
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

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server ready on port ${PORT}`);
  console.log(`WebSocket endpoint: ws://localhost:${PORT}`);
});