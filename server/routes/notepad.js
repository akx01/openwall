const express = require("express");
const router = express.Router();
const Notepad = require("../models/Notepad");

// GET /api/notepad — retrieve global notepad content
router.get("/", async (req, res) => {
  try {
    let notepad = await Notepad.findOne({ name: "global" });
    if (!notepad) {
      notepad = await Notepad.create({ name: "global", content: "" });
    }
    res.json(notepad);
  } catch (err) {
    res.status(500).json({ error: "Failed to load notepad" });
  }
});

module.exports = router;
