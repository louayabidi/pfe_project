import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsOverview } from 'src/app/services/analytics.service';

@Component({
  selector: 'app-kpi-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kpi-cards.component.html',
  styleUrls: ['./kpi-cards.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KpiCardsComponent {
  @Input({ required: true }) data!: AnalyticsOverview;

  get cards() {
    return [
      { label: 'Total Events',      value: this.data.totalEvents,            icon: '⚡' },
      { label: 'Total Users',       value: this.data.totalUsers,             icon: '👥' },
      { label: 'Active (7d)',        value: this.data.activeUsersLast7Days,   icon: '🟢' },
      { label: 'Active (30d)',       value: this.data.activeUsersLast30Days,  icon: '📅' },
      { label: 'Avg Events/User',   value: Math.round(this.data.avgEventsPerUser * 10) / 10, icon: '📊' },
      { label: 'Badges Awarded',    value: this.data.totalBadgesAwarded,     icon: '🏅' },
      { label: 'Points Awarded',    value: this.data.totalPointsAwarded,     icon: '⭐' },
    ];
  }
}