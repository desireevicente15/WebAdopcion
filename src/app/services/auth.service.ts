import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Protectora } from './protectora.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private protectoraSubject = new BehaviorSubject<Protectora | null>(null);

  constructor() {
    const stored = localStorage.getItem('currentProtectora');
    if (stored) {
      try {
        const obj: Protectora = JSON.parse(stored);
        this.protectoraSubject.next(obj);
      } catch {
        localStorage.removeItem('currentProtectora');
        this.protectoraSubject.next(null);
      }
    }
  }

  login(creds: { email: string; password: string }): Observable<Protectora> {
    return new Observable<Protectora>(observer => {
      setTimeout(() => {
        const fakeJwt = 'eyJhbGciOi...';
        localStorage.setItem('token', fakeJwt);

        const datos = {
          id: 'abc123',
          nombre: 'Protectora Ejemplo',
          descripcion: 'Descripción demo',
          fotoPerfilUrl: 'https://...',
          comunidadAutonoma: 'Madrid',
          provincia: 'Madrid',
          fechaRegistro: new Date().toISOString(),
          animales: []
        };

        const protectora: Protectora = {
          id: datos.id,
          nombre: datos.nombre,
          descripcion: datos.descripcion,
          fotoPerfilUrl: datos.fotoPerfilUrl,
          comunidadAutonoma: datos.comunidadAutonoma,
          provincia: datos.provincia,
          fechaRegistro: datos.fechaRegistro,
          animales: datos.animales
        };

        this.protectoraSubject.next(protectora);
        observer.next(protectora);
        observer.complete();
      }, 1000);
    });
  }

  setProtectora(p: Protectora): void {
    if (!p.rol) {
      p.rol = (p.nombre.toLowerCase() === 'admin-de-prueba') ? 'admin' : 'protectora';
    }
    if (p.suscrito === undefined) {
      p.suscrito = false;
    }
    this.protectoraSubject.next(p);
    localStorage.setItem('currentProtectora', JSON.stringify(p));
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentProtectora');
    this.protectoraSubject.next(null);
  }


  getProtectoraActual(): Protectora | null {
    return this.protectoraSubject.getValue();
  }

  getProtectora$(): Observable<Protectora | null> {
    return this.protectoraSubject.asObservable();
  }

  private decodeToken(token: string): any {

    return {
      id: 'abc123',
      nombre: 'Protectora Ejemplo',
      descripcion: 'Descripción demo',
      fotoPerfilUrl: 'https://...',
      comunidadAutonoma: 'Madrid',
      provincia: 'Madrid',
      fechaRegistro: new Date().toISOString(),
      animales: []
    };
  }

  setSuscripcion(valor: boolean): void {
    const current = this.protectoraSubject.getValue();
    if (current) {
      current.suscrito = valor;
      this.protectoraSubject.next(current);
      localStorage.setItem('currentProtectora', JSON.stringify(current));
    }
  }
}
