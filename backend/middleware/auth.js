const jwt = require('jsonwebtoken');
const config = require('../config/config');

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, config.jwtSecret, (err, user) => {
      if (err) {
        console.error('JWT verification error:', err);
        return res.status(403).json({ error: 'Invalid token' });
      }

      console.log('Decoded user from JWT:', user);
      req.user = {
        ...user,
        user_id: Number(user.user_id)
      };
      console.log('Modified req.user:', req.user);
      next();
    });
  } else {
    res.status(401).json({ error: 'No token provided' });
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

    const accessToken = jwt.sign({ user_id: Number(user.user_id) }, config.jwtSecret, { expiresIn: '15m' });
    res.json({ accessToken });
  });
};

module.exports = { authenticateJWT, refreshToken };