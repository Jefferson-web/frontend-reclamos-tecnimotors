import { Component, OnInit } from '@angular/core';
import { PaginatedList, ReclamoListadoDto, ReclamosFiltros } from '../../../../core/models/reclamo.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ReclamoService } from '../../../../core/services/reclamo.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-lista-reclamos',
  standalone: false,
  templateUrl: './lista-reclamos.component.html',
  styleUrl: './lista-reclamos.component.scss'
})
export class ListaReclamosComponent implements OnInit {
  reclamos: ReclamoListadoDto[] = [];
  reclamosFiltrados: ReclamoListadoDto[] = [];
  
  filtrosForm: FormGroup;
  mostrarFiltros = true;
  cargando = false;
  
  // Paginación
  paginaActual = 1;
  itemsPorPagina = 10;
  totalReclamos = 0;
  totalPaginas = 0;
  
  // Opciones de filtros
  estadoOptions = [
    { value: '', label: 'Todos' },
    { value: 'Registrado', label: 'Registrado' },
    { value: 'EnProceso', label: 'En Proceso' },
    { value: 'Atendido', label: 'Atendido' },
    { value: 'Cerrado', label: 'Cerrado' },
    { value: 'Rechazado', label: 'Rechazado' }
  ];
  
  prioridadOptions = [
    { value: '', label: 'Todas' },
    { value: 'Alta', label: 'Alta' },
    { value: 'Media', label: 'Media' },
    { value: 'Baja', label: 'Baja' }
  ];
  
  // Datos del usuario actual
  usuarioActualId: number;
  usuarioActualRol: string = '';
  
  constructor(
    private reclamoService: ReclamoService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.inicializarFormulario();
    
    // Obtener datos del usuario actual
    this.usuarioActualId = this.authService.currentUserValue?.usuarioId;
    this.usuarioActualRol = this.authService.currentUserValue?.rol || '';
  }
  
  ngOnInit(): void {
    this.cargarReclamos();
  }
  
  inicializarFormulario(): void {
    this.filtrosForm = this.fb.group({
      ticketId: [''],
      fechaDesde: [null],
      fechaHasta: [null],
      estado: [''],
      prioridad: ['']
    });
  }
  
  toggleFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
  }
  
  aplicarFiltros(): void {
    this.paginaActual = 1;
    this.cargarReclamos();
  }
  
  limpiarFiltros(): void {
    this.filtrosForm.reset();
    this.paginaActual = 1;
    this.cargarReclamos();
  }
  
  cargarReclamos(): void {
    this.cargando = true;
    
    const filtros: ReclamosFiltros = {
      pageNumber: this.paginaActual,
      pageSize: this.itemsPorPagina,
      ...this.filtrosForm.value
    };
    
    // Modificar la lógica para filtrar según el rol
    this.reclamoService.getReclamos(filtros).subscribe({
      next: (response) => {
        this.reclamos = response.items;
        this.totalReclamos = response.totalCount;
        this.totalPaginas = Math.ceil(this.totalReclamos / this.itemsPorPagina);
        
        // Filtrar los reclamos según el rol del usuario
        this.filtrarReclamosSegunRol();
        
        this.cargando = false;
      },
      error: (err) => {
        this.toastr.error('Error al cargar los reclamos: ' + err.message);
        this.cargando = false;
      }
    });
  }
  
  // Método para filtrar los reclamos según el rol
  filtrarReclamosSegunRol(): void {
    if (this.esAdministrador()) {
      // Administrador ve todos los reclamos
      this.reclamosFiltrados = [...this.reclamos];
    } else if (this.esAtencionCliente()) {
      // Atención al Cliente ve todos los reclamos
      this.reclamosFiltrados = [...this.reclamos];
    } else if (this.esJefeArea()) {
      // Jefe de Área solo ve los reclamos asignados a él
      this.reclamosFiltrados = this.reclamos.filter(reclamo => 
        reclamo.asignaciones.some(asignacion => asignacion.usuarioId === this.usuarioActualId)
      );
    } else {
      // Otros roles no ven reclamos
      this.reclamosFiltrados = [];
    }
  }
  
  // Métodos para verificar roles
  esAdministrador(): boolean {
    return this.usuarioActualRol === 'Administrador';
  }
  
  esAtencionCliente(): boolean {
    return this.usuarioActualRol === 'AtencionCliente';
  }
  
  esJefeArea(): boolean {
    return this.usuarioActualRol === 'JefeArea';
  }
  
  // Métodos para la paginación
  cambiarPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas || pagina === this.paginaActual) {
      return;
    }
    
    this.paginaActual = pagina;
    this.cargarReclamos();
  }
  
  cambiarItemsPorPagina(items: number): void {
    this.itemsPorPagina = items;
    this.paginaActual = 1;
    this.cargarReclamos();
  }
  
  getPaginas(): number[] {
    const paginas: number[] = [];
    const cantidadPaginas = Math.min(5, this.totalPaginas);
    
    let inicio = Math.max(1, this.paginaActual - 2);
    const fin = Math.min(inicio + cantidadPaginas - 1, this.totalPaginas);
    
    if (fin - inicio + 1 < cantidadPaginas) {
      inicio = Math.max(1, fin - cantidadPaginas + 1);
    }
    
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    
    return paginas;
  }
  
  // Métodos para navegar
  verDetalle(ticketId: string): void {
    this.router.navigate(['/reclamos', ticketId]);
  }
  
  // Método para obtener el número de columnas según el rol
  getColumnCount(): number {
    // Si es AtencionCliente o Admin, incluye la columna "Asignado a"
    if (this.esAtencionCliente() || this.esAdministrador()) {
      return 9; // 8 columnas + columna de acciones
    } else {
      return 8; // 7 columnas + columna de acciones
    }
  }
  
  // Métodos para formatear y obtener clases
  formatearEstado(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'enproceso': return 'En Proceso';
      default: return estado;
    }
  }
  
getEstadoClass(estado: string): string {
  switch (estado.toLowerCase()) {
    case 'registrado': return 'estado-registrado';
    case 'enproceso': return 'estado-enproceso';
    case 'atendido': return 'estado-atendido';
    case 'cerrado': return 'estado-cerrado';
    case 'rechazado': return 'estado-rechazado';
    default: return 'estado-registrado';
  }
}
  
  getEstadoIcon(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'registrado': return 'fas fa-folder-open';
      case 'enproceso': return 'fas fa-sync-alt';
      case 'atendido': return 'fas fa-headset';
      case 'cerrado': return 'fas fa-lock';
      case 'rechazado': return 'fas fa-ban';
      default: return 'fas fa-question-circle';
    }
  }
  
  getPrioridadClass(prioridad: string): string {
    switch (prioridad.toLowerCase()) {
      case 'alta': return 'bg-danger';
      case 'media': return 'bg-warning text-dark';
      case 'baja': return 'bg-info text-dark';
      default: return 'bg-secondary';
    }
  }
  
  getDiasAbiertoBadgeClass(dias: number): string {
    if (dias > 7) return 'bg-danger';
    if (dias > 3) return 'bg-warning text-dark';
    return 'bg-light text-dark';
  }

  formatearRol(rol: string): string{
    if(!rol) return '';
    switch(rol.toLowerCase()){
      case 'atencioncliente': return 'Atención al Cliente';
      case 'jefearea': return 'Jefe de Área';
      default: return rol;
    }
  }
}