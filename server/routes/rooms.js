const express = require("express");
const router = express.Router();
const Room = require("../models/Room");
const bcrypt = require("bcryptjs");

// GET /api/rooms
router.get("/", async (req, res) => {
  try {
    const rooms = await Room.find()
      .select("-password") // never send password hash to client
      .sort({ memberCount: -1, createdAt: 1 })
      .lean();
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: "Failed to load rooms" });
  }
});

// POST /api/rooms — create room
router.post("/", async (req, res) => {
  try {
    const { name, description, createdBy, isPrivate, password } = req.body;
    if (!name) return res.status(400).json({ error: "Name required" });

    const cleanName = name.toLowerCase().trim().replace(/\s+/g, "-");

    const exists = await Room.findOne({ name: cleanName });
    if (exists) return res.status(400).json({ error: "Room name already taken" });

    const roomData = {
      name: cleanName,
      description: description || "",
      createdBy,
      leader: createdBy,
      isPrivate: !!isPrivate
    };

    if (isPrivate && password) {
      roomData.password = await bcrypt.hash(password, 10);
    }

    const room = await Room.create(roomData);
    const roomObj = room.toObject();
    delete roomObj.password;
    res.status(201).json(roomObj);
  } catch (err) {
    console.error("Create room error:", err.message);
    res.status(500).json({ error: "Failed to create room" });
  }
});

// POST /api/rooms/:name/verify — verify password for private room
router.post("/:name/verify", async (req, res) => {
  try {
    const { password } = req.body;
    const room = await Room.findOne({ name: req.params.name });
    if (!room) return res.status(404).json({ error: "Room not found" });
    if (!room.isPrivate) return res.json({ ok: true });

    const valid = await bcrypt.compare(password, room.password);
    if (!valid) return res.status(401).json({ error: "Wrong password" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Verification failed" });
  }
});

// POST /api/rooms/:name/kick — leader kicks a user
router.post("/:name/kick", async (req, res) => {
  try {
    const { leaderUsername, targetUsername } = req.body;
    const room = await Room.findOne({ name: req.params.name });
    if (!room) return res.status(404).json({ error: "Room not found" });
    if (room.leader !== leaderUsername) {
      return res.status(403).json({ error: "Only the room leader can kick users" });
    }
    res.json({ success: true, kicked: targetUsername });
  } catch (err) {
    res.status(500).json({ error: "Kick failed" });
  }
});

// POST /api/rooms/:name/ban — leader bans a user
router.post("/:name/ban", async (req, res) => {
  try {
    const { leaderUsername, targetUsername } = req.body;
    const room = await Room.findOne({ name: req.params.name });
    if (!room) return res.status(404).json({ error: "Room not found" });
    if (room.leader !== leaderUsername) {
      return res.status(403).json({ error: "Only the room leader can ban users" });
    }
    if (!room.bannedUsers.includes(targetUsername)) {
      room.bannedUsers.push(targetUsername);
      await room.save();
    }
    res.json({ success: true, banned: targetUsername });
  } catch (err) {
    res.status(500).json({ error: "Ban failed" });
  }
});

module.exports = router;