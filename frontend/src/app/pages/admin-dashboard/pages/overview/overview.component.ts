import {
  Component, ChangeDetectionStrategy, ViewEncapsulation,
  OnInit, signal, computed
} from '@angular/core';
import { AdminApiService, PlatformStats } from 'src/app/services/admin.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
  
})
export class OverviewComponent implements OnInit {

  loading = signal(true);
  error   = signal<string | null>(null);
  raw     = signal<PlatformStats | null>(null);

  stats = computed(() => {
    const s = this.raw();
    if (!s) return [];
    return [
      {
        label: 'Total Owners',
        value: s.totalOwners.toLocaleString(),
        delta: `${s.activeOwners} active`,
        up: true,
        icon: 'owners'
      },
      {
        label: 'Active Apps',
        value: s.totalApps.toLocaleString(),
        delta: `${s.totalOwners} owners`,
        up: true,
        icon: 'apps'
      },
      {
        label: 'Total Rules',
        value: (s.totalRules + s.totalAdvancedRules).toLocaleString(),
        delta: `${s.totalAdvancedRules} advanced`,
        up: true,
        icon: 'events'
      },
      {
        label: 'Platform Admins',
        value: s.totalAdmins.toLocaleString(),
        delta: `${s.verifiedOwners} verified owners`,
        up: false,
        icon: 'flag'
      },
    ];
  });

  constructor(private adminApi: AdminApiService) {}

  ngOnInit(): void {
    this.adminApi.getStats().subscribe({
      next: data => { this.raw.set(data); this.loading.set(false); },
      error: ()   => { this.error.set('Failed to load stats'); this.loading.set(false); }
    });
  }
}