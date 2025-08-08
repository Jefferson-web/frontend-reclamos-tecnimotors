import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReclamosRoutingModule } from './reclamos-routing.module';
import { NuevoReclamoComponent } from './pages/nuevo-reclamo/nuevo-reclamo.component';
import { DetalleReclamoComponent } from './pages/detalle-reclamo/detalle-reclamo.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxEditorModule } from 'ngx-editor';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { HttpClientModule } from '@angular/common/http';
import { RoleBasedDirective } from '../../core/directives/role-based.directive';
import { ListaReclamosComponent } from './pages/lista-reclamos/lista-reclamos.component';


@NgModule({
  declarations: [
    NuevoReclamoComponent,
    DetalleReclamoComponent,
    ListaReclamosComponent,
    RoleBasedDirective
  ],
  imports: [
    CommonModule,
    ReclamosRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxEditorModule,
    AngularMultiSelectModule,
    HttpClientModule
  ],
  exports: [
    RoleBasedDirective
  ]
})
export class ReclamosModule { }
