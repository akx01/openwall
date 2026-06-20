const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  name: {
    type: String, required: true, unique: true,
    trim: true, maxlength: 40
  },
  description: { type: String, maxlength: 200, default: "" },
  createdBy: { type: String, default: "system" },
  leader: { type: String, default: null }, // username of room leader
  isPrivate: { type: Boolean, default: false },
  password: { type: String, default: null }, // hashed if private
  memberCount: { type: Number, default: 0 },
  isSystem: { type: Boolean, default: false },
  bannedUsers: [String], // usernames banned from this room
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Room", roomSchema);