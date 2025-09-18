import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRole = route.data['expectedRole']; // defined in route config
  const userRole = authService.getCurrentUserRole();

  if (authService.isLoggedIn() && userRole === expectedRole) {
    return true;
  }

  router.navigate(['/']);
  return false;
};

