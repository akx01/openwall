const express = require("express");
const router = express.Router();
const User = require("../models/User");
const DirectMessage = require("../models/DirectMessage");

// Auth Middleware using custom headers
const authenticateUser = async (req, res, next) => {
  try {
    const username = req.headers["x-username"];
    const passwordHash = req.headers["x-password-hash"];

    if (!username || !passwordHash) {
      return res.status(401).json({ error: "Authentication credentials required" });
    }

    const normalized = username.toLowerCase().trim();
    const user = await User.findOne({ username: normalized });

    if (!user || user.passwordHash !== passwordHash) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({ error: "Authentication failed" });
  }
};

// ── GET /api/dms/:friend — Retrieve DM history with a friend
router.get("/:friend", authenticateUser, async (req, res) => {
  try {
    const friendUsername = req.params.friend.toLowerCase().trim();
    
    // Check if they are friends
    if (!req.user.friends.includes(friendUsername)) {
      return res.status(403).json({ error: "You can only message your friends" });
    }

    const messages = await DirectMessage.find({
      $or: [
        { sender: req.user.username, recipient: friendUsername },
        { sender: friendUsername, recipient: req.user.username }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json(messages.reverse()); // return chronological order
  } catch (err) {
    res.status(500).json({ error: "Failed to load direct messages" });
  }
});

// ── POST /api/dms/mark-read — Mark all DMs from a friend as read
router.post("/mark-read", authenticateUser, async (req, res) => {
  try {
    const { friend } = req.body;
    if (!friend) return res.status(400).json({ error: "Friend username required" });

    const friendUsername = friend.toLowerCase().trim();

    await DirectMessage.updateMany(
      { sender: friendUsername, recipient: req.user.username, read: false },
      { $set: { read: true } }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark messages as read" });
  }
});

module.exports = router;
