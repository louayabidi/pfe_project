import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AdminsComponent } from './admins.component';

const routes: Routes = [{ path: '', component: AdminsComponent }];

@NgModule({
  declarations: [AdminsComponent],
  imports: [CommonModule, FormsModule, RouterModule.forChild(routes)]
})
export class AdminsModule {}