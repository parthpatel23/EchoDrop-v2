// AngularApp\echodrop\frontend-angular\src\app\messages\schedule-message\schedule-message.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-schedule-message',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './schedule-message.component.html',
  styleUrls: ['./schedule-message.component.scss']
})
export class ScheduleMessageComponent {
  API_URL = 'http://localhost:5000/messages';

  message = {
    recipient: '',
    platform: 'email',
    subject: '',
    content: '',
    scheduledTime: ''
  };

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit() {
    this.http.post(`${this.API_URL}/create`, this.message).subscribe({
      next: (res: any) => {
        alert('✅ Message scheduled successfully!');
      
        // Add a small delay to ensure data is saved
        setTimeout(() => {
          this.router.navigate(['/messages']);
        }, 500);
      },
      error: (err) => {
        console.error(err);
        alert(err.error?.msg || '❌ Failed to schedule message');
      }
    });
  }

  goTo(path: string) {
    this.router.navigate([`/${path}`]);
  }
}
