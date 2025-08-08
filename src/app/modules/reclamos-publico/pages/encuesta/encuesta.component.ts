import { Component } from '@angular/core';
import { EncuestaDto, PreguntaDto } from '../../../../core/models/encuesta.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EncuestaService } from '../../../../core/services/encuesta.service';
import { finalize } from 'rxjs';

interface RespuestaLikert {
  valor: number;
  etiqueta: string;
  emoji: string;
  color: string;
}

@Component({
  selector: 'app-encuesta',
  standalone: false,
  templateUrl: './encuesta.component.html',
  styleUrl: './encuesta.component.scss'
})
export class EncuestaComponent {
token: string = '';
  encuesta: EncuestaDto | null = null;
  encuestaForm: FormGroup;
  
  loading = true;
  submitting = false;
  error: string | null = null;
  success = false;
  
  opcionesLikert: RespuestaLikert[] = [
    { valor: 1, etiqueta: 'Muy Insatisfecho', emoji: '😠', color: 'danger' },
    { valor: 2, etiqueta: 'Insatisfecho', emoji: '😕', color: 'warning' },
    { valor: 3, etiqueta: 'Neutral', emoji: '😐', color: 'secondary' },
    { valor: 4, etiqueta: 'Satisfecho', emoji: '🙂', color: 'info' },
    { valor: 5, etiqueta: 'Muy Satisfecho', emoji: '😊', color: 'success' }
  ];
  
  categorias: any = {
    'PROCESO': { nombre: 'Proceso de Atención', icono: 'bi-clipboard-check', color: 'primary' },
    'SOLUCION': { nombre: 'Calidad de la Solución', icono: 'bi-tools', color: 'success' },
    'ATENCION': { nombre: 'Atención al Cliente', icono: 'bi-people', color: 'info' },
    'SISTEMA': { nombre: 'Plataforma Digital', icono: 'bi-laptop', color: 'warning' },
    'GENERAL': { nombre: 'Satisfacción General', icono: 'bi-star', color: 'danger' }
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private encuestaService: EncuestaService
  ) {
    this.encuestaForm = this.fb.group({
      comentario: ['', [Validators.maxLength(250)]]
    });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') || '';
    if (this.token) {
      this.cargarEncuesta();
    } else {
      this.error = 'Token de encuesta no válido';
      this.loading = false;
    }
  }

  cargarEncuesta(): void {
    this.loading = true;
    this.encuestaService.obtenerEncuesta(this.token)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (data) => {
          this.encuesta = data;
          if (data.puedeResponder) {
            this.inicializarFormulario(data.preguntas);
          } else {
            this.error = data.mensajeError || 'No puede responder esta encuesta';
          }
        },
        error: (err) => {
          console.error('Error al cargar encuesta:', err);
          this.error = 'No se pudo cargar la encuesta. Por favor, verifique el enlace.';
        }
      });
  }

  inicializarFormulario(preguntas: PreguntaDto[]): void {
    const respuestasGroup: any = {};
    preguntas.forEach(pregunta => {
      respuestasGroup[pregunta.codigo] = [
        null, 
        pregunta.obligatoria ? Validators.required : null
      ];
    });
    
    this.encuestaForm = this.fb.group({
      respuestas: this.fb.group(respuestasGroup),
      comentario: ['', [Validators.maxLength(250)]]
    });
  }

  getPreguntasPorCategoria(categoria: string): PreguntaDto[] {
    return this.encuesta?.preguntas.filter(p => p.categoria === categoria) || [];
  }

  getCategorias(): string[] {
    const categoriasUnicas = [...new Set(this.encuesta?.preguntas.map(p => p.categoria))];
    return categoriasUnicas.sort((a, b) => {
      const ordenCategorias = ['PROCESO', 'SOLUCION', 'ATENCION', 'SISTEMA', 'GENERAL'];
      return ordenCategorias.indexOf(a) - ordenCategorias.indexOf(b);
    });
  }

  seleccionarRespuesta(preguntaCodigo: string, valor: number): void {
    this.encuestaForm.get(['respuestas', preguntaCodigo])?.setValue(valor);
  }

  getRespuestaSeleccionada(preguntaCodigo: string): number | null {
    return this.encuestaForm.get(['respuestas', preguntaCodigo])?.value;
  }

  onSubmit(): void {
    if (this.encuestaForm.invalid) {
      Object.keys(this.encuestaForm.controls).forEach(key => {
        const control = this.encuestaForm.get(key);
        control?.markAsTouched();
      });
      
      // Marcar todas las respuestas como touched
      const respuestasGroup: any = this.encuestaForm.get('respuestas');
      if (respuestasGroup) {
        Object.keys(respuestasGroup.controls).forEach(key => {
          respuestasGroup.get(key)?.markAsTouched();
        });
      }
      
      this.error = 'Por favor responda todas las preguntas obligatorias';
      return;
    }

    this.submitting = true;
    this.error = null;

    const request = {
      respuestas: this.encuestaForm.get('respuestas')?.value,
      comentario: this.encuestaForm.get('comentario')?.value
    };

    this.encuestaService.responderEncuesta(this.token, request)
      .pipe(finalize(() => this.submitting = false))
      .subscribe({
        next: (response) => {
          if (response.exitoso) {
            this.success = true;
            // Opcionalmente redirigir después de unos segundos
            setTimeout(() => {
              this.router.navigate(['/']);
            }, 5000);
          } else {
            this.error = response.mensaje;
          }
        },
        error: (err) => {
          console.error('Error al enviar encuesta:', err);
          this.error = 'Error al enviar la encuesta. Por favor intente nuevamente.';
        }
      });
  }

  get caracteresRestantes(): number {
    const comentario = this.encuestaForm.get('comentario')?.value || '';
    return 250 - comentario.length;
  }
}
