import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReclamosPublicoRoutingModule } from './reclamos-publico-routing.module';
import { ConsultaTicketComponent } from './components/consulta-ticket/consulta-ticket.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EncuestaComponent } from './pages/encuesta/encuesta.component';


@NgModule({
  declarations: [
    ConsultaTicketComponent,
    EncuestaComponent
  ],
  imports: [
    CommonModule,
    ReclamosPublicoRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class ReclamosPublicoModule { }
