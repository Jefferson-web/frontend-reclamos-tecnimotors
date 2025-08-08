import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const rolGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Obtenemos el rol actual del usuario
  const currentRole = authService.currentUserValue?.rol;
  
  // Obtenemos los roles permitidos de los datos de la ruta
  const allowedRoles = route.data['roles'] as Array<string>;
  
  // Verificamos si el rol del usuario está en la lista de roles permitidos
  const isAuthorized = allowedRoles.includes(currentRole);
  
  if (!isAuthorized) {
    // Si no está autorizado, redirigimos a una página de acceso denegado
    // o a otra página como el dashboard
    router.navigate(['/acceso-denegado']);
    return false;
  }
  
  return true;
};
