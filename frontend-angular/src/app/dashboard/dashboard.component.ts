// AngularApp\echodrop\frontend-angular\src\app\dashboard\dashboard.component.ts
import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  userData: any = {};
  loading = true;
  API_URL = 'http://localhost:5000';

  constructor(
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: any // Change from object to any
  ) {}

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
        alert('✅ Google account linked successfully!');
        this.router.navigate([], {
          queryParams: { link_success: null },
          queryParamsHandling: 'merge'
        });
      }
      if (params['google_already_linked']) {
        alert('❌ This Google account is already linked to another user.');
        this.router.navigate([], {
          queryParams: { google_already_linked: null },
          queryParamsHandling: 'merge'
        });
      }
      if (params['error'] === 'link_failed') {
        alert('❌ Failed to link Google account. Please try again.');
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
