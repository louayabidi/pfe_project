import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { OAuth2CallbackComponent } from './oauth2-callback.component';

const routes: Routes = [{ path: '', component: OAuth2CallbackComponent }];

@NgModule({
  declarations: [OAuth2CallbackComponent],
  imports: [CommonModule, RouterModule.forChild(routes)]
})
export class OAuth2CallbackModule {}