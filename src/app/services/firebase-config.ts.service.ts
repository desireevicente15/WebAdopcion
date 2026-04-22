import { Injectable } from '@angular/core';
import {
  initializeApp,
  getApp,
  getApps,
  FirebaseApp
} from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FirebaseConfigTsService {
  public app: FirebaseApp;
  public db: Firestore;

  constructor() {
    this.app = !getApps().length
      ? initializeApp(environment.firebase)
      : getApp();


    this.db        = getFirestore(this.app);
  }
}
