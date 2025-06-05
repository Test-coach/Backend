const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');
const Redis = require('ioredis');
const dotenv = require('dotenv');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { authRoutes, authenticateJWT } = require('./modules/auth');
const { requestLogger } = require('./middleware/logger.middleware');
const { errorHandler } = require('./middleware/error.middleware');
const { redisConfig } = require('./config/database.config');
const { serverConfig, rateLimitConfig } = require('./config/server.config');
const DatabaseInitializer = require('./db/postgres/utils/db.init');
const { pool } = require('./db/postgres');

// Load environment variables
dotenv.config({ path: path.resolve('config/env/development.env') });

const app = express();
const httpServer = createServer(app);

// Initialize Redis connection
const redis = new Redis(redisConfig);

// Test database connections
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

const wss = new WebSocketServer({ server: httpServer });

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
    const client = await pool.connect();
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
  
  // Close database connections
  try {
    await pool.end();
    console.log('PostgreSQL pool closed');
  } catch (err) {
    console.error('Error closing PostgreSQL pool:', err);
  }

  try {
    await redis.quit();
    console.log('Redis connection closed');
  } catch (err) {
    console.error('Error closing Redis connection:', err);
  }

  // Close HTTP server
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
};

// Handle shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Initialize database and start server
const startServer = async () => {
  try {
    // Initialize database (migrations and seeders)
    await DatabaseInitializer.initialize({
      seed: process.env.NODE_ENV === 'development',
      clearData: process.env.CLEAR_DB === 'true'
    });

    // Start server
    httpServer.listen(serverConfig.port, () => {
      console.log(`Server ready on port ${serverConfig.port} in ${serverConfig.env} mode`);
      console.log(`WebSocket endpoint: ws://localhost:${serverConfig.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();