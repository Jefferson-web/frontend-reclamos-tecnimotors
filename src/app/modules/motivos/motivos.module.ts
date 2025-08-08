import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MotivosRoutingModule } from './motivos-routing.module';
import { ListaMotivosComponent } from './pages/lista-motivos/lista-motivos.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    ListaMotivosComponent
  ],
  imports: [
    CommonModule,
    MotivosRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class MotivosModule { }
