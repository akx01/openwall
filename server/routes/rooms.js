const express = require("express");
const router = express.Router();
const Room = require("../models/Room");
const { sanitizeBody } = require("../middleware/sanitize");
const { clean } = require("../middleware/profanityFilter");

// ── GET /api/rooms — list all rooms
router.get("/", async (req, res) => {
  try {
    const rooms = await Room.find().sort({ memberCount: -1, createdAt: 1 }).lean();
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: "Failed to load rooms" });
  }
});

// ── POST /api/rooms — create a room
router.post("/", sanitizeBody, async (req, res) => {
  try {
    const { name, description, createdBy } = req.body;
    if (!name) return res.status(400).json({ error: "Name required" });

    const exists = await Room.findOne({ name: clean(name) });
    if (exists) return res.status(400).json({ error: "Room already exists" });

    const room = await Room.create({
      name: clean(name).toLowerCase().replace(/\s+/g, "-"),
      description: description ? clean(description) : "",
      createdBy,
    });
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ error: "Failed to create room" });
  }
});

module.exports = router;