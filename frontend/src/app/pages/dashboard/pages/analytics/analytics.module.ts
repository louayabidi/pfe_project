import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsRoutingModule } from './analytics-routing.module';

import { AnalyticsShellComponent } from './analytics-shell/analytics-shell.component';

@NgModule({
  imports: [
    CommonModule,
    AnalyticsRoutingModule,
    AnalyticsShellComponent,  // Standalone component imported as module dependency
  ]
})
export class AnalyticsModule {}