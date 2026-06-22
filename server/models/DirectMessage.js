const mongoose = require("mongoose");

const directMessageSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxlength: 30,
  },
  recipient: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxlength: 30,
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  read: {
    type: Boolean,
    default: false,
  },
  // Auto-delete DMs after 7 days
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24 * 7,
  },
});

directMessageSchema.index({ sender: 1, recipient: 1, createdAt: 1 });

module.exports = mongoose.model("DirectMessage", directMessageSchema);
