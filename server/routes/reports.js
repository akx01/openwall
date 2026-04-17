const express = require("express");
const router = express.Router();
const Report = require("../models/Report");
const Post = require("../models/Post");

router.post("/", async (req, res) => {
  try {
    const { targetType, targetId, reason, reportedBy } = req.body;
    await Report.create({ targetType, targetId, reason, reportedBy });

    // Auto-hide posts after 5 reports
    if (targetType === "post") {
      const count = await Report.countDocuments({ targetId });
      if (count >= 5) await Post.findByIdAndUpdate(targetId, { hidden: true });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to submit report" });
  }
});

// Admin: view reports (protected by secret header)
router.get("/admin", async (req, res) => {
  if (req.headers["x-admin-secret"] !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: "Unauthorized" });
  }
  const reports = await Report.find().sort({ createdAt: -1 }).limit(100).lean();
  res.json(reports);
});

module.exports = router;