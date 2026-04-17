require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

const app = express();
const httpServer = http.createServer(app);

// ── CORS — allow ALL origins (fixes the block) ──
// We do this BEFORE everything else including helmet
app.use(cors({
  origin: "*",           // allow every origin
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "x-admin-secret"],
}));
app.options("*", cors()); // handle preflight for every route

// ── Middleware ───────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan("dev"));
app.use(express.json({ limit: "10kb" }));

// ── Health check ─────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// ── Rate limiter ─────────────────────────────
try {
  const { globalRateLimiter } = require("./middleware/rateLimiter");
  app.use(globalRateLimiter);
} catch (e) {
  console.error("Rate limiter load error:", e.message);
}

// ── Routes ───────────────────────────────────
try { app.use("/api/posts",    require("./routes/posts"));    console.log("✅ posts"); }
  catch(e) { console.error("posts route error:", e.message); }

try { app.use("/api/messages", require("./routes/messages")); console.log("✅ messages"); }
  catch(e) { console.error("messages route error:", e.message); }

try { app.use("/api/rooms",    require("./routes/rooms"));    console.log("✅ rooms"); }
  catch(e) { console.error("rooms route error:", e.message); }

try { app.use("/api/reports",  require("./routes/reports"));  console.log("✅ reports"); }
  catch(e) { console.error("reports route error:", e.message); }

// ── Global error handler ─────────────────────
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.message);
  res.status(500).json({ error: err.message });
});

// ── Socket.IO ────────────────────────────────
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
  transports: ["websocket", "polling"],
  allowEIO3: true,
});

try {
  const { initSocketHandlers } = require("./socket/handlers");
  initSocketHandlers(io);
  console.log("✅ socket");
} catch(e) {
  console.error("socket error:", e.message);
}

// ── MongoDB ───────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB failed:", err.message);
    process.exit(1);
  });
