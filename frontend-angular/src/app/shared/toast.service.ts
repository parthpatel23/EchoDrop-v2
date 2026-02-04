// AngularApp\EchoDrop-v2\frontend-angular\src\app\shared\toast.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastsSubject.asObservable();

  private nextId = 1;

  private addToast(toast: Toast) {
    this.toastsSubject.next([...this.toastsSubject.value, toast]);
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => this.dismiss(toast.id), toast.duration);
    }
  }

  show(message: string, type: ToastType = 'info', duration = 3000) {
    this.addToast({ id: this.nextId++, message, type, duration });
  }

  success(message: string, duration = 3000) {
    this.show(message, 'success', duration);
  }

  error(message: string, duration = 4000) {
    this.show(message, 'error', duration);
  }

  info(message: string, duration = 3000) {
    this.show(message, 'info', duration);
  }

  dismiss(id: number) {
    this.toastsSubject.next(
      this.toastsSubject.value.filter(t => t.id !== id)
    );
  }

  clear() {
    this.toastsSubject.next([]);
  }
}