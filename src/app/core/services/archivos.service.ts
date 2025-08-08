import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ArchivosService {

  private apiUrl = `${environment.apiUrl}/Archivos`;

  constructor(private http: HttpClient) { }

  descargarArchivo(archivoId: number){
    return this.http.get(`${this.apiUrl}/download/${archivoId}`, {responseType: 'blob'});
  }
}
