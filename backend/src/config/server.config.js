const serverConfig = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development'
};

const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
};

module.exports = {
  serverConfig,
  rateLimitConfig
}; 