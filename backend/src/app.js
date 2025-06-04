const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');
const { Pool } = require('pg');
const Redis = require('ioredis');
const dotenv = require('dotenv');
const path = require('path');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./auth/routes/auth.route');
const { authenticateJWT } = require('./middleware/auth.middleware');
const { requestLogger } = require('./middleware/logger.middleware');
const { errorHandler } = require('./middleware/error.middleware');
const { postgresConfig, redisConfig } = require('./config/database.config');
const { serverConfig, rateLimitConfig } = require('./config/server.config');

const app = express();
const httpServer = createServer(app);

const wss = new WebSocketServer({ server: httpServer });
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