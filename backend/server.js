// AngularApp\EchoDrop-v2\backend\server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import passport from "passport";

import "./scheduler.js";

import authRoutes from "./src/routes/auth.js";
import messageRoutes from "./src/routes/messages.js";
import adminRoutes from "./src/routes/admin.js";
import "./src/config/passport.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:4200", credentials: true }));

// Session for passport
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// MongoDB connect
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error(err));

// Routes
app.use("/auth", authRoutes);
app.use("/messages", messageRoutes);
app.use("/admin", adminRoutes);

app.get("/version", (req, res) => {
  res.json({ version: "admin-routes-added" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
