const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const { postCreateLimiter } = require("../middleware/rateLimiter");
const { sanitizeBody } = require("../middleware/sanitize");
const { clean } = require("../middleware/profanityFilter");
const { body, validationResult } = require("express-validator");

// ── GET /api/posts — fetch posts (paginated, sortable, searchable)
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 20, sort = "latest", search, tag, room } = req.query;

    const query = { hidden: false };
    if (room) query.room = room;
    if (tag) query.tags = tag;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } }
      ];
    }

    let sortObj = {};
    if (sort === "liked") sortObj = { likes: -1 };
    else if (sort === "trending") sortObj = { likes: -1, createdAt: -1 };
    else sortObj = { createdAt: -1 };

    const posts = await Post.find(query)
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const total = await Post.countDocuments(query);
    res.json({ posts, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: "Failed to load posts" });
  }
});

// ── POST /api/posts — create a new post
router.post(
  "/",
  postCreateLimiter,
  sanitizeBody,
  [
    body("title").notEmpty().isLength({ max: 120 }),
    body("content").notEmpty().isLength({ max: 2000 }),
    body("author").notEmpty().isLength({ max: 30 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { title, content, tags, author, authorColor, room, sessionId, theme } = req.body;
      const VALID_THEMES = [
        "default", "starfield", "glitch", "polaroid"
      ];
      const post = await Post.create({
        title: clean(title),
        content: clean(content),
        tags: (tags || []).map((t) => clean(t)).slice(0, 5),
        author: clean(author),
        authorColor,
        room: room || "global",
        sessionId,
        theme: VALID_THEMES.includes(theme) ? theme : "default",
      });
      res.status(201).json(post);
    } catch (err) {
      res.status(500).json({ error: "Failed to create post" });
    }
  }
);

// ── GET /api/posts/trending-tags — top 10 tags by frequency
router.get("/trending-tags", async (req, res) => {
  try {
    const agg = await Post.aggregate([
      { $match: { hidden: false, tags: { $exists: true, $not: { $size: 0 } } } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 12 },
    ]);
    res.json(agg.map((a) => ({ tag: a._id, count: a.count })));
  } catch (err) {
    res.status(500).json([]);
  }
});


// ── POST /api/posts/:id/like — toggle like
router.post("/:id/like", async (req, res) => {
  try {
    const { sessionId } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const idx = post.likedBy.indexOf(sessionId);
    if (idx === -1) {
      post.likedBy.push(sessionId);
      post.likes += 1;
    } else {
      post.likedBy.splice(idx, 1);
      post.likes = Math.max(0, post.likes - 1);
    }
    await post.save();
    res.json({ likes: post.likes, liked: idx === -1 });
  } catch (err) {
    res.status(500).json({ error: "Failed to toggle like" });
  }
});

// ── POST /api/posts/:id/comment — add comment
router.post("/:id/comment", sanitizeBody, async (req, res) => {
  try {
    const { author, authorColor, content } = req.body;
    if (!content || content.length > 500) return res.status(400).json({ error: "Invalid comment" });

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          comments: { author: clean(author), authorColor, content: clean(content) },
        },
      },
      { new: true }
    );
    res.json(post.comments);
  } catch (err) {
    res.status(500).json({ error: "Failed to add comment" });
  }
});

// ── POST /api/posts/:id/bookmark — toggle bookmark
router.post("/:id/bookmark", async (req, res) => {
  try {
    const { sessionId } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Not found" });

    const idx = post.bookmarkedBy.indexOf(sessionId);
    if (idx === -1) post.bookmarkedBy.push(sessionId);
    else post.bookmarkedBy.splice(idx, 1);
    await post.save();
    res.json({ bookmarked: idx === -1 });
  } catch (err) {
    res.status(500).json({ error: "Failed to bookmark" });
  }
});

// ── DELETE /api/posts/:id — delete own post (by sessionId)
router.delete("/:id", async (req, res) => {
  try {
    const { sessionId } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Not found" });
    if (post.sessionId !== sessionId) return res.status(403).json({ error: "Not your post" });
    await post.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete" });
  }
});

// ── POST /api/posts/:id/react — quick emoji react
router.post("/:id/react", async (req, res) => {
  try {
    const { emoji, sessionId } = req.body;
    const ALLOWED = ["👍", "❤️", "😂", "😮", "🔥", "🎉", "😍"];
    if (!ALLOWED.includes(emoji)) return res.status(400).json({ error: "Invalid emoji" });
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Not found" });
    const cur = post.quickReacts.get(emoji) || 0;
    post.quickReacts.set(emoji, cur + 1);
    await post.save();
    const obj = {};
    post.quickReacts.forEach((v, k) => { obj[k] = v; });
    res.json({ quickReacts: obj });
  } catch (err) {
    res.status(500).json({ error: "Failed to react" });
  }
});

module.exports = router;