import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeatmapPoint } from 'src/app/services/analytics.service';

@Component({
  selector: 'app-heatmap',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './heatmap.component.html',
  styleUrls: ['./heatmap.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeatmapComponent {
  @Input({ required: true }) points!: HeatmapPoint[];

  get heatmapData(): HeatmapPoint[] {
    const dataMap = new Map<string, HeatmapPoint>();

    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        dataMap.set(`${day}-${hour}`, { dayOfWeek: day, hour, count: 0 });
      }
    }

    this.points.forEach((p: HeatmapPoint) => {
      dataMap.set(`${p.dayOfWeek}-${p.hour}`, p);
    });

    return Array.from(dataMap.values()).sort((a, b) => {
      if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
      return a.hour - b.hour;
    });
  }

  dayHourKey(point: HeatmapPoint): string {
    return `${point.dayOfWeek}-${point.hour}`;
  }

  getColor(count: number): string {
    const maxCount = Math.max(...this.points.map((p: HeatmapPoint) => p.count), 1);
    const percentage = (count / maxCount) * 100;

    if (percentage === 0) return '#f3f4f6';
    if (percentage < 33) return '#d8d0ff';
    if (percentage < 66) return '#a78bfa';
    return '#6c63ff';
  }
}