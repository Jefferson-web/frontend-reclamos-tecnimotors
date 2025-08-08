import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Chart, ChartConfiguration, ChartOptions, registerables } from 'chart.js';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { Subscription } from 'rxjs';
import { EstadisticaCard, TendenciaReclamos } from '../../../../core/models/dashboard.model';

// Interfaces para tipos de datos
interface StatCard {
  icon: string;
  count: number;
  title: string;
  percentChange: number;
  timeFrame: string;
  suffix: string;
  decimal: boolean;
}

interface EstadoReclamo {
  estado: string;
  cantidad: number;
}

interface MotivoReclamo {
  motivo: string;
  cantidad: number;
  porcentajeAcumulado: number;
}

interface DistribucionResponse {
  distribucion: EstadoReclamo[];
}

interface MotivosResponse {
  motivos: MotivoReclamo[];
}

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('trendChart') trendChartCanvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('pieChart') pieChartCanvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('paretoChart') paretoChartCanvas: ElementRef<HTMLCanvasElement>;
  loading: boolean = true;
  loadingTendencia: boolean = true;

  // Mapa de colores consistente para los estados de reclamos
  readonly ESTADO_COLORS: any = {
    'Registrado': {
      background: 'rgba(54, 162, 235, 0.7)', // Azul
      hover: 'rgba(54, 162, 235, 0.9)'
    },
    'EnProceso': {
      background: 'rgba(255, 193, 7, 0.7)', // Amarillo
      hover: 'rgba(255, 193, 7, 0.9)'
    },
    'Atendido': {
      background: 'rgba(40, 167, 69, 0.7)', // Verde
      hover: 'rgba(40, 167, 69, 0.9)'
    },
    'Cerrado': {
      background: 'rgba(108, 117, 125, 0.7)', // Gris
      hover: 'rgba(108, 117, 125, 0.9)'
    },
    'Rechazado': {
      background: 'rgba(220, 53, 69, 0.7)', // Rojo
      hover: 'rgba(220, 53, 69, 0.9)'
    }
  };

  statCards: StatCard[] = [];

  lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    datasets: [
      {
        data: [30, 35, 32, 40, 45, 50, 55, 60, 70, 65, 75, 68],
        label: '2024',
        fill: false,
        tension: 0.3,
        borderColor: '#6c757d',
        backgroundColor: 'rgba(108, 117, 125, 0.1)',
        pointBackgroundColor: '#6c757d',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#6c757d'
      },
      {
        data: [25, 30, 40, 38, 52, 48, 58, 65, 62, 70, 72, 80],
        label: '2025',
        fill: false,
        tension: 0.3,
        borderColor: '#adb5bd',
        backgroundColor: 'rgba(173, 181, 189, 0.1)',
        pointBackgroundColor: '#adb5bd',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#adb5bd'
      }
    ]
  };

  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      title: {
        display: false
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      }
    }
  };

  pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
      hoverBackgroundColor: []
    }]
  };

  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 15,
          padding: 15
        }
      }
    }
  };

  yearSelected: string = '2024';
  years: string[] = ['2024', '2025'];

  trendChart: Chart;
  pieChart: Chart;
  paretoChart: Chart;

  private subscriptions: Subscription[] = [];

  constructor(private dashboardService: DashboardService) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadTendenciaReclamos();
  }

  ngAfterViewInit(): void {
    this.initTrendChart();
    this.initPieChart();
    this.initParetoChart();
  }

  ngOnDestroy(): void {
    // Cancelar todas las suscripciones para evitar memory leaks
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadTendenciaReclamos(anio?: number): void {
    this.loadingTendencia = true;

    const tendenciaSub = this.dashboardService.getTendenciaReclamos(anio).subscribe({
      next: (data: TendenciaReclamos) => {
        // Preparar datos para el gráfico
        this.lineChartData.labels = data.meses;
        this.lineChartData.datasets = [];

        // Colores para los distintos años
        const colors: any = {
          '2024': {
            border: '#6c757d',
            background: 'rgba(108, 117, 125, 0.1)',
            point: '#6c757d'
          },
          '2025': {
            border: '#adb5bd',
            background: 'rgba(173, 181, 189, 0.1)',
            point: '#adb5bd'
          }
        };

        // Agregar conjuntos de datos para cada año
        Object.keys(data.datosPorAnio).forEach(anio => {
          const color = colors[anio] || {
            border: '#6c757d',
            background: 'rgba(108, 117, 125, 0.1)',
            point: '#6c757d'
          };

          this.lineChartData.datasets.push({
            data: data.datosPorAnio[anio],
            label: anio,
            fill: false,
            tension: 0.3,
            borderColor: color.border,
            backgroundColor: color.background,
            pointBackgroundColor: color.point,
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: color.point
          });
        });

        // Actualizar el gráfico si ya existe
        if (this.trendChart) {
          this.trendChart.data = this.lineChartData;
          this.trendChart.update();
        }

        this.loadingTendencia = false;
      },
      error: (err) => {
        console.error('Error al cargar tendencia de reclamos', err);
        this.loadingTendencia = false;
      }
    });

    this.subscriptions.push(tendenciaSub);
  }

  loadDashboardData(): void {
    const estadisticasSub = this.dashboardService.getEstadisticasGenerales().subscribe({
      next: (response: any) => {
        // Mapear las estadísticas recibidas de la API al formato de nuestras tarjetas
        this.statCards = response.map((item: EstadisticaCard) => ({
          icon: item.icono,
          count: item.valor,
          title: item.titulo,
          percentChange: item.cambioPorcentual,
          timeFrame: item.periodoTiempo,
          suffix: item.sufijo,
          decimal: item.esDecimal
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar estadísticas generales', err);
        this.loading = false;
      }
    });
    this.subscriptions.push(estadisticasSub);

    // Cargar datos de distribución de estados
    const estadosSub = this.dashboardService.getDistribucionEstados().subscribe({
      next: (response: DistribucionResponse) => {
        // Aplicar colores consistentes basados en el estado
        const backgroundColors: string[] = [];
        const hoverColors: string[] = [];

        response.distribucion.forEach(item => {
          const colorSet = this.ESTADO_COLORS[item.estado] || {
            background: 'rgba(108, 117, 125, 0.7)',
            hover: 'rgba(108, 117, 125, 0.9)'
          };
          backgroundColors.push(colorSet.background);
          hoverColors.push(colorSet.hover);
        });

        this.pieChartData.labels = response.distribucion.map(d => d.estado);
        this.pieChartData.datasets[0].data = response.distribucion.map(d => d.cantidad);
        this.pieChartData.datasets[0].backgroundColor = backgroundColors;
        this.pieChartData.datasets[0].hoverBackgroundColor = hoverColors;

        if (this.pieChart) {
          this.pieChart.update();
        }
      },
      error: (err) => console.error('Error al cargar distribución de estados', err)
    });
    this.subscriptions.push(estadosSub);

    // Cargar datos de análisis de motivos
    const motivosSub = this.dashboardService.getAnalisisMotivos().subscribe({
      next: (response: MotivosResponse) => {
        if (this.paretoChart && this.paretoChart.data && this.paretoChart.data.labels) {
          this.paretoChart.data.labels = response.motivos.map(m => m.motivo);
          this.paretoChart.data.datasets[0].data = response.motivos.map(m => m.cantidad);
          this.paretoChart.data.datasets[1].data = response.motivos.map(m => m.porcentajeAcumulado);
          this.paretoChart.update();
        }
      },
      error: (err) => console.error('Error al cargar análisis de motivos', err)
    });
    this.subscriptions.push(motivosSub);
  }

  initTrendChart(): void {
    const ctx = this.trendChartCanvas?.nativeElement.getContext('2d');
    if (ctx) {
      this.trendChart = new Chart(ctx, {
        type: 'line',
        data: this.lineChartData,
        options: this.lineChartOptions
      });
    }
  }

  initPieChart(): void {
    const ctx = this.pieChartCanvas?.nativeElement.getContext('2d');
    if (ctx) {
      this.pieChart = new Chart(ctx, {
        type: 'pie',
        data: this.pieChartData,
        options: this.pieChartOptions
      });
    }
  }

  initParetoChart(): void {
    const ctx = this.paretoChartCanvas?.nativeElement.getContext('2d');
    if (ctx) {
      this.paretoChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: [],
          datasets: [
            {
              label: 'Cantidad de Reclamos',
              data: [],
              backgroundColor: 'rgba(54, 162, 235, 0.7)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1
            },
            {
              label: 'Porcentaje Acumulado',
              data: [],
              type: 'line',
              fill: false,
              borderColor: 'rgba(255, 99, 132, 1)',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              pointBackgroundColor: 'rgba(255, 99, 132, 1)',
              pointBorderColor: '#fff',
              pointRadius: 5,
              pointHoverRadius: 7,
              yAxisID: 'y1'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          aspectRatio: 0.5,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Cantidad de Reclamos'
              }
            },
            y1: {
              beginAtZero: true,
              max: 100,
              position: 'right',
              grid: {
                drawOnChartArea: false
              },
              title: {
                display: true,
                text: 'Porcentaje Acumulado (%)'
              },
              ticks: {
                callback: function (value) {
                  return value + '%';
                }
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: function (context) {
                  const datasetLabel = context.dataset.label || '';
                  const value = context.parsed.y;
                  if (context.datasetIndex === 0) {
                    return `${datasetLabel}: ${value}`;
                  } else {
                    return `${datasetLabel}: ${value.toFixed(1)}%`;
                  }
                }
              }
            }
          }
        }
      });
    }
  }

  onYearChange(year: string): void {
    this.yearSelected = year;
    this.loadTendenciaReclamos(parseInt(year));
  }

  getAbsoluteValue(value: number): number {
    return Math.abs(value);
  }

  isPositive(value: number): boolean {
    return value > 0;
  }

  isNegative(value: number): boolean {
    return value < 0;
  }

  formatNumber(value: number, decimal: boolean): string {
    if (decimal) {
      return value.toFixed(1);
    }
    return value.toString();
  }
}