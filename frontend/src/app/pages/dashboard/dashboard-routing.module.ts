import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardShellComponent } from './dashboard-shell/dashboard-shell.component';
import { RulesComponent } from './pages/rules/rules.component';
import { CreateRuleComponent } from './pages/create-rule/create-rule.component';
import { OverviewComponent } from './pages/overview/overview.component';
import { AppsComponent } from './pages/apps/apps.component';
import { CreateAppComponent } from './pages/create-app/create-app.component';
import { EventsComponent } from './pages/events/events.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardShellComponent,
    children: [
      { path: '',            redirectTo: 'apps', pathMatch: 'full' },
      { path: 'apps',        component: AppsComponent },
      { path: 'apps/new',    component: CreateAppComponent },
      { path: 'rules',       component: RulesComponent },
      { path: 'rules/new',   component: CreateRuleComponent },
      { path: 'overview',    component: OverviewComponent },
      {path : 'events',       component: EventsComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {}