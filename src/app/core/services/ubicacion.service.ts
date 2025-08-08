import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UbicacionService {

  private apiUrl = `${environment.apiUrl}/Ubicaciones`;

  constructor(private http: HttpClient) { }

  getDepartamentos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/departamentos`);
  }

  getProvincias(departamentoId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/provincias/${departamentoId}`);
  }

  getDistritos(provinciaId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/distritos/${provinciaId}`);
  }
}
