import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevoReclamoComponent } from './nuevo-reclamo.component';

describe('NuevoReclamoComponent', () => {
  let component: NuevoReclamoComponent;
  let fixture: ComponentFixture<NuevoReclamoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NuevoReclamoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NuevoReclamoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
