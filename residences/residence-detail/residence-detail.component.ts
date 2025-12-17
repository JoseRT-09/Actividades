import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { GetResidenceByIdUseCase } from '../../../domain/use-cases/residence/get-residence-by-id.usecase';
import { DeleteResidenceUseCase } from '../../../domain/use-cases/residence/delete-residence.usecase';
import { GetReassignmentHistoryUseCase } from '../../../domain/use-cases/residence/get-reassignment-history.usecase';
import { Residence, ResidenceStatus, ReassignmentHistory } from '../../../domain/models/residence.model';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-residence-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatTabsModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatMenuModule,
    MatTableModule
  ],
  templateUrl: './residence-detail.component.html',
  styleUrls: ['./residence-detail.component.scss']
})
export class ResidenceDetailComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private getResidenceById = inject(GetResidenceByIdUseCase);
  private deleteResidence = inject(DeleteResidenceUseCase);
  private getReassignmentHistory = inject(GetReassignmentHistoryUseCase);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  residence: Residence | null = null;
  reassignmentHistory: ReassignmentHistory[] = [];
  isLoading = true;
  isLoadingHistory = false;
  residenceId!: number;

  displayedColumns: string[] = ['fecha', 'tipo', 'residente_anterior', 'residente_nuevo', 'motivo'];

  stats = [
    { label: 'Años Registrada', value: 0, icon: 'schedule', color: '#667eea' },
    { label: 'Cambios de Residente', value: 0, icon: 'swap_horiz', color: '#ff9800' },
    { label: 'Pagos Recibidos', value: 0, icon: 'payments', color: '#4caf50' },
    { label: 'Reportes Generados', value: 0, icon: 'report', color: '#f44336' }
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.residenceId = +id;
      this.loadResidence();
      this.loadReassignmentHistory();
    } else {
      this.router.navigate(['/residences']);
    }
  }

  loadResidence(): void {
    this.isLoading = true;
    
    this.getResidenceById.execute(this.residenceId).subscribe({
      next: (residence) => {
        this.residence = residence;
        this.calculateStats();
        this.isLoading = false;
      },
      error: (error) => {
        this.notificationService.error('Error al cargar residencia');
        this.router.navigate(['/residences']);
        this.isLoading = false;
      }
    });
  }

  loadReassignmentHistory(): void {
    this.isLoadingHistory = true;

    this.getReassignmentHistory.execute(this.residenceId).subscribe({
      next: (historyResponse: any) => {
        // ✅ CORRECCIÓN: Inicializar como array vacío si la respuesta es undefined/null
        this.reassignmentHistory = Array.isArray(historyResponse) 
          ? historyResponse
          : historyResponse || []; 
        this.stats[1].value = this.reassignmentHistory.length;
        this.isLoadingHistory = false;
      },
      error: (error) => {
        console.error('Error loading history:', error);
        // Si falla el historial, establecemos a un array vacío para evitar que la app crashe
        this.reassignmentHistory = [];
        this.isLoadingHistory = false;
      }
    });
  }

  calculateStats(): void {
    if (!this.residence) return;

    // Calcular años desde el registro
    const createdDate = new Date(this.residence.created_at || Date.now());
    const now = new Date();
    const years = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 365));
    this.stats[0].value = years > 0 ? years : 0;

    // Los demás valores se cargarían de otras fuentes en producción
    this.stats[2].value = 12; // Ejemplo
    this.stats[3].value = 3;  // Ejemplo
  }

  onEdit(): void {
    this.router.navigate(['/residences', this.residenceId, 'edit']);
  }

  onAssign(): void {
    this.router.navigate(['/residences', this.residenceId, 'assign']);
  }

  onDelete(): void {
    if (!this.residence) return;

    const confirmed = confirm(
      `¿Estás seguro de eliminar la residencia ${this.residence.numero_unidad}?\n\nEsta acción no se puede deshacer.`
    );

    if (confirmed) {
      this.deleteResidence.execute(this.residenceId).subscribe({
        next: () => {
          this.notificationService.success('Residencia eliminada correctamente');
          this.router.navigate(['/residences']);
        },
        error: () => {
          this.notificationService.error('Error al eliminar residencia');
        }
      });
    }
  }

  getStatusClass(status: ResidenceStatus): string {
    const statusMap: Record<ResidenceStatus, string> = {
      [ResidenceStatus.OCUPADA]: 'status-occupied',
      [ResidenceStatus.DISPONIBLE]: 'status-available',
      [ResidenceStatus.MANTENIMIENTO]: 'status-maintenance'
    };
    return statusMap[status];
  }

  getStatusIcon(status: ResidenceStatus): string {
    const iconMap: Record<ResidenceStatus, string> = {
      [ResidenceStatus.OCUPADA]: 'home',
      [ResidenceStatus.DISPONIBLE]: 'home_work',
      [ResidenceStatus.MANTENIMIENTO]: 'home_repair_service'
    };
    return iconMap[status];
  }

  getResidentName(residence: Residence): string {
    if (residence.residenteActual) {
      return `${residence.residenteActual.nombre} ${residence.residenteActual.apellido}`;
    }
    return 'Sin asignar';
  }

  getOwnerName(residence: Residence): string {
    if (residence.dueno) {
      return `${residence.dueno.nombre} ${residence.dueno.apellido}`;
    }
    return 'Sin dueño';
  }

  getAdministratorName(residence: Residence): string {
    if (residence.administrador) {
      return `${residence.administrador.nombre} ${residence.administrador.apellido}`;
    }
    return 'Sin asignar';
  }

  getUserInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  getReassignmentTypeName(type: string): string {
    const typeMap: Record<string, string> = {
      'Asignacion': 'Asignación Inicial',
      'Cambio': 'Cambio de Residente',
      'Liberacion': 'Liberación'
    };
    return typeMap[type] || type;
  }

  canEdit(): boolean {
    return this.authService.isAdmin();
  }

  canDelete(): boolean {
    return this.authService.isSuperAdmin();
  }

  printDetails(): void {
    window.print();
  }

  exportDetails(): void {
    this.notificationService.info('Exportando detalles...');
  }
}