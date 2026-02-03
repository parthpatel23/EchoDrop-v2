// src/app/admin/admin-dashboard/admin-dashboard.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  API_URL = 'https://echodrop-backend.onrender.com/admin';

  loading = true;
  error: string | null = null;

  stats: any = null;
  users: any[] = [];
  failedMessages: any[] = [];

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    console.log('[Admin] ngOnInit - browser');
    this.loadAll();
  }

  loadAll() {
    console.log('[Admin] loadAll() called');
    this.loading = true;
    this.error = null;

    // --- Stats ---
    this.http.get<any>(`${this.API_URL}/stats`).subscribe({
      next: (res) => {
        console.log('[Admin] stats response (next)', res);
        this.stats = res;
        this.loading = false;
        this.cdr.detectChanges(); // ensure view updates
      },
      error: (err) => {
        console.error('[Admin] stats error (error)', err);
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
        console.log('[Admin] users response (next)', res);
        this.users = res.users || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[Admin] users error (error)', err);
      }
    });

    // --- Failed messages ---
    this.http
      .get<any>(`${this.API_URL}/messages?status=failed&limit=50`)
      .subscribe({
        next: (res) => {
          console.log('[Admin] messages response (next)', res);
          this.failedMessages = res.messages || [];
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('[Admin] messages error (error)', err);
        }
      });
  }
}