// AngularApp\EchoDrop-v2\frontend-angular\src\app\navbar\navbar.component.ts
import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, ElementRef, HostListener } from '@angular/core';
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

  private authSubscription!: Subscription;
  private routeSubscription!: Subscription;

  constructor(
    private router: Router,
    public auth: AuthService,
    private elRef: ElementRef,          // for click detection
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


    // React to login/logout
    this.authSubscription = this.auth.isLoggedIn$.subscribe(
      (loggedIn) => {
        this.isLoggedIn = loggedIn;
        if (!loggedIn) {
          this.isProfileOpen = false;
        }
      }
    );

    // Subscribe to route changes
    this.routeSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const currentRoute = this.router.url;
        this.showNavbar = !['/login', '/signup'].includes(currentRoute);

        this.isLoggedIn = this.auth.isLoggedIn();

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

  // Close dropdown when clicking outside navbar
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.isBrowser()) return;
    const target = event.target as HTMLElement;
    const clickedInside = this.elRef.nativeElement.contains(target);
    if (!clickedInside) {
      this.isProfileOpen = false;
    }
  }

  // Display helpers
  get userDisplayName(): string {
    return this.auth.currentName || this.auth.currentEmail || 'User';
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