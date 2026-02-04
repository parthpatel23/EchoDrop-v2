// AngularApp/EchoDrop-v2/frontend-angular/src/app/messages/messages-list/messages-list.component.ts
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ToastService } from '../../shared/toast.service';

type Message = {
  _id: string;
  recipient: string;
  platform: 'email' | 'sms' | 'whatsapp' | 'telegram';
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

const SCHEDULE_DRAFT_KEY = 'echodrop_schedule_draft';

@Component({
  selector: 'app-messages-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messages-list.component.html',
  styleUrls: ['./messages-list.component.scss']
})

export class MessagesListComponent implements OnInit, OnDestroy {
  // API_URL = 'http://localhost:5000/messages';
  // API_URL = 'https://echodrop-backend.onrender.com/messages';
  private API_URL = `${environment.apiBaseUrl}/messages`;

  private allMessages: Message[] = [];      // All messages from the API

  messages: Message[] = [];       // Messages actually shown in the table (after filtering)

  loading = false;
  saving = false;

  // Filters
  selectedStatus: string = 'all';
  statuses = ['all', 'pending', 'processing', 'sent', 'failed', 'cancelled'];

  // Logs modal state
  showLogs = false;
  logsLoading = false;
  logs: LogEntry[] = [];
  logsForId: string | null = null;

  // Edit modal state
  editId: string | null = null;
  showEdit = false;
  editModel = {
    recipient: '',
    platform: 'email' as 'email' | 'sms' | 'whatsapp' | 'telegram',
    subject: '',
    content: '',
    scheduledTimeLocal: ''
  };

  // --- Cancel confirm modal state ---
  showCancelConfirm = false;
  cancelTarget: Message | null = null;

  private refreshInterval: any;
  private routerSubscription: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private toast: ToastService
  ) { }

  ngOnInit() {
    this.loadMessages();

    // 🔄 Automatically refresh messages every 5 seconds
    this.refreshInterval = setInterval(() => {
      this.loadMessages(false); // refresh silently, keep current filter
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
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  /**
   * Always fetch ALL messages from the backend,
   * then apply the current status filter on the client.
   */
  loadMessages(showLoading = true) {
    if (showLoading) this.loading = true;

    this.http.get<{ messages: Message[] }>(`${this.API_URL}/list`).subscribe({
      next: (res) => {
        this.allMessages = res.messages || [];
        this.applyFilter(); // refresh this.messages according to selectedStatus
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

  /**
   * Update the visible messages based on selectedStatus.
   * "all" => no filtering.
   */
  private applyFilter() {
    if (this.selectedStatus === 'all') {
      this.messages = [...this.allMessages];
    } else {
      this.messages = this.allMessages.filter(
        msg => msg.status === this.selectedStatus
      );
    }
  }

  filterByStatus(status: string) {
    this.selectedStatus = status;
    this.applyFilter(); // no extra HTTP call; we already have allMessages
  }

  // Cancel
  // Open confirm modal
  openCancelConfirm(msg: Message) {
    if (msg.status !== 'pending') return; // safety; button is already disabled
    this.cancelTarget = msg;
    this.showCancelConfirm = true;
  }
  private cancelMessage(id: string) {
    this.http.post(`${this.API_URL}/cancel/${id}`, {}).subscribe({
      next: () => {
        this.loadMessages();
        // alert('✅ Message cancelled');
        this.toast.success('Message cancelled');
      },
      error: (err) => {
        console.error(err);
        // alert('❌ Failed to cancel');
        this.toast.error('Failed to cancel message');
      }
    });
  }

  // When user clicks "Yes, cancel it"
  confirmCancel() {
    if (!this.cancelTarget?._id) return;
    this.cancelMessage(this.cancelTarget._id);
    this.closeCancelConfirm();
  }

  // When user clicks "Keep scheduled" or closes modal
  closeCancelConfirm() {
    this.showCancelConfirm = false;
    this.cancelTarget = null;
  }

  // Quick reschedule
  reschedulePlus5(msg: Message) {
    if (msg.status !== 'pending') {
      // alert('Only pending messages can be rescheduled.');
      this.toast.info('Only pending messages can be rescheduled.');
      return;
    }
    const newTime = new Date(msg.scheduledTime);
    newTime.setMinutes(newTime.getMinutes() + 5);

    this.http.put(`${this.API_URL}/update/${msg._id}`, {
      scheduledTime: newTime.toISOString()
    }).subscribe({
      next: () => {
        this.loadMessages();
        // alert('⏰ Rescheduled +5 minutes');
        this.toast.success('Rescheduled +5 minutes');
      },
      error: (err) => {
        console.error(err);
        // alert('❌ Failed to reschedule');
        this.toast.error('Failed to reschedule message');
      }
    });
  }

  // Schedule Again
  scheduleAgain(msg: Message) {
    if (msg.status === 'pending') {
      return; // just in case
    }

    // Only makes sense for non-pending messages
    // But even if called for pending, it's harmless
    const draft = {
      recipient: msg.recipient,
      platform: msg.platform,
      subject: msg.subject || '',
      content: msg.content
      // We intentionally do NOT include scheduledTime; user picks a new one
    };

    try {
      if (typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined') {
        sessionStorage.setItem(SCHEDULE_DRAFT_KEY, JSON.stringify(draft));
      }
    } catch (e) {
      console.warn('Failed to store schedule draft', e);
    }

    // Navigate to the schedule page where the form will be prefilled
    this.router.navigate(['/schedule']);
  }

  // 🔹 View Logs
  viewLogs(msg: Message) {
    this.logsForId = msg._id;
    this.logs = [];
    this.showLogs = true;
    this.logsLoading = true;

    // Backend route: GET /messages/:id/logs
    this.http.get<{ logs: LogEntry[] }>(`${this.API_URL}/${msg._id}/logs`).subscribe({
      next: (res) => {
        console.log('Logs response from backend:', res);
        this.logs = res.logs || [];
        this.logsLoading = false;
      },
      error: (err) => {
        console.error('Error loading logs', err);
        this.logsLoading = false;
        // alert('❌ Failed to load logs');
        this.toast.error('Failed to load logs');
      }
    });
  }

  closeLogs() {
    this.showLogs = false;
    this.logsForId = null;
    this.logs = [];
  }

  // --- Edit modal helpers ---
  openEdit(msg: Message) {
    console.log('[openEdit] clicked for', msg._id, 'status:', msg.status);
    if (msg.status !== 'pending') {
      // alert('Only pending messages can be edited.');
      this.toast.info('Only pending messages can be edited.');
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
    console.log('[openEdit] showEdit =', this.showEdit, 'editModel =', this.editModel);
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

    console.log('[saveEdit] editId =', this.editId);
    console.log('[saveEdit] payload =', payload);

    this.http.put(`${this.API_URL}/update/${this.editId}`, payload).subscribe({
      next: (res) => {
        console.log('[saveEdit] success response =', res);
        this.saving = false;
        this.closeEdit();
        this.loadMessages();
        // alert('✅ Message updated');
        this.toast.success('Message updated');
      },
      error: (err) => {
        console.error('[saveEdit] error =', err);
        this.saving = false;
        // alert(err?.error?.msg || '❌ Failed to update message');
        this.toast.error(err?.error?.msg || 'Failed to update message');
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