const express = require("express");
const router = express.Router();
const { authenticateJWT } = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcrypt");
const fs = require("fs");

// Multer configuration (unchanged)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "..", "uploads");
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

router.get("/me/profile", authenticateJWT, async (req, res) => {
  console.log("Accessed /api/users/me/profile route");
  try {
    const userId = req.user.user_id;
    const query = `
      SELECT u.user_id, u.username, u.email, up.full_name, up.avatar_url, up.bio,
        (SELECT COUNT(*) FROM followers WHERE followed_id = u.user_id) as followers_count,
        (SELECT COUNT(*) FROM followers WHERE follower_id = u.user_id) as following_count,
        (SELECT COUNT(*) FROM likes WHERE user_id = u.user_id) as likes_count,
        (SELECT COUNT(*) FROM reposts WHERE user_id = u.user_id) as reposts_count
      FROM users u
      LEFT JOIN user_profiles up ON u.user_id = up.user_id
      WHERE u.user_id = $1
    `;
    const { rows } = await req.app.locals.db.query(query, [userId]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

router.get("/me/posts", authenticateJWT, async (req, res) => {
  console.log("Accessed /api/users/me/posts route");
  try {
    const userId = req.user.user_id;
    const query = `
      SELECT p.*, 
        (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.post_id) as likes_count,
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.post_id) as comments_count,
        (SELECT COUNT(*) FROM reposts r WHERE r.post_id = p.post_id) as reposts_count
      FROM posts p
      WHERE p.user_id = $1
      ORDER BY p.created_at DESC
    `;
    const { rows } = await req.app.locals.db.query(query, [userId]);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching user posts:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

router.put("/me/settings", authenticateJWT, upload.single("avatar"), async (req, res) => {
  console.log("Accessed /api/users/me/settings route");
  try {
    const { firstName, lastName, bio, password, username, email } = req.body;
    const userId = req.user.user_id;
    const client = await req.app.locals.db.connect();
    
    try {
      await client.query("BEGIN");
      await client.query(
        "UPDATE users SET username = $1, email = $2 WHERE user_id = $3",
        [username, email, userId]
      );
      const fullName = `${firstName} ${lastName}`.trim();
      await client.query(
        "UPDATE user_profiles SET full_name = $1, bio = $2 WHERE user_id = $3",
        [fullName, bio, userId]
      );
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await client.query(
          "UPDATE users SET password_hash = $1 WHERE user_id = $2",
          [hashedPassword, userId]
        );
      }
      if (req.file) {
        const avatarUrl = `/uploads/${req.file.filename}`;
        await client.query(
          "UPDATE user_profiles SET avatar_url = $1 WHERE user_id = $2",
          [avatarUrl, userId]
        );
      }
      await client.query("COMMIT");
      const { rows } = await client.query(
        `SELECT u.user_id, u.username, u.email, up.full_name, up.avatar_url, up.bio,
                (SELECT COUNT(*) FROM followers WHERE followed_id = u.user_id) as followers_count,
                (SELECT COUNT(*) FROM followers WHERE follower_id = u.user_id) as following_count,
                (SELECT COUNT(*) FROM likes WHERE user_id = u.user_id) as likes_count
         FROM users u
         LEFT JOIN user_profiles up ON u.user_id = up.user_id
         WHERE u.user_id = $1`,
        [userId]
      );
      res.json(rows[0]);
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Error in profile update:", err);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

// Get user profile by username
router.get("/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const query = `
      SELECT u.user_id, u.username, u.email, up.full_name, up.avatar_url, up.bio,
        (SELECT COUNT(*) FROM followers WHERE followed_id = u.user_id) as followers_count,
        (SELECT COUNT(*) FROM followers WHERE follower_id = u.user_id) as following_count,
        (SELECT COUNT(*) FROM likes WHERE user_id = u.user_id) as likes_count,
        (SELECT COUNT(*) FROM reposts WHERE user_id = u.user_id) as reposts_count
      FROM users u
      LEFT JOIN user_profiles up ON u.user_id = up.user_id
      WHERE u.username = $1
    `;
    const { rows } = await req.app.locals.db.query(query, [username]);
    if (rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get user posts
router.get("/:username/posts", async (req, res) => {
  try {
    const { username } = req.params;
    const query = `
      SELECT p.*, u.username as user_name, up.avatar_url,
        (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.post_id) as likes_count,
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.post_id) as comments_count,
        (SELECT COUNT(*) FROM reposts r WHERE r.post_id = p.post_id) as reposts_count
      FROM posts p
      JOIN users u ON p.user_id = u.user_id
      LEFT JOIN user_profiles up ON u.user_id = up.user_id
      WHERE u.username = $1
      ORDER BY p.created_at DESC
    `;
    const { rows } = await req.app.locals.db.query(query, [username]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get user stats
router.get("/:username/stats", async (req, res) => {
  try {
    const { username } = req.params;
    const query = `
      SELECT
        (SELECT COUNT(*) FROM followers WHERE followed_id = u.user_id) as followers_count,
        (SELECT COUNT(*) FROM followers WHERE follower_id = u.user_id) as following_count,
        (SELECT COUNT(*) FROM likes WHERE user_id = u.user_id) as likes_count,
        (SELECT COUNT(*) FROM reposts WHERE user_id = u.user_id) as reposts_count
      FROM users u
      WHERE u.username = $1
    `;
    const { rows } = await req.app.locals.db.query(query, [username]);
    if (rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get follow status
router.get("/:username/follow-status", authenticateJWT, async (req, res) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user.user_id;
    const query = `
      SELECT EXISTS (
        SELECT 1 FROM followers f
        JOIN users u ON f.followed_id = u.user_id
        WHERE f.follower_id = $1 AND u.username = $2
      ) as is_following
    `;
    const { rows } = await req.app.locals.db.query(query, [currentUserId, username]);
    res.json({ isFollowing: rows[0].is_following });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Toggle follow
router.post("/:username/follow", authenticateJWT, async (req, res) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user.user_id;

    // Get the user_id of the user to follow/unfollow
    const userQuery = "SELECT user_id FROM users WHERE username = $1";
    const userResult = await req.app.locals.db.query(userQuery, [username]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const targetUserId = userResult.rows[0].user_id;

    if (currentUserId === targetUserId) {
      return res.status(400).json({ error: "You cannot follow yourself" });
    }

    const followQuery = `
      SELECT * FROM followers 
      WHERE follower_id = $1 AND followed_id = $2
    `;
    const followResult = await req.app.locals.db.query(followQuery, [currentUserId, targetUserId]);

    if (followResult.rows.length > 0) {
      // Unfollow
      await req.app.locals.db.query(
        "DELETE FROM followers WHERE follower_id = $1 AND followed_id = $2",
        [currentUserId, targetUserId]
      );
      res.json({ message: "Unfollowed successfully", isFollowing: false });
    } else {
      // Follow
      await req.app.locals.db.query(
        "INSERT INTO followers (follower_id, followed_id) VALUES ($1, $2)",
        [currentUserId, targetUserId]
      );
      res.json({ message: "Followed successfully", isFollowing: true });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/profile", async (req, res) => {
  console.log("Accessed /api/users/profile route without auth");
  res.json({ message: "Profile route working" });


  try {
    const userId = req.user.user_id;
    const query = `
      SELECT u.user_id, u.username, u.email, up.full_name, up.avatar_url, up.bio,
        (SELECT COUNT(*) FROM followers WHERE followed_id = u.user_id) as followers_count,
        (SELECT COUNT(*) FROM followers WHERE follower_id = u.user_id) as following_count,
        (SELECT COUNT(*) FROM likes WHERE user_id = u.user_id) as likes_count,
        (SELECT COUNT(*) FROM reposts WHERE user_id = u.user_id) as reposts_count
      FROM users u
      LEFT JOIN user_profiles up ON u.user_id = up.user_id
      WHERE u.user_id = $1
    `;
    const { rows } = await req.app.locals.db.query(query, [userId]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

router.get("/posts", authenticateJWT, async (req, res) => {
  console.log("Accessed /api/users/posts route");
  res.json({ message: "Posts route working" });


  try {
    const userId = req.user.user_id;
    const query = `
      SELECT p.*, 
        (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.post_id) as likes_count,
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.post_id) as comments_count,
        (SELECT COUNT(*) FROM reposts r WHERE r.post_id = p.post_id) as reposts_count
      FROM posts p
      WHERE p.user_id = $1
      ORDER BY p.created_at DESC
    `;
    const { rows } = await req.app.locals.db.query(query, [userId]);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching user posts:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

router.put("/profile", authenticateJWT, upload.single("avatar"), async (req, res) => {
  try {
    const { firstName, lastName, bio, password, username, email } = req.body;
    const userId = req.user.user_id;
    const client = await req.app.locals.db.connect();
    
    try {
      await client.query("BEGIN");
      await client.query(
        "UPDATE users SET username = $1, email = $2 WHERE user_id = $3",
        [username, email, userId]
      );
      const fullName = `${firstName} ${lastName}`.trim();
      await client.query(
        "UPDATE user_profiles SET full_name = $1, bio = $2 WHERE user_id = $3",
        [fullName, bio, userId]
      );
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await client.query(
          "UPDATE users SET password_hash = $1 WHERE user_id = $2",
          [hashedPassword, userId]
        );
      }
      if (req.file) {
        const avatarUrl = `/uploads/${req.file.filename}`;
        await client.query(
          "UPDATE user_profiles SET avatar_url = $1 WHERE user_id = $2",
          [avatarUrl, userId]
        );
      }
      await client.query("COMMIT");
      const { rows } = await client.query(
        `SELECT u.user_id, u.username, u.email, up.full_name, up.avatar_url, up.bio,
                (SELECT COUNT(*) FROM followers WHERE followed_id = u.user_id) as followers_count,
                (SELECT COUNT(*) FROM followers WHERE follower_id = u.user_id) as following_count,
                (SELECT COUNT(*) FROM likes WHERE user_id = u.user_id) as likes_count
         FROM users u
         LEFT JOIN user_profiles up ON u.user_id = up.user_id
         WHERE u.user_id = $1`,
        [userId]
      );
      res.json(rows[0]);
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Error in profile update:", err);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

console.log("userRoutes is being loaded");

router.use((req, res, next) => {
  console.log(`Unmatched user route: ${req.method} ${req.path}`);
  next();
});

module.exports = router;