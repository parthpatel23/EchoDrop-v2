// AngularApp/echodrop/backend/src/services/sendMessage.js
import { google } from 'googleapis';
import twilio from 'twilio';
import axios from 'axios';
import User from '../models/User.js'; // adjust if file path differs

// Twilio client (unchanged)
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Create a fresh OAuth2 client per request (avoids shared state)
function createOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

export default async function sendMessage(msg) {
  switch (msg.platform) {
    case 'email':
      return sendEmail(msg);
    case 'sms':
      return sendSms(msg);
    case 'whatsapp':
      return sendWhatsapp(msg);
    case 'telegram':
      return sendTelegram(msg);
    default:
      throw new Error('Unsupported platform: ' + msg.platform);
  }
}

// Email sending using per-user refresh token
async function sendEmail(msg) {
  if (!msg.recipient || !msg.recipient.includes('@')) throw new Error('Invalid email recipient');

  // Determine sender (prefer msg.userId, else msg.senderEmail)
  let senderUser = null;
  if (msg.userId) {
    senderUser = await User.findById(msg.userId);
  } else if (msg.senderEmail) {
    senderUser = await User.findOne({ email: msg.senderEmail });
  } else {
    throw new Error('No sender specified. Provide msg.userId or msg.senderEmail');
  }

  if (!senderUser) throw new Error('Sender user not found');
  if (!senderUser.googleRefreshToken) throw new Error('Sender not linked with Google (missing refresh token)');

  // Build oauth client for this sender and set the refresh token
  const oAuth2Client = createOAuthClient();
  oAuth2Client.setCredentials({ refresh_token: senderUser.googleRefreshToken });

  // Let googleapis handle obtaining access tokens; DO NOT overwrite credentials with access_token
  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

  // Build message
  const messageLines = [
    `From: ${senderUser.email}`,
    `To: ${msg.recipient}`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${msg.subject || 'Message from EchoDrop'}`,
    '',
    msg.content || ''
  ];
  const raw = Buffer.from(messageLines.join('\n'))
    .toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  // Send
  const result = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw }
  });

  console.log('Email sent by', senderUser.email, 'Message ID:', result.data.id);
  return result.data;
}

// SMS (unchanged)
async function sendSms(msg) {
  if (!/^\+?[1-9]\d{1,14}$/.test(msg.recipient)) {
    throw new Error('Invalid phone number format (E.164 required)');
  }

  await client.messages.create({
    body: msg.content,
    from: process.env.TWILIO_SMS_PHONE,
    to: msg.recipient,
  });
  console.log('✅ SMS sent to', msg.recipient);
}

// WhatsApp (unchanged)
async function sendWhatsapp(msg) {
  let recipient = msg.recipient.trim();
  if (!recipient.startsWith('whatsapp:')) recipient = 'whatsapp:' + recipient;

  await client.messages.create({
    body: msg.content,
    from: 'whatsapp:' + process.env.TWILIO_WHATSAPP_PHONE,
    to: recipient,
  });

  console.log('✅ WhatsApp sent to', recipient);
}

// ---------- Telegram (personal reminders) ----------
async function sendTelegram(msg) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID; // for demo: your own chat

  if (!token || !chatId) {
    throw new Error('Telegram not configured (missing TELEGRAM_BOT_TOKEN or TELEGRAM_ADMIN_CHAT_ID)');
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const text = msg.content || msg.subject || 'Message from EchoDrop (Telegram)';

  console.log('[Telegram] Sending message:', { chatId, text });

  await axios.post(url, {
    chat_id: chatId,
    text,
  });

  console.log('✅ Telegram message sent to chat', chatId);
}
