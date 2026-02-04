// src/app/admin/admin-dashboard/admin-dashboard.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ToastService } from '../../shared/toast.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  // API_URL = 'https://echodrop-backend.onrender.com/admin';
  API_URL = `${environment.apiBaseUrl}/admin`;

  loading = true;
  error: string | null = null;

  stats: any = null;
  users: any[] = [];
  failedMessages: any[] = [];

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

  // someAdminAction() {
  //   this.http.post(...).subscribe({
  //     next: () => this.toast.success('Action completed'),
  //     error: () => this.toast.error('Action failed')
  //   });
  // }

  ngOnInit() {
    this.loadAll();
  }

  get currentAdminEmail() {
    return this.auth.currentEmail;
  }

  get isOwner(): boolean {
    return this.auth.isOwner;
  }

  loadAll() {
    this.loading = true;
    this.error = null;

    // --- Stats ---
    this.http.get<any>(`${this.API_URL}/stats`).subscribe({
      next: (res) => {
        console.log('[Admin] stats response', res);
        this.stats = res;
        this.loading = false;
        this.cdr.detectChanges(); // ensure view updates
      },
      error: (err) => {
        console.error('[Admin] stats error', err);
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

    // --- Users ---
    this.http.get<any>(`${this.API_URL}/users`).subscribe({
      next: (res) => {
        console.log('[Admin] users response', res);
        this.users = res.users || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[Admin] users error', err);
      }
    });

    // --- Failed messages ---
    this.http
      .get<any>(`${this.API_URL}/messages?status=failed&limit=50`)
      .subscribe({
        next: (res) => {
          console.log('[Admin] messages response', res);
          this.failedMessages = res.messages || [];
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('[Admin] messages error', err);
        }
      });
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