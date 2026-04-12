// AngularApp\Echodrop-v2\backend\src\index.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import passport from "passport";
import rateLimit from "express-rate-limit";

dotenv.config();

// Import configs
import "./config/passport.js";
import "../scheduler.js";

// Routes
import authRoutes from "./routes/auth.js";
import messagesRoutes from "./routes/messages.js";
import adminRoutes from "./routes/admin.js";

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: [
    "http://localhost:4200",                 // local Angular dev
    "https://echodrop-c4a0d.web.app",       // Firebase Hosting URL
    "https://echodrop-c4a0d.firebaseapp.com"
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: false   // using JWT in Authorization, cookies not needed
}));
app.use(passport.initialize());

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,                   // 30 requests per window
  message: { msg: "Too many requests, please try again later." }
});
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { msg: "Too many requests, please try again later." }
});
app.use("/auth", authLimiter);
app.use("/messages", apiLimiter);
app.use("/admin", apiLimiter);

// DB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));

// Routes
app.use("/auth", authRoutes);
app.use("/messages", messagesRoutes);
app.use("/admin", adminRoutes);

// Health route
app.get("/", (req, res) => res.json({ ok: true, timestamp: Date.now() }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend listening on ${PORT}`));