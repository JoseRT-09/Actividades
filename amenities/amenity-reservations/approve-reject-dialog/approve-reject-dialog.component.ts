import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { AmenityReservation } from '../../../domain/models/amenity.model';

export interface ApproveRejectDialogData {
  reservation: AmenityReservation;
  action: 'aprobar' | 'rechazar';
}

@Component({
  selector: 'app-approve-reject-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './approve-reject-dialog.component.html',
  styleUrls: ['./approve-reject-dialog.component.scss']
})
export class ApproveRejectDialogComponent {
  form: FormGroup;
  isApprove: boolean;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ApproveRejectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ApproveRejectDialogData
  ) {
    this.isApprove = data.action === 'aprobar';

    this.form = this.fb.group({
      motivo: ['', this.isApprove ? [] : [Validators.required, Validators.minLength(10)]]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.form.valid || this.isApprove) {
      this.dialogRef.close({
        confirmed: true,
        motivo: this.form.value.motivo
      });
    }
  }

  getTitle(): string {
    return this.isApprove ? 'Aprobar Reserva' : 'Rechazar Reserva';
  }

  getMessage(): string {
    const amenidad = this.data.reservation.amenidad?.nombre || 'esta amenidad';
    const residente = this.data.reservation.residente
      ? `${this.data.reservation.residente.nombre} ${this.data.reservation.residente.apellido}`
      : 'este residente';

    if (this.isApprove) {
      return `¿Está seguro que desea aprobar la reserva de ${amenidad} para ${residente}?`;
    } else {
      return `¿Está seguro que desea rechazar la reserva de ${amenidad} para ${residente}?`;
    }
  }
}
