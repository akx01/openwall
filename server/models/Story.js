const mongoose = require("mongoose");

const storySchema = new mongoose.Schema(
  {
    author: { type: String, required: true, trim: true, maxlength: 30 },
    authorColor: { type: String, default: "#EF4444" },
    content: { type: String, required: true, trim: true, maxlength: 200 },
    theme: { type: String, default: "fire" }, // e.g. "fire", "sun", "magma", "neon"
    // TTL index — MongoDB will delete the document exactly 24 hours after creation
    createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 },
  },
  { timestamps: false }
);

module.exports = mongoose.model("Story", storySchema);
