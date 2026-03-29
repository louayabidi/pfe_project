import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardShellComponent } from './dashboard-shell/dashboard-shell.component';  // ← ajouter
import { RulesComponent } from './pages/rules/rules.component';
import { CreateRuleComponent } from './pages/create-rule/create-rule.component';
import { OverviewComponent } from './pages/overview/overview.component';
import { AppsComponent } from './pages/apps/apps.component';
import { CreateAppComponent } from './pages/create-app/create-app.component';
import { AppCardComponent } from './pages/apps/app-card/app-card.component';
import { RuleCardComponent } from './pages/rules/rule-card/rule-card.component';
import { EventsComponent } from './pages/events/events.component';
import { DecimalPipe } from '@angular/common';

@NgModule({
  declarations: [
    DashboardShellComponent,  
    RulesComponent,
    CreateRuleComponent,
    OverviewComponent,
    AppsComponent,
    AppCardComponent, 
    EventsComponent,
  
     
    CreateAppComponent, RuleCardComponent, EventsComponent,
    
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    DashboardRoutingModule
  ],


  providers: [DecimalPipe]

  
})
export class DashboardModule {}