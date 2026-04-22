import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Animal, AnimalService } from '../services/animal.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdopcionService } from '../services/adopcion.service';
import { ProtectoraService } from '../services/protectora.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-adopcion-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './adopcion-form.component.html',
  styleUrls: ['./adopcion-form.component.scss']
})
export class AdopcionFormComponent implements OnInit {
  adoptionForm!: FormGroup;
  protectoraId!: string;
  animalId!: string;

  animal?: Animal;
  nombreProtectora: string = '';

  loading = false;
  exito = false;
  error = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private animalService: AnimalService,
    private ps: ProtectoraService,
    private adoptionService: AdopcionService
  ) {}

 ngOnInit(): void {
  this.protectoraId = this.route.snapshot.paramMap.get('protectoraId')!;
  this.animalId     = this.route.snapshot.paramMap.get('animalId')!;

  console.log(
    '>> AdopcionFormComponent se ha inicializado con:',
    'protectoraId=', this.protectoraId,
    'animalId=', this.animalId
  );

  
  this.adoptionForm = this.fb.group({
    nombreCompleto: ['', [Validators.required]],
    correo:         ['', [Validators.required, Validators.email]],
    telefono:       ['', [Validators.required]],
    mensaje:        ['']
  });

  this.animalService.getAnimalGlobal(this.protectoraId, this.animalId).subscribe({
    next: (a: Animal) => {
      console.log('→ getAnimalGlobal: Ví el animal =', a);
      this.animal = a;
      this.ps.getProtectora(this.protectoraId).subscribe(protectoraData => {
        this.nombreProtectora = protectoraData.nombre || 'Desconocida';
    });
  },
  error: (err) => {
    console.error('→ getAnimalGlobal lanzó un error:', err);
    this.router.navigate(['/filtrar']);
  }
});

}


  onSubmit(): void {
    if (this.adoptionForm.invalid || !this.animal) {
      return;
    }
    this.loading = true;
    this.error = false;

    const solicitud = {
      nombreCompleto: this.adoptionForm.value.nombreCompleto,
      correo: this.adoptionForm.value.correo,
      telefono: this.adoptionForm.value.telefono,
      mensaje: this.adoptionForm.value.mensaje || '',
      fechaSolicitud: new Date(),
      animalId: this.animal.id!, 
      animalNombre: this.animal.nombre
    };

    this.adoptionService
      .crearSolicitud(this.protectoraId, solicitud)
      .then(() => {
        this.loading = false;
        this.exito = true;
        this.adoptionForm.disable();
      })
      .catch(err => {
        console.error('Error al crear solicitud:', err);
        this.loading = false;
        this.error = true;
      });
  }

  cancel(): void {
    this.router.navigate(['/filtrar']);
  }
}
