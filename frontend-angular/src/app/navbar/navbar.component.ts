// AngularApp\EchoDrop-v2\frontend-angular\src\app\navbar\navbar.component.ts
import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { RouterModule, Router, NavigationEnd, UrlTree } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isCollapsed = true;
  showNavbar: boolean = true;
  isLoggedIn: boolean = false;

  // Profile menu
  isProfileOpen = false;
  userName: string | null = null;   // from userInfo
  private authSubscription!: Subscription;
  private routeSubscription!: Subscription;

  constructor(
    private router: Router,
    public auth: AuthService,
    @Inject(PLATFORM_ID) private platformId: any // Add platform injection
  ) { }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    // Skip initialization on server
    if (!this.isBrowser()) {
      this.showNavbar = false;
      return;
    }

    // Initialize with current auth state
    this.isLoggedIn = this.auth.isLoggedIn();
    this.loadUserDisplay();
    console.log('Navbar initialized, isLoggedIn:', this.isLoggedIn);

    // Subscribe to authentication state changes
    this.authSubscription = this.auth.isLoggedIn$.subscribe(
      (loggedIn) => {
        this.isLoggedIn = loggedIn;
        console.log('Navbar auth state changed:', loggedIn);
        if (loggedIn) {
          this.loadUserDisplay();
        } else {
          this.userName = null;
        }
      }
    );

    // Subscribe to route changes
    this.routeSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const currentRoute = this.router.url;
        this.showNavbar = !['/login', '/signup'].includes(currentRoute);
        // console.log('Route changed:', currentRoute, 'Show navbar:', this.showNavbar);

        this.isLoggedIn = this.auth.isLoggedIn();
        // console.log('Auth state rechecked after route change:', this.isLoggedIn);
        this.loadUserDisplay();   // 🔹 update name/email from userInfo or token

        // Close menus on navigation
        this.isCollapsed = true;
        this.isProfileOpen = false;
      });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  private loadingUser = false;

  private loadUserDisplay() {
    this.userName = null;
    if (!this.isBrowser()) return;

    // Try cache first
    try {
      const raw = localStorage.getItem('userInfo');
      if (raw) {
        const user = JSON.parse(raw);
        this.userName = user.name || null;
      }
    } catch (e) {
      console.warn('Navbar: failed to read userInfo', e);
    }

    // If logged in but no cached user, fetch once
    if (this.auth.isLoggedIn() && !this.loadingUser) {
      this.loadingUser = true;
      this.auth.getCurrentUser().subscribe({
        next: (user) => {
          this.loadingUser = false;
          try {
            localStorage.setItem('userInfo', JSON.stringify(user));
          } catch (e) {
            console.warn('Navbar: failed to cache userInfo', e);
          }
          this.userName = user.name || null;
        },
        error: (err) => {
          this.loadingUser = false;
          console.error('Navbar: failed to load current user', err);
        }
      });
    }
  }

  get userEmail(): string | null {
    return this.auth.currentEmail;
  }

  get userDisplayName(): string {
    return this.userName || this.userEmail || 'User';
  }

  get userInitial(): string {
    const name = this.userDisplayName.trim();
    return name ? name[0].toUpperCase() : '?';
  }

  get roleLabel(): string {
    if (this.auth.isOwner) return 'Owner';
    if (this.auth.isAdmin) return 'Admin';
    return 'User';
  }

  toggleProfileMenu() {
    this.isProfileOpen = !this.isProfileOpen;
  }

  goTo(path: string | UrlTree) {
    this.router.navigateByUrl(path);
    this.isProfileOpen = false;
  }

  logout() {
    this.auth.logout();
    this.isProfileOpen = false;
    this.router.navigate(['/login']);
  }
}