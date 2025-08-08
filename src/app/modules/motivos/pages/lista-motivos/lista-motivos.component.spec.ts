import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaMotivosComponent } from './lista-motivos.component';

describe('ListaMotivosComponent', () => {
  let component: ListaMotivosComponent;
  let fixture: ComponentFixture<ListaMotivosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListaMotivosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaMotivosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
