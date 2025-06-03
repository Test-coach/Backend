export const postgresConfig = {
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT
};

export const redisConfig = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
}; 