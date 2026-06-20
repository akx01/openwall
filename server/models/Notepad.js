const mongoose = require("mongoose");

const notepadSchema = new mongoose.Schema({
  name: { type: String, default: "global", unique: true },
  content: { type: String, default: "" },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notepad", notepadSchema);
