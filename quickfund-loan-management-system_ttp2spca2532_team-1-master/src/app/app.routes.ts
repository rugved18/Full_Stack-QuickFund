import { Routes } from '@angular/router';
import { NotFoundComponent } from './shared/not-found/not-found.component';
import { LandingComponent } from './public/landing/landing.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { 
    path: '', redirectTo: '/homepage', pathMatch: 'full' 
  },
  {
    path: 'homepage' , component: LandingComponent,
  },
  {
    path: 'user',
    loadChildren: () =>
      import('./user/user.module').then(m => m.UserModule),
    canActivate: [authGuard],
    data: { expectedRole: 'user' }

  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./admin/admin.module').then(m => m.AdminModule),
    canActivate: [authGuard],
    data: { expectedRole: 'admin' }
  
  },

  { path: '**', component: NotFoundComponent }
];
