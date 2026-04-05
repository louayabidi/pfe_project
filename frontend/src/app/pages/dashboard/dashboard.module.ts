/**
 * ============================================================================
 * DASHBOARD MODULE (UPDATED)
 * ============================================================================
 * Includes new AppStateService, AppSelector, and AppChooser components.
 * 
 * Location: src/app/pages/dashboard/dashboard.module.ts
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DashboardRoutingModule } from './dashboard-routing.module';

// Shell & Components
import { DashboardShellComponent } from './dashboard-shell/dashboard-shell.component';
import { AppSelectorComponent } from './components/app-selector/app-selector.component';
import { AppChooserComponent } from './components/app-chooser/app-chooser.component';

// Pages
import { RulesComponent } from './pages/rules/rules.component';
import { CreateRuleComponent } from './pages/create-rule/create-rule.component';
import { OverviewComponent } from './pages/overview/overview.component';
import { AppsComponent } from './pages/apps/apps.component';
import { CreateAppComponent } from './pages/create-app/create-app.component';
import { AppCardComponent } from './pages/apps/app-card/app-card.component';
import { RuleCardComponent } from './pages/rules/rule-card/rule-card.component';
import { EventsComponent } from './pages/events/events.component';
import { BadgesComponent } from './pages/badges/badges/badges.component';
import { CreateBadgeComponent } from './pages/badges/create-badge/create-badge.component';

// Services
import { AppStateService } from 'src/app/services/app-state.service';
import { DecimalPipe } from '@angular/common';

@NgModule({
  declarations: [
    DashboardShellComponent,
    AppSelectorComponent,
    AppChooserComponent,
    RulesComponent,
    CreateRuleComponent,
    OverviewComponent,
    AppsComponent,
    AppCardComponent,
    RuleCardComponent,
    EventsComponent,
    BadgesComponent,
    CreateAppComponent,
    CreateBadgeComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    DashboardRoutingModule
  ],
  providers: [
    DecimalPipe
  ]
})
export class DashboardModule {}