import { Routes } from '@angular/router';
import { HomeComponent } from './Home-component';
import { DetailsdataComponent } from './details/details-component';
import { ChartComponent } from './chart-component';

export const routes: Routes = [
  { path: '', component: HomeComponent },             // pagina principale
  { path: 'pagina-details', component: DetailsdataComponent }, // pagina dettaglio
  { path: 'pagina-chart', component: ChartComponent } // pagina chart
];
