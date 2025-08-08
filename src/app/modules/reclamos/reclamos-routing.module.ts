import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListaReclamosComponent } from './pages/lista-reclamos/lista-reclamos.component';
import { NuevoReclamoComponent } from './pages/nuevo-reclamo/nuevo-reclamo.component';
import { DetalleReclamoComponent } from './pages/detalle-reclamo/detalle-reclamo.component';
import { rolGuard } from '../../core/guards/rol.guard';

const routes: Routes = [
  { 
    path: '', 
    component: ListaReclamosComponent 
  },
  { 
    path: 'nuevo', 
    component: NuevoReclamoComponent,
    canActivate: [rolGuard],
    data: {
      roles: ['AtencionCliente']
    }
  },
  { 
    path: ':ticketId', 
    component: DetalleReclamoComponent 
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReclamosRoutingModule { }
