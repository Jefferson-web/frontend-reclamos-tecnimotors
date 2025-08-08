import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/Usuarios`;

  constructor(private http: HttpClient) { }

  getUsuariosPorRol(rolId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${rolId}`);
  }
}