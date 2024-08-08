const express = require("express");
const router = express.Router();
const { authenticateJWT } = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcrypt");
const fs = require("fs");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '..', 'uploads');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.get("/profile", authenticateJWT, async (req, res) => {
  try {
    console.log("Fetching profile for user:", req.user.user_id);
    const { rows } = await req.app.locals.db.query(
      `
      SELECT u.user_id, u.username, u.email, up.full_name, up.avatar_url, up.bio,
             (SELECT COUNT(*) FROM followers WHERE followed_id = u.user_id) as followers_count,
             (SELECT COUNT(*) FROM followers WHERE follower_id = u.user_id) as following_count,
             (SELECT COUNT(*) FROM likes WHERE user_id = u.user_id) as likes_count
      FROM users u
      LEFT JOIN user_profiles up ON u.user_id = up.user_id
      WHERE u.user_id = $1
    `,
      [req.user.user_id]
    );

    if (rows.length > 0 && rows[0].avatar_url) {
      const fullPath = path.join(
        __dirname,
        "..",
        "uploads",
        path.basename(rows[0].avatar_url)
      );
      console.log("Full avatar path:", fullPath);

      if (fs.existsSync(fullPath)) {
        console.log("Avatar file exists");
        rows[0].avatar_url = `/uploads/${path.basename(rows[0].avatar_url)}`;
      } else {
        console.log("Avatar file does not exist");
        rows[0].avatar_url = null;
      }
    }

    console.log("Sending user data:", rows[0]);
    res.json(rows[0]);
  } catch (err) {
    console.error("Error in /profile route:", err);
    res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
});

router.get("/posts", authenticateJWT, async (req, res) => {
  try {
    console.log("Fetching posts for user:", req.user.user_id);
    const { rows } = await req.app.locals.db.query(
      `
      SELECT p.*, 
             (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.post_id) as likes_count,
             (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.post_id) as comments_count,
             (SELECT COUNT(*) FROM reposts r WHERE r.post_id = p.post_id) as reposts_count
      FROM posts p
      WHERE p.user_id = $1
      ORDER BY p.created_at DESC
    `,
      [req.user.user_id]
    );

    console.log("Posts query result:", rows);
    res.json(rows);
  } catch (err) {
    console.error("Error in /posts route:", err);
    res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { rows } = await req.app.locals.db.query(
      `
      SELECT u.user_id, u.username, u.email, up.full_name, up.avatar_url, up.bio,
             (SELECT COUNT(*) FROM followers WHERE followed_id = u.user_id) as followers_count,
             (SELECT COUNT(*) FROM followers WHERE follower_id = u.user_id) as following_count,
             (SELECT COUNT(*) FROM likes WHERE user_id = u.user_id) as likes_count
      FROM users u
      LEFT JOIN user_profiles up ON u.user_id = up.user_id
      WHERE u.user_id = $1
    `,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put(
  "/profile",
  authenticateJWT,
  upload.single("avatar"),
  async (req, res) => {
    try {
      console.log("Received profile update request:", req.body);
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
          `
          SELECT u.user_id, u.username, u.email, up.full_name, up.avatar_url, up.bio,
                 (SELECT COUNT(*) FROM followers WHERE followed_id = u.user_id) as followers_count,
                 (SELECT COUNT(*) FROM followers WHERE follower_id = u.user_id) as following_count,
                 (SELECT COUNT(*) FROM likes WHERE user_id = u.user_id) as likes_count
          FROM users u
          LEFT JOIN user_profiles up ON u.user_id = up.user_id
          WHERE u.user_id = $1
        `,
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
      res
        .status(500)
        .json({ error: "Internal server error", details: err.message });
    }
  }
);

module.exports = router;