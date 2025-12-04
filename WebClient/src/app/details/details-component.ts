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
    let itemCol: any;
    
    for (itemCol of this.columnsrootdetails) {
        this.tableInfo.description = itemCol.name;
        this.tableInfo.value = this.row[itemCol.field]; 
        this.detailsData.push({ description: this.tableInfo.description, value: this.tableInfo.value });
    }

  }

  subShowTestDetails(item: any)
  {
    this.detailsData = []; // pulizia
    let itemCol: any;
    let itemRow: any;
    let itemMes: any;
    let itemPar: any;

    for (itemRow of this.results)
    {
      if (itemRow['ProgressiveGroup'] == item['ProgressiveGroup']) {
          for (itemCol of this.columnsdetails) {
              if (itemCol.field !== 'TestType') {
                  this.tableInfo.description = itemCol.name;
                  this.tableInfo.value = itemRow[itemCol.field]; 
                  this.detailsData.push({ description: this.tableInfo.description, value: this.tableInfo.value });
              }
          }
      }
    }

    for (itemRow of this.results) {
      if (itemRow['ProgressiveGroup'] == item['ProgressiveGroup']) {
          for (itemCol of this.columnsdetails) {
              if (itemCol.field == 'TestType') {
                  switch (itemRow[itemCol.field]) {
                    case 1:
                      for (itemMes of this.columnsmeasuredetails) {
                          if (itemRow[itemMes.field] == "") {
                              this.tableInfo.description = "Trigger";
                              this.tableInfo.value = ( itemRow['TestTimeOut'] == 1 ? "FAIL" : "PASS" );
                              this.detailsData.push({ description: this.tableInfo.description, value: this.tableInfo.value });
                              break;
                          } 
                          else
                          {
                              this.tableInfo.description = itemMes.name;
                              this.tableInfo.value = itemRow[itemMes.field];
                              this.detailsData.push({ description: this.tableInfo.description, value: this.tableInfo.value });
                          } 
                      }
                      break;
                          
                    default:
                      for (let iPar: number = 1; iPar <= 10; iPar++) {
                          
                          if (itemRow["Valore" + iPar.toString()] !== "?") {
                            this.tableInfo.description = itemRow["Descr" + iPar.toString()];
                            this.tableInfo.value = itemRow["Valore" + iPar.toString()] + " " + itemRow["UM" + iPar.toString()];
                            this.detailsData.push({ description: this.tableInfo.description, value: this.tableInfo.value });
                          }
                      }                    
                      break;
                  }
              }
          }
      }
    }
  }
}
