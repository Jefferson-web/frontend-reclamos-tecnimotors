export interface PreguntaDto {
  id: number;
  codigo: string;
  textoPregunta: string;
  categoria: string;
  orden: number;
  obligatoria: boolean;
}

export interface EncuestaDto {
  ticketId: string;
  estadoEncuesta: string;
  fechaVencimiento: Date;
  preguntas: PreguntaDto[];
  puedeResponder: boolean;
  mensajeError?: string;
}

export interface ResponderEncuestaRequest {
  respuestas: { [key: string]: number };
  comentario?: string;
}

export interface ResponderEncuestaResponse {
  exitoso: boolean;
  mensaje: string;
  isgCalculado?: number;
}