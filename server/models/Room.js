const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true, maxlength: 40 },
  description: { type: String, maxlength: 200, default: "" },
  createdBy: { type: String, default: "system" },
  memberCount: { type: Number, default: 0 }, // live count via Socket.IO
  isSystem: { type: Boolean, default: false }, // global room can't be deleted
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Room", roomSchema);