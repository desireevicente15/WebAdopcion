
import { Component } from '@angular/core';
import { CommonModule }  from '@angular/common';
import { RouterModule }  from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { FirebaseConfigTsService } from './services/firebase-config.ts.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'WebAdopcion';
  constructor(private firebaseConfig: FirebaseConfigTsService) {}
}
