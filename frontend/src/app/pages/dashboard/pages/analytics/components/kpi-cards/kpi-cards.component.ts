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
    const series = this.data.eventsByDay ?? [];
    const mid = Math.floor(series.length / 2);
    const recent = series.slice(mid).reduce((s, p) => s + p.value, 0);
    const prior = series.slice(0, mid).reduce((s, p) => s + p.value, 0);
    const trendPct = prior > 0 ? Math.round(((recent - prior) / prior) * 100) : 0;
    const trendClass = trendPct > 0 ? 'up' : trendPct < 0 ? 'down' : 'neutral';
    const trendLabel = trendPct > 0 ? `+${trendPct}%` : trendPct < 0 ? `${trendPct}%` : '—';

    return [
      { label: 'Total events', value: this.data.totalEvents, icon: '📊', trendClass, trendLabel },
      { label: 'Total users', value: this.data.totalUsers, icon: '👥', trendClass: 'neutral', trendLabel: '—' },
      { label: 'Active (7d)', value: this.data.activeUsersLast7Days, icon: '⚡', trendClass: 'neutral', trendLabel: '—' },
      { label: 'Active (30d)', value: this.data.activeUsersLast30Days, icon: '📅', trendClass: 'neutral', trendLabel: '—' },
      { label: 'Avg events/user', value: Math.round(this.data.avgEventsPerUser * 10) / 10, icon: '🎯', trendClass, trendLabel },
      { label: 'Badges awarded', value: this.data.totalBadgesAwarded, icon: '🏅', trendClass: 'neutral', trendLabel: '—' },
      { label: 'Points awarded', value: this.data.totalPointsAwarded, icon: '⭐', trendClass: 'neutral', trendLabel: '—' },
    ];
  }
}