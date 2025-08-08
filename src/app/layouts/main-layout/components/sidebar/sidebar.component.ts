import { Component, Input } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {

  @Input() collapsed: boolean = false;
  userRole: string = '';

  menuItems = [
    {
      title: 'Dashboard',
      icon: 'bi bi-speedometer2',
      link: '/dashboard',
      roles: ['admin', 'AtencionCliente', 'JefeArea']
    },
    {
      title: 'Reclamos',
      icon: 'bi bi-file-earmark-text',
      link: '/reclamos',
      roles: ['admin', 'AtencionCliente', 'JefeArea']
    },
    {
      title: 'Nuevo Reclamo',
      icon: 'bi bi-plus-circle',
      link: '/reclamos/nuevo',
      roles: ['AtencionCliente']
    },
    {
      title: 'Usuarios',
      icon: 'bi bi-people',
      link: '/usuarios',
      roles: ['admin']
    },
    {
      title: 'Configuración',
      icon: 'bi bi-gear',
      link: '/configuracion',
      roles: ['admin']
    },
    {
      title: 'Reportes',
      icon: 'bi bi-bar-chart',
      link: '/reportes',
      roles: ['admin']
    },
    {
      title: 'Motivos',
      icon: 'bi bi-tags',
      link: '/motivos',
      roles: ['admin', 'AtencionCliente']
    }
  ];

  constructor(private authService: AuthService) {
    const user = this.authService.currentUserValue;
    if (user) {
      this.userRole = user.rol;
    }
  }

  canView(roles: string[]): boolean {
    return roles.includes(this.userRole);
  }
}
