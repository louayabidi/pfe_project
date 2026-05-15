import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { FeaturesComponent } from './features.component';


const routes: Routes = [{ path: '', component: FeaturesComponent }];
@NgModule({
  declarations: [


    FeaturesComponent,
    
  ],
  imports: [
    CommonModule,
     ReactiveFormsModule,
     
       RouterModule.forChild(routes)
  ]
})
export class FeaturesModule { }
