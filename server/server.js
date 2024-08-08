require('dotenv').config();
const express = require("express");
const { Pool } = require("pg");
const path = require('path');
const cors = require('cors');
const config = require("./config/config");
const app = require("./app");

const port = config.port || 3000;

const pool = new Pool({
  user: config.db.user,
  host: config.db.host,
  database: config.db.database,
  password: config.db.password,
  port: config.db.port,
});

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Error connecting to the database", err);
  } else {
    console.log("Connected to the database");
  }
});

app.locals.db = pool;

// CORS configuration
app.use(cors({
  origin: "http://localhost:5173", // or your frontend URL
  credentials: true
}));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path, stat) => {
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Swagger UI: http://localhost:${port}/api-docs`);
});