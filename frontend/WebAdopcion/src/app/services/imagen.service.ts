import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UploadResult {
  url: string;
  publicId: string;
}

@Injectable({ providedIn: 'root' })
export class ImagenService {
  private apiUrl = 'http://localhost:8080/api/upload';

  constructor(private http: HttpClient) {}

  uploadAnimalImage(file: File): Observable<UploadResult> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<UploadResult>(
      `${this.apiUrl}/animal`,
      form
    );
  }

  deleteAnimalImage(publicId: string): Observable<void> {
    const params = new HttpParams().set('public_id', publicId);
    return this.http.delete<void>(
      `${this.apiUrl}/animal`,
      { params }
    );
  }
}
