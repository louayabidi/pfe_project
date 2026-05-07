import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminShellComponent } from '../admin-shell/admin-shell.component';

const routes: Routes = [
  {
    path: '',
    component: AdminShellComponent,
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      {
        path: 'overview',
        loadChildren: () =>
          import('../pages/overview/overview.module')
            .then(m => m.OverviewModule)
      },
      {
        path: 'owners',
        loadChildren: () =>
          import('../pages/owners/owners.module')
            .then(m => m.OwnersModule)
      },
      {
        path: 'admins',
        loadChildren: () =>
          import('../pages/admins/admins.module')
            .then(m => m.AdminsModule)
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminDashboardRoutingModule {}