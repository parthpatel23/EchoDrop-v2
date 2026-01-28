// AngularApp\echodrop\backend\src\models\MessageLog.js
import mongoose from "mongoose";

const messageLogSchema = new mongoose.Schema(
  {
    message: { type: mongoose.Schema.Types.ObjectId, ref: "ScheduledMessage", required: true },
    status: { type: String, enum: ["sent", "failed"], required: true },
    error: { type: String }, // store error if failed
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model("MessageLog", messageLogSchema);
