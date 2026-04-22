import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { AnimalListComponent } from './animal-list/animal-list.component';
import { SuscripcionComponent } from './suscripcion/suscripcion.component';
import { PerfilProtectoraComponent } from './perfil-protectora/perfil-protectora.component';
import { AddAnimalComponent } from './add-animal/add-animal.component';
import { RecoverComponent } from './recover/recover.component';
import { VerificaCorreoComponent } from './verifica-correo/verifica-correo.component';
import { AdopcionFormComponent } from './adopcion-form/adopcion-form.component';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '',          component: HomeComponent },
  { path: 'registro',  component: RegisterComponent },
  { path: 'login',     component: LoginComponent },
  { path: 'filtrar',   component: AnimalListComponent },
  { path: 'suscripcion', component: SuscripcionComponent,},
  { path: 'recuperar', component: RecoverComponent },
  { path: 'verifica-correo', component: VerificaCorreoComponent },
  { path: 'adopcion/:protectoraId/:animalId', component: AdopcionFormComponent},
  { path: 'protectora/:id', component: PerfilProtectoraComponent, canActivate: [authGuard]},
  { path: 'protectora/:id/add-animal', component: AddAnimalComponent, canActivate: [authGuard]},
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
