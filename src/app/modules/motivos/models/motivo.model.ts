export interface Motivo {
  motivoId: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  fechaRegistro: Date;
  fechaActualizacion?: Date;
}

export interface MotivosFiltros {
  pageIndex: number;
  pageSize: number;
  nombre?: string;
}