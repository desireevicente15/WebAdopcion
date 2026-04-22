import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FirebaseConfigTsService } from '../services/firebase-config.ts.service';
import { collection, getDocs, query } from 'firebase/firestore';

@Component({
  selector: 'app-home',
  standalone: true, 
  imports: [
    CommonModule,   
    RouterModule    
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  animals: any[] = [];

  constructor(private firebaseService: FirebaseConfigTsService, private router: Router) { }

  async ngOnInit() {
    const q = query(collection(this.firebaseService.db, 'animales'));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      console.log(`${doc.id} => `, doc.data());
      this.animals.push(doc.data());
    });
  }

  goFiltrar(): void {
    this.router.navigate(['/filtrar']);
  }
}
