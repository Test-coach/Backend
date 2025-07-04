const Joi = require('joi');

const adminLoginSchema = Joi.object({
  email: Joi.string().email(),
  username: Joi.string(),
  password: Joi.string().min(6).required(),
}).or('email', 'username');

module.exports = { adminLoginSchema };
