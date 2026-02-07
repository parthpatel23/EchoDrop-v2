// AngularApp\EchoDrop-v2\frontend-angular\src\app\admin\admin-dashboard\admin-dashboard.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ToastService } from '../../shared/toast.service';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  // API_URL = 'https://echodrop-backend.onrender.com/admin';
  API_URL = `${environment.apiBaseUrl}/admin`;

  loading = true;
  error: string | null = null;

  stats: any = null;
  statsRange: 'all' | 'today' | '7d' | 'month' = 'all';
  users: any[] = [];
  failedPage = 1;
  failedPageSize = 10;
  failedTotal = 0;
  failedMessages: any[] = [];

  // --- Users filters & pagination ---
  userSearch = '';
  userHasMessages: 'all' | 'true' | 'false' = 'all';
  userPage = 1;
  userPageSize = 10;
  userTotal = 0;

  // --- Admin role change modal state ---
  showRoleConfirm = false;
  roleTarget: any = null;
  roleTargetNewState: boolean = false; // true => make admin, false => remove admin

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private toast: ToastService,
    public auth: AuthService
  ) { }

  ngOnInit() {
    this.loadAll();
  }

  onStatsRangeChange(range: any) {
    this.statsRange = range;
    this.loadStats();
  }

  loadStats() {
    this.loading = true;
    this.http.get<any>(`${this.API_URL}/stats`, { params: { range: this.statsRange } }).subscribe({
      next: (res) => { this.stats = res; this.loading = false; this.cdr.detectChanges(); },
      error: (err) => { this.loading = false; this.error = err.error?.msg || 'Failed to load admin stats.'; this.cdr.detectChanges(); }
    });
  }

  get failedTotalPages(): number {
    return Math.max(Math.ceil(this.failedTotal / this.failedPageSize), 1);
  }

  goToFailedPage(page: number) {
    if (page < 1 || page > this.failedTotalPages) return;
    this.failedPage = page;
    this.loadFailedMessages();
  }

  loadFailedMessages() {
    const params: any = {
      status: 'failed',
      page: this.failedPage,
      limit: this.failedPageSize
    };

    this.http.get<any>(`${this.API_URL}/messages`, { params }).subscribe({
      next: (res) => {
        this.failedMessages = res.messages || [];
        this.failedTotal = res.total || 0;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('[Admin] messages error', err)
    });
  }

  get currentAdminEmail() {
    return this.auth.currentEmail;
  }

  get isOwner(): boolean {
    return this.auth.isOwner;
  }

  loadUsers() {
    const params: any = { page: this.userPage, limit: this.userPageSize };

    if (this.userSearch.trim()) params.search = this.userSearch.trim();
    if (this.userHasMessages !== 'all') {
      params.hasMessages = this.userHasMessages; // 'true' or 'false'
    }

    console.log('GET', `${this.API_URL}/users`, params);

    this.http.get<any>(`${this.API_URL}/users`, { params }).subscribe({
      next: (res) => {
        console.log('users res =>', res);
        this.users = res.users || [];
        this.userTotal = res.total || 0;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[Admin] users error', err);
        this.error = err.error?.msg || 'Failed to load users';
        this.cdr.detectChanges();
      }
    });
  }

  private searchTimer: any;

  onUserSearchInput() {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.userPage = 1;
      this.loadUsers();
    }, 300);
  }

  clearUserFilters() {
    this.userSearch = '';
    this.userHasMessages = 'all';
    this.userPage = 1;
    this.loadUsers();
  }

  onHasMessagesChange(value: 'all' | 'true' | 'false') {
    this.userHasMessages = value;
    this.userPage = 1;
    this.loadUsers();
  }

  get userTotalPages(): number {
    return Math.max(Math.ceil(this.userTotal / this.userPageSize), 1);
  }

  goToUserPage(page: number) {
    if (page < 1 || page > this.userTotalPages) return;
    this.userPage = page;
    this.loadUsers();
  }

  loadAll() {
    this.loading = true;
    this.error = null;

    // --- Stats ---
    this.http.get<any>(`${this.API_URL}/stats`).subscribe({
      next: (res) => {
        this.stats = res;
        this.loading = false;
        this.cdr.detectChanges(); // ensure view updates
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 403) {
          this.error = 'You do not have admin access.';
        } else if (err.status === 401) {
          this.error = 'Please log in to access the admin dashboard.';
        } else {
          this.error = err.error?.msg || 'Failed to load admin stats.';
        }
        this.cdr.detectChanges();
      }
    });

    // --- Users with filters/pagination ---
    this.loadUsers();

    // --- Failed messages ---
    this.loadFailedMessages()
  }

  // Promote/demote owner/admin status
  openRoleConfirm(user: any) {
    // Only owner can see this button, but double-check
    if (!this.isOwner) return;

    const makeAdmin = !user.isAdmin;

    // Extra safety: don't allow changes to yourself
    if (!makeAdmin && user.email === this.currentAdminEmail) {
      this.toast.error("You can't remove your own admin access.");
      return;
    }

    this.roleTarget = user;
    this.roleTargetNewState = makeAdmin;
    this.showRoleConfirm = true;
  }

  closeRoleConfirm() {
    this.showRoleConfirm = false;
    this.roleTarget = null;
  }

  confirmRoleChange() {
    if (!this.roleTarget) return;

    const user = this.roleTarget;
    const makeAdmin = this.roleTargetNewState;

    this.http
      .patch<any>(`${this.API_URL}/users/${user._id}/admin`, { isAdmin: makeAdmin })
      .subscribe({
        next: (res) => {
          console.log('[Admin] admin status updated', res);
          user.isAdmin = makeAdmin;
          this.toast.success(
            `User ${makeAdmin ? 'promoted to' : 'removed from'} admin`
          );
          this.cdr.detectChanges();
          this.closeRoleConfirm();
        },
        error: (err) => {
          console.error('[Admin] toggle admin error', err);
          this.toast.error(err.error?.msg || 'Failed to update admin status');
          this.closeRoleConfirm();
        }
      });
  }
}