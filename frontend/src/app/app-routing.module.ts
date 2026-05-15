import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SplashComponent } from './pages/splash/splash.component';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { DocsComponent } from './components/docs/docs.component';

const routes: Routes = [
  // Splash
  { path: 'splash', component: SplashComponent },

  // Public pages
  {
    path: 'home',
    loadChildren: () =>
      import('./pages/home/home.module').then(m => m.HomeModule)
  },

{
  path: 'contact',
  loadChildren: () =>
    import('./pages/contact/contact.module').then(m => m.ContactModule)
},

  {
  path: 'features',
  loadChildren: () =>
    import('./pages/features/features.module').then(m => m.FeaturesModule)
},

{
  path: 'oauth2/callback',
  loadChildren: () =>
    import('./pages/oauth2-callback/oauth2-callback.module')
      .then(m => m.OAuth2CallbackModule)
},
  {
    path: 'login',
    loadChildren: () =>
      import('./pages/login/login.module').then(m => m.LoginModule)
  },
  {
    path: 'register',
    loadChildren: () =>
      import('./pages/register/register.module').then(m => m.RegisterModule)
  },

  // Protected
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./pages/dashboard/dashboard.module')
        .then(m => m.DashboardModule)
  },

  {
  path: 'admin/login',
  loadChildren: () =>
    import('./pages/admin-login/admin-login.module').then(m => m.AdminLoginModule)
},



 

{
    path: 'docs',
    component: DocsComponent,
    data: { title: 'Documentation' }
  },

// ── Admin dashboard — fully isolated from user dashboard ──────────────────
  {
  path: 'admin/dashboard',
  canActivate: [adminGuard],
  loadChildren: () =>
    import('./pages/admin-dashboard/admin-dashboard/admin-dashboard.module')
      .then(m => m.AdminDashboardModule)
},
  { path: '',   redirectTo: 'splash', pathMatch: 'full' },
  { path: '**', redirectTo: 'splash' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'top',
    anchorScrolling: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {}