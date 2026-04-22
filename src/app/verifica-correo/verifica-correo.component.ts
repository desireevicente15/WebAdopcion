
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { getAuth, sendEmailVerification, User } from 'firebase/auth';
import { ProtectoraService } from '../services/protectora.service';

@Component({
  selector: 'app-verifica-correo',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './verifica-correo.component.html',
  styleUrls: ['./verifica-correo.component.scss']
})
export class VerificaCorreoComponent implements OnInit {
  user: User | null = null;

  constructor(private router: Router, private ps: ProtectoraService) { }

  ngOnInit(): void {
    const auth = getAuth();
    this.user = auth.currentUser;
    this.checkVerification();
  }

  async checkVerification(): Promise<void> {
    const auth = getAuth();
    this.user = auth.currentUser;
    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }
    await this.user.reload();

    if (!this.user.emailVerified) {
      return;
    }

    const json = sessionStorage.getItem('registroProtectora');
    if (!json) {
      return;
    }

    const payload: {
      nombre: string;
      descripcion: string;
      comunidadAutonoma: string;
      provincia: string;
      fotoPerfilUrl?: string;
      cif: string;
      address: string;
      email: string;
    } = JSON.parse(json);

    this.ps.createProtectora(payload).subscribe({
      next: () => {
        sessionStorage.removeItem('registroProtectora');
        this.router.navigate(['/suscripcion']);
      },
      error: () => {
        alert('Ha ocurrido un error al guardar los datos de la protectora.');
      }
    });
  }

  async resendVerification(): Promise<void> {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user && !user.emailVerified) {
      await sendEmailVerification(user);
      alert('Correo de verificación reenviado. Revisa tu bandeja.');
    }
  }
}
