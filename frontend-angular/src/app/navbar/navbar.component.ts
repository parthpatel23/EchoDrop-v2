// AngularApp\echodrop\frontend-angular\src\app\navbar\navbar.component.ts
import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
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
  showNavbar: boolean = true;
  isLoggedIn: boolean = false;
  private authSubscription!: Subscription;
  private routeSubscription!: Subscription;

  constructor(
    private router: Router, 
    public auth: AuthService,
    @Inject(PLATFORM_ID) private platformId: any // Add platform injection
  ) { }

  ngOnInit() {
    // Skip initialization on server
    if (!isPlatformBrowser(this.platformId)) {
      this.showNavbar = false;
      return;
    }

    // Initialize with current auth state
    this.isLoggedIn = this.auth.isLoggedIn();
    console.log('Navbar initialized, isLoggedIn:', this.isLoggedIn);

    // Subscribe to authentication state changes
    this.authSubscription = this.auth.isLoggedIn$.subscribe(
      (loggedIn) => {
        this.isLoggedIn = loggedIn;
        console.log('Navbar auth state changed:', loggedIn);
      }
    );

    // Subscribe to route changes
    this.routeSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // Hide navbar on login and signup pages
        const currentRoute = this.router.url;
        this.showNavbar = !['/login', '/signup'].includes(currentRoute);
        console.log('Route changed:', currentRoute, 'Show navbar:', this.showNavbar);
        
        // Force check auth state on route changes
        this.isLoggedIn = this.auth.isLoggedIn();
        console.log('Auth state rechecked after route change:', this.isLoggedIn);
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

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
