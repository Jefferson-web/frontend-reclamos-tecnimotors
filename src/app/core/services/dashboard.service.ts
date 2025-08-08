import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AnalisisMotivosPareto, DashboardData, DashboardFiltros, DistribucionEstados, EstadisticaCard, TendenciaReclamos } from '../models/dashboard.model';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/Dashboard`;

  constructor(private http: HttpClient) { }

  getDashboardData(filtros?: DashboardFiltros): Observable<DashboardData> {
    let params = new HttpParams();
    
    if (filtros?.fechaDesde) {
      params = params.set('fechaDesde', filtros.fechaDesde.toISOString());
    }
    
    if (filtros?.fechaHasta) {
      params = params.set('fechaHasta', filtros.fechaHasta.toISOString());
    }
    
    if (filtros?.anio) {
      params = params.set('anio', filtros.anio.toString());
    }
    
    return this.http.get<DashboardData>(this.apiUrl, { params });
  }

  getDistribucionEstados(fechaDesde?: Date, fechaHasta?: Date): Observable<DistribucionEstados> {
    let params = new HttpParams();
    
    if (fechaDesde) {
      params = params.set('fechaDesde', fechaDesde.toISOString());
    }
    
    if (fechaHasta) {
      params = params.set('fechaHasta', fechaHasta.toISOString());
    }
    
    return this.http.get<DistribucionEstados>(`${this.apiUrl}/distribucion-estados`, { params });
  }

  getAnalisisMotivos(fechaDesde?: Date, fechaHasta?: Date): Observable<AnalisisMotivosPareto> {
    let params = new HttpParams();
    
    if (fechaDesde) {
      params = params.set('fechaDesde', fechaDesde.toISOString());
    }
    
    if (fechaHasta) {
      params = params.set('fechaHasta', fechaHasta.toISOString());
    }
    
    return this.http.get<AnalisisMotivosPareto>(`${this.apiUrl}/analisis-motivos`, { params });
  }

  getEstadisticasGenerales(fechaDesde?: Date, fechaHasta?: Date): Observable<EstadisticaCard> {
    let params = new HttpParams();
    
    if (fechaDesde) {
      params = params.set('fechaDesde', fechaDesde.toISOString());
    }
    
    if (fechaHasta) {
      params = params.set('fechaHasta', fechaHasta.toISOString());
    }
    
    return this.http.get<EstadisticaCard>(`${this.apiUrl}/estadisticas-generales`, { params });
  }

   getTendenciaReclamos(anio?: number): Observable<TendenciaReclamos> {
    let params = new HttpParams();
    
    if (anio) {
      params = params.set('anio', anio.toString());
    }
    
    return this.http.get<TendenciaReclamos>(`${this.apiUrl}/tendencia-reclamos`, { params });
  }
}
