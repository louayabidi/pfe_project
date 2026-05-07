import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminDashboardRoutingModule } from './admin-dashboard-routing.module';
import { AdminShellComponent } from '../admin-shell/admin-shell.component';
import { RouterModule } from '@angular/router';


@NgModule({
  declarations: [
    AdminShellComponent
  ],
  imports: [
    CommonModule,
    AdminDashboardRoutingModule,
    RouterModule
  ]
})
export class AdminDashboardModule { }
