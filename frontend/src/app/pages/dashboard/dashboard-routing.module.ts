import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardShellComponent } from './dashboard-shell/dashboard-shell.component';
import { RulesComponent } from './pages/rules/rules.component';
import { CreateRuleComponent } from './pages/create-rule/create-rule.component';
import { OverviewComponent } from './pages/overview/overview.component';
import { AppsComponent } from './pages/apps/apps.component';
import { CreateAppComponent } from './pages/create-app/create-app.component';
import { EventsComponent } from './pages/events/events.component';
import { BadgesComponent } from './pages/badges/badges/badges.component';
import { CreateBadgeComponent } from './pages/badges/create-badge/create-badge.component';
import { AdvancedRulesComponent } from './pages/rules/advanced-rules/advanced-rules.component';
import { CreateAdvancedRuleComponent } from './pages/rules/create-advanced-rule/create-advanced-rule.component';
import { UserProfileComponent } from './pages/user/user-profile/user-profile.component';
import { WidgetStudioComponent } from './pages/widget/widget-studio/widget-studio.component';
import { LeaderboardComponent } from './pages/leaderboard/leaderboard.component';
import { AiEngineComponent } from './pages/ai-engine/ai-engine.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardShellComponent,
    children: [
      // Default route
      {
        path: '',
        redirectTo: 'apps',
        pathMatch: 'full'
      },



      {
  path: 'leaderboard',
  component: LeaderboardComponent,
  data: { title: 'Leaderboard' }
},


{
  path: 'ai-engine',
  component: AiEngineComponent,
  data: { title: 'AI Engine' }
},

      // Widget Studio
      {
        path: 'widget-studio',
        component: WidgetStudioComponent,
        data: { title: 'Widget Studio' }
      },

      //user_profile

      {
  path: 'profile',
  component: UserProfileComponent,
  data: { title: 'Mon Profil' }
},

      // ── APPS ──────────────────────────────────────────────────────
      {
        path: 'apps',
        component: AppsComponent,
        data: { title: 'Mes Applications' }
      },
      {
        path: 'apps/new',
        component: CreateAppComponent,
        data: { title: 'Nouvelle Application' }
      },

      // ── RULES ─────────────────────────────────────────────────────
      // URL: /dashboard/rules?appId=123
      {
        path: 'rules',
        component: RulesComponent,
        data: { title: 'Règles de Gamification' }
      },
      // URL: /dashboard/rules/new?appId=123
      {
        path: 'rules/new',
        component: CreateRuleComponent,
        data: { title: 'Nouvelle Règle' }
      },

      {
  path: 'rules/advanced',
  component: AdvancedRulesComponent,
  data: { title: 'Règles Avancées' }
},
{
  path: 'rules/advanced/new',
  component: CreateAdvancedRuleComponent,
  data: { title: 'Nouvelle Règle Avancée' }
},

      // ── BADGES ────────────────────────────────────────────────────
      // URL: /dashboard/badges?appId=123
      {
        path: 'badges',
        component: BadgesComponent,
        data: { title: 'Badges' }
      },
      // URL: /dashboard/badges/new?appId=123
      {
        path: 'badges/new',
        component: CreateBadgeComponent,
        data: { title: 'Nouveau Badge' }
      },

      // ── EVENTS ────────────────────────────────────────────────────
      // URL: /dashboard/events?appId=123
      {
        path: 'events',
        component: EventsComponent,
        data: { title: 'Événements' }
      },

      // ── ANALYTICS ─────────────────────────────────────────────────
      {
        path: 'analytics',
        loadChildren: () =>
          import('./pages/analytics/analytics.module')
            .then(m => m.AnalyticsModule)
      },

      // ── OVERVIEW ──────────────────────────────────────────────────
      {
        path: 'overview',
        component: OverviewComponent,
        data: { title: 'Vue d\'ensemble' }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {}