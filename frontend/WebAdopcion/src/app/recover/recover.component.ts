import { Component, OnInit } from '@angular/core';
import { CommonModule }            from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { getAuth, sendPasswordResetEmail, Auth } from 'firebase/auth';
import { FirebaseConfigTsService } from '../services/firebase-config.ts.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recover',
  standalone: true,
  imports: [
    CommonModule,         
    ReactiveFormsModule
  ],
  templateUrl: './recover.component.html',
  styleUrls: ['./recover.component.scss']
})
export class RecoverComponent implements OnInit {
  form!: FormGroup;
  private auth!: Auth;
  loading = false;
  infoMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private firebaseConfig: FirebaseConfigTsService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    this.auth = getAuth(this.firebaseConfig.app);

    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  async onRecover(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.infoMessage = this.errorMessage = null;
    const { email } = this.form.value;
    try {
      await sendPasswordResetEmail(this.auth, email, {
        url: window.location.origin + '/login'
      });
      this.infoMessage = 'Enlace enviado: revisa tu correo para restablecer tu contraseña.';
    } catch (err: any) {
      console.error('Reset email error:', err);
      if (err.code === 'auth/user-not-found') {
        this.errorMessage = 'No existe ninguna cuenta con ese correo.';
      } else {
        this.errorMessage = 'Error al solicitar recuperación de contraseña.';
      }
    } finally {
      this.loading = false;
    }
  }
    goLogin(): void {
    this.router.navigate(['/login']);
  }
}
