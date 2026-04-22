import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Auth, getAuth, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { FirebaseConfigTsService } from '../services/firebase-config.ts.service';
import { ProtectoraService } from '../services/protectora.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [
    CommonModule,
    RouterLink
  ]
})
export class HeaderComponent implements OnInit {

  private auth!: Auth;

  isLoggedIn: boolean = false;
  protectoraId: string | null = null;
  protectoraNombre: string | null = null;

  constructor(
    private router: Router,
    private firebaseConfig: FirebaseConfigTsService,
    private ps: ProtectoraService,
    public authService: AuthService) { }

  ngOnInit(): void {
    this.auth = getAuth(this.firebaseConfig.app);

    onAuthStateChanged(this.auth, (user: User | null) => {
      if (user && user.emailVerified) {
        this.isLoggedIn = true;

        this.ps.getProtectoraByEmail(user.email!).subscribe({
          next: protectoraObj => {
            this.protectoraId = protectoraObj.id;
            this.protectoraNombre = protectoraObj.nombre;
          },
          error: () => {
            this.protectoraId = null;
            this.protectoraNombre = null;
          }
        });
      } else {
        this.isLoggedIn = false;
        this.protectoraId = null;
        this.protectoraNombre = null;
      }
    });
  }


  goRegister(): void {
    this.router.navigate(['/registro']);
  }

  goInicioSesion(): void {
    this.router.navigate(['/login']);
  }

  goProtectora(): void {
    if (this.protectoraId) {
      this.router.navigate(['/protectora', this.protectoraId]);
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch {}
    this.isLoggedIn = false;
    this.protectoraId = null;
    this.protectoraNombre = null;
    this.router.navigate(['/']);
  }
}
