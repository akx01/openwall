const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  room: { type: String, required: true },
  author: { type: String, required: true, maxlength: 30 },
  authorColor: { type: String, default: "#7C3AED" },
  sessionId: { type: String, required: true }, // so user can delete own messages
  content: { type: String, required: true, maxlength: 1000 },
  reactions: {
    type: Map,
    of: [String], // emoji → [sessionIds]
    default: {},
  },
  deleted: { type: Boolean, default: false },
  // TTL — auto-delete after 7 days
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 7 },
});

messageSchema.index({ room: 1, createdAt: 1 });

module.exports = mongoose.model("Message", messageSchema);