// AngularApp\echodrop\backend\src\routes\auth.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import passport from "passport";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js"; // Import your auth middleware

const router = express.Router();

// 🔑 Helper to generate JWT
function generateToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
}

/* -------------------------
   📌 Manual Signup
------------------------- */
router.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ msg: "Missing email or password" });

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const name = `${firstName} ${lastName}`.trim();

    await User.create({ name, email, password: hashed });

    res.json({ msg: "Signup successful! Please login now." }); // ✅ only message
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ msg: err.message });
  }
});

/* -------------------------
   📌 Manual Login
------------------------- */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Missing email or password" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password || "");
    if (!ok) return res.status(400).json({ msg: "Invalid credentials" });

    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: err.message });
  }
});

/* -------------------------
   📌 Google OAuth Login (Initial Login/Signup)
------------------------- */
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email", "https://www.googleapis.com/auth/gmail.send"], // Added gmail.send scope
    accessType: 'offline', // Request a refresh token
    prompt: 'consent',     // Prompt user for consent every time (useful for testing refresh token)
    session: false,
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:4200/login?error=auth_failed",
    session: false,
  }),
  (req, res) => {
    if (!req.user) {
      // This case should ideally be caught by passport.authenticate failureRedirect
      return res.redirect("http://localhost:4200/login?error=auth_failed");
    }

    // Handle the case where Google account is already linked to another user
    if (req.authInfo && req.authInfo.message === "This Google account is already linked to another user.") {
      return res.redirect("http://localhost:4200/dashboard?error=google_already_linked");
    }

    const token = generateToken(req.user);

    // Redirect with JWT token
    res.redirect(`http://localhost:4200/dashboard?token=${token}`);
  }
);

/* -------------------------
   📌 Link Google Account (for already logged-in users)
------------------------- */
router.get(
  "/google/link",
  requireAuth, // Ensure user is authenticated before linking
  passport.authenticate("google", {
    scope: ["profile", "email", "https://www.googleapis.com/auth/gmail.send"], // Added gmail.send scope
    accessType: 'offline', // Request a refresh token
    prompt: 'consent',     // Prompt user for consent every time
    session: false,
  })
);

router.get(
  "/google/link/callback",
  requireAuth, // Ensure user is still authenticated
  passport.authenticate("google", {
    failureRedirect: "http://localhost:4200/dashboard?error=link_failed", // Redirect to dashboard on failure
    session: false,
  }),
  (req, res) => {
    if (!req.user) {
      return res.redirect("http://localhost:4200/dashboard?error=link_failed");
    }

    // Handle the case where Google account is already linked to another user
    if (req.authInfo && req.authInfo.message === "This Google account is already linked to another user.") {
      return res.redirect("http://localhost:4200/dashboard?error=google_already_linked");
    }

    // If linking is successful, redirect back to dashboard with a success message
    res.redirect("http://localhost:4200/dashboard?link_success=true");
  }
);


/* -------------------------
   📌 Get Current User
------------------------- */
router.get("/me", async (req, res) => {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ msg: "No token" });

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      defaultChannel: user.defaultChannel || 'email',
      googleLinked: !!user.googleRefreshToken,   // ✅ based on refresh token
      // ✅ Telegram is considered globally configured, not per-user
      telegramLinked: !!process.env.TELEGRAM_BOT_TOKEN && !!process.env.TELEGRAM_ADMIN_CHAT_ID,
    });
  } catch (err) {
    console.error("GET /auth/me error:", err.message);
    res.status(401).json({ msg: "Invalid token" });
  }
});

// Update profile (name, preferences)
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, defaultChannel } = req.body;

    const allowedChannels = ['email', 'sms', 'whatsapp'];
    if (defaultChannel && !allowedChannels.includes(defaultChannel)) {
      return res.status(400).json({ msg: 'Invalid defaultChannel' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    if (name !== undefined) user.name = name;
    if (defaultChannel !== undefined) user.defaultChannel = defaultChannel;

    await user.save();

    res.json({
      msg: 'Profile updated',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        defaultChannel: user.defaultChannel,
        // include other safe fields if you want
      }
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

export default router;
