import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeSeriesPoint } from 'src/app/services/analytics.service';

@Component({
  selector: 'app-users-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users-chart.component.html',
  styleUrls: ['./users-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersChartComponent {
  @Input({ required: true }) series!: TimeSeriesPoint[];

  getPoints(): string {
    const data = this.series;
    if (data.length === 0) return '';

    const maxValue = Math.max(...data.map((p: TimeSeriesPoint) => p.value), 1);
    return data
      .map((p: TimeSeriesPoint, i: number) =>
        `${(i / (data.length - 1)) * 100}, ${100 - (p.value / maxValue) * 100}`
      )
      .join(' ');
  }
}