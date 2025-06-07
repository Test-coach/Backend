const dotenv = require('dotenv');
dotenv.config();

const features = {
  redis: {
    enabled: process.env.ENABLE_REDIS === 'true',
    url: process.env.REDIS_URL
  },
  websocket: {
    enabled: process.env.ENABLE_WEBSOCKET === 'true'
  }
};

module.exports = features; 