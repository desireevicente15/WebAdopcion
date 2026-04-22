// src/app/register/register.component.ts
import Swal from 'sweetalert2';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'; 
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProtectoraService } from '../services/protectora.service';
import { Router } from '@angular/router';
import { FirebaseConfigTsService } from '../services/firebase-config.ts.service';
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  Auth
} from 'firebase/auth';
import { firstValueFrom } from 'rxjs';

interface Comunidad {
  nombre: string;
  provincias: string[];
}

@Component({
  selector: 'app-register',
  standalone: true, 
  imports: [
    CommonModule,      
    ReactiveFormsModule, 
    RouterModule        
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  form!: FormGroup;
  private auth!: Auth;

  comunidadesAutonomas: Comunidad[] = [
    { nombre: 'Andalucía', provincias: ['Almería', 'Cádiz', 'Córdoba', 'Granada', 'Huelva', 'Jaén', 'Málaga', 'Sevilla'] },
    { nombre: 'Comunidad de Madrid', provincias: ['Madrid'] },
    { nombre: 'Comunidad Valenciana', provincias: ['Alicante', 'Castellón', 'Valencia'] },
    { nombre: 'Castilla-La Mancha', provincias: ['Albacete', 'Ciudad Real', 'Cuenca', 'Guadalajara', 'Toledo'] },
    { nombre: 'Castilla y León', provincias: ['Ávila', 'Burgos', 'León', 'Palencia', 'Salamanca', 'Segovia', 'Soria', 'Valladolid', 'Zamora'] },
    { nombre: 'Extremadura', provincias: ['Badajoz', 'Cáceres'] },
    { nombre: 'Región de Murcia', provincias: ['Murcia'] },
    { nombre: 'Cataluña', provincias: ['Barcelona', 'Girona', 'Lleida', 'Tarragona'] },
    { nombre: 'País Vasco', provincias: ['Bizkaia', 'Gipuzkoa', 'Araba'] },
    { nombre: 'Islas Baleares', provincias: ['Baleares'] },
    { nombre: 'Galicia', provincias: ['A Coruña', 'Pontevedra', 'Lugo', 'Ourense'] },
    { nombre: 'Canarias', provincias: ['Las Palmas', 'Santa Cruz de Tenerife'] },
    { nombre: 'Principado de Asturias', provincias: ['Asturias'] },
    { nombre: 'Aragón', provincias: ['Teruel', 'Zaragoza', 'Huesca'] },
    { nombre: 'Comunidad Foral de Navarra', provincias: ['Navarra'] },
    { nombre: 'Cantabria', provincias: ['Cantabria'] },
    { nombre: 'La Rioja', provincias: ['La Rioja'] },
    { nombre: 'Melilla', provincias: ['Melilla'] },
    { nombre: 'Ceuta', provincias: ['Ceuta'] }
  ];

  provinciasDisponibles: string[] = [];

  constructor(
    private fb: FormBuilder,
    private ps: ProtectoraService,
    private router: Router,
    private firebaseConfig: FirebaseConfigTsService
  ) { }

  ngOnInit(): void {
    this.auth = getAuth(this.firebaseConfig.app);

    this.form = this.fb.group({
      protectoraName: ['', Validators.required],
      cif: ['', [Validators.required, Validators.pattern(/^[ABCDEFGHJKLMNPQRSUVW]\d{7}[0-9A-J]$/i)]],
      username: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      repeatPassword: ['', Validators.required],
      descripcion: ['', Validators.required],
      comunidadAutonoma: ['', Validators.required],
      provincia: ['', Validators.required],
      address: ['', Validators.required]
    });

    this.form.get('comunidadAutonoma')?.valueChanges.subscribe(ca => {
      const seleccion = this.comunidadesAutonomas.find(c => c.nombre === ca);
      this.provinciasDisponibles = seleccion ? seleccion.provincias : [];
      this.form.get('provincia')?.setValue('');
    });
  }

  async onsubmit(): Promise<void> {
    if (this.form.invalid) {
      console.warn('Formulario inválido');
      return;
    }
    if (this.form.value.password !== this.form.value.repeatPassword) {
      console.warn('Las contraseñas no coinciden');
      return;
    }

    const nombreProtec = this.form.value.protectoraName.trim();
    const cifProtec = this.form.value.cif.trim();
    const email = this.form.value.username;
    const pwd = this.form.value.password;

    try {
      const nombreResult = await firstValueFrom(this.ps.existsNombre(nombreProtec));
      if (nombreResult.exists) {
        await Swal.fire({
          icon: 'error',
          title: 'Nombre en uso',
          text: `Ya existe una protectora registrada con el nombre "${nombreProtec}". Usa otro nombre.`,
          confirmButtonText: 'Entendido'
        });
        return;
      }

      const cifResult = await firstValueFrom(this.ps.existsCif(cifProtec));
      if (cifResult.exists) {
        await Swal.fire({
          icon: 'error',
          title: 'CIF en uso',
          text: `Ya existe una protectora registrada con el CIF "${cifProtec}".`,
          confirmButtonText: 'Entendido'
        });
        return;
      }

      const cred = await createUserWithEmailAndPassword(this.auth, email, pwd);
      await sendEmailVerification(cred.user);
      console.log('Correo de verificación enviado a', email);

      const payload = {
        nombre: nombreProtec,
        descripcion: this.form.value.descripcion,
        comunidadAutonoma: this.form.value.comunidadAutonoma,
        provincia: this.form.value.provincia,
        fotoPerfilUrl: undefined,
        cif: cifProtec,
        address: this.form.value.address,
        email: email
      };
      sessionStorage.setItem('registroProtectora', JSON.stringify(payload));

      await Swal.fire({
        icon: 'success',
        title: 'Registro casi completo',
        text: 'Hemos enviado un correo de verificación a tu bandeja. Confírmalo para continuar.',
        confirmButtonText: 'Ir a verificar'
      });

      this.router.navigate(['/verifica-correo']);

    } catch (err: any) {
      console.error('Error durante el registro:', err);
      switch (err.code) {
        case 'auth/email-already-in-use':
          await Swal.fire({
            icon: 'error',
            title: 'Correo en uso',
            text: 'Ese correo ya está registrado. Intenta iniciar sesión o recupera tu contraseña.',
            confirmButtonText: 'Entendido'
          });
          break;

        case 'auth/invalid-email':
          await Swal.fire({
            icon: 'error',
            title: 'Correo no válido',
            text: 'El formato del correo no es válido.',
            confirmButtonText: 'Entendido'
          });
          break;

        case 'auth/weak-password':
          await Swal.fire({
            icon: 'error',
            title: 'Contraseña débil',
            text: 'La contraseña es demasiado débil. Elige al menos 6 caracteres.',
            confirmButtonText: 'Entendido'
          });
          break;

        default:
          await Swal.fire({
            icon: 'error',
            title: 'Error al crear cuenta',
            text: err.message || 'Ha ocurrido un error inesperado al crear la cuenta.',
            confirmButtonText: 'Entendido'
          });
          break;
      }
    }
  }
}
