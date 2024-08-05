const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { OAuth2Client } = require('google-auth-library');
const config = require('../config/config');

const client = new OAuth2Client(config.google.clientId);

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - first_name
 *         - last_name
 *         - date_of_birth
 *       properties:
 *         user_id:
 *           type: integer
 *           description: The auto-generated id of the user
 *         username:
 *           type: string
 *           description: The user's username
 *         email:
 *           type: string
 *           description: The user's email (generated from username if not provided)
 *         first_name:
 *           type: string
 *           description: The user's first name
 *         last_name:
 *           type: string
 *           description: The user's last name
 *         date_of_birth:
 *           type: string
 *           format: date
 *           description: The user's date of birth (YYYY-MM-DD)
 *         google_id:
 *           type: string
 *           description: The user's Google ID (if logged in with Google)
 */

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - first_name
 *               - last_name
 *               - password
 *               - confirm_password
 *               - date_of_birth
 *             properties:
 *               username:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               password:
 *                 type: string
 *               confirm_password:
 *                 type: string
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input
 *       409:
 *         description: Username already exists
 *       500:
 *         description: Internal server error
 */
router.post('/register', async (req, res) => {
  try {
    const { username, first_name, last_name, password, confirm_password, date_of_birth } = req.body;

    // Validate input
    if (password !== confirm_password) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Validate date_of_birth format (MM/DD/YYYY)
    const dobRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
    if (!dobRegex.test(date_of_birth)) {
      return res.status(400).json({ error: 'Invalid date format. Use MM/DD/YYYY' });
    }

    // Convert date_of_birth to YYYY-MM-DD for database storage
    const [month, day, year] = date_of_birth.split('/');
    const formattedDob = `${year}-${month}-${day}`;

    // Check if username already exists
    const userExists = await req.app.locals.db.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (userExists.rows.length > 0) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user
    const result = await req.app.locals.db.query(
      'INSERT INTO users (username, first_name, last_name, password_hash, date_of_birth) VALUES ($1, $2, $3, $4, $5) RETURNING user_id, username, first_name, last_name, date_of_birth, email',
      [username, first_name, last_name, hashedPassword, formattedDob]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username or email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username or email
    const result = await req.app.locals.db.query(
      'SELECT * FROM users WHERE username = $1 OR email = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign({ user_id: user.user_id }, config.jwtSecret, { expiresIn: '1d' });

    res.json({ 
      token, 
      user: { 
        user_id: user.user_id, 
        username: user.username, 
        email: user.email,
        first_name: user.first_name, 
        last_name: user.last_name, 
        date_of_birth: user.date_of_birth 
      } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /auth/google:
 *   post:
 *     summary: Login or register a user with Google
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Google ID token
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid token
 *       500:
 *         description: Internal server error
 */
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: config.google.clientId,
    });
    const { sub, email, given_name, family_name } = ticket.getPayload();

    // Check if user exists
    let result = await req.app.locals.db.query(
      'SELECT * FROM users WHERE google_id = $1 OR email = $2',
      [sub, email]
    );

    let user;
    if (result.rows.length === 0) {
      // Register new user
      result = await req.app.locals.db.query(
        'INSERT INTO users (username, email, first_name, last_name, google_id) VALUES ($1, $2, $3, $4, $5) RETURNING user_id, username, email, first_name, last_name, google_id',
        [email.split('@')[0], email, given_name, family_name, sub]
      );
      user = result.rows[0];
    } else {
      user = result.rows[0];
      if (!user.google_id) {
        // Update existing user with Google ID
        await req.app.locals.db.query(
          'UPDATE users SET google_id = $1, first_name = $2, last_name = $3 WHERE user_id = $4',
          [sub, given_name, family_name, user.user_id]
        );
        user.google_id = sub;
        user.first_name = given_name;
        user.last_name = family_name;
      }
    }

    // Generate JWT
    const jwtToken = jwt.sign({ user_id: user.user_id }, config.jwtSecret, { expiresIn: '1d' });

    res.json({ token: jwtToken, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Middleware to verify JWT
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, config.jwtSecret, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }

      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

module.exports = { router, authenticateJWT };