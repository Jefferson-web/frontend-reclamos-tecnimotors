import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Directive({
  selector: '[appRoleBased]',
  standalone: false
})
export class RoleBasedDirective implements OnInit {

  @Input('appRoleBased') allowedRoles: string[];
  private isVisible = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.updateView();
  }

  private updateView() {
    const userRole = this.authService.currentUserValue?.rol;
    
    // Si no se especifican roles, mostrar para todos
    if (!this.allowedRoles || this.allowedRoles.length === 0) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.isVisible = true;
      return;
    }
    
    // Verificar si el rol del usuario está entre los permitidos
    const isAllowed = userRole && this.allowedRoles.includes(userRole);
    
    if (isAllowed && !this.isVisible) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.isVisible = true;
    } else if (!isAllowed && this.isVisible) {
      this.viewContainer.clear();
      this.isVisible = false;
    }
  }

}
