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
  jwtSecret: '8f4b6c2a1e9d7f3b5a0c8e6d4a2b0f1e9c7d5a3b1f0e8a6c4d2',
  google : {
    clientId: '128196627423-2adlv8of8ait9and9o4rq9nopave9u2a.apps.googleusercontent.com'
  }
};
