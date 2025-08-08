import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { PaginatedList, ReclamoDetalleCompletoDto, ReclamoListadoDto, ReclamoPublico, ReclamosFiltros } from '../models/reclamo.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReclamoService {
  private apiUrl = `${environment.apiUrl}/Reclamos`;

  constructor(private http: HttpClient) { }

  crearReclamo(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, formData);
  }

  getReclamoDetalleCompleto(ticketId: string): Observable<ReclamoDetalleCompletoDto> {
    return this.http.get<ReclamoDetalleCompletoDto>(`${this.apiUrl}/${ticketId}/detalle-completo`);
  }

  crearInteraccion(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/interacciones`, formData);
  }

  getReclamos(filtros: ReclamosFiltros): Observable<PaginatedList<ReclamoListadoDto>> {
    let params = new HttpParams()
      .set('pageNumber', filtros.pageNumber.toString())
      .set('pageSize', filtros.pageSize.toString());

    if (filtros.ticketId) {
      params = params.set('ticketId', filtros.ticketId);
    }

    if (filtros.fechaDesde) {
      params = params.set('fechaDesde', filtros.fechaDesde.toISOString());
    }

    if (filtros.fechaHasta) {
      params = params.set('fechaHasta', filtros.fechaHasta.toISOString());
    }

    if (filtros.estado) {
      params = params.set('estado', filtros.estado);
    }

    if (filtros.prioridad) {
      params = params.set('prioridad', filtros.prioridad);
    }

    return this.http.get<PaginatedList<ReclamoListadoDto>>(this.apiUrl, { params });
  }

    /**
   * Atiende un reclamo
   * @param ticketId ID del reclamo a atender
   * @param command Comando con datos para atender el reclamo
   */
    atenderReclamo(ticketId: string, command: {TicketId: string}): Observable<any> {
      return this.http.put(`${this.apiUrl}/${ticketId}/atender`, command);
    }
  
    /**
     * Cierra un reclamo
     * @param ticketId ID del reclamo a cerrar
     * @param command Comando con datos para cerrar el reclamo
     */
    cerrarReclamo(ticketId: string, command: {TicketId: string}): Observable<any> {
      return this.http.put(`${this.apiUrl}/${ticketId}/cerrar`, command);
    }
  
    /**
     * Rechaza un reclamo
     * @param ticketId ID del reclamo a rechazar
     * @param command Comando con datos para rechazar el reclamo, incluye motivo de rechazo
     */
    rechazarReclamo(ticketId: string, command: {TicketId: string, MotivoRechazo: string}): Observable<any> {
      return this.http.put(`${this.apiUrl}/${ticketId}/rechazar`, command);
    }

    consultarReclamo(ticketId: string): Observable<ReclamoPublico | null> {
    return this.http.get<ReclamoPublico>(`${this.apiUrl}/reclamo/${ticketId}`)
      .pipe(
        map((reclamo: any) => {
          if (!reclamo) return null;
          
          return {
            ...reclamo,
            fechaCreacion: new Date(reclamo.fechaCreacion),
            ultimaModificacion: reclamo.ultimaModificacion ? new Date(reclamo.ultimaModificacion) : undefined,
            historial: (reclamo.historial || []).map((h: any) => ({
              ...h,
              fecha: new Date(h.fecha)
            }))
          };
        }),
        catchError(error => {
          console.error('Error al consultar el reclamo:', error);
          return of(null);
        })
      );
  }
}