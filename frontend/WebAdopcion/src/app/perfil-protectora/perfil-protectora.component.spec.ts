import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerfilProtectoraComponent } from './perfil-protectora.component';

describe('PerfilProtectoraComponent', () => {
  let component: PerfilProtectoraComponent;
  let fixture: ComponentFixture<PerfilProtectoraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PerfilProtectoraComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerfilProtectoraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
