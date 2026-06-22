const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 30,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      default: "#7C3AED",
    },
    friends: {
      type: [String], // Array of usernames
      default: [],
    },
    friendRequests: {
      type: [String], // Array of usernames who sent requests to this user
      default: [],
    },
    sentRequests: {
      type: [String], // Array of usernames this user sent requests to
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
