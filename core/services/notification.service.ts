import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private snackBar: MatSnackBar) { }

  private defaultConfig: MatSnackBarConfig = {
    duration: 3000,
    horizontalPosition: 'end',
    verticalPosition: 'top'
  };

  success(message: string, duration: number = 3000): void {
    this.snackBar.open(message, 'Cerrar', {
      ...this.defaultConfig,
      duration,
      panelClass: ['snackbar-success']
    });
  }

  error(message: string, duration: number = 5000): void {
    this.snackBar.open(message, 'Cerrar', {
      ...this.defaultConfig,
      duration,
      panelClass: ['snackbar-error']
    });
  }

  warning(message: string, duration: number = 4000): void {
    this.snackBar.open(message, 'Cerrar', {
      ...this.defaultConfig,
      duration,
      panelClass: ['snackbar-warning']
    });
  }

  info(message: string, duration: number = 3000): void {
    this.snackBar.open(message, 'Cerrar', {
      ...this.defaultConfig,
      duration,
      panelClass: ['snackbar-info']
    });
  }

  custom(message: string, action: string = 'Cerrar', config?: MatSnackBarConfig): void {
    this.snackBar.open(message, action, {
      ...this.defaultConfig,
      ...config
    });
  }

  dismiss(): void {
    this.snackBar.dismiss();
  }
}