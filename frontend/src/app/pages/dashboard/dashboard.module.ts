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


@NgModule({
  declarations: [
    DashboardShellComponent,  
    RulesComponent,
    CreateRuleComponent,
    OverviewComponent,
    AppsComponent,
    AppCardComponent, 
   
     
    CreateAppComponent,
    
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    DashboardRoutingModule
  ]
})
export class DashboardModule {}