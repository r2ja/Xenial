const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Post management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       required:
 *         - post_id
 *         - user_id
 *         - content
 *       properties:
 *         post_id:
 *           type: integer
 *           description: The auto-generated id of the post
 *         user_id:
 *           type: integer
 *           description: The id of the user who created the post
 *         content:
 *           type: string
 *           description: The content of the post
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The date and time when the post was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: The date and time when the post was last updated
 *         user_name:
 *           type: string
 *           description: The name of the user who created the post
 *         avatar_url:
 *           type: string
 *           description: The URL of the user's avatar
 *         likes_count:
 *           type: integer
 *           description: The number of likes the post has
 *         comments_count:
 *           type: integer
 *           description: The number of comments the post has
 *         reposts_count:
 *           type: integer
 *           description: The number of reposts the post has
 */

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Retrieve a list of posts
 *     tags: [Posts]
 *     description: Retrieve a list of posts from the database. The list is sorted by creation date in descending order.
 *     responses:
 *       200:
 *         description: A list of posts.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       500:
 *         description: Internal server error
 */
router.get('/', async (req, res) => {
  try {
    const { rows } = await req.app.locals.db.query(`
      SELECT p.*, u.username as user_name, up.avatar_url,
             (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.post_id) as likes_count,
             (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.post_id) as comments_count,
             (SELECT COUNT(*) FROM reposts r WHERE r.post_id = p.post_id) as reposts_count
      FROM posts p
      JOIN users u ON p.user_id = u.user_id
      JOIN user_profiles up ON u.user_id = up.user_id
      ORDER BY p.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/', async (req, res) => {
  try {
    // Ensure the user is authenticated
    if (!req.user || !req.user.user_id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { content } = req.body;
    
    // Validate content
    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Post content is required' });
    }

    // Insert the new post
    const { rows } = await req.app.locals.db.query(
      `INSERT INTO posts (user_id, content) 
       VALUES ($1, $2) 
       RETURNING *, 
         (SELECT username FROM users WHERE user_id = $1) as user_name,
         (SELECT avatar_url FROM user_profiles WHERE user_id = $1) as avatar_url`,
      [req.user.user_id, content]
    );

    // Add counts to the returned post object
    const postWithCounts = {
      ...rows[0],
      likes_count: 0,
      comments_count: 0,
      reposts_count: 0
    };

    res.status(201).json(postWithCounts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/posts/{postId}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: postId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the post to delete
 *     responses:
 *       204:
 *         description: Post deleted successfully
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { rowCount } = await req.app.locals.db.query('DELETE FROM posts WHERE post_id = $1', [postId]);
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/posts/search:
 *   get:
 *     summary: Search for posts and users
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Search query string
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 posts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Post'
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === '') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Sanitize the search query
    const sanitizedQuery = q.replace(/[^a-zA-Z0-9 ]/g, '').trim();
    
    // Split the sanitized query into words
    const searchWords = sanitizedQuery.split(/\s+/);
    
    // Create the parameterized query parts
    const queryParts = searchWords.map((_, index) => `$${index + 1}`);
    const likeExpressions = queryParts.map(part => `LOWER(p.content) LIKE LOWER('%' || ${part} || '%')`);
    
    // Construct the SQL query
    const searchQuery = `
      SELECT 
        p.post_id, 
        p.user_id, 
        p.content, 
        p.created_at, 
        p.updated_at,
        u.username as user_name,
        up.avatar_url,
        (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.post_id) as likes_count,
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.post_id) as comments_count,
        (SELECT COUNT(*) FROM reposts r WHERE r.post_id = p.post_id) as reposts_count,
        'post' as result_type
      FROM 
        posts p
      JOIN 
        users u ON p.user_id = u.user_id
      JOIN 
        user_profiles up ON u.user_id = up.user_id
      WHERE 
        ${likeExpressions.join(' OR ')}
      UNION ALL
      SELECT 
        u.user_id as post_id, 
        u.user_id, 
        up.full_name as content, 
        u.created_at, 
        u.updated_at,
        u.username as user_name,
        up.avatar_url,
        0 as likes_count,
        0 as comments_count,
        0 as reposts_count,
        'user' as result_type
      FROM 
        users u
      JOIN 
        user_profiles up ON u.user_id = up.user_id
      WHERE 
        ${queryParts.map(part => `LOWER(u.username) LIKE LOWER('%' || ${part} || '%')`).join(' OR ')} OR
        ${queryParts.map(part => `LOWER(up.full_name) LIKE LOWER('%' || ${part} || '%')`).join(' OR ')}
      ORDER BY 
        created_at DESC
      LIMIT 50;
    `;

    // Execute the query with parameterized values
    const { rows } = await req.app.locals.db.query(searchQuery, searchWords);

    // Separate posts and users
    const posts = rows.filter(row => row.result_type === 'post');
    const users = rows.filter(row => row.result_type === 'user');

    res.json({ posts, users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;