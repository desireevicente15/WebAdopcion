// src/app/services/cif-validator.service.ts

import { Injectable } from '@angular/core';
import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class CifValidatorService {

  constructor() { }

  cifFormatValidator(): ValidatorFn {
    // Letras permitidas en 1ª posición
    const letraInicial = '[ABCDEFGHJKLMNPQRSUVW]';
    // Siete dígitos
    const sieteDigitos = '\\d{7}';
    // Dígito o letra de control
    const controlFinal = '[0-9A-J]';
    const cifRegex = new RegExp(`^${letraInicial}${sieteDigitos}${controlFinal}$`, 'i');

    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value?.toString().trim() || '';
      if (!value) {
        return { required: true };
      }
      if (!cifRegex.test(value)) {
        return { cifFormatoInvalido: true };
      }
      return null;
    };
  }
}