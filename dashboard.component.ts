import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatGridListModule } from '@angular/material/grid-list';
import { AuthService, User, UserRole } from '../../core/services/auth.service';
import { GetReportStatisticsUseCase } from '../../domain/use-cases/report/get-report-statistics.usecase';
import { GetAllResidencesUseCase } from '../../domain/use-cases/residence/get-all-residences.usecase';
import { GetAllPaymentsUseCase } from '../../domain/use-cases/payment/get-all-payments.usecase';
import { GetUpcomingActivitiesUseCase } from '../../domain/use-cases/activity/get-upcoming-activities.usecase';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { StatsCardComponent } from './components/stats-card/stats-card.component';
import { RecentActivitiesComponent } from './components/recent-activities/recent-activities.component';
import { PendingReportsComponent } from './components/pending-reports/pending-reports.component';

interface DashboardStats {
  totalResidences: number;
  totalResidents: number;
  pendingReports: number;
  totalPayments: number;
  upcomingActivities: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatChipsModule,
    MatGridListModule,
    StatsCardComponent,
    RecentActivitiesComponent,
    PendingReportsComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private getReportStatistics = inject(GetReportStatisticsUseCase);
  private getAllResidences = inject(GetAllResidencesUseCase);
  private getAllPayments = inject(GetAllPaymentsUseCase);
  private getUpcomingActivities = inject(GetUpcomingActivitiesUseCase);

  currentUser$!: Observable<User | null>;
  currentUser: User | null = null;
  isLoading = true;
  dashboardStats: DashboardStats = {
    totalResidences: 0,
    totalResidents: 0,
    pendingReports: 0,
    totalPayments: 0,
    upcomingActivities: 0
  };

  statsCards = [
    {
      title: 'Total Residencias',
      value: 0,
      icon: 'home',
      color: 'primary',
      route: '/residences',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Residentes Activos',
      value: 0,
      icon: 'people',
      color: 'accent',
      route: '/users',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Reportes Pendientes',
      value: 0,
      icon: 'report_problem',
      color: 'warn',
      route: '/reports',
      change: '-5%',
      changeType: 'negative'
    },
    {
      title: 'Pagos del Mes',
      value: 0,
      icon: 'payments',
      color: 'success',
      route: '/payments',
      change: '+15%',
      changeType: 'positive',
      prefix: '$'
    }
  ];

  quickActions = [
    {
      icon: 'add_home',
      label: 'Nueva Residencia',
      route: '/residences/new',
      color: 'primary',
      roles: [UserRole.ADMINISTRADOR, UserRole.SUPER_ADMIN]
    },
    {
      icon: 'person_add',
      label: 'Nuevo Usuario',
      route: '/users/new',
      color: 'accent',
      roles: [UserRole.ADMINISTRADOR, UserRole.SUPER_ADMIN]
    },
    {
      icon: 'add_alert',
      label: 'Crear Reporte',
      route: '/reports/new',
      color: 'warn'
    },
    {
      icon: 'event',
      label: 'Nueva Actividad',
      route: '/activities/new',
      color: 'success',
      roles: [UserRole.ADMINISTRADOR, UserRole.SUPER_ADMIN]
    }
  ];

  ngOnInit(): void {
    this.currentUser$ = this.authService.currentUser$;
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;

    forkJoin({
      reportStats: this.getReportStatistics.execute(),
      residences: this.getAllResidences.execute({ page: 1, limit: 1 }),
      payments: this.getAllPayments.execute({ page: 1, limit: 100 }),
      activities: this.getUpcomingActivities.execute()
    }).subscribe({
      next: (results) => {
        // Actualizar estadísticas
        this.dashboardStats.totalResidences = results.residences.total;
        this.dashboardStats.pendingReports = results.reportStats.byStatus.abierto + results.reportStats.byStatus.enProgreso;
        this.dashboardStats.totalPayments = results.payments.total;
        this.dashboardStats.upcomingActivities = results.activities.length;

        // Actualizar cards
        this.statsCards[0].value = this.dashboardStats.totalResidences;
        this.statsCards[1].value = this.dashboardStats.totalResidents;
        this.statsCards[2].value = this.dashboardStats.pendingReports;
        this.statsCards[3].value = this.dashboardStats.totalPayments;

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.isLoading = false;
      }
    });
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }

  hasAccess(roles?: UserRole[]): boolean {
    if (!roles || roles.length === 0) return true;
    return this.authService.hasRole(roles);
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}