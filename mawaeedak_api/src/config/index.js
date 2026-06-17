module.exports = {
  jwt: {
    secret: process.env.JWT_SECRET || 'mawaeedak_super_secret_key_2024',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  },
  database: {
    name: process.env.DB_NAME || 'mawaeedak_db',
    path: process.env.DB_PATH || './database.sqlite'
  },
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development'
  }
};
