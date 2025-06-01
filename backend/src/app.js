import Fastify from 'fastify';
import postgres from '@fastify/postgres';
import redis from '@fastify/redis';
import websocket from '@fastify/websocket';
import jwt from '@fastify/jwt';
import cors from '@fastify/cors';
import helmet from 'helmet';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './auth/routes/auth.route.js';
import { connectMongo } from './db/mongo.js';

import { fastifyConfig } from './config/fastify.config.js';
import { corsConfig, jwtConfig, postgresConfig, redisConfig } from './config/plugins.config.js';
import { serverConfig } from './config/server.config.js';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the correct path
dotenv.config({ path: path.join(__dirname, '../../config/env/development.env') });

const server = Fastify(fastifyConfig);

const initialize = async () => {
  try {
    // Security
    await server.register(helmet);
    await server.register(cors, corsConfig);

    // Add request logging
    server.addHook('onRequest', (request, reply, done) => {
      const start = Date.now();
      reply.raw.on('finish', () => {
        const duration = Date.now() - start;
        server.log.info({
          method: request.method,
          url: request.url,
          statusCode: reply.statusCode,
          duration: `${duration}ms`,
          userAgent: request.headers['user-agent'],
          ip: request.ip
        }, 'Request completed');
      });
      done();
    });

    // JWT
    await server.register(jwt, jwtConfig);

    // Add JWT authentication hook
    server.addHook('onRequest', async function(request, reply) {
      try {
        if (request.url.startsWith('/auth/') || request.url === '/health') {
          return;
        }
        await request.jwtVerify();
      } catch (err) {
        reply.code(401).send({ error: 'Unauthorized' });
      }
    });

    // Bcrypt
    const saltRounds = parseInt(process.env.SALT_ROUNDS || '12');
    server.decorate('bcrypt', {
      hash: (password) => bcrypt.hash(password, saltRounds),
      compare: (password, hash) => bcrypt.compare(password, hash)
    });

    // PostgreSQL
    await server.register(postgres, postgresConfig);

    // Redis
    await server.register(redis, redisConfig);

    // MongoDB
    await connectMongo();
    server.log.info('MongoDB connected successfully');

    // WebSockets
    await server.register(websocket);

    // Register auth routes
    await server.register(authRoutes, { prefix: '/auth' });

    // Health check
    server.get('/health', async () => ({ 
      status: 'OK', 
      db: 'PostgreSQL', 
      cache: 'Redis',
      nosql: 'MongoDB',
      timestamp: new Date().toISOString()
    }));

    // Test Routes
    server.get('/test-db', async () => {
      const client = await server.pg.connect();
      try {
        const { rows } = await client.query('SELECT NOW() as time, current_database() as db');
        return rows[0];
      } finally {
        client.release();
      }
    });

    // WebSocket Endpoint
    server.register(async (fastify) => {
      fastify.get('/ws', { websocket: true }, (connection, req) => {
        connection.socket.on('message', (message) => {
          fastify.redis.publish('ws:messages', message.toString());
        });

        fastify.redis.subscribe('ws:messages', (err) => {
          if (err) connection.socket.close(1011, 'Subscription failed');
        });

        fastify.redis.on('message', (channel, msg) => {
          if (channel === 'ws:messages') {
            connection.socket.send(`Broadcast: ${msg}`);
          }
        });
      });
    });

    server.get('/protected', {
      preHandler: server.jwt.authenticate
    }, async (request) => {
      return { message: 'This is a protected route', user: request.user };
    });

    // Graceful Shutdown
    ['SIGINT', 'SIGTERM'].forEach(signal => {
      process.on(signal, async () => {
        server.log.info(`Shutting down on ${signal}`);
        await server.close();
        process.exit(0);
      });
    });

    // Start Server
    await server.listen(serverConfig);
    server.log.info(`Server ready on ${server.server.address().port}`);
    server.log.info(`WebSocket endpoint: ws://localhost:${server.server.address().port}/ws`);

  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

initialize();