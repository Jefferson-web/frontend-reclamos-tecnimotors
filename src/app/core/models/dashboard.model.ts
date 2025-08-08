export interface EstadisticaCard {
    icono: string;
    valor: number;
    titulo: string;
    cambioPorcentual: number;
    periodoTiempo: string;
    sufijo: string;
    esDecimal: boolean;
  }
  
  export interface EstadoReclamo {
    estado: string;
    cantidad: number;
  }
  
  export interface DistribucionEstados {
    distribucion: EstadoReclamo[];
  }
  
  export interface MotivoReclamo {
    motivo: string;
    cantidad: number;
    porcentajeAcumulado: number;
  }
  
  export interface AnalisisMotivosPareto {
    motivos: MotivoReclamo[];
  }
  
  export interface TendenciaReclamos {
  meses: string[];
  datosPorAnio: {
    [key: string]: number[]
  };
}
  
  export interface DashboardData {
    estadisticasCards: EstadisticaCard[];
    distribucionEstados: DistribucionEstados;
    analisisMotivos: AnalisisMotivosPareto;
    tendenciaReclamos: TendenciaReclamos;
  }
  
  export interface DashboardFiltros {
    fechaDesde?: Date;
    fechaHasta?: Date;
    anio?: number;
  }