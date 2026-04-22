// src/app/suscripcion/suscripcion.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ProtectoraService } from '../services/protectora.service';
import { getAuth, deleteUser } from 'firebase/auth';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-suscripcion',
  standalone: true,              
  imports: [
    CommonModule,                
    ReactiveFormsModule,         
    RouterModule                 
  ],
  templateUrl: './suscripcion.component.html',
  styleUrls: ['./suscripcion.component.scss']
})
export class SuscripcionComponent implements OnInit {

  formaPago!: FormGroup;
  pagoExitoso = false;
  hoy = new Date();
  paymentSuccess = false;

  constructor(private fb: FormBuilder, private router: Router, private ps: ProtectoraService) { }

  ngOnInit(): void {
    this.formaPago = this.fb.group({
      numeroTarjeta: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[0-9]{16,19}$/)
        ]
      ],
      caducidad: [
        '',
        [
          Validators.required,
          this.expirationMonthYearValidator()
        ]
      ],
      cvc: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[0-9]{3,4}$/) // 3 o 4 dígitos
        ]
      ]
    });

  }

  private expirationMonthYearValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const valor: string = control.value;
      if (!valor) {
        return null; 
      }

      const partes = valor.split('-');
      if (partes.length !== 2) {
        return { fechaCaducidadInvalida: true };
      }

      const anio = parseInt(partes[0], 10);
      const mes = parseInt(partes[1], 10);
      if (isNaN(anio) || isNaN(mes) || mes < 1 || mes > 12) {
        return { fechaCaducidadInvalida: true };
      }

      const hoy = new Date();
      const anioActual = hoy.getFullYear();
      const mesActual = hoy.getMonth() + 1;

      if (anio < anioActual) {
        return { fechaCaducidadInvalida: true };
      }
      if (anio === anioActual && mes < mesActual) {
        return { fechaCaducidadInvalida: true };
      }

      return null;
    };
  }

  async simularPago(): Promise<void> {
    if (this.formaPago.invalid) {
      this.formaPago.markAllAsTouched();
      return;
    }

    this.onPagoExitoso();
  }

  async cancelarPago(): Promise<void> {
    sessionStorage.removeItem('registroProtectora');
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      try {
        await deleteUser(user);
        console.log('Usuario Auth eliminado tras cancelar pago');
      } catch (delErr) {
        console.error('Error eliminando usuario:', delErr);
      }
    }
    await Swal.fire({
      icon: 'info',
      title: 'Pago cancelado',
      text: 'Has cancelado el pago. Tu cuenta ha sido eliminada.',
      confirmButtonText: 'Aceptar'
    });

    this.router.navigate(['/']);
  }


  private onPagoExitoso(): void {
    this.paymentSuccess = true;

    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 3000);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  get numeroTarjeta() { return this.formaPago.get('numeroTarjeta'); }
  get caducidad() { return this.formaPago.get('caducidad'); }
  get cvc() { return this.formaPago.get('cvc'); }
}
