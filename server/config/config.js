require("dotenv").config();

module.exports = {
  port: process.env.PORT || 3000,
  db: {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  },
  jwtSecret: process.env.JWT_SECRET || '8f4b6c2a1e9d7f3b5a0c8e6d4a2b0f1e9c7d5a3b1f0e8a6c4d2',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID
  }
};