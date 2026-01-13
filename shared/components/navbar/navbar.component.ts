import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService, User } from '../../../core/services/auth.service';
import { Observable } from 'rxjs';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser$!: Observable<User | null>;
  notificationCount = 3; // Esto vendría de un servicio de notificaciones

  ngOnInit(): void {
    this.currentUser$ = this.authService.currentUser$;
  }

  getUserInitials(user: User): string {
    return `${user.nombre.charAt(0)}${user.apellido.charAt(0)}`.toUpperCase();
  }

  onLogout(): void {
    this.authService.logout();
  }

  navigateToProfile(): void {
    // Por ahora mostrar datos en el menú, en el futuro se puede crear una página de perfil completa
    this.router.navigate(['/dashboard']);
  }
}