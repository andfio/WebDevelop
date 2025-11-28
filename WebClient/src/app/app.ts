import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig, filterValues, Filters} from './app.config.json';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  constructor(private http: HttpClient) {}

  filters: AppConfig["filters"] = [];
  columns: AppConfig["columns"] = [];
  query: AppConfig["query"] = {} as any;

  ngOnInit() {
    this.http.get<AppConfig>('config/appconfig.json').subscribe({
      next: (config) => {
        console.log('CONFIG OK:', config);
          this.filters = config.filters;
          this.columns = config.columns;
          this.query = config.query;
      },
      error: (err) => {
        console.error('ERRORE CARICAMENTO JSON:', err);
      }
    });
  }

  DateFormat: string = new Date().toISOString().slice(0,16);

  filterValues: { [key: string]: any } = {};
  
  fvalues: filterValues = {}
  submit() {

    let filter: Filters = {} as Filters

    this.filters.forEach(filter => {      
    
        const checkvalue: any = this.filterValues[filter.name]

        if(checkvalue!== null && checkvalue !== '') {
            this.fvalues[filter.name] = checkvalue;
        } else {
          this.fvalues[filter.name] = '*';
        }

    })

    this.sendToBackend();
  }

  sendToBackend() {
    const payload = {
      filters: this.fvalues,
      query: this.query  // ← questa è la sezione query dal JSON
    };

    this.http.post('/api/query', payload).subscribe({
      next: (r) => console.log("RISULTATO:", r),
      error: (err) => console.error("ERRORE API:", err)
    });
  }

}
