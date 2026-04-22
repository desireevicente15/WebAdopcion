import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { getAuth, signInWithEmailAndPassword, Auth } from 'firebase/auth';
import { FirebaseConfigTsService } from '../services/firebase-config.ts.service';
import { Protectora, ProtectoraService } from '../services/protectora.service';
import { AuthService } from '../services/auth.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true, 
  imports: [
    CommonModule,      
    ReactiveFormsModule,
    RouterModule    
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  form!: FormGroup;
  private auth!: Auth;
  infoMessage: string | null = null;
  loading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private firebaseConfig: FirebaseConfigTsService,
    private router: Router,
    private route: ActivatedRoute,
    private ps: ProtectoraService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.auth = getAuth(this.firebaseConfig.app);

    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.route.queryParamMap.subscribe(params => {
      if (params.get('info') === 'verify-email') {
        this.infoMessage = 'Revisa tu correo y confirma tu cuenta antes de iniciar sesión.';
      }
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  async onLogin(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.infoMessage = null;
    const { email, password } = this.form.value;

    try {
      const cred = await signInWithEmailAndPassword(this.auth, email, password);

      if (!cred.user.emailVerified) {
        await this.auth.signOut();
        this.infoMessage = 'Debes verificar tu correo antes de iniciar sesión.';
        this.loading = false;
        return;
      }

      this.ps.getProtectoraByEmail(email)
        .pipe(take(1))
        .subscribe({
          next: (protectoraObj: Protectora) => {
            this.authService.setProtectora(protectoraObj);

            this.router.navigate(['/protectora', protectoraObj.id]);
          },
          error: () => {
            this.auth.signOut().catch(() => {});
            this.router.navigate(['/']);
          }
        });

    } catch (err: any) {
      switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          this.infoMessage = 'Correo o contraseña incorrectos.';
          break;
        case 'auth/invalid-email':
          this.infoMessage = 'Formato de correo no válido.';
          break;
        case 'auth/user-disabled':
          this.infoMessage = 'Tu cuenta ha sido deshabilitada.';
          break;
        default:
          this.infoMessage = 'Error al iniciar sesión. Inténtalo de nuevo más tarde.';
          break;
      }
    } finally {
      this.loading = false;
    }
  }
}
