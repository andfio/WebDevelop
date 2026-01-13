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
background: any;

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
        this.subShowRoot();
        this.subShowIcon();
      },
      error: (err) => {
        console.error("ERRORE BACKEND:", err);
      }
    });

    this.filtervalues['ID_Result'] = undefined;        
  }

  currProgressiveGroup: number = 0;
  subIncrementProgressive(item: any): boolean {
    if (Number(item) !== this.currProgressiveGroup) {
      this.currProgressiveGroup = Number(item);
      return true;
    }
    else
    {
      return false;
    }

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

    this.subShowResultState();   
  }

  rowColor: any[] = [];
  subShowResultState()
  {
    this.results.forEach(itemSeq => {
      this.columnsdetails.forEach(col => {
        if (col.field == 'TestResult') {
           const id =  itemSeq['ProgressiveGroup']
           const res =  itemSeq['TestResult']
          //  console.log(id + " " + res);

           switch (res)
           {
              case 7: //bypass
                this.rowColor[id] = "#00CCFF";
                break;
              case 0: //fail
                this.rowColor[id] = "#FF0000";
                break;
              case 4: //warning
                this.rowColor[id] = "#FFFF00";
                break;                
              default: 
                this.rowColor[id] = "#FFFFFF";
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
    let itemValue: any;
    
    for (itemCol of this.columnsrootdetails) {
        switch (itemCol.field) {
          case "":
            itemValue = "";
            break;
          case "TestTimeLength":
            itemValue = this.subCalculateTestTime();
            break;
          default:
            itemValue = this.row[itemCol.field];
            break;
        }
        this.tableInfo.description = itemCol.name;
        this.tableInfo.value = itemValue; 
        this.detailsData.push({ description: this.tableInfo.description, value: this.tableInfo.value, bgColor: "#FFFFFF", textColor: "#0d0080"});
    }

  }

  subCalculateTestTime()
  {
    let TestTimeLength: number = 0;

    this.results.forEach(itemRow => {
      if(itemRow["EndEventTime"] > 0)
        {
          if(Number(itemRow["EndEventTime"]) > TestTimeLength)
          {
            TestTimeLength = Number(itemRow["EndEventTime"].toString());
          }
        }  
    });

    return this.convertSecondiToTime(TestTimeLength).toString();
  }

  subShowTestDetails(item: any)
  {
    this.detailsData = []; // pulizia
    let itemCol: any;
    let itemRow: any;
    let itemMes: any;
    let itemPar: any;
    let CurrProgressiveGroup: number = 0;

    for (itemRow of this.results)
    {
      if (itemRow['ProgressiveGroup'] == item['ProgressiveGroup']) {
        if (CurrProgressiveGroup !== Number(itemRow['ProgressiveGroup'])) {
          for (itemCol of this.columnsdetails) {
              if (itemCol.field !== 'TestType') {
                  this.tableInfo.description = itemCol.name;
                  
                  if (itemCol.field === 'TestResult' || itemCol.field === 'Result') {
                    this.tableInfo.value = this.ResultDescription(itemRow[itemCol.field])
                  } else if (itemCol.field === 'StartEventTime' || itemCol.field === 'EndEventTime') {
                    console.log(itemRow[itemCol.field].toString())
                    this.tableInfo.value = this.convertSecondiToTime(Number(itemRow[itemCol.field]));
                  }
                  else {
                    this.tableInfo.value = itemRow[itemCol.field];
                  } 
                  this.detailsData.push({ description: this.tableInfo.description, value: this.tableInfo.value, bgColor: "#FFFFFF", textColor: "#0d0080"});
              }
          }

          CurrProgressiveGroup = Number(itemRow['ProgressiveGroup']);
        }  
      }
    }

    let currProgressiveTest: number = 1;

    for (itemRow of this.results) {
      if (itemRow['ProgressiveGroup'] == item['ProgressiveGroup']) {
          for (itemCol of this.columnsdetails) {
              if (itemCol.field == 'TestType') {
                  this.detailsData.push({ description: "", value: "", bgColor: "#BEBFC5", textColor: "#0d0080"})  

                  switch (itemRow[itemCol.field]) {
                    case 1:
                      if (itemRow['M'] != "") {
                          this.tableInfo.description = "Descr.";
                          this.tableInfo.value = itemRow['TestDescr'];
                          this.detailsData.push({ description: this.tableInfo.description, value: this.tableInfo.value, bgColor: "#FFFFFF", textColor: "#0d0080"})

                          this.tableInfo.description = "Result";
                          this.tableInfo.value = this.ResultDescription(itemRow['TestRes']);
                          this.detailsData.push({ description: this.tableInfo.description, value: this.tableInfo.value, bgColor: "#FFFFFF", textColor: "#0d0080"})                          
                      }
                      for (itemMes of this.columnsmeasuredetails) {
                          if (itemRow[itemMes.field] == "") {
                              this.tableInfo.description = "Trigger";
                              this.tableInfo.value = ( itemRow['TestTimeOut'] == 1 ? "FAIL" : "PASS" );
                              this.detailsData.push({ description: this.tableInfo.description, value: this.tableInfo.value, bgColor: "#FFFFFF", textColor: "#0d0080"});
                              break;
                          } 
                          else
                          {
                              this.tableInfo.description = itemMes.name;
                              if (itemMes.field === 'Min' || itemMes.field === 'Max' || itemMes.field === 'Value' || itemMes.field === 'LimitMin' || itemMes.field === 'LimitMax') {
                                this.tableInfo.value =  (Number(itemRow[itemMes.field])).toString();
                              } else {
                                this.tableInfo.value = itemRow[itemMes.field];
                              }
                              this.detailsData.push({ description: this.tableInfo.description, value: this.tableInfo.value, bgColor: "#FFFFFF", textColor: "#0d0080"});
                          } 
                      }
                      break;
                          
                    default:

                      this.tableInfo.description = "Descr.";
                      this.tableInfo.value = itemRow['TestDescr'];
                      this.detailsData.push({ description: this.tableInfo.description, value: this.tableInfo.value, bgColor: "#FFFFFF", textColor: "#0d0080"})

                      this.tableInfo.description = "Result";
                      this.tableInfo.value = this.ResultDescription(itemRow['TestRes']);
                      this.detailsData.push({ description: this.tableInfo.description, value: this.tableInfo.value, bgColor: "#FFFFFF", textColor: "#0d0080"})  

                      for (let iPar: number = 1; iPar <= 10; iPar++) {
                          
                          if (itemRow["Valore" + iPar.toString()] !== "?") {
                            this.tableInfo.description = (itemRow["Descr" + iPar.toString()] !== "" ? itemRow["Descr" + iPar.toString()] : "Parameter" + iPar.toString());
                            this.tableInfo.value = itemRow["Valore" + iPar.toString()] + " " + itemRow["UM" + iPar.toString()];
                            this.detailsData.push({ description: this.tableInfo.description, value: this.tableInfo.value, bgColor: "#FFFFFF", textColor: "#0d0080"});
                          }
                      }                    
                      break;
                  }
                  
                  currProgressiveTest = currProgressiveTest + 1;
              }
          }
      }
    }
  }

  ResultDescription(res: string): any {
    let result: any = "";
    let itm: (string | number)[] = [];
    
    try {
      this.filters.forEach(itemRes => {
        if (itemRes.name == "Result") {
          itm = itemRes.values ?? [];
          for(let idx = 0; idx < itm.length; idx++){
            let code: any = itm[idx];
            if(code.split('-')[0] == res )
            {
              result = itm[idx];
            }
          } 
        }
      });
    }
    catch(err)  {
      console.error(res + " non trovato." + err)
    }
    return result;
  }

  convertSecondiToTime(a: number): string {
    let tot_sec = a;
    let tot_min = Math.floor(tot_sec / 60);
    let tot_ore = Math.floor(tot_min / 60);

    tot_sec = tot_sec - (tot_min * 60);
    tot_min = tot_min - (tot_ore * 60);

    // --- Formattazione dei secondi come "00.00"
    const str_tot_sec = tot_sec.toFixed(2).padStart(5, "0");

    // --- Formattazione minuti a 2 cifre
    const str_tot_min = String(tot_min).padStart(2, "0");

    // --- Le ore rimangono senza zeri iniziali (comportamento VB6 in questo caso)
    const str_tot_ore = String(tot_ore);

    return `${str_tot_ore}:${str_tot_min} - (${str_tot_sec})`;
  }

}
