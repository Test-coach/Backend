export const fastifyConfig = {
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
        messageFormat: '{msg}',
        levelFirst: true
      }
    }
  },
  disableRequestLogging: process.env.NODE_ENV === 'production'
}; 