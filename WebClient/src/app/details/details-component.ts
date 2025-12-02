import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AppConfig, filterValues} from '../app.config.json';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './details.component.html',
  styleUrls: ['./details-component.css']
})
export class DetailsdataComponent {

  constructor(private router: Router, private http: HttpClient) {}
  goBack() {
    this.router.navigate(['/']);
  }

  filters: AppConfig["filters"] = [];
  columnshome: AppConfig["columns"] = [];
  columnsdetails: AppConfig["columnsdetails"] = [];
  queryhome: AppConfig["query"] = {} as any;
  querydetails: AppConfig["querydetails"] = {} as any;

  row: any;

  ngOnInit() {
    this.row = history.state.rowData;
    console.log("Riga ricevuta:", this.row);

    this.http.get<AppConfig>('config/appconfig.json').subscribe({
      next: (config) => {
        console.log('CONFIG OK:', config);
          this.filters = config.filters;
          this.columnshome = config.columns;
          this.columnsdetails = config.columnsdetails;
          this.queryhome = config.query;
          this.querydetails = config.querydetails;
      },
      error: (err) => {
        console.error('ERRORE CARICAMENTO JSON:', err);
      }
    });
  }  

  filtervalues: { [key: string]: any } = {};

  results: any[] = [];
  sendToBackend() {
    const payload = {
      filters: this.filtervalues,
      query: this.querydetails  
    };

    this.http.post('http://localhost:61694/api/query/details', payload).subscribe({
      next: (data: any) => {
        console.log("RISULTATO BACKEND:", data);
        this.results = data; 
      },
      error: (err) => {
        console.error("ERRORE BACKEND:", err);
      }
    });

    
    //this.filtervalues[filter.name] = undefined;        
    
  }

}
