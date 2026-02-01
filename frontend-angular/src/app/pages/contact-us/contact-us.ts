// src/app/pages/contact-us/contact-us.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact-us.html',
  styleUrls: ['./contact-us.scss']
})
export class ContactUsComponent {
  model = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  onSubmit() {
    if (!this.model.name || !this.model.email || !this.model.message) {
      alert('Please fill in name, email and message.');
      return;
    }

    // For now just show an alert; can be extended to send to backend later.
    alert('Thank you for contacting us! This message is stored locally for demo purposes.');
    console.log('Contact form submitted:', this.model);

    this.model = { name: '', email: '', subject: '', message: '' };
  }
}