import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaReclamosComponent } from './lista-reclamos.component';

describe('ListaReclamosComponent', () => {
  let component: ListaReclamosComponent;
  let fixture: ComponentFixture<ListaReclamosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListaReclamosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaReclamosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
