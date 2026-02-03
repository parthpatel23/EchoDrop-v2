import { Component, OnInit } from '@angular/core';
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

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.loading = true;
    this.error = null;

    // Load stats
    this.http.get<any>(`${this.API_URL}/stats`).subscribe({
      next: (res) => {
        this.stats = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Admin stats error', err);
        this.loading = false;
        if (err.status === 403) {
          this.error = 'You do not have admin access.';
        } else if (err.status === 401) {
          this.error = 'Please log in to access the admin dashboard.';
        } else {
          this.error = err.error?.msg || 'Failed to load admin stats.';
        }
      }
    });

    // Load users
    this.http.get<any>(`${this.API_URL}/users`).subscribe({
      next: (res) => {
        this.users = res.users || [];
      },
      error: (err) => {
        console.error('Admin users error', err);
      }
    });

    // Load failed messages
    this.http.get<any>(`${this.API_URL}/messages?status=failed&limit=50`).subscribe({
      next: (res) => {
        this.failedMessages = res.messages || [];
      },
      error: (err) => {
        console.error('Admin messages error', err);
      }
    });
  }
}