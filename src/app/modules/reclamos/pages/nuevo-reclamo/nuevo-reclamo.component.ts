import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Editor } from 'ngx-editor';
import { UbicacionService } from '../../../../core/services/ubicacion.service';
import { MotivoService } from '../../../../core/services/motivo.service';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { ReclamoService } from '../../../../core/services/reclamo.service';

@Component({
  selector: 'app-nuevo-reclamo',
  standalone: false,
  templateUrl: './nuevo-reclamo.component.html',
  styleUrl: './nuevo-reclamo.component.scss'
})
export class NuevoReclamoComponent implements OnInit, OnDestroy{

  ngOnDestroy(): void {
    
  }

  ngOnInit(): void {
    this.editor = new Editor();
    
    // Cargar datos iniciales
    this.cargarDepartamentos();
    this.cargarMotivos();
    this.cargarUsuarios();
    
    this.dropdownSettings = { 
      singleSelection: false, 
      text:"Seleccionar usuarios",
      selectAllText:'Select All',
      unSelectAllText:'UnSelect All',
      enableSearchFilter: true,
      classes:"myclass custom-class"
    };
    
    this.reclamoForm.get('departamentoId')?.valueChanges.subscribe(departamentoId => {
      if (departamentoId) {
        this.cargarProvincias(departamentoId);
        this.reclamoForm.get('provinciaId')?.setValue('');
        this.reclamoForm.get('distritoId')?.setValue('');
      }
    });
    
    this.reclamoForm.get('provinciaId')?.valueChanges.subscribe(provinciaId => {
      if (provinciaId) {
        this.cargarDistritos(provinciaId);
        this.reclamoForm.get('distritoId')?.setValue('');
      }
    });
  }

  reclamoForm: FormGroup;
  editor: Editor;
  isSubmitting = false;
  archivosList: File[] = [];
  
  // Para los select de ubicación
  departamentos: any[] = [];
  provincias: any[] = [];
  distritos: any[] = [];
  
  // Para el select de motivos
  motivos: any[] = [];
  
  // Para el multiselect de usuarios
  usuarios: any[] = [];
  usuariosSeleccionados: any[] = [];
  dropdownSettings = {};

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private ubicacionService: UbicacionService,
    private motivoService: MotivoService,
    private usuarioService: UsuarioService,
    private reclamoService: ReclamoService
  ) {
    this.reclamoForm = this.fb.group({
      cliente: ['', Validators.required],
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
      correo: ['', [Validators.required, Validators.email]],
      detalle: ['', Validators.required],
      prioridad: ['', Validators.required],
      motivoId: ['', Validators.required],
      departamentoId: ['', Validators.required],
      provinciaId: ['', Validators.required],
      distritoId: ['', Validators.required],
      usuariosAsignadosIds: [[], Validators.required]
    });
  }

  cargarDepartamentos(): void {
    this.ubicacionService.getDepartamentos().subscribe(data => {
      this.departamentos = data;
    });
  }
  
  cargarProvincias(departamentoId: string): void {
    this.ubicacionService.getProvincias(departamentoId).subscribe(data => {
      this.provincias = data;
    });
  }
  
  cargarDistritos(provinciaId: string): void {
    this.ubicacionService.getDistritos(provinciaId).subscribe(data => {
      this.distritos = data;
    });
  }
  
  cargarMotivos(): void {
    this.motivoService.getMotivos().subscribe(data => {
      this.motivos = data;
    });
  }
  
  cargarUsuarios(): void {
    this.usuarioService.getUsuariosPorRol(3).subscribe(data => {
      this.usuarios = data.map(user => ({
        id: user.usuarioId,
        itemName: `${user.nombre} ${user.apellidos}`
      }));
    });
  }

  onFileChange(event: any): void {
    if (event.target.files && event.target.files.length) {
      for (let i = 0; i < event.target.files.length; i++) {
        this.archivosList.push(event.target.files[i]);
      }
    }
  }
  
  removeFile(index: number): void {
    this.archivosList.splice(index, 1);
  }

  onItemSelect(item: any): void {
    // El multiselect ya maneja la selección internamente
  }
  
  onSubmit(): void {
    if (this.reclamoForm.invalid) {
      Object.keys(this.reclamoForm.controls).forEach(key => {
        const control = this.reclamoForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    
    this.isSubmitting = true;
    
    const formData = new FormData();
    
    Object.keys(this.reclamoForm.value).forEach(key => {
      if (key !== 'usuariosAsignadosIds') {
        formData.append(key, this.reclamoForm.value[key]);
      }
    });
    
    this.usuariosSeleccionados.forEach(item => {
      formData.append('usuariosAsignadosIds', item.id);
    });
    
    this.archivosList.forEach(archivo => {
      formData.append('archivos', archivo);
    });
    
    this.reclamoService.crearReclamo(formData).subscribe(
      response => {
        alert(`Reclamo creado con éxito. Número de ticket: ${response.data}`);
        this.router.navigate(['/reclamos']);
      },
      error => {
        console.error('Error al crear el reclamo', error);
        this.isSubmitting = false;
      }
    );
  }
}
