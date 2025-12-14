// Frontend/src/app/dashboard/components/pending-reports/pending-reports.component.ts (CORREGIDO)
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GetAllReportsUseCase } from '../../../../domain/use-cases/report/get-all-reports.usecase';
import { Report, ReportPriority, ReportType } from '../../../../domain/models/report.model';

interface PaginatedResponse<T> {
  data?: T[];
  reports?: T[];
  total?: number;
  pages?: number;
  currentPage?: number;
}

@Component({
  selector: 'app-pending-reports',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './pending-reports.component.html',
  styleUrls: ['./pending-reports.component.scss']
})
export class PendingReportsComponent implements OnInit {
  private getAllReports = inject(GetAllReportsUseCase);
  private cdr = inject(ChangeDetectorRef); // AGREGADO

  pendingReports: Report[] = [];
  isLoading = false; // CAMBIADO: Inicializar en false

  ngOnInit(): void {
    this.loadPendingReports();
  }

  loadPendingReports(): void {
    this.isLoading = true;
    this.cdr.detectChanges(); // AGREGADO: Forzar detección de cambios

    this.getAllReports.execute({ 
      page: 1, 
      limit: 6,
      estado: 'Abierto,En Progreso'
    }).subscribe({
      next: (result: PaginatedResponse<Report> | Report[] | any) => {
        console.log('Reports response:', result);
        
        if (Array.isArray(result)) {
          this.pendingReports = result;
        } else if (result && Array.isArray(result.data)) {
          this.pendingReports = result.data;
        } else if (result && Array.isArray(result.reports)) {
          this.pendingReports = result.reports;
        } else {
          console.warn('Unexpected reports response format:', result);
          this.pendingReports = [];
        }

        // AGREGADO: Establecer isLoading en false después de un breve delay
        setTimeout(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }, 0);
      },
      error: (error) => {
        console.error('Error loading pending reports:', error);
        this.pendingReports = [];
        
        setTimeout(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }, 0);
      }
    });
  }

  getSafeTimeAgoDate(dateInput: string | Date | undefined): string {
    if (!dateInput) return '';

    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return this.getTimeAgo(date);
  }

  getTimeAgo(date: string | Date | undefined): string {
    if (!date) return '';

    const now = new Date();
    const reportDate = typeof date === 'string' ? new Date(date) : new Date(date);
    const diff = now.getTime() - reportDate.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 24) {
      return `Hace ${hours}h`;
    } else {
      return `Hace ${days}d`;
    }
  }

  getPriorityClass(priority: ReportPriority): string {
    const priorityMap: Record<ReportPriority, string> = {
      [ReportPriority.CRITICA]: 'priority-critical',
      [ReportPriority.ALTA]: 'priority-high',
      [ReportPriority.MEDIA]: 'priority-medium',
      [ReportPriority.BAJA]: 'priority-low'
    };
    return priorityMap[priority];
  }

  getPriorityIcon(priority: ReportPriority): string {
    const iconMap: Record<ReportPriority, string> = {
      [ReportPriority.CRITICA]: 'priority_high',
      [ReportPriority.ALTA]: 'arrow_upward',
      [ReportPriority.MEDIA]: 'remove',
      [ReportPriority.BAJA]: 'arrow_downward'
    };
    return iconMap[priority];
  }

  getReportIcon(type: ReportType): string {
    const icons: Record<ReportType, string> = {
      [ReportType.MANTENIMIENTO]: 'build', 
      [ReportType.LIMPIEZA]: 'cleaning_services',
      [ReportType.SEGURIDAD]: 'security',
      [ReportType.INSTALACIONES]: 'devices',
      [ReportType.OTRO]: 'help_outline',
    };
    return icons[type] || 'report_problem';
  }

  getReportColor(type: ReportType): string {
    const colors: Record<ReportType, string> = {
      [ReportType.MANTENIMIENTO]: '#2196f3', // Azul
      [ReportType.LIMPIEZA]: '#4caf50',     // Verde
      [ReportType.SEGURIDAD]: '#f44336',    // Rojo
      [ReportType.INSTALACIONES]: '#ff9800',// Naranja
      [ReportType.OTRO]: '#9e9e9e',
    };
    return colors[type] || '#666';
  }
}