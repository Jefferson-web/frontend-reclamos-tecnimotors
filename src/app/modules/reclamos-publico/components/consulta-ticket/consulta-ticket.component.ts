import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReclamoEstadoEnum, ReclamoPublico } from '../../../../core/models/reclamo.model';
import { ActivatedRoute } from '@angular/router';
import { ReclamoService } from '../../../../core/services/reclamo.service';

@Component({
  selector: 'app-consulta-ticket',
  standalone: false,
  templateUrl: './consulta-ticket.component.html',
  styleUrl: './consulta-ticket.component.scss'
})
export class ConsultaTicketComponent implements OnInit{

  searchForm: FormGroup;
  emailForm: FormGroup;
  reclamo: ReclamoPublico | null = null;
  loading = false;
  error = false;
  errorMessage = '';
  showTicketInfo = false;
  showEmailForm = false;
  emailSending = false;
  emailSent = false;

  // Enum para los estados de reclamo
  readonly ESTADO = ReclamoEstadoEnum;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private consultaService: ReclamoService
  ) {
    this.searchForm = this.fb.group({
      ticketNumber: ['', [Validators.required, Validators.minLength(5)]]
    });
    
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    // Verificar si hay un ticketId en la URL
    this.route.queryParams.subscribe(params => {
      const ticketId = params['ticket'];
      if (ticketId) {
        this.searchForm.get('ticketNumber')?.setValue(ticketId);
        this.searchTicket();
      }
    });
  }

  searchTicket(): void {
    if (this.searchForm.invalid) {
      return;
    }

    const ticketId = this.searchForm.get('ticketNumber')?.value;
    this.loading = true;
    this.error = false;
    this.showTicketInfo = false;
    
    this.consultaService.consultarReclamo(ticketId).subscribe({
      next: (data) => {
        if (data) {
          this.reclamo = data;
          this.showTicketInfo = true;
        } else {
          this.error = true;
          this.errorMessage = 'No se encontró el reclamo solicitado.';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = true;
        this.errorMessage = err.message || 'No se encontró el reclamo.';
        this.loading = false;
      }
    });
  }

  tryAgain(): void {
    this.error = false;
    this.searchForm.reset();
    this.showTicketInfo = false;
  }

  showEmailUpdateForm(): void {
    if (this.reclamo && this.reclamo.correo) {
      this.emailForm.get('email')?.setValue(this.reclamo.correo);
    } else {
      this.emailForm.get('email')?.setValue('');
    }
    this.showEmailForm = true;
    this.emailSent = false;
  }

  cancelEmailUpdate(): void {
    this.showEmailForm = false;
  }

  requestEmailUpdate(): void {
    if (this.emailForm.invalid || !this.reclamo) {
      return;
    }
    
    const email = this.emailForm.get('email')?.value;
    this.emailSending = true;
    
    /* this.consultaService.solicitarActualizacion(this.reclamo.ticketId, email).subscribe({
      next: (success) => {
        this.emailSending = false;
        
        if (success) {
          this.emailSent = true;
          this.showEmailForm = false;
        } else {
          alert('No se pudo procesar tu solicitud. Por favor, intenta más tarde.');
        }
      },
      error: () => {
        this.emailSending = false;
        alert('Ocurrió un error al enviar la solicitud. Por favor, intenta más tarde.');
      }
    }); */
  }

  getProgressPercentage(): string {
    if (!this.reclamo) return '0%';
    
    switch(this.reclamo.estado) {
      case this.ESTADO.REGISTRADO:
        return '0%';
      case this.ESTADO.EN_PROCESO:
        return '33%';
      case this.ESTADO.ATENDIDO:
        return '66%';
      case this.ESTADO.CERRADO:
      case this.ESTADO.RECHAZADO:
        return '100%';
      default:
        return '0%';
    }
  }

  getStatusClass(): string {
    if (!this.reclamo) return '';
    
    switch(this.reclamo.estado) {
      case this.ESTADO.REGISTRADO:
        return 'status-registrado';
      case this.ESTADO.EN_PROCESO:
        return 'status-proceso';
      case this.ESTADO.ATENDIDO:
        return 'status-atendido';
      case this.ESTADO.CERRADO:
        return 'status-cerrado';
      case this.ESTADO.RECHAZADO:
        return 'status-rechazado';
      default:
        return '';
    }
  }

  getStatusText(): string {
    if (!this.reclamo || !this.reclamo.historial || this.reclamo.historial.length === 0) return '';
    
    const estadoActual = this.reclamo.historial.find(h => h.estado === this.reclamo?.estado);
    return estadoActual?.estadoTexto || '';
  }

  isRejected(): boolean {
    return this.reclamo?.estado === this.ESTADO.RECHAZADO;
  }

}
