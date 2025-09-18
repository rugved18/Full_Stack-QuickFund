import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; 

import { UserLayoutComponent } from './user-layout/user-layout.component';
import { UserNavbarComponent } from './user-navbar/user-navbar.component';

@NgModule({
  declarations: [ ],
  imports: [
    CommonModule,
    RouterModule,
    UserLayoutComponent,
    UserNavbarComponent
  ],
  exports: [
    UserLayoutComponent
  ]
})
export class LayoutModule { }
