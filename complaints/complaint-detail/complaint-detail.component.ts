import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ComplaintService } from '../../../core/services/complaint.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';

interface Comment {
  id: number;
  usuario: string;
  contenido: string;
  comentario?: string; // Alias para contenido
  fecha: Date;
  isAdmin: boolean;
  esAdministrador?: boolean; // Alias para isAdmin
}

interface ActivityLog {
  id: number;
  accion: string;
  usuario: string;
  fecha: Date;
  detalles?: string;
}

@Component({
  selector: 'app-complaint-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    TimeAgoPipe
  ],
  templateUrl: './complaint-detail.component.html',
  styleUrls: ['./complaint-detail.component.scss']
})
export class ComplaintDetailComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private complaintService = inject(ComplaintService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  complaint: any | null = null;
  isLoading = true;
  isSavingComment = false;
  complaintId!: number;
  commentForm!: FormGroup;
  comments: Comment[] = [];
  activityLog: ActivityLog[] = [];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.complaintId = +id;
      this.initCommentForm();
      this.loadComplaint();
      this.loadMockData();
    } else {
      this.router.navigate(['/complaints']);
    }
  }

  initCommentForm(): void {
    this.commentForm = this.fb.group({
      contenido: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  loadComplaint(): void {
    this.isLoading = true;
    this.complaintService.getComplaintById(this.complaintId).subscribe({
      next: (response) => {
        this.complaint = response;
        this.isLoading = false;
      },
      error: (error) => {
        this.notificationService.error('Error al cargar queja');
        this.router.navigate(['/complaints']);
        this.isLoading = false;
      }
    });
  }

  loadMockData(): void {
    // Mock data para comentarios y actividad
    this.comments = [
      {
        id: 1,
        usuario: 'Admin Sistema',
        contenido: 'Hemos recibido su queja y la estamos revisando.',
        comentario: 'Hemos recibido su queja y la estamos revisando.',
        fecha: new Date(Date.now() - 86400000),
        isAdmin: true,
        esAdministrador: true
      }
    ];

    this.activityLog = [
      {
        id: 1,
        accion: 'Queja creada',
        usuario: 'Sistema',
        fecha: new Date(Date.now() - 172800000),
        detalles: 'Queja registrada en el sistema'
      },
      {
        id: 2,
        accion: 'Estado actualizado',
        usuario: 'Admin',
        fecha: new Date(Date.now() - 86400000),
        detalles: 'Cambio de estado: Nuevo → Revisado'
      }
    ];
  }

  onEdit(): void {
    this.router.navigate(['/complaints', this.complaintId, 'edit']);
  }

  changeStatus(newStatus: "Nueva" | "En Revisión" | "En Proceso" | "Resuelta" | "Cerrada" | "Rechazada"): void {
    if (!this.complaint) return;

    this.complaintService.updateComplaint(this.complaintId, { estado: newStatus }).subscribe({
      next: () => {
        this.notificationService.success('Estado actualizado correctamente');
        this.loadComplaint();
      },
      error: () => {
        this.notificationService.error('Error al actualizar estado');
      }
    });
  }

  onDelete(): void {
    if (!this.complaint) return;
    if (confirm(`¿Estás seguro de eliminar la queja "${this.complaint.asunto}"?`)) {
      this.complaintService.deleteComplaint(this.complaintId).subscribe({
        next: () => {
          this.notificationService.success('Queja eliminada correctamente');
          this.router.navigate(['/complaints']);
        },
        error: () => {
          this.notificationService.error('Error al eliminar queja');
        }
      });
    }
  }

  onSubmitComment(): void {
    if (this.commentForm.valid) {
      this.isSavingComment = true;
      const currentUser = this.authService.getCurrentUser();
      const newComment: Comment = {
        id: this.comments.length + 1,
        usuario: currentUser ? `${currentUser.nombre} ${currentUser.apellido}` : 'Usuario',
        contenido: this.commentForm.value.contenido,
        comentario: this.commentForm.value.contenido,
        fecha: new Date(),
        isAdmin: this.authService.isAdmin(),
        esAdministrador: this.authService.isAdmin()
      };

      // Simular delay de red
      setTimeout(() => {
        this.comments.push(newComment);
        this.commentForm.reset();
        this.isSavingComment = false;
        this.notificationService.success('Comentario agregado');
      }, 500);
    }
  }

  printComplaint(): void {
    window.print();
  }

  notifyUser(): void {
    this.notificationService.info('Notificación enviada al usuario');
  }

  getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      'Nueva': 'status-new',
      'En Revisión': 'status-reviewed',
      'En Proceso': 'status-in-progress',
      'Resuelta': 'status-resolved',
      'Cerrada': 'status-closed',
      'Rechazada': 'status-rejected'
    };
    return statusMap[status] || 'status-default';
  }

  getStatusIcon(status: string): string {
    const iconMap: Record<string, string> = {
      'Nueva': 'fiber_new',
      'En Revisión': 'rate_review',
      'En Proceso': 'sync',
      'Resuelta': 'check_circle',
      'Cerrada': 'archive',
      'Rechazada': 'block'
    };
    return iconMap[status] || 'help_outline';
  }

  getCategoryClass(category: string): string {
    const categoryMap: Record<string, string> = {
      'Ruido': 'category-noise',
      'Convivencia': 'category-coexistence',
      'Mascotas': 'category-pets',
      'Estacionamiento': 'category-parking',
      'Áreas Comunes': 'category-common-areas',
      'Limpieza': 'category-cleaning',
      'Seguridad': 'category-security',
      'Mantenimiento': 'category-maintenance',
      'Administración': 'category-administration',
      'Otro': 'category-other'
    };
    return categoryMap[category] || 'category-default';
  }

  getCategoryIcon(category: string): string {
    const iconMap: Record<string, string> = {
      'Ruido': 'volume_up',
      'Convivencia': 'groups',
      'Mascotas': 'pets',
      'Estacionamiento': 'local_parking',
      'Áreas Comunes': 'domain',
      'Limpieza': 'cleaning_services',
      'Seguridad': 'security',
      'Mantenimiento': 'build',
      'Administración': 'admin_panel_settings',
      'Otro': 'help_outline'
    };
    return iconMap[category] || 'help_outline';
  }

  getPriorityClass(priority: string): string {
    const priorityMap: Record<string, string> = {
      'Baja': 'priority-low',
      'Media': 'priority-medium',
      'Alta': 'priority-high',
      'Urgente': 'priority-urgent'
    };
    return priorityMap[priority] || 'priority-default';
  }

  getPriorityIcon(priority: string): string {
    const iconMap: Record<string, string> = {
      'Baja': 'arrow_downward',
      'Media': 'remove',
      'Alta': 'arrow_upward',
      'Urgente': 'priority_high'
    };
    return iconMap[priority] || 'help_outline';
  }

  getUserName(): string {
    if (!this.complaint) return 'N/A';
    if (this.complaint.es_anonima) {
      return 'Usuario Anónimo';
    }
    const user = this.complaint.usuario || this.complaint.autor;
    if (!user) return 'N/A';
    return `${user.nombre} ${user.apellido}`;
  }

  getUserInitials(): string {
    if (!this.complaint) return '?';
    if (this.complaint.es_anonima) {
      return 'AN';
    }
    const user = this.complaint.usuario || this.complaint.autor;
    if (!user) return '?';
    return `${user.nombre.charAt(0)}${user.apellido.charAt(0)}`.toUpperCase();
  }

  getResidenceName(): string {
    if (!this.complaint || !this.complaint.residencia) {
      return 'Queja General';
    }
    const res = this.complaint.residencia;
    return res.bloque 
      ? `Unidad ${res.numero_unidad} - Bloque ${res.bloque}`
      : `Unidad ${res.numero_unidad}`;
  }

  canEdit(): boolean {
    if (!this.complaint || !this.authService.isAdmin()) return false;
    return this.complaint.estado === 'Nueva';
  }

  canDelete(): boolean {
    return this.authService.isAdmin();
  }

  canChangeStatus(): boolean {
    return this.authService.isAdmin();
  }
}