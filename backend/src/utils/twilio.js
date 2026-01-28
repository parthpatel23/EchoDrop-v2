// AngularApp\echodrop\backend\src\utils\twilio.js
import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const sendSMS = async (to, body) => {
  try {
    const message = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE, // Your Twilio number
      to, // Receiver number in E.164 format (+91 for India, etc.)
    });
    console.log("📩 SMS sent:", message.sid);
    return message;
  } catch (err) {
    console.error("❌ SMS error:", err);
    throw err;
  }
};
