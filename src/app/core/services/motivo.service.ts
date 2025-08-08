import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedList } from '../models/reclamo.model';
import { Motivo, MotivosFiltros } from '../../modules/motivos/models/motivo.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MotivoService {
  private apiUrl = `${environment.apiUrl}/Motivos`;

  constructor(private http: HttpClient) { }

  getMotivos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }

  getMotivosByFiltros(filtros: MotivosFiltros): Observable<PaginatedList<Motivo>> {
    let params = new HttpParams()
      .set('pageIndex', filtros.pageIndex.toString())
      .set('pageSize', filtros.pageSize.toString());

    if (filtros.nombre) {
      params = params.set('nombre', filtros.nombre);
    }

    return this.http.get<PaginatedList<Motivo>>(`${this.apiUrl}/ListarMotivosByFilter`, { params });
  }

  getMotivoPorId(id: number): Observable<Motivo> {
    return this.http.get<Motivo>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crea un nuevo motivo
   */
  crearMotivo(motivo: Motivo): Observable<Motivo> {
    return this.http.post<Motivo>(this.apiUrl, motivo);
  }

  /**
   * Actualiza un motivo existente
   */
  actualizarMotivo(id: number, motivo: Motivo): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, motivo);
  }

  /**
   * Elimina un motivo
   */
  eliminarMotivo(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
