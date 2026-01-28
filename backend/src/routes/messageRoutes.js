// AngularApp\echodrop\backend\src\routes\messageRoutes.js
import express from "express";
import { sendSMS } from "../utils/twilio.js";

const router = express.Router();

// Test SMS
router.post("/send-sms", async (req, res) => {
  const { phone, message } = req.body;

  if (!phone || !message) {
    return res.status(400).json({ error: "Phone and message are required" });
  }

  try {
    const result = await sendSMS(phone, message);
    res.json({ success: true, sid: result.sid });
  } catch (err) {
    res.status(500).json({ error: "Failed to send SMS" });
  }
});

export default router;
