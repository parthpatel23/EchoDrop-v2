// AngularApp\EchoDrop-v2\backend\src\routes\admin.js

import express from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import User from "../models/User.js";
import ScheduledMessage from "../models/ScheduledMessage.js";

const router = express.Router();

// All admin routes require auth + admin
router.use(requireAuth, requireAdmin);

// GET /admin/stats
router.get("/stats", async (req, res) => {
  try {
    const [
      totalUsers,
      totalMessages,
      pendingCount,
      processingCount,
      sentCount,
      failedCount,
      cancelledCount,
    ] = await Promise.all([
      User.countDocuments(),
      ScheduledMessage.countDocuments(),
      ScheduledMessage.countDocuments({ status: "pending" }),
      ScheduledMessage.countDocuments({ status: "processing" }),
      ScheduledMessage.countDocuments({ status: "sent" }),
      ScheduledMessage.countDocuments({ status: "failed" }),
      ScheduledMessage.countDocuments({ status: "cancelled" }),
    ]);

    res.json({
      totalUsers,
      totalMessages,
      byStatus: {
        pending: pendingCount,
        processing: processingCount,
        sent: sentCount,
        failed: failedCount,
        cancelled: cancelledCount,
      },
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// GET /admin/users
router.get("/users", async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $lookup: {
          from: "scheduledmessages",       // collection name for ScheduledMessage
          localField: "_id",
          foreignField: "createdBy",
          as: "messages",
        },
      },
      {
        $addFields: {
          messagesCount: { $size: "$messages" },
        },
      },
      {
        $addFields: {
          joinedAt: {
            $ifNull: ["$createdAt", { $toDate: "$_id" }]
          }
        }
      },
      {
        $project: {
          _id: 1,
          email: 1,
          name: 1,
          isAdmin: 1,
          joinedAt: 1,
          messagesCount: 1,
        },
      },
      { $sort: { joinedAt: -1 } },
    ]);

    res.json({ users });
  } catch (err) {
    console.error("Admin users error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// PATCH /admin/users/:id/admin  { isAdmin: boolean }
router.patch("/users/:id/admin", async (req, res) => {
  try {
    const { isAdmin } = req.body;

    if (typeof isAdmin !== "boolean") {
      return res.status(400).json({ msg: "isAdmin (boolean) is required" });
    }

    // Prevent removing your own admin access
    if (req.user._id.toString() === req.params.id && isAdmin === false) {
      return res
        .status(400)
        .json({ msg: "You cannot remove your own admin access." });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isAdmin },
      { new: true }
    ).select("email name isAdmin");

    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json({ msg: "Admin status updated", user });
  } catch (err) {
    console.error("Admin toggle error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// GET /admin/messages?status=failed&limit=50
router.get("/messages", async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const messages = await ScheduledMessage.find(filter)
      .populate("createdBy", "email name isAdmin")
      .sort("-scheduledTime")
      .limit(Number(limit))
      .lean();

    res.json({ messages });
  } catch (err) {
    console.error("Admin messages error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

export default router;