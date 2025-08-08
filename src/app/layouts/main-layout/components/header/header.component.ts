import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  @Output() toggleSidebar = new EventEmitter<void>();
  userName: string = '';
  userRole: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    const user = this.authService.currentUserValue;
    if (user) {
      this.userName = user.nombre;
      this.userRole = user.rol;
    }
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  obtenerIniciales() {
    var resultado = '';
    var parts = this.userName.split(/\s+/);
    for (const part of parts) {
      resultado += part.slice(0, 1);
    }
    return resultado.toUpperCase();
  }

  formatearRol(rol: string): string{
    if(!rol) return '';
    switch(rol.toLowerCase()){
      case 'atencioncliente': return 'Atención al Cliente';
      case 'jefearea': return 'Jefe de Área';
      default: return rol;
    }
  }
}
