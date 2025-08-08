import { Injectable } from '@angular/core';
import { EncuestaDto, ResponderEncuestaRequest, ResponderEncuestaResponse } from '../models/encuesta.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EncuestaService {

  private apiUrl = `${environment.apiUrl}/Encuestas`;

  constructor(private http: HttpClient) { }

  obtenerEncuesta(token: string): Observable<EncuestaDto> {
    return this.http.get<EncuestaDto>(`${this.apiUrl}/${token}`);
  }

  responderEncuesta(token: string, request: ResponderEncuestaRequest): Observable<ResponderEncuestaResponse> {
    return this.http.post<ResponderEncuestaResponse>(`${this.apiUrl}/${token}/responder`, request);
  }
}
