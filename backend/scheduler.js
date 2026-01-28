// AngularApp/echodrop/backend/scheduler.js
import cron from "node-cron";
import ScheduledMessage from "./src/models/ScheduledMessage.js";
import sendMessage from "./src/services/sendMessage.js";
import MessageLog from "./src/models/MessageLog.js";
import User from "./src/models/User.js";

console.log("⏳ Scheduler initialized...");

cron.schedule("* * * * *", async () => {  // Runs every minute
  const now = new Date();

  try {
    const dueMessages = await ScheduledMessage.find({
      status: "pending",
      scheduledTime: { $lte: now },
    });

    for (let msg of dueMessages) {
      try {
        msg.status = "processing";
        msg.attempts = (msg.attempts || 0) + 1;
        await msg.save();

        // Resolve the sender's email if not present on the scheduled message
        let senderEmail = msg.senderEmail;
        if (!senderEmail && msg.createdBy) {
          const user = await User.findById(msg.createdBy).lean();
          if (user && user.email) senderEmail = user.email;
        }

        // Build a minimal payload for sendMessage — explicitly include userId or senderEmail
        const payload = {
          platform: msg.platform,
          userId: msg.createdBy ? msg.createdBy.toString() : undefined,
          senderEmail: senderEmail,
          recipient: msg.recipient,
          subject: msg.subject,
          content: msg.content,
          meta: msg.meta || {}
        };

        // Call sendMessage with explicit sender info
        await sendMessage(payload);

        msg.status = "sent";
        msg.logs = msg.logs || [];
        msg.logs.push({ status: "sent", time: new Date() });
        await msg.save();

        await MessageLog.create({ message: msg._id, status: "sent" });
        console.log(`✅ Message sent to ${msg.recipient} (scheduled id: ${msg._id})`);
      } catch (err) {
        msg.status = "failed";
        msg.lastError = err.message;
        msg.logs = msg.logs || [];
        msg.logs.push({ status: "failed", time: new Date(), error: err.message });
        await msg.save();

        await MessageLog.create({ message: msg._id, status: "failed", error: err.message });
        console.error(`❌ Failed to send message to ${msg.recipient} (scheduled id: ${msg._id}): ${err.message}`);
      }
    }
  } catch (err) {
    console.error("Scheduler error:", err.message);
  }
});
