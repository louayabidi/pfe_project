import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RetentionRow } from 'src/app/services/analytics.service';

@Component({
  selector: 'app-retention',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './retention.component.html',
  styleUrls: ['./retention.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RetentionComponent {
  @Input({ required: true }) matrix!: RetentionRow[];

  readonly weekRange = [0, 1, 2, 3, 4, 5, 6, 7, 8];

  getRateColor(rate: number): string {
    if (rate === 0) return '#d1d5db';
    if (rate < 20) return '#f87171';
    if (rate < 40) return '#fb923c';
    if (rate < 60) return '#facc15';
    if (rate < 80) return '#86efac';
    return '#10b981';
  }
}