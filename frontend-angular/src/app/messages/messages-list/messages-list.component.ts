// AngularApp\echodrop\frontend-angular\src\app\messages\messages-list\messages-list.component.ts
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

type Message = {
  _id: string;
  recipient: string;
  platform: 'email' | 'sms' | 'whatsapp';
  subject?: string;
  content: string;
  scheduledTime: string;
  status: 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled';
  attempts: number;
  lastError?: string;
};

type LogEntry = {
  _id: string;
  status: 'sent' | 'failed';
  error?: string;
  timestamp: string;
};

@Component({
  selector: 'app-messages-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messages-list.component.html',
  styleUrls: ['./messages-list.component.scss']
})
export class MessagesListComponent implements OnInit, OnDestroy {
  // API_URL = 'http://localhost:5000/messages';
  API_URL = 'https://echodrop-backend.onrender.com/messages';
  messages: Message[] = [];
  loading = false;
  saving = false;

  // Filters
  selectedStatus: string = 'all';
  statuses = ['all', 'pending', 'sent', 'failed', 'cancelled'];

  // Logs modal state
  showLogs = false;
  logsLoading = false;
  logs: LogEntry[] = [];
  logsForId: string | null = null;

  private refreshInterval: any;
  private routerSubscription: any;

  constructor(
    private http: HttpClient, 
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadMessages();

    // 🔄 Automatically refresh messages every 5 seconds
    this.refreshInterval = setInterval(() => {
      this.loadMessages(false); // refresh silently
    }, 5000);

    // Listen for route changes to refresh when navigating to this page
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        if (event.url === '/messages' || event.urlAfterRedirects === '/messages') {
          console.log('🔄 Route changed to messages, refreshing...');
          this.loadMessages();
        }
      });
  }

  ngOnDestroy() {
    // Clear interval when component is destroyed to avoid memory leaks
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  loadMessages(showLoading = true) {
    if (showLoading) this.loading = true;

    const query = this.selectedStatus !== 'all' ? `?status=${this.selectedStatus}` : '';
    this.http.get<{ messages: Message[] }>(`${this.API_URL}/list${query}`).subscribe({
      next: (res) => {
        this.messages = res.messages || [];
        this.loading = false;
        this.cdr.detectChanges(); // Force UI update
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.cdr.detectChanges(); // Force UI update
      }
    });
  }

  filterByStatus(status: string) {
    this.selectedStatus = status;
    this.loadMessages();
  }

  // Cancel
  cancelMessage(id: string) {
    if (!confirm('Cancel this message?')) return;
    this.http.post(`${this.API_URL}/cancel/${id}`, {}).subscribe({
      next: () => {
        this.loadMessages();
        alert('✅ Message cancelled');
      },
      error: (err) => {
        console.error(err);
        alert('❌ Failed to cancel');
      }
    });
  }

  // Quick reschedule
  reschedulePlus5(msg: Message) {
    if (msg.status !== 'pending') {
      alert('Only pending messages can be rescheduled.');
      return;
    }
    const newTime = new Date(msg.scheduledTime);
    newTime.setMinutes(newTime.getMinutes() + 5);

    this.http.put(`${this.API_URL}/update/${msg._id}`, {
      scheduledTime: newTime.toISOString()
    }).subscribe({
      next: () => {
        this.loadMessages();
        alert('⏰ Rescheduled +5 minutes');
      },
      error: (err) => {
        console.error(err);
        alert('❌ Failed to reschedule');
      }
    });
  }

  // 🔹 View Logs
  viewLogs(msg: Message) {
    this.logsForId = msg._id;
    this.logs = [];
    this.showLogs = true;
    this.logsLoading = true;

    this.http.get<{ logs: LogEntry[] }>(`${this.API_URL}/${msg._id}/logs`).subscribe({
      next: (res) => {
        this.logs = res.logs || [];
        this.logsLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.logsLoading = false;
        alert('❌ Failed to load logs');
      }
    });
  }

  closeLogs() {
    this.showLogs = false;
    this.logsForId = null;
    this.logs = [];
  }

  // --- Edit modal helpers ---
  editId: string | null = null;
  showEdit = false;
  editModel = {
    recipient: '',
    platform: 'email' as 'email' | 'sms' | 'whatsapp',
    subject: '',
    content: '',
    scheduledTimeLocal: ''
  };

  openEdit(msg: Message) {
    if (msg.status !== 'pending') {
      alert('Only pending messages can be edited.');
      return;
    }
    this.editId = msg._id;
    this.editModel = {
      recipient: msg.recipient,
      platform: msg.platform,
      subject: msg.subject || '',
      content: msg.content,
      scheduledTimeLocal: this.isoToLocalInput(msg.scheduledTime)
    };
    this.showEdit = true;
  }

  closeEdit() {
    this.showEdit = false;
    this.editId = null;
  }

  saveEdit() {
    if (!this.editId) return;
    this.saving = true;

    const scheduledTimeISO = this.localInputToISO(this.editModel.scheduledTimeLocal);

    const payload: any = {
      recipient: this.editModel.recipient,
      platform: this.editModel.platform,
      content: this.editModel.content,
      scheduledTime: scheduledTimeISO
    };
    if (this.editModel.platform === 'email') {
      payload.subject = this.editModel.subject || '';
    }

    this.http.put(`${this.API_URL}/update/${this.editId}`, payload).subscribe({
      next: () => {
        this.saving = false;
        this.closeEdit();
        this.loadMessages();
        alert('✅ Message updated');
      },
      error: (err) => {
        console.error(err);
        this.saving = false;
        alert(err?.error?.msg || '❌ Failed to update message');
      }
    });
  }

  private isoToLocalInput(iso: string) {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const min = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  }

  private localInputToISO(local: string) {
    return new Date(local).toISOString();
  }

  goTo(path: string) {
    this.router.navigate([`/${path}`]);
  }
}
