const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const { messageLimiter } = require("../middleware/rateLimiter");
const { sanitizeBody } = require("../middleware/sanitize");
const { clean } = require("../middleware/profanityFilter");

// ── GET /api/messages/:room — load last 50 messages for a room
router.get("/:room", async (req, res) => {
  try {
    const messages = await Message.find({
      room: req.params.room,
      deleted: false,
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.json(messages.reverse()); // oldest first
  } catch (err) {
    res.status(500).json({ error: "Failed to load messages" });
  }
});

// ── DELETE /api/messages/:id — delete own message
router.delete("/:id", async (req, res) => {
  try {
    const { sessionId } = req.body;
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ error: "Not found" });
    if (msg.sessionId !== sessionId) return res.status(403).json({ error: "Not your message" });
    msg.deleted = true;
    msg.content = "[message deleted]";
    await msg.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete" });
  }
});

module.exports = router;