const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createServer } = require('http');
const dotenv = require('dotenv');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { authRoutes, authenticateJWT } = require('./modules/auth');
const { adminRoutes, examRoutes } = require('./modules/admin');
const { requestLogger } = require('./middleware/logger.middleware');
const { errorHandler } = require('./middleware/error.middleware');
const { redisConfig } = require('./config/database.config');
const { serverConfig, rateLimitConfig } = require('./config/server.config');
const { notFoundHandler } = require('./middleware/not-found.middleware');
const { prisma, testConnection, ensureMigrations } = require('./db');
const corsOptions = require('./config/cors.config');
const features = require('./config/features.config');
const cacheService = require('./services/cache.service');
const yaml = require('yamljs');
const swaggerUi = require('swagger-ui-express');
const { AuthError } = require('./modules/shared/utils/error');
const SuccessResponse = require('./modules/shared/utils/success');

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Initialize Redis and WebSocket only if enabled
let redis = null;
let wss = null;

if (features.redis.enabled) {
  const Redis = require('ioredis');
  const { WebSocketServer } = require('ws');
  
  redis = new Redis(redisConfig);
  console.log('Redis connection initialized');

  if (features.websocket.enabled) {
    wss = new WebSocketServer({ server: httpServer });
    console.log('WebSocket server initialized');

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
  }
} else {
  console.log('Using in-memory cache');
}

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

const swaggerDocument = yaml.load(path.join(__dirname, '../openapi.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/health', (req, res) => {
  return new SuccessResponse('Health check successful', {
    status: 'OK',
    db: 'PostgreSQL',
    cache: features.redis.enabled ? 'Redis' : 'In-Memory',
    websocket: features.websocket.enabled ? 'Enabled' : 'Disabled',
    timestamp: new Date().toISOString(),
    environment: serverConfig.env
  }).sendResponse(res);
});

// Example of using cache
app.get('/cache-test', (req, res) => {
  const key = 'test-key';
  let value;
  
  if (features.redis.enabled) {
    value = redis.get(key);
  } else {
    value = cacheService.get(key);
  }
  
  if (!value) {
    value = { message: 'This is a cached value', timestamp: new Date().toISOString() };
    if (features.redis.enabled) {
      redis.set(key, JSON.stringify(value), 'EX', 3600);
    } else {
      cacheService.set(key, value);
    }
  }
  
  return new SuccessResponse('Cache test successful', value).sendResponse(res);
});

app.get('/test-db', async (req, res) => {
  try {
    const result = await prisma.$queryRaw`SELECT NOW() as time, current_database() as db`;
    return new SuccessResponse('Database test successful', result[0]).sendResponse(res);
  } catch (err) {
    return new AuthError('Database error', 500).sendResponse(res);
  }
});

app.get('/protected', authenticateJWT, (req, res) => {
  return new SuccessResponse('Protected route accessed', { user: req.user }).sendResponse(res);
});

// Routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/admin', examRoutes);

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

  // Close Redis connection if enabled
  if (features.redis.enabled && redis) {
    try {
      await redis.quit();
      console.log('Redis connection closed');
    } catch (err) {
      console.error('Error closing Redis connection:', err);
    }
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
    ensureMigrations();

    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Database connection failed');
    }

    // Start server
    httpServer.listen(serverConfig.port, () => {
      console.log(`Server ready on port ${serverConfig.port} in ${serverConfig.env} mode`);
      if (features.websocket.enabled) {
        console.log(`WebSocket endpoint: ws://localhost:${serverConfig.port}`);
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();