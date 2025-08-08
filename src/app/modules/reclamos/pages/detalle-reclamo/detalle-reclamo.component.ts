import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Editor, Toolbar } from 'ngx-editor';
import { ReclamoService } from '../../../../core/services/reclamo.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AtenderReclamoCommand, CerrarReclamoCommand, InteraccionDetalleDto, RechazarReclamoCommand, ReclamoDetalleCompletoDto, } from '../../../../core/models/reclamo.model';
import { ArchivosService } from '../../../../core/services/archivos.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Subscription } from 'rxjs';

declare var bootstrap: any;

@Component({
  selector: 'app-detalle-reclamo',
  standalone: false,
  templateUrl: './detalle-reclamo.component.html',
  styleUrl: './detalle-reclamo.component.scss'
})
export class DetalleReclamoComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('fileInput') fileInput: ElementRef;
  @ViewChild('modalAtender') modalAtenderEl: ElementRef;
  @ViewChild('modalCerrar') modalCerrarEl: ElementRef;
  @ViewChild('modalRechazar') modalRechazarEl: ElementRef;
  
  reclamo: ReclamoDetalleCompletoDto | null = null;
  interaccionForm: FormGroup;
  filtroBusqueda: string = '';
  archivosFiltrados: any[] = [];
  archivosSeleccionados: File[] = [];
  cargando: boolean = true;
  error: string = '';
  modoEdicion: boolean = false;
  interaccionEditando: InteraccionDetalleDto | null = null;
  enviando: boolean = false;
  puedeCrearInteraccion: boolean = false;

  // Variables para los modales de acción
  private modalAtender: any;
  private modalCerrar: any;
  private modalRechazar: any;
  comentarioAccion: string = '';
  procesandoAccion: boolean = false;
  formSubmitted: boolean = false;
  
  // Usuario actual
  usuarioActualId: number;
  usuarioActualRol: string = '';
  
  // Editor de texto enriquecido
  editor: Editor;
  toolbar: Toolbar = [
    ['bold', 'italic', 'underline'],
    ['ordered_list', 'bullet_list'],
    ['link'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
  ];
  
  // Suscripciones
  private suscripciones: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reclamosService: ReclamoService,
    private archivosService: ArchivosService,
    private authService: AuthService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.interaccionForm = this.fb.group({
      mensaje: ['', Validators.required],
      interaccionId: [null]
    });
    
    // Obtener información del usuario actual
    this.usuarioActualId = this.authService.currentUserValue?.usuarioId;
    this.usuarioActualRol = this.authService.currentUserValue?.rol || '';
  }

  verificarPermisosInteraccion(): void {
    // Si no hay reclamo cargado, no hay permiso
    if (!this.reclamo) {
      this.puedeCrearInteraccion = false;
      return;
    }
    
    const esJefeArea = this.esJefeArea();
    const esAtencionCliente = this.esAtencionCliente();
    const hayInteracciones = this.reclamo.interacciones && this.reclamo.interacciones.length > 0;
    
    // Si es administrador, siempre puede interactuar
/*     if (this.esAdministrador()) {
      this.puedeCrearInteraccion = true;
      return;
    } */
    
    // Si es Jefe de Área, solo puede ser la primera interacción y si está asignado
    if (esJefeArea) {
      // Puede interactuar si no hay interacciones previas y está asignado
      this.puedeCrearInteraccion = this.esUsuarioAsignado();
      return;
    }
    
    // Si es Atención al Cliente, solo puede interactuar después de la primera interacción
    if (esAtencionCliente) {
      this.puedeCrearInteraccion = hayInteracciones;
      return;
    }
    
    // Por defecto, no puede crear interacciones
    this.puedeCrearInteraccion = false;
  }

  ngOnInit(): void {
    this.editor = new Editor({
      content: '',
      history: true,
      keyboardShortcuts: true,
      inputRules: true,
    });
    
    const paramsSub = this.route.params.subscribe(params => {
      const ticketId = params['ticketId'];
      if (ticketId) {
        this.cargarDetalleReclamo(ticketId);
      } else {
        this.error = 'ID de ticket no proporcionado';
        this.cargando = false;
      }
    });
    
    this.suscripciones.push(paramsSub);
  }

  ngAfterViewInit(): void {
    // Inicializar modales después de que las vistas estén disponibles
    setTimeout(() => {
      this.inicializarModales();
    }, 0);
  }

  ngOnDestroy(): void {
    // Destruir editor
    if (this.editor) {
      this.editor.destroy();
    }
    
    // Limpiar modales
    if (this.modalAtender) {
      this.modalAtender.dispose();
    }
    if (this.modalCerrar) {
      this.modalCerrar.dispose();
    }
    if (this.modalRechazar) {
      this.modalRechazar.dispose();
    }
    
    // Cancelar suscripciones
    this.suscripciones.forEach(sub => sub.unsubscribe());
  }
  
  /**
   * Inicializa los modales de Bootstrap utilizando las referencias ViewChild
   */
  private inicializarModales(): void {
    if (this.modalAtenderEl?.nativeElement) {
      this.modalAtender = new bootstrap.Modal(this.modalAtenderEl.nativeElement);
    }
    
    if (this.modalCerrarEl?.nativeElement) {
      this.modalCerrar = new bootstrap.Modal(this.modalCerrarEl.nativeElement);
    }
    
    if (this.modalRechazarEl?.nativeElement) {
      this.modalRechazar = new bootstrap.Modal(this.modalRechazarEl.nativeElement);
    }
  }

  /**
   * Carga los detalles del reclamo desde el servicio
   * @param ticketId ID del ticket a cargar
   */
  cargarDetalleReclamo(ticketId: string): void {
    this.cargando = true;
    const reclamoSub = this.reclamosService.getReclamoDetalleCompleto(ticketId).subscribe({
      next: (data) => {
        this.reclamo = data;
        this.archivosFiltrados = [...data.archivos];
        this.cargando = false;
        this.verificarPermisosInteraccion();
      },
      error: (err) => {
        this.error = 'Error al cargar los detalles del reclamo: ' + err.message;
        this.cargando = false;
        this.toastr.error('No se pudo cargar la información del reclamo', 'Error');
      }
    });
    
    this.suscripciones.push(reclamoSub);
  }

  // Métodos para verificar roles y permisos
  
  /**
   * Verifica si el usuario actual es Administrador
   */
  esAdministrador(): boolean {
    return this.usuarioActualRol === 'Administrador';
  }
  
  /**
   * Verifica si el usuario actual es de Atención al Cliente
   */
  esAtencionCliente(): boolean {
    return this.usuarioActualRol === 'AtencionCliente';
  }
  
  /**
   * Verifica si el usuario actual es Jefe de Área
   */
  esJefeArea(): boolean {
    return this.usuarioActualRol === 'JefeArea';
  }
  
  /**
   * Verifica si el usuario actual está asignado al reclamo
   */
  esUsuarioAsignado(): boolean {
    if (!this.reclamo || !this.reclamo.asignaciones || !this.usuarioActualId) {
      return false;
    }
    
    return this.reclamo.asignaciones.some(
      asignacion => asignacion.usuarioId === this.usuarioActualId
    );
  }

  // Métodos para manejar los modales
  
  /**
   * Muestra el modal de atender reclamo
   */
  mostrarModalAtender(): void {
    if (this.modalAtender) {
      this.modalAtender.show();
    } else {
      this.toastr.error('No se pudo mostrar el modal', 'Error');
    }
  }
  
  /**
   * Muestra el modal de cerrar reclamo
   */
  mostrarModalCerrar(): void {
    if (this.modalCerrar) {
      this.modalCerrar.show();
    } else {
      this.toastr.error('No se pudo mostrar el modal', 'Error');
    }
  }
  
  /**
   * Muestra el modal de rechazar reclamo
   */
  mostrarModalRechazar(): void {
    this.comentarioAccion = '';
    this.formSubmitted = false;
    
    if (this.modalRechazar) {
      this.modalRechazar.show();
    } else {
      this.toastr.error('No se pudo mostrar el modal', 'Error');
    }
  }
  
  /**
   * Ejecuta la acción de atender el reclamo
   */
  atenderReclamo(): void {
    if (this.procesandoAccion || !this.reclamo) {
      return;
    }

    console.log("step 1");
    
    this.procesandoAccion = true;
    
    const command: AtenderReclamoCommand = {
      TicketId: this.reclamo.ticketId
    };

    console.log("step 2");

    
    const atenderSub = this.reclamosService.atenderReclamo(this.reclamo.ticketId, command).subscribe({
      next: () => {
        this.toastr.success('Reclamo marcado como atendido correctamente', 'Éxito');
        if (this.modalAtender) {
          this.modalAtender.hide();
        }
        this.cargarDetalleReclamo(this.reclamo.ticketId);
        this.procesandoAccion = false;
      },
      error: (err) => {
        this.toastr.error(`Error al atender el reclamo: ${err.error?.message || err.message}`, 'Error');
        this.procesandoAccion = false;
      }
    });
    
    this.suscripciones.push(atenderSub);
  }
  
  /**
   * Ejecuta la acción de cerrar el reclamo
   */
  cerrarReclamo(): void {
    if (this.procesandoAccion || !this.reclamo) {
      return;
    }
    
    this.procesandoAccion = true;
    
    const command: CerrarReclamoCommand = {
      TicketId: this.reclamo.ticketId
    };
    
    const cerrarSub = this.reclamosService.cerrarReclamo(this.reclamo.ticketId, command).subscribe({
      next: () => {
        this.toastr.success('Reclamo cerrado correctamente', 'Éxito');
        if (this.modalCerrar) {
          this.modalCerrar.hide();
        }
        this.cargarDetalleReclamo(this.reclamo.ticketId);
        this.procesandoAccion = false;
      },
      error: (err) => {
        this.toastr.error(`Error al cerrar el reclamo: ${err.error?.message || err.message}`, 'Error');
        this.procesandoAccion = false;
      }
    });
    
    this.suscripciones.push(cerrarSub);
  }
  
  /**
   * Ejecuta la acción de rechazar el reclamo
   */
  rechazarReclamo(): void {
    this.formSubmitted = true;
    
    if (this.procesandoAccion || !this.reclamo || !this.comentarioAccion) {
      return;
    }
    
    this.procesandoAccion = true;
    
    const command: RechazarReclamoCommand = {
      TicketId: this.reclamo.ticketId,
      MotivoRechazo: this.comentarioAccion
    };
    
    const rechazarSub = this.reclamosService.rechazarReclamo(this.reclamo.ticketId, command).subscribe({
      next: () => {
        this.toastr.success('Reclamo rechazado correctamente', 'Éxito');
        if (this.modalRechazar) {
          this.modalRechazar.hide();
        }
        this.cargarDetalleReclamo(this.reclamo.ticketId);
        this.procesandoAccion = false;
      },
      error: (err: any) => {
        this.toastr.error(`Error al rechazar el reclamo: ${err.error?.message || err.message}`, 'Error');
        this.procesandoAccion = false;
      }
    });
    
    this.suscripciones.push(rechazarSub);
  }

  enviarInteraccion(): void {
    if (!this.puedeCrearInteraccion) {
      this.toastr.error('No tienes permisos para crear interacciones en este estado del reclamo', 'Error de permisos');
      return;
    }

    if (this.interaccionForm.invalid || !this.reclamo || this.enviando) {
      return;
    }
    
    this.enviando = true;
    
    // Crear FormData para enviar archivos
    const formData = new FormData();
    formData.append('TicketId', this.reclamo.ticketId);
    formData.append('Mensaje', this.interaccionForm.get('mensaje').value);
    
    // Agregar archivos
    this.archivosSeleccionados.forEach(archivo => {
      formData.append('Archivos', archivo);
    });
    
    if (this.modoEdicion && this.interaccionEditando) {
      // Lógica para editar
      formData.append('InteraccionId', this.interaccionEditando.interaccionId.toString());
      
      // Esta funcionalidad no está implementada en el backend aún
      this.toastr.info('La funcionalidad de edición no está implementada aún', 'Información');
      this.enviando = false;
      return;
    } else {
      // Crear nueva interacción
      const interaccionSub = this.reclamosService.crearInteraccion(formData).subscribe({
        next: () => {
          this.toastr.success('Interacción enviada correctamente', 'Éxito');
          this.limpiarFormularioInteraccion();
          this.cargarDetalleReclamo(this.reclamo.ticketId);
          this.enviando = false;
        },
        error: (err) => {
          this.toastr.error('Error al enviar la interacción: ' + (err.error?.message || err.message), 'Error');
          this.enviando = false;
        }
      });
      
      this.suscripciones.push(interaccionSub);
    }
  }

  /**
   * Maneja la selección de archivos
   * @param event Evento del input file
   */
  onFilesSelected(event: any): void {
    if (event.target.files.length > 0) {
      const archivos = Array.from(event.target.files) as File[];
      
      // Validar tamaño de los archivos (5MB máximo por archivo)
      const archivosValidos = archivos.filter(archivo => archivo.size <= 5 * 1024 * 1024);
      const archivosInvalidos = archivos.filter(archivo => archivo.size > 5 * 1024 * 1024);
      
      if (archivosInvalidos.length > 0) {
        this.toastr.warning(`${archivosInvalidos.length} archivo(s) exceden el tamaño máximo de 5MB`, 'Advertencia');
      }
      
      // Agregar los archivos válidos a la lista
      this.archivosSeleccionados = [...this.archivosSeleccionados, ...archivosValidos];
    }
  }
  
  /**
   * Elimina un archivo seleccionado de la lista
   * @param index Índice del archivo a eliminar
   */
  eliminarArchivoSeleccionado(index: number): void {
    this.archivosSeleccionados.splice(index, 1);
  }
  
  /**
   * Verifica si el usuario puede editar una interacción
   * @param interaccion Interacción a verificar
   */
  puedeEditarInteraccion(interaccion: InteraccionDetalleDto): boolean {
    // Solo el creador de la interacción puede editarla
    return this.esUsuarioActual(interaccion.usuarioId);
  }
  
  /**
   * Verifica si un ID de usuario corresponde al usuario actual
   * @param usuarioId ID de usuario a verificar
   */
  esUsuarioActual(usuarioId: number): boolean {
    return this.usuarioActualId === usuarioId;
  }
  
  /**
   * Prepara el formulario para editar una interacción
   * @param interaccion Interacción a editar
   */
  editarInteraccion(interaccion: InteraccionDetalleDto): void {
    this.modoEdicion = true;
    this.interaccionEditando = interaccion;
    
    // Establecer los valores en el formulario
    this.interaccionForm.patchValue({
      mensaje: interaccion.mensaje,
      interaccionId: interaccion.interaccionId
    });
    
    // Actualizar el editor
    this.editor.setContent(interaccion.mensaje);
    
    // Scrollear hasta el formulario
    const editorElement = document.querySelector('.editor-container');
    if (editorElement) {
      editorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
  
  /**
   * Solicita confirmación y elimina una interacción
   * @param interaccion Interacción a eliminar
   */
  eliminarInteraccion(interaccion: InteraccionDetalleDto): void {
    if (confirm('¿Está seguro de que desea eliminar esta interacción?')) {
      // Esta funcionalidad no está implementada en el backend aún
      this.toastr.info('La funcionalidad de eliminación no está implementada aún', 'Información');
    }
  }
  
  /**
   * Cancela la edición y resetea el formulario
   */
  cancelarEdicion(): void {
    this.modoEdicion = false;
    this.interaccionEditando = null;
    this.limpiarFormularioInteraccion();
  }
  
  /**
   * Limpia el formulario de interacción
   */
  limpiarFormularioInteraccion(): void {
    this.interaccionForm.reset();
    this.editor.setContent('');
    this.archivosSeleccionados = [];
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  /**
   * Filtra archivos según el término de búsqueda
   */
  filtrarArchivos(): void {
    if (!this.reclamo) return;
    
    if (!this.filtroBusqueda.trim()) {
      this.archivosFiltrados = [...this.reclamo.archivos];
    } else {
      const busqueda = this.filtroBusqueda.toLowerCase().trim();
      this.archivosFiltrados = this.reclamo.archivos.filter(archivo => 
        archivo.nombreOriginal.toLowerCase().includes(busqueda)
      );
    }
  }

  formatearEstado(estado: string): string {
    if (!estado) return '';
    
    switch (estado.toLowerCase()) {
      case 'enproceso': return 'En Proceso';
      default: return estado;
    }
  }

  formatearRol(rol: string): string{
    if(!rol) return '';
    switch(rol.toLowerCase()){
      case 'atencioncliente': return 'Atención al Cliente';
      case 'jefearea': return 'Jefe de Área';
      default: return rol;
    }
  }

  /**
   * Descarga un archivo del reclamo
   * @param archivo Archivo a descargar
   */
  descargarArchivo(archivo: any): void {
    const descargarSub = this.archivosService.descargarArchivo(archivo.archivoId).subscribe({
      next: (data: Blob) => {
        const url = window.URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = archivo.nombreOriginal;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.toastr.error('Error al descargar el archivo', 'Error');
        console.error('Error al descargar:', err);
      }
    });
    
    this.suscripciones.push(descargarSub);
  }
  
  // Métodos de utilidad para estilos y clases CSS
  
  /**
   * Obtiene la clase CSS para el estado actual del reclamo
   */
  getEstadoClass(): string {
    if (!this.reclamo) return '';
    
    switch (this.reclamo.estado.toLowerCase()) {
      case 'registrado': return 'estado-registrado';
      case 'enproceso': return 'estado-enproceso';
      case 'atendido': return 'estado-atendido';
      case 'cerrado': return 'estado-cerrado';
      case 'rechazado': return 'estado-rechazado';
      default: return '';
    }
  }
  
  /**
   * Obtiene el icono para el estado actual del reclamo
   */
  getEstadoIcon(): string {
    if (!this.reclamo) return 'fas fa-question-circle';
    
    switch (this.reclamo.estado.toLowerCase()) {
      case 'registrado': return 'fas fa-folder-open';
      case 'enproceso': return 'fas fa-sync-alt';
      case 'atendido': return 'fas fa-headset';
      case 'cerrado': return 'fas fa-lock';
      case 'rechazado': return 'fas fa-ban';
      default: return 'fas fa-question-circle';
    }
  }
  
  /**
   * Obtiene la clase CSS para un estado en la línea de tiempo
   * @param estado Nombre del estado
   */
  getEstadoTimelineClass(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'registrado': return 'timeline-abierto';
      case 'enproceso': return 'timeline-enproceso';
      case 'atendido': return 'timeline-atendido';
      case 'cerrado': return 'timeline-cerrado';
      case 'rechazado': return 'timeline-rechazado';
      default: return '';
    }
  }
  
  /**
   * Obtiene el icono para un estado por su nombre
   * @param estado Nombre del estado
   */
  getEstadoIconByName(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'registrado': return 'fas fa-folder-open';
      case 'enproceso': return 'fas fa-sync-alt';
      case 'atendido': return 'fas fa-headset';
      case 'cerrado': return 'fas fa-lock';
      case 'rechazado': return 'fas fa-ban';
      default: return 'fas fa-question-circle';
    }
  }
  
  /**
   * Obtiene la clase CSS para un rol de usuario
   * @param rol Nombre del rol
   */
  getRolClass(rol: string): string {
    switch (rol.toLowerCase()) {
      case 'cliente': return 'badge-cliente';
      case 'administrador': return 'badge-admin';
      case 'atencioncliente': return 'badge-soporte';
      case 'jefearea': return 'badge-agente';
      default: return 'bg-secondary';
    }
  }
  
  /**
   * Obtiene la clase CSS para el icono de un archivo según su extensión
   * @param fileName Nombre del archivo
   */
  getFileIconClass(fileName: string): string {
    if (!fileName) return 'fas fa-file text-secondary';
    
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    switch (extension) {
      case 'pdf': return 'fas fa-file-pdf text-danger';
      case 'doc':
      case 'docx': return 'fas fa-file-word text-primary';
      case 'xls':
      case 'xlsx': return 'fas fa-file-excel text-success';
      case 'ppt':
      case 'pptx': return 'fas fa-file-powerpoint text-warning';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp': return 'fas fa-file-image text-info';
      case 'zip':
      case 'rar': return 'fas fa-file-archive text-secondary';
      case 'txt': return 'fas fa-file-alt text-secondary';
      default: return 'fas fa-file text-secondary';
    }
  }
  
  /**
   * Formatea el tamaño de un archivo en unidades legibles
   * @param bytes Tamaño en bytes
   */
  formatearTamano(bytes: number): string {
    if (!bytes || bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Acciones generales
  
  /**
   * Imprime el detalle del reclamo
   */
  imprimirReclamo(): void {
    window.print();
  }

  /**
   * Navega a la página de edición del reclamo
   */
  editarReclamo(): void {
    this.router.navigate(['/reclamos', this.reclamo?.ticketId, 'editar']);
  }

  /**
   * Vuelve a la lista de reclamos
   */
  volver(): void {
    this.router.navigate(['/reclamos']);
  }

  /**
   * Limpia la lista de archivos seleccionados
   */
  limpiarArchivosSeleccionados(): void {
    this.archivosSeleccionados = [];
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }
}