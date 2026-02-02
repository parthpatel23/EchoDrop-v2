// AngularApp\EchoDrop-v2\frontend-angular\src\app\messages\schedule-message\schedule-message.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-schedule-message',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './schedule-message.component.html',
  styleUrls: ['./schedule-message.component.scss']
})
export class ScheduleMessageComponent implements OnInit {
  API_URL = 'https://echodrop-backend.onrender.com/messages';

  // Two modes:
  //  - 'message'  -> Email / SMS / WhatsApp (to others)
  //  - 'reminder' -> Telegram personal reminder
  mode: 'message' | 'reminder' = 'message';

  message = {
    recipient: '',
    platform: 'email',   // will be overridden by defaultChannel if set
    subject: '',
    content: '',
    scheduledTime: ''
  };

  // ---------- Built-in templates ----------

  // For messages to others (Email/SMS/WhatsApp)
  messageTemplates = [
    {
      id: 'birthday',
      name: 'Birthday Wish',
      subject: 'Happy Birthday!',
      content: 'Wishing you a very happy birthday! 🎉\nHope your day is filled with joy and happiness.'
    },
    {
      id: 'meeting',
      name: 'Meeting Reminder',
      subject: 'Meeting Reminder',
      content: 'This is a reminder for our meeting scheduled at [time] on [date].\nPlease be on time.'
    },
    {
      id: 'followup',
      name: 'Follow-up Message',
      subject: 'Following up',
      content: 'Just following up on our previous conversation. Let me know if you have any questions.'
    }
  ];

  // For personal Telegram reminders
  reminderTemplates = [
    {
      id: 'water',
      name: 'Drink Water Reminder',
      subject: 'Hydrate!',
      content: 'Time to drink a glass of water. Stay hydrated! 💧'
    },
    {
      id: 'study',
      name: 'Study Reminder',
      subject: 'Study Time',
      content: 'Reminder: Focused study session now. Avoid distractions and give your best! 📚'
    },
    {
      id: 'exercise',
      name: 'Exercise Reminder',
      subject: 'Workout',
      content: 'Reminder: It\'s time for your workout. Even a short session counts! 💪'
    }
  ];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.applyDefaultChannel();
  }

  private applyDefaultChannel() {
    // Only run in browser
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return;
    }

    try {
      const raw = window.localStorage.getItem('userInfo');
      if (!raw) return;

      const user = JSON.parse(raw) || {};
      const allowed = ['email', 'sms', 'whatsapp'];

      if (user.defaultChannel && allowed.includes(user.defaultChannel)) {
        this.message.platform = user.defaultChannel;
      }
    } catch (e) {
      console.warn('Schedule: failed to read defaultChannel from userInfo', e);
    }
  }

  setMode(mode: 'message' | 'reminder') {
    this.mode = mode;

    if (mode === 'reminder') {
      // Telegram reminder: no recipient, platform fixed to telegram
      this.message.platform = 'telegram';
      this.message.recipient = '';
    } else {
      // Back to scheduled message: default to email if currently telegram
      if (this.message.platform === 'telegram') {
        this.message.platform = 'email';
      }
    }
  }

  // Apply a template by id for the current mode
  applyTemplate(type: 'message' | 'reminder', templateId: string) {
    if (!templateId) return;

    const list = type === 'message' ? this.messageTemplates : this.reminderTemplates;
    const template = list.find(t => t.id === templateId);
    if (!template) return;

    if (template.subject !== undefined) {
      this.message.subject = template.subject;
    }
    if (template.content !== undefined) {
      this.message.content = template.content;
    }
  }

  isRecipientValid(): boolean {
    if (this.mode !== 'message') return true;
    const v = this.message.recipient.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return emailRegex.test(v) || phoneRegex.test(v);
  }

  onSubmit() {
    // Basic client-side checks
    if (!this.message.content || !this.message.scheduledTime) {
      alert('Content and schedule time are required.');
      return;
    }

    if (this.mode === 'message') {
      if (!this.message.recipient) {
        alert('Recipient is required for Email/SMS/WhatsApp.');
        return;
      }
      if (!this.isRecipientValid()) {
        alert('Please enter a valid email or E.164 phone number.');
        return;
      }
    }

    // Convert local datetime (from <input type="datetime-local">) to UTC ISO string
    try {
      const localDate = new Date(this.message.scheduledTime);  // interpreted in browser local timezone
      const utcISO = localDate.toISOString();                  // converts to UTC ISO

      const payload = {
        ...this.message,
        scheduledTime: utcISO
      };

      this.http.post(`${this.API_URL}/create`, payload).subscribe({
        next: (res: any) => {
          alert('✅ Message scheduled successfully!');
          setTimeout(() => {
            this.router.navigate(['/messages']);
          }, 500);
        },
        error: (err) => {
          console.error(err);
          alert(err.error?.msg || '❌ Failed to schedule message');
        }
      });
    } catch (e) {
      console.error('Error converting scheduledTime to UTC', e);
      alert('Invalid schedule time.');
    }
  }

  goTo(path: string) {
    this.router.navigate([`/${path}`]);
  }
}