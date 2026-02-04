// AngularApp\EchoDrop-v2\frontend-angular\src\app\dashboard\dashboard.component.ts
import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';
import { ToastService } from '../shared/toast.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  userData: any = {};
  loading = true;
  // API_URL = 'http://localhost:5000';
  // private API_URL = 'https://echodrop-backend.onrender.com'; // your Render URL
  private API_URL = environment.apiBaseUrl;

  constructor(
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: any,
    private toast: ToastService
  ) { }

  ngOnInit() {
    // Use Angular's proper platform detection
    if (!isPlatformBrowser(this.platformId)) {
      console.log('Running on server, skipping processing');
      this.loading = false;
      return;
    }

    // Just load user data - token processing is handled by AuthGuard
    this.loadUserData();
  }

  private loadUserData() {
    const token = this.auth.getToken();
    console.log('Loading user data - token:', token);

    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.auth.getCurrentUser().subscribe({
      next: (data) => {
        console.log('Fetched user data:', data);
        this.userData = data || {};
        try {
          localStorage.setItem('userInfo', JSON.stringify(this.userData));
        } catch (e) {
          console.warn('Failed to cache user info in localStorage', e);
        }
        this.loading = false;
        this.cdr.detectChanges();
        this.checkForLinkingMessages();
      },
      error: (err) => {
        console.error('Error fetching user data:', err);
        this.loading = false;
        this.router.navigate(['/login']);
      }
    });
  }

  private checkForLinkingMessages() {
    this.route.queryParams.subscribe(params => {
      if (params['link_success']) {
        // alert('✅ Google account linked successfully!');
        this.toast.success('Google account linked successfully!');
        this.router.navigate([], {
          queryParams: { link_success: null },
          queryParamsHandling: 'merge'
        });
      }
      if (params['google_already_linked']) {
        // alert('❌ This Google account is already linked to another user.');
        this.toast.error('This Google account is already linked to another user.');
        this.router.navigate([], {
          queryParams: { google_already_linked: null },
          queryParamsHandling: 'merge'
        });
      }
      if (params['error'] === 'link_failed') {
        // alert('❌ Failed to link Google account. Please try again.');
        this.toast.error('Failed to link Google account. Please try again.');
        this.router.navigate([], {
          queryParams: { error: null },
          queryParamsHandling: 'merge'
        });
      }
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  goTo(path: string) {
    this.router.navigate([`/${path}`]);
  }

  linkGoogleAccount() {
    window.location.href = `${this.API_URL}/auth/google`;
  }
}