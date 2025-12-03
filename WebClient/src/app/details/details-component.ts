import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AppConfig, filterValues, tableinfo} from '../app.config.json';

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
  columnsrootdetails: AppConfig["columnsrootdetails"] = [];
  columnsdetails: AppConfig["columnsdetails"] = [];
  columnsmeasuredetails: AppConfig["columnsmeasuredetails"] = [];
  columnsparametersdetails: AppConfig["columnsparametersdetails"] = [];
  queryhome: AppConfig["query"] = {} as any;
  querydetails: AppConfig["querydetails"] = {} as any;

  filtervalues: { [key: string]: any } = {};
  row: any;

  ngOnInit() {
    this.row = history.state.rowData;
    console.log("Riga ricevuta:", this.row);
    this.filtervalues['ID_Result'] = this.row['ID_Result'];

    this.http.get<AppConfig>('config/appconfig.json').subscribe({
      next: (config) => {
        console.log('CONFIG OK:', config);
          this.filters = config.filters;
          this.columnshome = config.columns;
          this.columnsrootdetails = config.columnsrootdetails;
          this.columnsdetails = config.columnsdetails;
          this.columnsmeasuredetails = config.columnsmeasuredetails;
          this.columnsparametersdetails = config.columnsparametersdetails;
          this.queryhome = config.query;
          this.querydetails = config.querydetails;

          this.sendToBackend();
      },
      error: (err) => {
        console.error('ERRORE CARICAMENTO JSON:', err);
      }
    });
  }  

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
        this.subShowIcon();
      },
      error: (err) => {
        console.error("ERRORE BACKEND:", err);
      }
    });

    this.filtervalues['ID_Result'] = undefined;        
  }

  typeIcon: number[] = [];
  subShowIcon()
  {
    this.results.forEach(itemSeq => {
      this.columnsdetails.forEach(col => {
        if (col.field == 'TestType') {
           const icon =  itemSeq[col.field]
           switch (icon)
           {
              case 1:
                this.typeIcon[icon] = 1;
                break;
              case 2: 
                this.typeIcon[icon] = 2;
                break;
              case 5: 
                this.typeIcon[icon] = 5;
                break;                
              default: 
                this.typeIcon[icon] = icon;
                break;                
           }
        }
      });
    });
  }

  detailsData: any[] = [];
  tableInfo: tableinfo = {} as tableinfo;

  subShowRoot() {
    this.detailsData = [];  // pulizia

    this.detailsData = [];  // pulizia
    this.detailsData.push(
        { description: "Matricola", value: this.row['SerialNumber'] },
        { description: "Info", value: "Dettagli generali..." }
    );

  }

  subShowTestDetails(item: any)
  {
    this.detailsData = []; // pulizia
    this.detailsData.push(
        { description: "ProgressiveGroup", value: item['ProgressiveGroup'] },
        { description: "Tipo Test", value: item['TestType'] },
        { description: "Descrizione Test", value: item['TestDescription'] }
    );
  }

}
