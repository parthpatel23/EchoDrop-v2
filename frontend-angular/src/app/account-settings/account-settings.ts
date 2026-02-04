// AngularApp\EchoDrop-v2\frontend-angular\src\app\account-settings\account-settings.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './account-settings.html',
  styleUrls: ['./account-settings.scss']
})
export class AccountSettingsComponent implements OnInit {
  loading = true;
  saving = false;
  error: string | null = null;
  success: string | null = null;

  user: any = {};
  form = {
    name: '',
    defaultChannel: 'email'
  };

  constructor(
    private auth: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadUserFromCache();
  }

  private loadUserFromCache() {
    this.loading = true;
    this.error = null;

    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      this.loading = false;
      return;
    }

    try {
      const raw = window.localStorage.getItem('userInfo');
      if (!raw) {
        this.error = 'Profile is not loaded. Please open the Dashboard first.';
        this.loading = false;
        return;
      }

      this.user = JSON.parse(raw) || {};
      this.form.name = this.user.name || '';
      this.form.defaultChannel = this.user.defaultChannel || 'email';
      this.loading = false;
    } catch (e) {
      console.error('AccountSettings: failed to read cached user', e);
      this.error = 'Failed to load profile from cache.';
      this.loading = false;
    }
  }

  get googleLinked(): boolean {
    return !!this.user?.googleLinked;
  }

  get telegramLinked(): boolean {
    return !!this.user?.telegramLinked;
  }

  // 🔹 NEW: expose admin status from AuthService
  get isAdmin(): boolean {
    return this.auth.isAdmin;
  }

  // 🔹 NEW: navigate to admin console
  goToAdmin() {
    this.router.navigate(['/admin']);
  }

  onSave() {
    this.error = null;
    this.success = null;

    if (!this.form.name.trim()) {
      this.error = 'Name cannot be empty';
      return;
    }

    this.saving = true;
    this.auth.updateProfile(this.form).subscribe({
      next: (res) => {
        this.success = 'Profile updated successfully.';
        this.saving = false;

        this.user.name = this.form.name;
        this.user.defaultChannel = this.form.defaultChannel;
        try {
          localStorage.setItem('userInfo', JSON.stringify(this.user));
        } catch (e) {
          console.warn('Failed to cache updated user info', e);
        }
      },
      error: (err) => {
        console.error('AccountSettings: update error', err);
        this.error = err.error?.msg || 'Failed to update profile';
        this.saving = false;
      }
    });
  }
}