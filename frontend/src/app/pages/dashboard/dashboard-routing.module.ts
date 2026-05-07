import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardShellComponent } from './dashboard-shell/dashboard-shell.component';
import { AppsComponent } from './pages/apps/apps.component';
import { CreateAppComponent } from './pages/create-app/create-app.component';
import { RulesComponent } from './pages/rules/rules.component';
import { CreateRuleComponent } from './pages/create-rule/create-rule.component';
import { AdvancedRulesComponent } from './pages/rules/advanced-rules/advanced-rules.component';
import { CreateAdvancedRuleComponent } from './pages/rules/create-advanced-rule/create-advanced-rule.component';
import { BadgesComponent } from './pages/badges/badges/badges.component';
import { CreateBadgeComponent } from './pages/badges/create-badge/create-badge.component';
import { EventsComponent } from './pages/events/events.component';
import { OverviewComponent } from './pages/overview/overview.component';
import { UserProfileComponent } from './pages/user/user-profile/user-profile.component';
import { WidgetStudioComponent } from './pages/widget/widget-studio/widget-studio.component';
import { LeaderboardComponent } from './pages/leaderboard/leaderboard.component';
import { AiEngineComponent } from './pages/ai-engine/ai-engine.component';
import { GamifPageBuilderComponent } from './pages/gamif-page-builder/gamif-page-builder.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { EngagementComponent } from './pages/engagement/engagement.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardShellComponent,
    children: [
      { path: '', redirectTo: 'apps', pathMatch: 'full' },
      { path: 'apps',                   component: AppsComponent },
      { path: 'apps/new',               component: CreateAppComponent },
      { path: 'rules',                  component: RulesComponent },
      { path: 'rules/new',              component: CreateRuleComponent },
      { path: 'rules/advanced',         component: AdvancedRulesComponent },
      { path: 'rules/advanced/new',     component: CreateAdvancedRuleComponent },
      { path: 'badges',                 component: BadgesComponent },
      { path: 'badges/new',             component: CreateBadgeComponent },
      { path: 'events',                 component: EventsComponent },
      { path: 'overview',               component: OverviewComponent },
      { path: 'profile',                component: UserProfileComponent },
      { path: 'widget-studio',          component: WidgetStudioComponent },
      { path: 'leaderboard',            component: LeaderboardComponent },
      { path: 'ai-engine',              component: AiEngineComponent },
      { path: 'page-builder',           component: GamifPageBuilderComponent },
      { path: 'settings',               component: SettingsComponent },
      { path: 'engagement',             component: EngagementComponent },
      {
        path: 'analytics',
        loadChildren: () =>
          import('./pages/analytics/analytics.module').then(m => m.AnalyticsModule)
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {}