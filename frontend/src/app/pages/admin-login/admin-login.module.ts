import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AdminLoginComponent } from './admin-login.component';

const routes: Routes = [{ path: '', component: AdminLoginComponent }];

@NgModule({
  declarations: [AdminLoginComponent],
  imports: [CommonModule, ReactiveFormsModule, RouterModule.forChild(routes)]
})
export class AdminLoginModule {}