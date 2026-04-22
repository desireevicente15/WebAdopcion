import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Animal, AnimalService } from '../services/animal.service';
import { CommonModule } from '@angular/common';

import { Router, RouterModule } from '@angular/router';
import { ProtectoraService } from '../services/protectora.service';
import { take } from 'rxjs';
import { Carousel } from 'bootstrap';

@Component({
  selector: 'app-animal-list',
  standalone: true,   
  imports: [
    CommonModule,         
    ReactiveFormsModule, 
    RouterModule
  ],
  templateUrl: './animal-list.component.html',
  styleUrls: ['./animal-list.component.scss']
})
export class AnimalListComponent implements OnInit {
  filterForm: FormGroup;
  allAnimales: Animal[] = [];
  animales: Animal[] = [];
  provinciasDisponibles: string[] = [];

  selectedAnimal: Animal | null = null;
  protectoraNombre: string = '';
  showModal = false;

  fullscreenImageUrl: string | null = null;
  fullscreenModalVisible = false;


  numFotos(animal: Animal): number {
    const fotos = animal.fotoUrls;
    return Array.isArray(fotos) ? fotos.length : 0;
  }

  especies = ['Perro', 'Gato', 'Conejo'];
  sexos = ['Macho', 'Hembra'];
  fechaNacimiento = ['Menos de 1 año', 'Más de 1 año'];
  tamanos = ['Pequeño', 'Mediano', 'Grande'];
  comunidadAutonoma = [
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

  constructor(private fb: FormBuilder, private animalService: AnimalService, private sanitizer: DomSanitizer, private router: Router, private ps: ProtectoraService) {
    this.filterForm = this.fb.group({
      nombre: [''],
      especie: [''],
      sexo: [''],
      edad: [''],
      tamano: [''],
      comunidadAutonoma: [''],
      provincia: [''],
      estiloVida: [''],
      niniosYadultos: [''],
      otrasMascotas: ['']
    });
  }



  ngOnInit(): void {
    this.animalService.filtrarAnimales({}).subscribe(listado => {
      this.allAnimales = listado;
      this.animales = listado;
    });

    this.filterForm.valueChanges.subscribe(() => {
      this.onFilter();
    });
  }

  getSafeUrl(url: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  getAnimalImage(animal: Animal): string {
    if (!animal.fotoUrls || animal.fotoUrls.length === 0) {
      return animal.fotoUrl || '/No_image_available.svg.png';
    }
    const foto0 = animal.fotoUrls[0];
    if (typeof foto0 === 'object' && foto0 !== null && 'url' in foto0) {
      return foto0.url || '/No_image_available.svg.png';
    }
    if (typeof foto0 === 'string') {
      return foto0;
    }
    return animal.fotoUrl || '/No_image_available.svg.png';
  }



  onChangeComunidad(comunidad: string) {
    const ca = this.comunidadAutonoma.find(c => c.nombre === comunidad);
    this.provinciasDisponibles = ca ? ca.provincias : [];
    this.filterForm.patchValue({ provincia: '' });
  }

  onFilter(): void {
    const f = this.filterForm.value;
    this.animales = this.allAnimales
      .filter(a => {
        const esp = (a.especie || '').toLowerCase();
        return !f.especie || esp === f.especie.toLowerCase();
      })
      .filter(a => {
        const sx = (a.sexo || '').toLowerCase();
        return !f.sexo || sx === f.sexo.toLowerCase();
      })
      .filter(a => {
        if (!f.edad) return true;
        const partes = this.calcularEdad(a.fechaNacimiento).split(' ');
        const val = parseInt(partes[0], 10);
        const uni = partes[1] || '';
        const meses = uni.startsWith('mes') ? val : val * 12;
        return f.edad === 'Menos de 1 año' ? meses < 12 : meses >= 12;
      })
      .filter(a => {
        const tm = (a.tamano || '').toLowerCase();
        return !f.tamano || tm === f.tamano.toLowerCase();
      })
      .filter(a => {
        const ca = (a.comunidadAutonoma || '').toLowerCase();
        return !f.comunidadAutonoma || ca === f.comunidadAutonoma.toLowerCase();
      })
      .filter(a => {
        const pr = (a.provincia || '').toLowerCase();
        return !f.provincia || pr === f.provincia.toLowerCase();
      })
      .filter(a => {
        const ev = (a.estiloVida || '').toLowerCase();
        return !f.estiloVida || ev === f.estiloVida.toLowerCase();
      })
      .filter(a => {
        if (!f.otrasMascotas) return true;
        const tag = f.otrasMascotas === 'Si'
          ? `con_otros_${(a.especie || '').toLowerCase()}s`
          : '!con_otros';
        return Array.isArray(a.etiquetas) && a.etiquetas.includes(tag);
      })
      .filter(a => {
        if (!f.niniosYadultos) return true;
        const tag = f.niniosYadultos === 'Si' ? 'con_niños' : '!con_niños';
        return Array.isArray(a.etiquetas) && a.etiquetas.includes(tag);
      });
  }

  calcularEdad(fechaNacimiento: any): string {
    if (!fechaNacimiento) return '';
    let date: Date;
    if (fechaNacimiento.seconds) {
      date = new Date(fechaNacimiento.seconds * 1000);
    } else if (fechaNacimiento.toDate) {
      date = fechaNacimiento.toDate();
    } else {
      date = new Date(fechaNacimiento);
    }
    const hoy = new Date();
    let años = hoy.getFullYear() - date.getFullYear();
    let meses = hoy.getMonth() - date.getMonth();
    let dias = hoy.getDate() - date.getDate();
    if (dias < 0) { meses--; }
    if (meses < 0) { años--; meses += 12; }
    return años < 1 ? `${meses} meses` : `${años} años`;
  }

  clearFilters(): void {
    this.filterForm.reset({
      nombre: '', especie: '', sexo: '', edad: '', tamano: '',
      comunidadAutonoma: '', provincia: '', estiloVida: '',
      niniosYadultos: '', otrasMascotas: ''
    });
    this.animales = this.allAnimales;
  }

  goToAdoption(animal: Animal) {
    this.router.navigate([
      '/adopcion',
      animal.protectoraId,
      animal.id
    ]);
  }


  openDetails(animal: Animal): void {
    this.animalService.getAnimalGlobal(animal.protectoraId, animal.id!).pipe(take(1)).subscribe({
      next: (actualizado: Animal) => {
        this.selectedAnimal = actualizado;
        this.protectoraNombre = '';

        this.ps.getProtectora(actualizado.protectoraId).pipe(take(1)).subscribe({
          next: data => {
            this.protectoraNombre = data['nombre'] || '';
          },
          error: () => {
            this.protectoraNombre = 'Desconocida';
          }
        });

        this.showModal = true;

        setTimeout(() => this.initModalCarousel(), 50);
      },
      error: () => {}
    });
  }

  initModalCarousel(): void {
    if (!this.selectedAnimal) return;

    const modalElement = document.querySelector('.modal.show');
    if (!modalElement) return;

    modalElement.querySelectorAll<HTMLElement>('.carousel').forEach(carEl => {
      try {
        new Carousel(carEl, { interval: false });
      } catch {
      }
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedAnimal = null;
    this.protectoraNombre = '';
  }

  openFullscreenImage(url: string): void {
    this.fullscreenImageUrl = url;
    this.fullscreenModalVisible = true;
  }

  closeFullscreenModal(): void {
    this.fullscreenModalVisible = false;
    this.fullscreenImageUrl = null;
  }


}
