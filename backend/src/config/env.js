require('dotenv').config();

const env = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  db: {
    dialect: (process.env.DB_DIALECT || 'postgres').toLowerCase(),
    storage: process.env.DB_STORAGE || './data/biblioteca.sqlite',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_NAME || 'biblioteca',
    user: process.env.DB_USER || 'biblioteca',
    pass: process.env.DB_PASS || 'biblioteca',
    sync: (process.env.DB_SYNC || 'alter').toLowerCase(),
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'segredo-de-desenvolvimento',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },

  admin: {
    name: process.env.ADMIN_NAME || 'Administrador',
    email: process.env.ADMIN_EMAIL || 'admin@biblioteca.com',
    password: process.env.ADMIN_PASSWORD || 'admin123',
  },

  corsOrigin: process.env.CORS_ORIGIN || '*',
};

module.exports = env;
