import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeSeriesPoint } from 'src/app/services/analytics.service';

@Component({
  selector: 'app-events-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './events-chart.component.html',
  styleUrls: ['./events-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventsChartComponent {
  @Input({ required: true }) series!: TimeSeriesPoint[];

  get maxValue(): number {
    return Math.max(...this.series.map((p: TimeSeriesPoint) => p.value), 1);
  }
}