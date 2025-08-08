import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaTicketComponent } from './consulta-ticket.component';

describe('ConsultaTicketComponent', () => {
  let component: ConsultaTicketComponent;
  let fixture: ComponentFixture<ConsultaTicketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConsultaTicketComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultaTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
