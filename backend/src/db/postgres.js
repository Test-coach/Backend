import postgres from '@fastify/postgres';

export const pgPlugin = async (fastify) => {
  fastify.register(postgres, {
    connectionString: `postgres://${process.env.PG_USER}:${process.env.PG_PASSWORD}@${process.env.PG_HOST}:${process.env.PG_PORT}/${process.env.PG_DATABASE}`
  });
};