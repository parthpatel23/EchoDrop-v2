// AngularApp/echodrop/backend/src/routes/messages.js
import express from "express";
import ScheduledMessage from "../models/ScheduledMessage.js";
import { requireAuth } from "../middleware/auth.js";
import MessageLog from "../models/MessageLog.js";

const router = express.Router();

// Create a scheduled message
router.post("/create", requireAuth, async (req, res) => {
  try {
    const { recipient, platform, content, scheduledTime, subject, meta } = req.body;

    // basic validation
    if (!platform || !content || !scheduledTime) {
      return res.status(400).json({
        msg: "platform, content and scheduledTime are required",
      });
    }

    // recipient required only for non-telegram
    if (platform !== "telegram" && !recipient) {
      return res.status(400).json({
        msg: "recipient is required for email, sms and whatsapp",
      });
    }

    const date = new Date(scheduledTime);
    if (isNaN(date.getTime())) {
      return res.status(400).json({ msg: "Invalid scheduledTime" });
    }

    if (date < new Date()) {
      return res.status(400).json({ msg: "scheduledTime must be in the future" });
    }

    // Save senderEmail for convenience
    const senderEmail = req.user?.email || null;

    const newMessage = await ScheduledMessage.create({
      createdBy: req.user._id,
      senderEmail,
      recipient,
      platform,
      subject,
      content,
      scheduledTime: date,
      meta,
    });

    res.json({ msg: "Scheduled message created", scheduledMessage: newMessage });
  } catch (err) {
    console.error("Create message error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// List user's scheduled messages (supports filters & pagination)
router.get("/list", requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, page = 1, limit = 20, sort = "-scheduledTime" } = req.query;

    const filter = { createdBy: userId };
    if (status) filter.status = status;

    const messages = await ScheduledMessage.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const total = await ScheduledMessage.countDocuments(filter);

    res.json({ total, page: Number(page), limit: Number(limit), messages });
  } catch (err) {
    console.error("List messages error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Get single message by id (owner-only)
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const msg = await ScheduledMessage.findById(req.params.id);
    if (!msg) return res.status(404).json({ msg: "Message not found" });
    if (!msg.createdBy.equals(req.user._id)) return res.status(403).json({ msg: "Not authorized" });

    res.json(msg);
  } catch (err) {
    console.error("Get message error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Update a message (only if still pending)
router.put("/update/:id", requireAuth, async (req, res) => {
  try {
    const { recipient, platform, content, scheduledTime, subject, meta } = req.body;
    const msg = await ScheduledMessage.findById(req.params.id);
    if (!msg) return res.status(404).json({ msg: "Message not found" });
    if (!msg.createdBy.equals(req.user._id)) return res.status(403).json({ msg: "Not authorized" });

    if (msg.status !== "pending") {
      return res.status(400).json({ msg: "Only pending messages can be updated" });
    }

    if (recipient) msg.recipient = recipient;
    if (platform) msg.platform = platform;
    if (content) msg.content = content;
    if (subject !== undefined) msg.subject = subject;
    if (meta !== undefined) msg.meta = meta;
    if (scheduledTime) {
      const date = new Date(scheduledTime);
      if (isNaN(date.getTime())) return res.status(400).json({ msg: "Invalid scheduledTime" });
      if (date < new Date()) return res.status(400).json({ msg: "scheduledTime must be in the future" });
      msg.scheduledTime = date;
    }

    await msg.save();
    res.json({ msg: "Message updated", scheduledMessage: msg });
  } catch (err) {
    console.error("Update message error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Cancel (soft cancel) a scheduled message
router.post("/cancel/:id", requireAuth, async (req, res) => {
  try {
    const msg = await ScheduledMessage.findById(req.params.id);
    if (!msg) return res.status(404).json({ msg: "Message not found" });
    if (!msg.createdBy.equals(req.user._id)) return res.status(403).json({ msg: "Not authorized" });

    if (msg.status !== "pending") {
      return res.status(400).json({ msg: "Only pending messages can be cancelled" });
    }

    msg.status = "cancelled";
    await msg.save();

    res.json({ msg: "Message cancelled", scheduledMessage: msg });
  } catch (err) {
    console.error("Cancel message error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Get logs for a message
router.get("/:id/logs", requireAuth, async (req, res) => {
  try {
    const msg = await ScheduledMessage.findById(req.params.id);
    if (!msg) return res.status(404).json({ msg: "Message not found" });
    if (!msg.createdBy.equals(req.user._id)) return res.status(403).json({ msg: "Not authorized" });

    const logs = await MessageLog.find({ message: msg._id })
      .sort("-timestamp")
      .lean();

    res.json({ logs });
  } catch (err) {
    console.error("Logs fetch error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

export default router;