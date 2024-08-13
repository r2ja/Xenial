const express = require("express");
const cors = require("cors");
const config = require("./config/config");
const app = require("./app");
const { Pool } = require("pg");
const path = require("path");


const port = config.port || 3000;

const pool = new Pool(config.db);

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Error connecting to the database", err);
  } else {
    console.log("Connected to the database");
  }
});

app.locals.db = pool;

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path, stat) => {
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Swagger UI: http://localhost:${port}/api-docs`);
});

console.log("Registered routes:");
app._router.stack.forEach(function(r){
  if (r.route && r.route.path){
    console.log(r.route.path)
  }
});
