import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Motivo, MotivosFiltros } from '../../models/motivo.model';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { MotivoService } from '../../../../core/services/motivo.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';

declare var bootstrap: any;

@Component({
  selector: 'app-lista-motivos',
  standalone: false,
  templateUrl: './lista-motivos.component.html',
  styleUrl: './lista-motivos.component.scss'
})
export class ListaMotivosComponent implements OnInit{
filtrosForm: FormGroup;
  motivoForm: FormGroup;

  // Estado del componente
  cargando = false;
  guardando = false;
  eliminando = false;
  mostrarFiltros = true;
  modoEdicion = false;

  // Datos y paginación
  motivosFiltrados: Motivo[] = [];
  motivoSeleccionado: Motivo | null = null;
  totalMotivos = 0;
  paginaActual = 1;
  itemsPorPagina = 10;
  totalPaginas = 1;
  hasPreviousPage = false;
  hasNextPage = false;

  // Modales
  modalMotivo: any;
  modalEliminar: any;

  // Filtros subject para debounce
  private filtrosChanged = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private motivoService: MotivoService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Formulario simplificado de filtros
    this.filtrosForm = this.fb.group({
      nombre: [''],
      pageSize: [10]
    });

    this.motivoForm = this.fb.group({
      motivoId: [0],
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', [Validators.maxLength(500)]],
      activo: [true]
    });
  }

  ngOnInit(): void {
    // Configurar el debounce para los filtros
    this.filtrosChanged
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.paginaActual = 1;
        this.cargarMotivos();
      });

    // Cargar motivos iniciales
    this.cargarMotivos();

    // Inicializar modales
    this.inicializarModales();
  }

  ngAfterViewInit(): void {
    // Inicializar modales después de que el DOM esté listo
    setTimeout(() => {
      this.inicializarModales();
    }, 0);
  }

  inicializarModales(): void {
    const motivoModalEl = document.getElementById('motivoModal');
    const eliminarModalEl = document.getElementById('eliminarModal');
    
    if (motivoModalEl) {
      this.modalMotivo = new bootstrap.Modal(motivoModalEl);
    }
    
    if (eliminarModalEl) {
      this.modalEliminar = new bootstrap.Modal(eliminarModalEl);
    }
  }

  toggleFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  aplicarFiltros(): void {
    this.paginaActual = 1;
    this.cargarMotivos();
  }

  limpiarFiltros(): void {
    this.filtrosForm.patchValue({
      nombre: '',
      pageSize: 10
    });
    this.paginaActual = 1;
    this.cargarMotivos();
  }

  cargarMotivos(): void {
    this.cargando = true;

    const filtros: MotivosFiltros = {
      pageIndex: this.paginaActual,
      pageSize: this.filtrosForm.get('pageSize')?.value || 10,
      nombre: this.filtrosForm.get('nombre')?.value
    };

    this.itemsPorPagina = filtros.pageSize;

    this.motivoService.getMotivosByFiltros(filtros).subscribe({
      next: (response) => {
        this.motivosFiltrados = response.items;
        this.totalMotivos = response.totalCount;
        this.totalPaginas = response.totalPages;
        this.hasPreviousPage = response.hasPreviousPage;
        this.hasNextPage = response.hasNextPage;
        this.cargando = false;
      },
      error: (error) => {
        this.toastr.error('Error al cargar los motivos', 'Error');
        console.error('Error al cargar los motivos:', error);
        this.cargando = false;
      }
    });
  }

  cambiarPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas || pagina === this.paginaActual) {
      return;
    }
    this.paginaActual = pagina;
    this.cargarMotivos();
  }

  cambiarItemsPorPagina(): void {
    this.paginaActual = 1;
    this.cargarMotivos();
  }

  getPaginas(): number[] {
    const paginas: number[] = [];
    
    if (this.totalPaginas <= 7) {
      // Si hay 7 páginas o menos, mostrar todas
      for (let i = 1; i <= this.totalPaginas; i++) {
        paginas.push(i);
      }
    } else {
      // Siempre incluir la primera página
      paginas.push(1);
      
      // Calcular el rango central
      let startPage = Math.max(2, this.paginaActual - 2);
      let endPage = Math.min(this.totalPaginas - 1, this.paginaActual + 2);
      
      // Ajustar el rango para mostrar siempre 5 páginas
      if (startPage > 2) {
        paginas.push(-1); // Indicador de "..."
      }
      
      for (let i = startPage; i <= endPage; i++) {
        paginas.push(i);
      }
      
      if (endPage < this.totalPaginas - 1) {
        paginas.push(-1); // Indicador de "..."
      }
      
      // Siempre incluir la última página
      paginas.push(this.totalPaginas);
    }
    
    return paginas;
  }

  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.motivoForm.reset({
      motivoId: 0,
      nombre: '',
      descripcion: '',
      activo: true
    });
    this.modalMotivo.show();
  }

  abrirModalEditar(motivo: Motivo): void {
    this.modoEdicion = true;
    this.motivoForm.setValue({
      motivoId: motivo.motivoId,
      nombre: motivo.nombre,
      descripcion: motivo.descripcion || '',
      activo: motivo.activo
    });
    this.modalMotivo.show();
  }

  confirmarEliminar(motivo: Motivo): void {
    this.motivoSeleccionado = motivo;
    this.modalEliminar.show();
  }

  guardarMotivo(): void {
    if (this.motivoForm.invalid) {
      this.toastr.error('Por favor, completa correctamente el formulario', 'Error');
      return;
    }

    this.guardando = true;
    const motivoData = this.motivoForm.value;

    if (this.modoEdicion) {
      // Actualizar motivo existente
      this.motivoService.actualizarMotivo(motivoData.motivoId, motivoData).subscribe({
        next: () => {
          this.toastr.success('Motivo actualizado correctamente', 'Éxito');
          this.modalMotivo.hide();
          this.cargarMotivos();
          this.guardando = false;
        },
        error: (error) => {
          this.toastr.error('Error al actualizar el motivo', 'Error');
          console.error('Error al actualizar el motivo:', error);
          this.guardando = false;
        }
      });
    } else {
      // Crear nuevo motivo
      this.motivoService.crearMotivo(motivoData).subscribe({
        next: () => {
          this.toastr.success('Motivo creado correctamente', 'Éxito');
          this.modalMotivo.hide();
          this.cargarMotivos();
          this.guardando = false;
        },
        error: (error) => {
          this.toastr.error('Error al crear el motivo', 'Error');
          console.error('Error al crear el motivo:', error);
          this.guardando = false;
        }
      });
    }
  }

  eliminarMotivo(): void {
    if (!this.motivoSeleccionado) {
      return;
    }

    this.eliminando = true;
    this.motivoService.eliminarMotivo(this.motivoSeleccionado.motivoId).subscribe({
      next: () => {
        this.toastr.success('Motivo eliminado correctamente', 'Éxito');
        this.modalEliminar.hide();
        this.cargarMotivos();
        this.eliminando = false;
      },
      error: (error) => {
        this.toastr.error('Error al eliminar el motivo', 'Error');
        console.error('Error al eliminar el motivo:', error);
        this.eliminando = false;
      }
    });
  }
}
