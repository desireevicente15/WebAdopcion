import { Component, OnInit, AfterViewInit, ViewChildren, ElementRef, QueryList } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ProtectoraService } from '../services/protectora.service';
import { ImagenService } from '../services/imagen.service';
import { Animal, Foto } from '../services/animal.service';

import * as bootstrap from 'bootstrap';
import { AdopcionService, SolicitudAdopcion } from '../services/adopcion.service';
import { deleteUser, getAuth, User } from 'firebase/auth';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-perfil-protectora',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil-protectora.component.html',
  styleUrls: ['./perfil-protectora.component.scss']
})
export class PerfilProtectoraComponent implements OnInit, AfterViewInit {
  protectora$!: Observable<any>;
  private idProtectora!: string;

  editingId: string | null = null;
  editCache: Partial<Animal> & { etiquetasString?: string } = {};
  uploading = false;

  solicitudes: (SolicitudAdopcion & { id: string })[] = [];
  selectedSolicitud: SolicitudAdopcion & { id: string } | null = null;

  @ViewChildren('carrusel') carruseles!: QueryList<ElementRef>;

  especies = ['perro', 'gato', 'conejo'];
  sexos = ['macho', 'hembra'];
  tamanos = ['pequeño', 'mediano', 'grande'];
  estilosVida = ['muy activo', 'normal', 'poco activo'];

  comunidades = [
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
    { nombre: 'Navarra', provincias: ['Navarra'] },
    { nombre: 'Cantabria', provincias: ['Cantabria'] },
    { nombre: 'La Rioja', provincias: ['La Rioja'] },
    { nombre: 'Ceuta', provincias: ['Ceuta'] },
    { nombre: 'Melilla', provincias: ['Melilla'] }
  ];
  provinciasDisponibles: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ps: ProtectoraService,
    private imgSrv: ImagenService,
    private adoptionService: AdopcionService
  ) { }

  ngOnInit(): void {
    this.idProtectora = this.route.snapshot.paramMap.get('id')!;
    this.loadProtectora();
    this.loadSolicitudes();
  }

  ngAfterViewInit(): void {
    this.carruseles.changes.subscribe(() => this.initCarousels());
    this.initCarousels();
  }

  private initCarousels(): void {
    this.carruseles.forEach(car => {
      try { new bootstrap.Carousel(car.nativeElement, { interval: false }); }
      catch { }
    });
  }

  private loadProtectora(): void {
    this.protectora$ = this.ps.getProtectora(this.idProtectora);
  }

  private loadSolicitudes(): void {
    this.adoptionService.getSolicitudes(this.idProtectora).subscribe(list => {
      this.solicitudes = list;
    });
  }

  openModal(s: SolicitudAdopcion & { id: string }) {
    this.selectedSolicitud = s;

    const modalEl = document.getElementById('detalleSolicitudModal');
    if (modalEl) {
      const bsModal = new bootstrap.Modal(modalEl, {
        backdrop: 'static',
        keyboard: false
      });
      bsModal.show();
    }
  }

  addAnimal(): void {
    this.router.navigate(['/protectora', this.idProtectora, 'add-animal']);
  }

  onDeleteAnimal(id: string): void {
    this.ps.deleteAnimalAProtectora(this.idProtectora, id)
      .subscribe(() => this.loadProtectora());
  }

  startEdit(animal: Animal): void {
    this.editingId = animal.id!;
    this.editCache = { ...animal };
    this.editCache.etiquetasString = (animal.etiquetas || []).join(', ');

    this.onChangeComunidad(this.editCache.comunidadAutonoma || '');

    if (this.editCache.fotoUrls) {
      this.editCache.fotoUrls = this.editCache.fotoUrls.map((x: any) =>
        typeof x === 'string' ? { url: x, publicId: '' } : x
      );
    }
    if (!this.editCache.fotoUrls && this.editCache.fotoUrl) {
      this.editCache.fotoUrls = [{ url: this.editCache.fotoUrl, publicId: '' }];
    }
    if (!this.editCache.fotoUrls) {
      this.editCache.fotoUrls = [];
    }
  }

  saveEdit(animalId: string): void {
    if (this.editCache.etiquetasString !== undefined) {
      this.editCache.etiquetas = this.editCache.etiquetasString
        .split(',').map(e => e.trim()).filter(e => e);
    }
    delete (this.editCache as any).etiquetasString;

    this.ps.updateAnimalAProtectora(this.idProtectora, animalId, this.editCache as Animal)
      .subscribe(() => {
        this.cancelEdit();
        this.loadProtectora();
      });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editCache = {};
  }

  onChangeComunidad(ca: string) {
    const found = this.comunidades.find(x => x.nombre === ca);
    this.provinciasDisponibles = found ? found.provincias : [];
    if (!this.provinciasDisponibles.includes(this.editCache.provincia!)) {
      this.editCache.provincia = '';
    }
  }

  onEtiquetasBlur() {
    if (this.editCache.etiquetasString !== undefined) {
      this.editCache.etiquetas = this.editCache.etiquetasString
        .split(',').map(e => e.trim()).filter(e => e);
    }
  }

  onFilesSelected(evt: Event): void {
    const files = Array.from((evt.target as HTMLInputElement).files || []);
    if (!files.length) return;
    this.uploading = true;
    const next = (i: number) => {
      if (i >= files.length) { this.uploading = false; return; }
      this.imgSrv.uploadAnimalImage(files[i]).subscribe({
        next: ({ url, publicId }) => {
          this.editCache.fotoUrls!.push({ url, publicId });
          next(i + 1);
        },
        error: () => { this.uploading = false; }
      });
    };
    next(0);
  }

  removeImage(idx: number) {
    const f = this.editCache.fotoUrls![idx];
    if (!f.publicId) {
      this.editCache.fotoUrls!.splice(idx, 1);
      return;
    }
    this.imgSrv.deleteAnimalImage(f.publicId).subscribe(() => this.editCache.fotoUrls!.splice(idx, 1));
  }

  trackById(_i: number, a: Animal) { return a.id; }

  async onDeleteAccount(): Promise<void> {
    const result = await Swal.fire({
      title: 'Eliminar cuenta',
      text: '¿Estás seguro de que deseas eliminar tu cuenta y todos los datos asociados?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) {
      return;
    }

    this.ps.deleteProtectora(this.idProtectora).subscribe({
      next: async () => {
        const auth = getAuth();
        const currentUser: User | null = auth.currentUser;

        if (currentUser) {
          try {
            await deleteUser(currentUser);
            await Swal.fire({
              icon: 'success',
              title: 'Cuenta eliminada',
              text: 'Tu cuenta y todos los datos asociados fueron eliminados correctamente.',
              confirmButtonText: 'Aceptar'
            });
            this.router.navigate(['/login']);
          } catch {
            await Swal.fire({
              icon: 'error',
              title: 'Error en autenticación',
              text:
                'Se borraron los datos de la protectora, pero hubo un problema al eliminar tu cuenta de autenticación. ' +
                'Por favor, cierra sesión manualmente o contacta con soporte.',
              confirmButtonText: 'Aceptar'
            });
            this.router.navigate(['/login']);
          }
        } else {
          await Swal.fire({
            icon: 'info',
            title: 'Cuenta eliminada',
            text: 'Datos de la protectora eliminados. No se detectó usuario logueado para borrar en Auth.',
            confirmButtonText: 'Aceptar'
          });
          this.router.navigate(['/login']);
        }
      },
      error: async () => {
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar la cuenta. Inténtalo de nuevo más tarde.',
          confirmButtonText: 'Aceptar'
        });
      }
    });
  }
}
