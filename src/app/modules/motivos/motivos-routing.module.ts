import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListaMotivosComponent } from './pages/lista-motivos/lista-motivos.component';

const routes: Routes = [
  { 
      path: '', 
      component: ListaMotivosComponent 
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MotivosRoutingModule { }
