import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryPoint } from 'src/app/services/analytics.service';

@Component({
  selector: 'app-top-events',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './top-events.component.html',
  styleUrls: ['./top-events.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopEventsComponent {
  @Input({ required: true }) items!: CategoryPoint[];

  getPercentage(value: number): number {
    const max = Math.max(...this.items.map((i: CategoryPoint) => i.value), 1);
    return (value / max) * 100;
  }
}