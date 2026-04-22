import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerificaCorreoComponent } from './verifica-correo.component';

describe('VerificaCorreoComponent', () => {
  let component: VerificaCorreoComponent;
  let fixture: ComponentFixture<VerificaCorreoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VerificaCorreoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerificaCorreoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
