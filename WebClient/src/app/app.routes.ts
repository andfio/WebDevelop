import { Routes } from '@angular/router';
import { HomeComponent } from './Home-component';
import { DetailsdataComponent } from './details/details-component';

export const routes: Routes = [
  { path: '', component: HomeComponent },             // pagina principale
  { path: 'pagina-details', component: DetailsdataComponent } // pagina dettaglio
];
