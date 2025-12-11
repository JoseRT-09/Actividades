import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { GetActivityByIdUseCase } from '../../../domain/use-cases/activity/get-activity-by-id.usecase';
import { DeleteActivityUseCase } from '../../../domain/use-cases/activity/delete-activity.usecase';
import { Activity, ActivityStatus, ActivityType } from '../../../domain/models/activity.model';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { ActivityService } from '../../../core/services/activity.service';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';

@Component({
  selector: 'app-activity-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatMenuModule,
    MatTabsModule,
    MatListModule,
    TimeAgoPipe
  ],
  templateUrl: './activity-detail.component.html',
  styleUrls: ['./activity-detail.component.scss']
})
export class ActivityDetailComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private getActivityById = inject(GetActivityByIdUseCase);
  private deleteActivity = inject(DeleteActivityUseCase);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private activityService = inject(ActivityService);

  // Exponer enums al template
  ActivityType = ActivityType;
  ActivityStatus = ActivityStatus;

  activity: Activity | null = null;
  isLoading = true;
  activityId!: number;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.activityId = +id;
      this.loadActivity();
    } else {
      this.router.navigate(['/activities']);
    }
  }

  loadActivity(): void {
    this.isLoading = true;
    
    this.getActivityById.execute(this.activityId).subscribe({
      next: (activity) => {
        this.activity = activity;
        this.isLoading = false;
      },
      error: (error) => {
        this.notificationService.error('Error al cargar actividad');
        this.router.navigate(['/activities']);
        this.isLoading = false;
      }
    });
  }

  onEdit(): void {
    this.router.navigate(['/activities', this.activityId, 'edit']);
  }

  onDelete(): void {
    if (!this.activity) return;

    const confirmed = confirm(
      `Â¿EstÃ¡s seguro de eliminar la actividad "${this.activity.titulo}"?\n\nEsta acciÃ³n no se puede deshacer.`
    );

    if (confirmed) {
      this.deleteActivity.execute(this.activityId).subscribe({
        next: () => {
          this.notificationService.success('Actividad eliminada correctamente');
          this.router.navigate(['/activities']);
        },
        error: () => {
          this.notificationService.error('Error al eliminar actividad');
        }
      });
    }
  }

  getTypeClass(type: ActivityType): string {
    const typeMap: Record<ActivityType, string> = {
      [ActivityType.REUNION]: 'type-meeting',
      [ActivityType.EVENTO]: 'type-event',
      [ActivityType.MANTENIMIENTO]: 'type-maintenance',
      [ActivityType.ASAMBLEA]: 'type-assembly',
      [ActivityType.CELEBRACION]: 'type-celebration',
      [ActivityType.OTRO]: 'type-other'
    };
    return typeMap[type];
  }

  getTypeIcon(type: ActivityType): string {
    const iconMap: Record<ActivityType, string> = {
      [ActivityType.REUNION]: 'group',
      [ActivityType.EVENTO]: 'event',
      [ActivityType.MANTENIMIENTO]: 'build',
      [ActivityType.ASAMBLEA]: 'how_to_vote',
      [ActivityType.CELEBRACION]: 'celebration',
      [ActivityType.OTRO]: 'event_note'
    };
    return iconMap[type];
  }

  getStatusClass(status: ActivityStatus): string {
    const statusMap: Record<ActivityStatus, string> = {
      [ActivityStatus.PROGRAMADA]: 'status-scheduled',
      [ActivityStatus.EN_CURSO]: 'status-ongoing',
      [ActivityStatus.COMPLETADA]: 'status-completed',
      [ActivityStatus.CANCELADA]: 'status-cancelled'
    };
    return statusMap[status];
  }

  getStatusIcon(status: ActivityStatus): string {
    const iconMap: Record<ActivityStatus, string> = {
      [ActivityStatus.PROGRAMADA]: 'schedule',
      [ActivityStatus.EN_CURSO]: 'play_circle',
      [ActivityStatus.COMPLETADA]: 'check_circle',
      [ActivityStatus.CANCELADA]: 'cancel'
    };
    return iconMap[status];
  }

  getOrganizerName(): string {
    if (!this.activity?.organizador) return 'Organizador desconocido';
    return `${this.activity.organizador.nombre} ${this.activity.organizador.apellido}`;
  }

  getDuration(): string {
    if (!this.activity?.fecha_fin) return 'Sin duraciÃ³n definida';
    
    const start = new Date(this.activity.fecha_inicio);
    const end = new Date(this.activity.fecha_fin);
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  canEdit(): boolean {
    // Solo admin/superadmin pueden editar Y la actividad NO debe estar completada
    return this.authService.isAdmin() &&
           this.activity?.estado !== ActivityStatus.COMPLETADA;
  }

  canDelete(): boolean {
    return this.authService.isAdmin();
  }

  onCancel(): void {
    if (!this.activity) return;

    const motivo = prompt('¿Por qué deseas cancelar esta actividad? (Opcional)');
    if (motivo === null) return; // Usuario canceló el diálogo

    this.activityService.cancelActivity(this.activityId, motivo).subscribe({
      next: () => {
        this.notificationService.success('Actividad cancelada correctamente');
        this.loadActivity(); // Recargar para ver el estado actualizado
      },
      error: () => {
        this.notificationService.error('Error al cancelar actividad');
      }
    });
  }

  canCancel(): boolean {
    return this.authService.isAdmin() &&
           this.activity?.estado === ActivityStatus.PROGRAMADA;
  }

  canReschedule(): boolean {
    return this.authService.isAdmin() &&
           this.activity?.estado === ActivityStatus.CANCELADA;
  }

  onReschedule(): void {
    if (!this.activity) return;

    const fechaInicio = prompt(
      'Ingresa la nueva fecha y hora de inicio (formato: YYYY-MM-DD HH:MM:SS):',
      new Date(this.activity.fecha_inicio).toISOString().slice(0, 19).replace('T', ' ')
    );

    if (!fechaInicio) return; // Usuario canceló

    const fechaFin = this.activity.fecha_fin ? prompt(
      'Ingresa la nueva fecha y hora de fin (formato: YYYY-MM-DD HH:MM:SS, opcional):',
      new Date(this.activity.fecha_fin).toISOString().slice(0, 19).replace('T', ' ')
    ) : undefined;

    this.activityService.rescheduleActivity(this.activityId, {
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin
    }).subscribe({
      next: () => {
        this.notificationService.success('Actividad reprogramada correctamente');
        this.loadActivity(); // Recargar para ver los cambios
      },
      error: () => {
        this.notificationService.error('Error al reprogramar actividad');
      }
    });
  }
}