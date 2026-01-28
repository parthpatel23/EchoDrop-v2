// AngularApp\echodrop\backend\src\middleware\auth.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ msg: "No authorization header" });

    const token = header.split(" ")[1];
    if (!token) return res.status(401).json({ msg: "Malformed authorization header" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ msg: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    return res.status(401).json({ msg: "Invalid or expired token" });
  }
}
