import { Component, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None  
})
export class OverviewComponent {
  stats = [
    { label: 'Total Owners',   value: '1,284', delta: '+12%',  up: true,  icon: 'owners' },
    { label: 'Active Apps',    value: '347',   delta: '+8%',   up: true,  icon: 'apps'   },
    { label: 'Events Today',   value: '9,210', delta: '+23%',  up: true,  icon: 'events' },
    { label: 'Flagged Issues', value: '3',     delta: '-40%',  up: false, icon: 'flag'   },
  ];
}