const jwt = require('jsonwebtoken');
const config = require('../config/config');

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, config.jwtSecret, (err, user) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Token expired', authenticated: false });
        }
        return res.status(403).json({ error: 'Invalid token', authenticated: false });
      }

      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ error: 'No token provided', authenticated: false });
  }
};

const refreshToken = (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token required' });
  }

  jwt.verify(refreshToken, config.refreshTokenSecret, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    const accessToken = jwt.sign({ user_id: user.user_id }, config.jwtSecret, { expiresIn: '15m' });
    res.json({ accessToken });
  });
};

module.exports = { authenticateJWT, refreshToken };