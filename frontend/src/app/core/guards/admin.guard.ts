import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from 'src/app/services/token.service';

export const adminGuard: CanActivateFn = () => {
  const token  = inject(TokenService);
  const router = inject(Router);
  const user   = token.getUser();

  if (user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')) {
    return true;
  }

  router.navigate(['/admin/login']);
  return false;
};