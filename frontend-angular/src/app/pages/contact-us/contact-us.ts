// src/app/pages/contact-us/contact-us.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../shared/toast.service';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact-us.html',
  styleUrls: ['./contact-us.scss']
})
export class ContactUsComponent {
  constructor(
    private toast: ToastService
  ) { }

  model = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  onSubmit() {
    if (!this.model.name || !this.model.email || !this.model.message) {
      // alert('Please fill in name, email and message.');
      this.toast.error('Please fill in name, email and message.');
      return;
    }

    // For now just show an alert; can be extended to send to backend later.
    // alert('Thank you for contacting us! This message is stored locally for demo purposes.');
    this.toast.success('Thank you for contacting us! This message is stored locally for demo purposes.');
    console.log('Contact form submitted:', this.model);

    this.model = { name: '', email: '', subject: '', message: '' };
  }
}