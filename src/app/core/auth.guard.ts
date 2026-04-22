import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Protectora } from '../services/protectora.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const protectora: Protectora | null = authService.getProtectoraActual();

  if (!protectora) {
    return router.createUrlTree(['/login'], {
      queryParams: { redirectTo: state.url }
    });
  }

  const idPerfil = route.paramMap.get('id');
  if (!idPerfil) {
    return router.createUrlTree(['/']);
  }

  if (protectora.id === idPerfil) {
    return true;
  }

  return router.createUrlTree(['/no-autorizado']);
};
