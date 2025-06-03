export const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: '24h'
};

export const passwordConfig = {
  saltRounds: parseInt(process.env.SALT_ROUNDS || '12')
}; 