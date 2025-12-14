import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './stats-card.component.html',
  styleUrls: ['./stats-card.component.scss']
})
export class StatsCardComponent {
  @Input() title: string = '';
  @Input() value: number | string = 0;
  @Input() icon: string = 'info';
  @Input() color: 'primary' | 'accent' | 'warn' | 'success' = 'primary';
  @Input() route: string = '';
  @Input() change?: string;
  @Input() changeType?: 'positive' | 'negative' | 'neutral';
  @Input() prefix?: string;
  @Input() suffix?: string;

  getFormattedValue(): string {
    const prefix = this.prefix || '';
    const suffix = this.suffix || '';
    const value = typeof this.value === 'number' 
      ? this.value.toLocaleString('es-MX')
      : this.value;
    return `${prefix}${value}${suffix}`;
  }
}