import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EdadUtilsTsService {

  constructor() { }

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
