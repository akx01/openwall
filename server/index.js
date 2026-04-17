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

// ── Allowed origins ──────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

console.log("Allowed origins:", allowedOrigins);

// ── Socket.IO ────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
});

// ── Middleware ───────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan("dev"));

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    console.log("Blocked origin:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-admin-secret"],
}));

app.options("*", cors()); // preflight

app.use(express.json({ limit: "10kb" }));
app.use(globalRateLimiter);

// ── Routes ───────────────────────────────────
app.use("/api/posts", postsRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/rooms", roomsRouter);
app.use("/api/reports", reportsRouter);

app.get("/health", (req, res) => {
  res.json({ status: "ok", env: process.env.NODE_ENV, time: new Date().toISOString() });
});

// ── Socket ───────────────────────────────────
initSocketHandlers(io);

// ── DB + Start ───────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server on port ${PORT}`);
      console.log(`CLIENT_URL = ${process.env.CLIENT_URL}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB error:", err.message);
    process.exit(1);
  });
