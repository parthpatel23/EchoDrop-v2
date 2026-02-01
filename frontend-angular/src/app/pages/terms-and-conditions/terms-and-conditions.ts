// src/app/pages/terms-and-conditions/terms-and-conditions.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-terms-and-conditions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './terms-and-conditions.html',
  styleUrls: ['./terms-and-conditions.scss']
})
export class TermsAndConditionsComponent {
  today = new Date();
}