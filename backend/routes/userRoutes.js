const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - user_id
 *         - username
 *         - email
 *       properties:
 *         user_id:
 *           type: integer
 *           description: The auto-generated id of the user
 *         username:
 *           type: string
 *           description: The username
 *         email:
 *           type: string
 *           description: The user email
 *         full_name:
 *           type: string
 *           description: The user's full name
 *         avatar_url:
 *           type: string
 *           description: URL of the user's profile picture
 */

/**
 * @swagger
 * /api/users/{userId}:
 *   get:
 *     summary: Get a user's profile
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the user to get
 *     responses:
 *       200:
 *         description: User profile information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { rows } = await req.app.locals.db.query(
      `SELECT u.user_id, u.username, u.email, up.full_name, up.avatar_url
       FROM users u
       JOIN user_profiles up ON u.user_id = up.user_id
       WHERE u.user_id = $1`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;