// models/reclamo.model.ts

// Modelo principal para el detalle completo del reclamo
export interface ReclamoDetalleCompletoDto {
  ticketId: string;
  cliente: string;
  nombres: string;
  apellidos: string;
  telefono?: string;
  correo?: string;
  detalle: string;
  estado: string;
  prioridad: string;
  
  motivoId: number;
  motivoNombre: string;
  motivoDescripcion: string;
  
  usuarioId: number;
  usuarioNombre: string;
  usuarioApellidos: string;
  usuarioEmail: string;
  usuarioRolId: number;
  usuarioRolNombre: string;
  
  departamentoId: string;
  departamentoNombre: string;
  provinciaId: string;
  provinciaNombre: string;
  distritoId: string;
  distritoNombre: string;
  
  fechaCreacion: Date | string;
  fechaCierre?: Date | string;
  ultimaModificacion?: Date | string;
  
  diasAbierto: number;
  
  asignaciones: AsignacionDetalleDto[];
  archivos: ArchivoDetalleDto[];
  interacciones: InteraccionDetalleDto[];
  historialEstados: EstadoHistorialDto[];
}

// Modelo para asignaciones
export interface AsignacionDetalleDto {
  ticketId: string;
  usuarioId: number;
  usuarioNombre: string;
  usuarioApellidos: string;
  usuarioEmail: string;
  usuarioRolId: number;
  usuarioRolNombre: string;
}

// Modelo para historiales de estado
export interface EstadoHistorialDto {
  historialId: number;
  ticketId: string;
  usuarioId: number;
  usuarioNombre: string;
  usuarioApellidos: string;
  estadoAnterior: string;
  estadoNuevo: string;
  comentario?: string;
  fechaRegistro: Date | string;
}

// Modelo para archivos
export interface ArchivoDetalleDto {
  archivoId: number;
  nombreOriginal: string;
  nombreSistema: string;
  extension: string;
  tipoMime: string;
  rutaAlmacenamiento: string;
  tamanoByte: number;
  tamanoFormateado: string;
  fechaSubida: Date | string;
}

// Modelo para interacciones
export interface InteraccionDetalleDto {
  interaccionId: number;
  ticketId: string;
  usuarioId: number;
  usuarioNombre: string;
  usuarioApellidos: string;
  usuarioNombreCompleto: string;
  usuarioRolNombre: string;
  mensaje: string;
  fechaRegistro: Date | string;
  fechaModificacion?: Date | string;
  archivos: ArchivoDetalleDto[];
}

// Interfaz para crear una interacción
export interface CrearInteraccionCommand {
  ticketId: string;
  mensaje: string;
  archivos?: File[];
}

export interface ReclamoListadoDto {
  ticketId: string;
  cliente: string;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  fechaCreacion: Date | string;
  estado: string;
  prioridad: string;
  motivoNombre: string;
  diasAbierto: number;
  ultimaModificacion?: Date | string;
  asignaciones: AsignacionResumenDto[];
}

export interface AsignacionResumenDto {
  usuarioId: number;
  nombre: string;
  apellidos: string;
  nombreCompleto: string;
  rolNombre: string;
}

export interface PaginatedList<T> {
  items: T[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ReclamosFiltros {
  ticketId?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
  estado?: string;
  prioridad?: string;
  pageNumber: number;
  pageSize: number;
}

export interface AtenderReclamoCommand {
  TicketId: string;
}

export interface CerrarReclamoCommand {
  TicketId: string;
}

export interface RechazarReclamoCommand {
  TicketId: string;
  MotivoRechazo: string;
}

export interface HistorialEstado {
  estado: string;
  estadoTexto: string;
  estadoAnterior?: string;
  estadoAnteriorTexto?: string;
  fecha: Date;
  comentario: string;
  usuarioNombre: string;
}

export interface ReclamoPublico {
  ticketId: string;
  estado: string;
  fechaCreacion: Date;
  ultimaModificacion?: Date;
  tipoReclamo: string;
  descripcion: string;
  correo?: string;
  historial: HistorialEstado[];
}

export enum ReclamoEstadoEnum {
  REGISTRADO = 'Registrado',
  EN_PROCESO = 'EnProceso',
  ATENDIDO = 'Atendido',
  CERRADO = 'Cerrado',
  RECHAZADO = 'Rechazado'
}