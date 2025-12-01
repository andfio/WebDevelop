import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './details.component.html',
  styleUrls: ['./details-component.css']
})
export class DetailsdataComponent {

  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/']);
  }
}
