const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: '24h'
};

const passwordConfig = {
  saltRounds: parseInt(process.env.SALT_ROUNDS || '12')
};

module.exports = {
  jwtConfig,
  passwordConfig
}; 