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
  host: process.env.PG_HOST || 'localhost',
  port: parseInt(process.env.PG_PORT || '5432'),
  user: process.env.PG_USER || 'dev',
  password: process.env.PG_PASSWORD || 'password',
  database: process.env.PG_DATABASE || 'myappdb',
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