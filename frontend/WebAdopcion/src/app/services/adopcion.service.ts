import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  query,
  orderBy
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface SolicitudAdopcion {
  nombreCompleto: string;
  correo: string;
  telefono: string;
  mensaje: string;
  fechaSolicitud: any;
  animalId: string;
  animalNombre: string;
}

@Injectable({ providedIn: 'root' })
export class AdopcionService {
  constructor(private firestore: Firestore) {}

  crearSolicitud(
    protectoraId: string,
    solicitud: Omit<SolicitudAdopcion, 'fechaSolicitud'> & { fechaSolicitud: Date }
  ): Promise<void> {
    const colecRef = collection(
      this.firestore,
      `protectoras/${protectoraId}/solicitudes`
    );
    return addDoc(colecRef, solicitud).then(() => {
      return;
    });
  }

  getSolicitudes(
    protectoraId: string
  ): Observable<(SolicitudAdopcion & { id: string })[]> {
    const colecRef = collection(
      this.firestore,
      `protectoras/${protectoraId}/solicitudes`
    );
    const q = query(colecRef, orderBy('fechaSolicitud', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<
      (SolicitudAdopcion & { id: string })[]
    >;
  }
}
