// AngularApp\echodrop\backend\src\models\ScheduledMessage.js
import mongoose from "mongoose";

const scheduledMessageSchema = new mongoose.Schema(
  {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // email / phone / (not used for telegram reminders)
    recipient: {
      type: String,
      required: function () {
        // recipient is required for everything EXCEPT telegram reminders
        return this.platform !== "telegram";
      },
    },

    platform: {
      type: String,
      enum: ["email", "sms", "whatsapp", "telegram"], // ✅ added "telegram"
      required: true,
    },

    subject: { type: String }, // optional, for email
    content: { type: String, required: true },
    scheduledTime: { type: Date, required: true },

    status: {
      type: String,
      enum: ["pending", "processing", "sent", "failed", "cancelled"],
      default: "pending",
    },

    attempts: { type: Number, default: 0 },
    lastError: { type: String }, // store last failure reason
    meta: { type: mongoose.Schema.Types.Mixed }, // extra data for provider-specific info

    // 🔹 Delivery logs
    logs: [
      {
        time: { type: Date, default: Date.now },
        status: { type: String, enum: ["processing", "sent", "failed"] },
        error: { type: String },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("ScheduledMessage", scheduledMessageSchema);
