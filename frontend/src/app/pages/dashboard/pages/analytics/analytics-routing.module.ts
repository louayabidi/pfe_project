import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AnalyticsShellComponent } from './analytics-shell/analytics-shell.component';

const routes: Routes = [
  {
    path: '',
    component: AnalyticsShellComponent,
    data: { title: 'Analytics' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AnalyticsRoutingModule {}