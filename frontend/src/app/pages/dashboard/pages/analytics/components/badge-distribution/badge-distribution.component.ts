import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryPoint } from 'src/app/services/analytics.service';

@Component({
  selector: 'app-badge-distribution',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge-distribution.component.html',
  styleUrls: ['./badge-distribution.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeDistributionComponent {
  @Input({ required: true }) items!: CategoryPoint[];

  getPercentage(count: number): number {
    const maxCount = Math.max(...this.items.map((i: CategoryPoint) => i.value), 1);
    return (count / maxCount) * 100;
  }
}