
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
    const letraInicial = '[ABCDEFGHJKLMNPQRSUVW]';
    const sieteDigitos = '\\d{7}';
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