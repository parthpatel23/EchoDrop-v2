// AngularApp\echodrop\frontend-angular\src\app\app.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { HelpAssistantComponent } from './help-assistant/help-assistant.component';
import { ToastContainerComponent } from './shared/toast-container/toast-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, HelpAssistantComponent, ToastContainerComponent],
  templateUrl: './app.html'
})
export class App {}
