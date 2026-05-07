import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { OwnersComponent } from './owners.component';

const routes: Routes = [{ path: '', component: OwnersComponent }];

@NgModule({
  declarations: [OwnersComponent],
  imports: [CommonModule, RouterModule.forChild(routes)]
})
export class OwnersModule {}