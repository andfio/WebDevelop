import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig, structQuery } from './app.config.json';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  constructor(private http: HttpClient) {}

  filters: AppConfig["filters"] = [];
  columns: AppConfig["columns"] = [];
  query: AppConfig["query"] = {} as structQuery;

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

}
