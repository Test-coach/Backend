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
const { notFoundHandler } = require('./middleware/not-found.middleware');
const { prisma, testConnection } = require('./db');
const corsOptions = require('./config/cors.config');

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Initialize Redis connection
const redis = new Redis(redisConfig);

const wss = new WebSocketServer({ server: httpServer });

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
    const result = await prisma.$queryRaw`SELECT NOW() as time, current_database() as db`;
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/protected', authenticateJWT, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

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

// Routes
app.use('/auth', authRoutes);
// app.use('/api/users', require('./modules/users/routes/user.routes'));
// app.use('/api/orders', require('./modules/orders/routes/order.routes'));
// app.use('/api/coupons', require('./modules/coupons/routes/coupon.routes'));

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

const gracefulShutdown = async () => {
  console.log('Shutting down gracefully...');
  
  // Close database connections
  try {
    if (prisma) {
      await prisma.$disconnect();
      console.log('Prisma connection closed');
    }
  } catch (err) {
    console.error('Error closing Prisma connection:', err);
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

// Database connection and server start
async function startServer() {
  try {
    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Database connection failed');
    }

    // Start server
    httpServer.listen(serverConfig.port, () => {
      console.log(`Server ready on port ${serverConfig.port} in ${serverConfig.env} mode`);
      console.log(`WebSocket endpoint: ws://localhost:${serverConfig.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();