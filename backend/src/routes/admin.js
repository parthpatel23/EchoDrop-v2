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
    const {
      search = "",
      hasMessages = "all",
      page = 1,
      limit = 10
    } = req.query;

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const pageSize = Math.max(parseInt(limit) || 10, 1);

    // Build text search condition (email OR name)
    const searchMatch = {};
    if (search) {
      const regex = new RegExp(search, "i");
      searchMatch.$or = [
        { email: regex },
        { name: regex }
      ];
    }

    const pipeline = [
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
      // Remove heavy messages array and sensitive fields
      {
        $project: {
          password: 0,
          googleAccessToken: 0,
          googleRefreshToken: 0,
          messages: 0
        }
      }
    ];

    // Apply search filter if present
    if (Object.keys(searchMatch).length > 0) {
      pipeline.push({ $match: searchMatch });
    }

    // Filter on messagesCount
    const hm = String(req.query.hasMessages ?? "").toLowerCase().trim();

    const hasMessagesNormalized =
      (hm === "true" || hm === "1" || hm === "yes") ? true :
        (hm === "false" || hm === "0" || hm === "no") ? false :
          null; // null = no filter (all)

    if (hasMessagesNormalized === true) {
      pipeline.push({ $match: { messagesCount: { $gt: 0 } } });
    } else if (hasMessagesNormalized === false) {
      pipeline.push({ $match: { messagesCount: 0 } });
    }

    // Sort by joinedAt (newest first)
    pipeline.push({ $sort: { joinedAt: -1 } });

    // Pagination + total count via $facet
    pipeline.push({
      $facet: {
        data: [
          { $skip: (pageNum - 1) * pageSize },
          { $limit: pageSize }
        ],
        totalCount: [
          { $count: "count" }
        ]
      }
    });

    const result = await User.aggregate(pipeline);
    const users = result[0].data || [];
    const total = result[0].totalCount[0]?.count || 0;

    res.json({
      users,
      total,
      page: pageNum,
      limit: pageSize,
    });
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

    // 🔹 Only owner can change admin roles
    if (!req.user.isOwner) {
      return res.status(403).json({ msg: "Only the primary owner admin can manage admin roles." });
    }

    // Find target user
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ msg: "User not found" });

    // 🔹 Never allow changes to the owner account
    if (target.isOwner) {
      return res
        .status(400)
        .json({ msg: "The primary owner admin cannot be changed." });
    }

    // Prevent removing your own admin access
    if (req.user._id.toString() === target._id.toString() && isAdmin === false) {
      return res
        .status(400)
        .json({ msg: "You cannot remove your own admin access." });
    }

    target.isAdmin = isAdmin;
    await target.save();

    res.json({
      msg: "Admin status updated",
      user: {
        _id: target._id,
        email: target.email,
        name: target.name,
        isAdmin: target.isAdmin
      }
    });
  } catch (err) {
    console.error("Admin toggle error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// GET /admin/messages?status=failed&limit=50
router.get("/messages", async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const pageSize = Math.max(parseInt(limit) || 20, 1);

    const filter = {};
    if (status) filter.status = status;

    const [messages, total] = await Promise.all([
      ScheduledMessage.find(filter)
        .populate("createdBy", "email name isAdmin")
        .sort("-scheduledTime")
        .skip((pageNum - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      ScheduledMessage.countDocuments(filter),
    ]);

    res.json({ messages, total, page: pageNum, limit: pageSize });
  } catch (err) {
    console.error("Admin messages error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

export default router;