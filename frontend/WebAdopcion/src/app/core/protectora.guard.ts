import { ActivatedRouteSnapshot, CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

export const protectoraGuard: CanActivateFn = (route: ActivatedRouteSnapshot): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const protectora = authService.getProtectoraActual();

  if (!protectora) {
    return router.createUrlTree(['/login']);
  }

  if (protectora.rol === 'admin') {
    return true;
  }

  if (protectora.rol === 'protectora') {
    if (!protectora.suscrito) {
      return router.createUrlTree(['/suscripcion']);
    }
    const idParam = route.paramMap.get('id');
    if (idParam && idParam === protectora.id) {
      return true;
    }
  }

  return router.createUrlTree(['/no-autorizado']);
};

