const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const { authenticateJWT, refreshToken } = require("../middleware/auth");
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');

const client = new OAuth2Client(config.google.clientId);

router.post("/register", async (req, res) => {
  const client = await req.app.locals.db.connect();
  try {
    await client.query('BEGIN');

    const { username, email, password, firstName, lastName, dateOfBirth } = req.body;

    // Check if user already exists
    const userExists = await client.query(
      "SELECT * FROM users WHERE username = $1 OR email = $2",
      [username, email]
    );

    if (userExists.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: "Username or email already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user
    const userResult = await client.query(
      "INSERT INTO users (username, email, password_hash, first_name, last_name, date_of_birth) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [username, email, hashedPassword, firstName, lastName, dateOfBirth]
    );

    const user = userResult.rows[0];

    // Create user profile
    await client.query(
      "INSERT INTO user_profiles (user_id, full_name) VALUES ($1, $2)",
      [user.user_id, `${firstName} ${lastName}`]
    );

    await client.query('COMMIT');

    // Create tokens
    const accessToken = jwt.sign({ user_id: user.user_id }, config.jwtSecret, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ user_id: user.user_id }, config.refreshTokenSecret, { expiresIn: '7d' });

    res.status(201).json({ 
      user: { user_id: user.user_id, username: user.username, email: user.email },
      accessToken,
      refreshToken
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
});

router.post("/login", async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    // Find user
    const result = await req.app.locals.db.query(
      "SELECT * FROM users WHERE email = $1 OR username = $1",
      [emailOrUsername]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];

    // Check password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Create tokens
    const accessToken = jwt.sign({ user_id: user.user_id }, config.jwtSecret, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ user_id: user.user_id }, config.refreshTokenSecret, { expiresIn: '7d' });

    res.json({ 
      user: { user_id: user.user_id, username: user.username, email: user.email },
      accessToken,
      refreshToken
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/refresh-token", refreshToken);

router.post("/logout", authenticateJWT, (req, res) => {
  // In a real-world scenario, you might want to invalidate the refresh token here
  res.json({ message: "Logged out successfully" });
});
router.post("/google-login", async (req, res) => {
  try {
    const { token } = req.body;

    // Use the access token to fetch the user's information from Google
    const googleUserInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const { email, name, picture } = googleUserInfo.data;

    // Check if user exists, if not, create a new user
    let user = await req.app.locals.db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (user.rows.length === 0) {
      // Create new user
      const result = await req.app.locals.db.query(
        "INSERT INTO users (email, username, google_id, full_name) VALUES ($1, $2, $3, $4) RETURNING *",
        [email, email.split('@')[0], email, name]
      );
      user = result.rows[0];
    } else {
      user = user.rows[0];
    }

    // Create tokens
    const accessToken = jwt.sign({ user_id: user.user_id }, config.jwtSecret, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ user_id: user.user_id }, config.refreshTokenSecret, { expiresIn: '7d' });

    res.json({ 
      user: { user_id: user.user_id, username: user.username, email: user.email },
      accessToken,
      refreshToken
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;