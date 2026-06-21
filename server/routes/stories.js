const express = require("express");
const router = express.Router();
const Story = require("../models/Story");
const { sanitizeBody } = require("../middleware/sanitize");
const { clean } = require("../middleware/profanityFilter");
const { body, validationResult } = require("express-validator");

// ── GET /api/stories — fetch active stories
router.get("/", async (req, res) => {
  try {
    const stories = await Story.find().sort({ createdAt: -1 }).lean();
    res.json(stories);
  } catch (err) {
    res.status(500).json({ error: "Failed to load stories" });
  }
});

// ── POST /api/stories — create a story
router.post(
  "/",
  sanitizeBody,
  [
    body("content").notEmpty().isLength({ max: 200 }),
    body("author").notEmpty().isLength({ max: 30 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { content, author, authorColor, theme } = req.body;
      const story = await Story.create({
        content: clean(content),
        author: clean(author),
        authorColor,
        theme: theme || "fire",
      });
      res.status(201).json(story);
    } catch (err) {
      res.status(500).json({ error: "Failed to create story" });
    }
  }
);

module.exports = router;
