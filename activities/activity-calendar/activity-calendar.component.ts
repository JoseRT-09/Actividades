import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { GetAllActivitiesUseCase } from '../../../domain/use-cases/activity/get-all-activities.usecase';
import { Activity, ActivityType, ActivityStatus } from '../../../domain/models/activity.model';
import { NotificationService } from '../../../core/services/notification.service';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  activities: Activity[];
}

@Component({
  selector: 'app-activity-calendar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
    MatMenuModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatBadgeModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './activity-calendar.component.html',
  styleUrls: ['./activity-calendar.component.scss']
})
export class ActivityCalendarComponent implements OnInit {

  private getAllActivities = inject(GetAllActivitiesUseCase);
  private notificationService = inject(NotificationService);

  ActivityType = ActivityType;
  ActivityStatus = ActivityStatus;

  currentDate = new Date();
  currentMonth: Date;
  calendarDays: CalendarDay[] = [];
  selectedDate: Date | null = null;
  activities: Activity[] = [];
  isLoading = true;

  weekDays = ['Dom', 'Lun', 'Mar', 'MiÃ©', 'Jue', 'Vie', 'SÃ¡b'];

  constructor() {
    this.currentMonth = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth(),
      1
    );
  }

  ngOnInit(): void {
    this.loadActivities();
  }

  /** Convert JS Date â†’ yyyy-MM-dd */
  private formatDateYMD(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  /** LOAD ACTIVITIES FROM BACKEND */
  loadActivities(): void {
    this.isLoading = true;

    const startOfMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
    const endOfMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 0);

    const params = {
      page: 1,
      limit: 1000,
      fecha_inicio: this.formatDateYMD(startOfMonth),
      fecha_fin: this.formatDateYMD(endOfMonth)
    };

    console.log("ðŸ“¤ Enviando rango al backend:", params);

    this.getAllActivities.execute(params).subscribe({
      next: (response) => {

        console.log("ðŸ“¥ RAW backend response:", response);

if (!response) {
  console.error("âŒ Backend no enviÃ³ respuesta");
}

if (!response.data) {
  console.error(
    "âŒ 'data' viene undefined. Backend deberÃ­a enviar un array. Respuesta recibida:",
    JSON.stringify(response, null, 2)
  );
} else if (!Array.isArray(response.data)) {
  console.error(
    "âŒ 'data' existe pero NO es un array. Tipo recibido:",
    typeof response.data,
    "valor:",
    response.data
  );
} else {
  console.log("ðŸ“Œ Actividades recibidas:", response.data.length);
}

        const raw = Array.isArray(response.data) ? response.data : [];

        console.log(`ðŸ“Œ Total actividades recibidas: ${raw.length}`);

        this.activities = raw.map(a => {
          const parsed = {
            ...a,
            fecha_inicio: new Date(a.fecha_inicio),
            fecha_fin: a.fecha_fin ? new Date(a.fecha_fin) : null
          };

          console.log("â± Actividad parseada:", parsed);

          return parsed;
        });

        this.generateCalendar();
        this.isLoading = false;
      },
      error: err => {
        console.error("âŒ Error cargando actividades:", err);
        this.notificationService.error('Error al cargar actividades');
        this.isLoading = false;
      }
    });
  }

  /** GENERATE 42 DAYS GRID */
  generateCalendar(): void {
    console.log("ðŸ“… Generando calendario...");

    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    console.log(`ðŸ“… Mes actual ${month + 1}/${year} â†’ ${daysInMonth} dÃ­as`);

    this.calendarDays = [];

    /** PREVIOUS MONTH DAYS */
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      this.pushDay(date, false);
    }

    /** CURRENT MONTH DAYS */
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      this.pushDay(date, true);
    }

    /** NEXT MONTH DAYS */
    const remaining = 42 - this.calendarDays.length;
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(year, month + 1, i);
      this.pushDay(date, false);
    }

    console.log(`ðŸ“Œ Total dÃ­as generados: ${this.calendarDays.length}`);
  }

  /** PUSH ONE DAY INTO GRID */
  private pushDay(date: Date, isCurrentMonth: boolean) {
    const acts = this.getActivitiesForDate(date);

    console.log(`ðŸ“† DÃ­a ${date.toDateString()} â†’ ${acts.length} actividades`);

    this.calendarDays.push({
      date,
      isCurrentMonth,
      isToday: this.isToday(date),
      activities: acts
    });
  }

  /** FILTER ACTIVITIES FOR SPECIFIC DATE */
  getActivitiesForDate(date: Date): Activity[] {
    return this.activities.filter(activity => {
      const start = new Date(activity.fecha_inicio);
      const end = activity.fecha_fin ? new Date(activity.fecha_fin) : start;

      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      return date >= start && date <= end;
    });
  }

  /** TODAY DETECTOR */
  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate()
      && date.getMonth() === today.getMonth()
      && date.getFullYear() === today.getFullYear();
  }

  /** NAVIGATION */
  previousMonth(): void {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() - 1,
      1
    );
    this.loadActivities();
  }

  nextMonth(): void {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() + 1,
      1
    );
    this.loadActivities();
  }

  goToToday(): void {
    this.currentMonth = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth(),
      1
    );
    this.loadActivities();
  }

  /** CLICK DAY */
  selectDate(day: CalendarDay): void {
    this.selectedDate = day.date;
  }

  /** UI HELPERS */
  getTypeClass(type: ActivityType): string {
    const map: Record<ActivityType, string> = {
      [ActivityType.REUNION]: 'type-meeting',
      [ActivityType.EVENTO]: 'type-event',
      [ActivityType.MANTENIMIENTO]: 'type-maintenance',
      [ActivityType.ASAMBLEA]: 'type-assembly',
      [ActivityType.CELEBRACION]: 'type-celebration',
      [ActivityType.OTRO]: 'type-other'
    };
    return map[type];
  }

  getTypeIcon(type: ActivityType): string {
    const map: Record<ActivityType, string> = {
      [ActivityType.REUNION]: 'group',
      [ActivityType.EVENTO]: 'event',
      [ActivityType.MANTENIMIENTO]: 'build',
      [ActivityType.ASAMBLEA]: 'how_to_vote',
      [ActivityType.CELEBRACION]: 'celebration',
      [ActivityType.OTRO]: 'event_note'
    };
    return map[type];
  }

  /** TODAY ACTIVITIES */
  getTodayActivities(): Activity[] {
    return this.getActivitiesForDate(new Date());
  }

  /** UPCOMING ACTIVITIES */
  getUpcomingActivities(): Activity[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.activities
      .filter(a => new Date(a.fecha_inicio) >= today)
      .sort((a, b) => new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime())
      .slice(0, 5);
  }

  /** MONTH TITLE */
  getMonthYear(): string {
    return this.currentMonth.toLocaleDateString('es-ES', {
      month: 'long',
      year: 'numeric'
    });
  }
}