// AngularApp\echodrop\frontend-angular\src\app\app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AccountSettingsComponent } from './account-settings/account-settings';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy';
import { TermsAndConditionsComponent } from './pages/terms-and-conditions/terms-and-conditions';
import { ContactUsComponent } from './pages/contact-us/contact-us';
import { ScheduleMessageComponent } from './messages/schedule-message/schedule-message.component';
import { MessagesListComponent } from './messages/messages-list/messages-list.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'account', component: AccountSettingsComponent , canActivate: [AuthGuard] },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  { path: 'terms', component: TermsAndConditionsComponent },
  { path: 'contact', component: ContactUsComponent },
  { path: 'schedule', component: ScheduleMessageComponent, canActivate: [AuthGuard] },
  { path: 'messages', component: MessagesListComponent, canActivate: [AuthGuard] }
];
