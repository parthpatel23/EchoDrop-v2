// AngularApp\echodrop\frontend-angular\src\app\app.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { HelpAssistantComponent } from './help-assistant/help-assistant.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, HelpAssistantComponent],
  templateUrl: './app.html'
})
export class App {}
