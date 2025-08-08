import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConsultaTicketComponent } from './components/consulta-ticket/consulta-ticket.component';
import { EncuestaComponent } from './pages/encuesta/encuesta.component';

const routes: Routes = [
  {
    path: 'consulta-reclamo',
    component: ConsultaTicketComponent
  },
  {
    path: 'encuesta/:token',
    component: EncuestaComponent,
    data: { title: 'Encuesta de Satisfacción' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReclamosPublicoRoutingModule { }
