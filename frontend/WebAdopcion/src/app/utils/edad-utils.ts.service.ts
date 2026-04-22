import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EdadUtilsTsService {
  
  constructor() { }
  
  /**
   * Calcula la edad de un animal a partir de su fecha de nacimiento.
   * Si la edad es menor a 1 año, devuelve la edad en meses.
   * Si es 1 año o más, devuelve la edad en años.
   * 
   * @param fechaNacimiento - La fecha de nacimiento en formato ISO string.
   * @returns Una cadena que indica la edad (por ejemplo, "4 meses" o "2 años").
   */
  calcularEdad(fechaNacimiento: string): string {
    const fechaNac = new Date(fechaNacimiento);
    const ahora = new Date();
    
    let años = ahora.getFullYear() - fechaNac.getFullYear();
    let meses = ahora.getMonth() - fechaNac.getMonth();
    let dias = ahora.getDate() - fechaNac.getDate();
    
    if (dias < 0) {
      meses--;
    }
    if (meses < 0) {
      años--;
      meses += 12;
    }
    
    return años < 1 ? `${meses} meses` : `${años} años`;
  }
}
