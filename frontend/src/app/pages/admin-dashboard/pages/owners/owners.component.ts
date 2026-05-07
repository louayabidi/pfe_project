import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-owners',
  template: `
    <div style="padding:40px 0; color:var(--text-secondary); font-size:14px;">
      App Owners page — coming soon.
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OwnersComponent {}