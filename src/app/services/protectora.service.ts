import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Animal } from './animal.service';

export interface Protectora {
  id: string;
  nombre: string;
  descripcion: string;
  fotoPerfilUrl: string;
  comunidadAutonoma: string;
  provincia: string;
  fechaRegistro?: any;
  animales?: Animal[];
  rol?: 'protectora' | 'admin';
  suscrito?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProtectoraService {
  private apiUrl = 'http://localhost:8080/api/protectoras';

  constructor(private http: HttpClient) { }

  getProtectora(id: string): Observable<Protectora> {
    return this.http.get<Protectora>(`${this.apiUrl}/${id}`);
  }

  addAnimalAProtectora(id: string, animal: Animal): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/animales`, animal);
  }

  deleteAnimalAProtectora(protectoraId: string, animalId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${protectoraId}/animales/${animalId}`
    );
  }

  createProtectora(data: {
    nombre: string;
    descripcion: string;
    comunidadAutonoma: string;
    provincia: string;
    fotoPerfilUrl?: string;
  }): Observable<void> {
    return this.http.post<void>(this.apiUrl, data);
  }

  updateAnimalAProtectora(
    protectoraId: string,
    animalId: string,
    cambios: Partial<Animal>
  ): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/${protectoraId}/animales/${animalId}`,
      cambios
    );
  }

  existsNombre(nombre: string): Observable<{ exists: boolean }> {
    const url = `${this.apiUrl}/exists/nombre?nombre=${encodeURIComponent(nombre)}`;
    return this.http.get<{ exists: boolean }>(url);
  }

  existsCif(cif: string): Observable<{ exists: boolean }> {
    const url = `${this.apiUrl}/exists/cif?cif=${encodeURIComponent(cif)}`;
    return this.http.get<{ exists: boolean }>(url);
  }

  deleteProtectora(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getProtectoraByEmail(email: string): Observable<Protectora> {
    const url = `${this.apiUrl}/by-email?email=${encodeURIComponent(email)}`;
    return this.http.get<Protectora>(url);
  }
}