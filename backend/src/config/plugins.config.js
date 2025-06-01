export const corsConfig = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS?.split(',') 
    : true,
  credentials: true
};

export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'your-super-secret-key',
  sign: {
    expiresIn: '1d'
  }
};

export const postgresConfig = {
  connectionString: `postgres://${process.env.PG_USER}:${process.env.PG_PASSWORD}@${process.env.PG_HOST}:${process.env.PG_PORT}/${process.env.PG_DATABASE}`,
  ssl: process.env.NODE_ENV === 'production'
};

export const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  connectTimeout: 60000,
  lazyConnect: true,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: null
}; 