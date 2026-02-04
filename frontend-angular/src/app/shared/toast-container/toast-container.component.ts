// AngularApp\EchoDrop-v2\frontend-angular\src\app\shared\toast-container\toast-container.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-container.component.html',
  styleUrls: ['./toast-container.component.scss']
})
export class ToastContainerComponent {
  constructor(public toastService: ToastService) { }

  trackById(index: number, toast: Toast) {
    return toast.id;
  }

  dismiss(id: number) {
    this.toastService.dismiss(id);
  }
}