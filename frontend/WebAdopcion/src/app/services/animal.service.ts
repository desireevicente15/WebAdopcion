
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  setDoc,
  deleteDoc,
  query,
  where
} from '@angular/fire/firestore';


export interface Foto {
  url: string;
  publicId: string;
}


export interface Animal {
  id?: string;
  protectoraId: string;
  nombre: string;
  especie: string;
  sexo: string;
  fechaNacimiento: number | string;
  tamano: string;
  comunidadAutonoma: string;
  provincia: string;
  estiloVida: string;
  niniosYadultos: boolean;
  otrasMascotas: boolean;
  descripcion?: string;
  etiquetas: string[];
  fechaRegistro?: Date;
  fotoUrl?: string;
  fotoUrls?: Foto[];
  estado?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AnimalService {
  private apiUrl = 'http://localhost:8080/api/animales';

  constructor(
    private http: HttpClient,
    private firestore: Firestore
  ) {}

  filtrarAnimales(filters: any): Observable<Animal[]> {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined) {
        params = params.set(key, filters[key]);
      }
    });
    return this.http.get<Animal[]>(`${this.apiUrl}/filtrar`, { params });
  }

  addAnimal(animal: Animal): Observable<Animal> {
    return this.http.post<Animal>(this.apiUrl, animal);
  }

  getAnimalesByProtectora(protectoraId: string): Observable<Animal[]> {
    const url = `${this.apiUrl}/protectora/${protectoraId}`;
    return this.http.get<Animal[]>(url);
  }

  addAnimalGlobal(a: Animal & { protectoraId: string; id: string }): Promise<void> {
    const globalAnimal = {
      nombre: a.nombre,
      especie: a.especie,
      sexo: a.sexo,
      fechaNacimiento: a.fechaNacimiento,
      tamano: a.tamano,
      comunidadAutonoma: a.comunidadAutonoma,
      provincia: a.provincia,
      estiloVida: a.estiloVida,
      niniosYadultos: a.niniosYadultos,
      otrasMascotas: a.otrasMascotas,
      descripcion: a.descripcion,
      fotoUrls: a.fotoUrls?.map(f => f.url) || [],
      fotoUrl: a.fotoUrl,
      etiquetas: a.etiquetas,
      fechaRegistro: a.fechaRegistro || new Date(),
      protectoraId: a.protectoraId,
      estado: 'disponible'
    };

    const docRef = doc(this.firestore, 'animales', a.id);
    return setDoc(docRef, globalAnimal);
  }

  getAllGlobalAnimals(): Observable<Animal[]> {

    const colecRef = collection(this.firestore, 'animales');

    const q = query(colecRef, where('estado', '==', 'disponible'));


    return collectionData(q, { idField: 'id' }).pipe(
      map(docs =>
        docs.map((data: any) => {
          const fotos: Foto[] = (data.fotoUrls || []).map((url: string) => ({
            url,
            publicId: ''
          }));

          return {
            id: data.id,
            protectoraId: data.protectoraId,
            nombre: data.nombre,
            especie: data.especie,
            sexo: data.sexo,
            fechaNacimiento: data.fechaNacimiento,
            tamano: data.tamano,
            comunidadAutonoma: data.comunidadAutonoma,
            provincia: data.provincia,
            estiloVida: data.estiloVida,
            niniosYadultos: data.niniosYadultos,
            otrasMascotas: data.otrasMascotas,
            descripcion: data.descripcion,
            etiquetas: data.etiquetas,
            fechaRegistro: data.fechaRegistro?.toDate
              ? data.fechaRegistro.toDate()
              : data.fechaRegistro,
            fotoUrl: data.fotoUrl,
            fotoUrls: fotos,
            estado: data.estado
          } as Animal;
        })
      )
    );
  }

  getAnimalGlobal(protectoraId: string, animalId: string): Observable<Animal> {
  const docRef = doc(this.firestore,
    'protectoras', protectoraId,
    'animales',   animalId
  );

  return docData(docRef, { idField: 'id' }).pipe(
    map((data: any) => {
      if (!data) {
        throw new Error('Animal no encontrado en Firestore');
      }
      const fotos: Foto[] = (data.fotoUrls || []).map((u: any) =>
        typeof u === 'string' ? { url: u, publicId: '' } : (u as Foto)
      );
      return {
        id: data.id,
        protectoraId: data.protectoraId,
        nombre: data.nombre,
        especie: data.especie,
        sexo: data.sexo,
        fechaNacimiento: data.fechaNacimiento,
        tamano: data.tamano,
        comunidadAutonoma: data.comunidadAutonoma,
        provincia: data.provincia,
        estiloVida: data.estiloVida,
        niniosYadultos: data.niniosYadultos,
        otrasMascotas: data.otrasMascotas,
        descripcion: data.descripcion,
        etiquetas: data.etiquetas,
        fechaRegistro: data.fechaRegistro?.toDate ? data.fechaRegistro.toDate() : data.fechaRegistro,
        fotoUrl: data.fotoUrl,
        fotoUrls: fotos,
        estado: data.estado
      } as Animal;
    })
  );
}

  filtrarAnimalesGlobal(filters: any): Observable<Animal[]> {
    return this.getAllGlobalAnimals().pipe(
      map(animales =>
        animales.filter(a => {
          if (filters.especie) {
            if ((a.especie || '').toLowerCase() !== filters.especie.toLowerCase()) {
              return false;
            }
          }
          if (filters.sexo) {
            if ((a.sexo || '').toLowerCase() !== filters.sexo.toLowerCase()) {
              return false;
            }
          }
          if (filters.provincia) {
            if ((a.provincia || '').toLowerCase() !== filters.provincia.toLowerCase()) {
              return false;
            }
          }
          return true;
        })
      )
    );
  }

  deleteAnimalGlobal(id: string): Promise<void> {
    const docRef = doc(this.firestore, 'animales', id);
    return deleteDoc(docRef);
  }

  updateAnimalGlobal(animal: Animal): Promise<void> {
    const docRef = doc(this.firestore, 'animales', animal.id!);
    const updatedData: any = {
      ...animal,
      fotoUrls: animal.fotoUrls?.map(f => f.url) || [],
      estado: animal.estado || 'disponible'
    };
    return setDoc(docRef, updatedData, { merge: true });
  }
}
