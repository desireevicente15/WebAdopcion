import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Animal, AnimalService } from '../services/animal.service';
import { ProtectoraService } from '../services/protectora.service';
import { switchMap } from 'rxjs';
import { ImagenService } from '../services/imagen.service';

interface Comunidad {
  nombre: string;
  provincias: string[];
}

@Component({
  selector: 'app-add-animal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './add-animal.component.html',
  styleUrls: ['./add-animal.component.scss']
})
export class AddAnimalComponent implements OnInit {
  form: FormGroup;
  idProtectora!: string;

  tipos = ['perro', 'gato', 'conejo'];
  sexos = ['macho', 'hembra'];
  tamanos = ['pequeño', 'mediano', 'grande'];
  estilosVida = ['activo', 'normal', 'poco activo'];

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

  provincias: string[] = [];
  fotosSeleccionadas: { url: string; publicId: string }[] = [];
  uploading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private animalService: AnimalService,
    private route: ActivatedRoute,
    private ps: ProtectoraService,
    private router: Router,
    private imgSrv: ImagenService,
  ) {
    this.form = this.fb.group({
      tipo: ['', Validators.required],
      nombre: ['', Validators.required],
      comunidadAutonoma: ['', Validators.required],
      provincia: ['', Validators.required],
      sexo: ['', Validators.required],
      tamano: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      estiloVida: ['', Validators.required],
      conOtrasMascotas: [false],
      conNiniosYoMayores: [false],
      descripcion: [''],
    });
  }

  ngOnInit(): void {
    this.idProtectora = this.route.snapshot.paramMap.get('id')!;

    this.form.get('comunidadAutonoma')?.valueChanges.subscribe(ca => {
      const seleccion = this.comunidadesAutonomas.find(c => c.nombre === ca);
      this.provincias = seleccion ? seleccion.provincias : [];
      this.form.get('provincia')?.setValue('');
    });
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    if (files.length === 0) {
      return;
    }

    input.value = '';
    this.uploading = true;

    const subirSiguiente = (index: number) => {
      if (index >= files.length) {
        this.uploading = false;
        return;
      }

      this.imgSrv.uploadAnimalImage(files[index]).subscribe({
        next: ({ url, publicId }) => {
          this.fotosSeleccionadas.push({ url, publicId });
          subirSiguiente(index + 1);
        },
        error: () => {
          subirSiguiente(index + 1);
        }
      });
    };

    subirSiguiente(0);
  }

  removeSelectedImage(idx: number): void {
    const foto = this.fotosSeleccionadas[idx];
    if (!foto.publicId) {
      this.fotosSeleccionadas.splice(idx, 1);
      return;
    }

    this.imgSrv.deleteAnimalImage(foto.publicId).subscribe({
      next: () => {
        this.fotosSeleccionadas.splice(idx, 1);
      },
      error: () => {
        this.fotosSeleccionadas.splice(idx, 1);
      },
      complete: () => {
      }
    });
  }


  guardarAnimal(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value as {
      tipo: string;
      nombre: string;
      comunidadAutonoma: string;
      provincia: string;
      sexo: string;
      tamano: string;
      fechaNacimiento: any;
      estiloVida: string;
      conOtrasMascotas: boolean;
      conNiniosYoMayores: boolean;
      descripcion?: string;
      fotoUrls: string[];
    };

    const primeraFotoUrl: string = this.fotosSeleccionadas[0]?.url || '';
    const listaFotos: { url: string; publicId: string }[] = this.fotosSeleccionadas;

    const datos: Animal = {
      protectoraId: this.idProtectora,
      nombre: v.nombre,
      especie: v.tipo,
      sexo: v.sexo,
      fechaNacimiento: v.fechaNacimiento,
      tamano: v.tamano,
      comunidadAutonoma: v.comunidadAutonoma,
      provincia: v.provincia,
      estiloVida: v.estiloVida,
      niniosYadultos: v.conOtrasMascotas,
      otrasMascotas: v.conOtrasMascotas,
      descripcion: v.descripcion ?? '',
      fotoUrl: primeraFotoUrl,
      fotoUrls: listaFotos.map(f => ({ url: f.url, publicId: f.publicId })),
      etiquetas: this.buildTags(v),
      fechaRegistro: new Date()
    };

    this.ps.addAnimalAProtectora(this.idProtectora, datos)
      .subscribe({
        next: () => this.router.navigate(['/protectora', this.idProtectora]),
        error: () => {}
      });
  }

  private buildTags(v: any): string[] {
    const tags = [v.tipo, v.estiloVida];
    if (v.conOtrasMascotas) tags.push(`con_otros_${v.tipo}s`);
    if (v.conNiniosYoMayores) tags.push('con_niños');
    return tags;
  }

  goBack(): void {
    this.router.navigate(['/protectora', this.idProtectora]);
  }
}
