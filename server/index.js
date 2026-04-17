// ──────────────────────────────────────────────
//  OpenWall Server — main entry point
// ──────────────────────────────────────────────
require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

const postsRouter = require("./routes/posts");
const messagesRouter = require("./routes/messages");
const roomsRouter = require("./routes/rooms");
const reportsRouter = require("./routes/reports");
const { initSocketHandlers } = require("./socket/handlers");
const { globalRateLimiter } = require("./middleware/rateLimiter");

const app = express();
const httpServer = http.createServer(app);

// ── Socket.IO setup ──────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"],
  },
});

// ── Middleware ───────────────────────────────
app.use(helmet());
app.use(morgan("dev"));
app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json({ limit: "10kb" })); // prevent huge payloads
app.use(globalRateLimiter);

// ── Routes ───────────────────────────────────
app.use("/api/posts", postsRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/rooms", roomsRouter);
app.use("/api/reports", reportsRouter);

// Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

// ── Socket handlers ──────────────────────────
initSocketHandlers(io);

// ── Database + Start ─────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });