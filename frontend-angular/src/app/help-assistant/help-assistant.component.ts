import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ChatMessage {
  from: 'user' | 'bot';
  text: string;
}

@Component({
  selector: 'app-help-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './help-assistant.component.html',
  styleUrls: ['./help-assistant.component.scss']
})
export class HelpAssistantComponent {
  isOpen = false;
  userInput = '';

  messages: ChatMessage[] = [
    {
      from: 'bot',
      text: 'Hi, I am the EchoDrop Assistant. Ask me how to schedule messages, channels, or why Twilio is limited.'
    }
  ];

  // Simple FAQ knowledge base (rule-based "AI")
  faq = [
    {
      keywords: ['schedule', 'message', 'how'],
      answer:
        'To schedule a message: go to "Schedule", choose "Scheduled Messages", fill recipient, platform, content, time, then click "Schedule Message".'
    },
    {
      keywords: ['telegram', 'reminder'],
      answer:
        'Telegram is used for personal reminders. Open the "Telegram Reminders" tab, enter your reminder, time, and it will be sent to your own Telegram via the EchoDrop bot.'
    },
    {
      keywords: ['channel', 'email', 'sms', 'whatsapp'],
      answer:
        'EchoDrop supports Email (Gmail API), SMS and WhatsApp via Twilio, and Telegram reminders. Email/SMS/WhatsApp are for sending to others; Telegram is for your own reminders.'
    },
    {
      keywords: ['twilio', 'trial', 'sms', 'whatsapp', 'why'],
      answer:
        'The Twilio account is in trial / sandbox mode. That means SMS and WhatsApp can only be delivered to verified or sandbox numbers (typically the developer\'s numbers). The code is ready for production; limitations are from Twilio trial.'
    },
    {
      keywords: ['template'],
      answer:
        'You can use predefined templates on the Schedule page. For messages, pick a "Message Template". For reminders, pick a "Reminder Template". Subject and content will auto-fill.'
    },
    {
      keywords: ['login', 'auth'],
      answer:
        'EchoDrop uses JWT authentication. Login with your account, then all scheduled messages are linked to your user and protected on the backend.'
    },
    {
      keywords: ['login', 'auth', 'password'],
      answer:
        'To login, use the email and password you registered with EchoDrop. After login, you can access the dashboard, schedule messages, and Telegram reminders. If login fails, check your credentials or contact the administrator.'
    }
  ];

  toggleOpen() {
    this.isOpen = !this.isOpen;
  }

  sendMessage() {
    const text = this.userInput.trim();
    if (!text) return;

    // Add user message
    this.messages.push({ from: 'user', text });
    this.userInput = '';

    // Find best matching FAQ answer (simple keyword matching)
    const lower = text.toLowerCase();
    const match = this.faq.find(f =>
      f.keywords.some(k => lower.includes(k))
    );

    const answer =
      match?.answer ||
      'I did not fully understand that. You can ask about: how to schedule a message, Telegram reminders, channels, Twilio trial limits, or templates.';

    // Add bot reply
    this.messages.push({ from: 'bot', text: answer });

    // Optional: auto-scroll logic can be added later
  }
}
