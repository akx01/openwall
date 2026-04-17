const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  targetType: { type: String, enum: ["post", "message"], required: true },
  targetId: { type: String, required: true },
  reason: { type: String, maxlength: 300 },
  reportedBy: String, // sessionId
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Report", reportSchema);