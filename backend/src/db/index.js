// PostgreSQL
const postgres = require('./postgres');
const User = require('./postgres/models/user.model');
const Order = require('./postgres/models/order.model');
const Coupon = require('./postgres/models/coupon.model');

// MongoDB
const mongo = require('./mongo');
const Course = require('./mongo/models/course.model');
const Keystroke = require('./mongo/models/keystroke.model');

module.exports = {
  // Database connections
  postgres,
  mongo,

  // PostgreSQL models
  User,
  Order,
  Coupon,

  // MongoDB models
  Course,
  Keystroke
}; 