import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AppConfig, tableinfo, StructUnitsInfo, functionsinfo} from '../app.config.json';
import { DialogContent } from '../dialog-component';
import { MatDialog } from '@angular/material/dialog';
import { AxesConfig, measuresinfo, tabledata } from '../chart-config';
import { ChartSettingsComponent } from '../chart-settings-component';
import { DetailsStateService } from '../DetailsState.Service';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './details.component.html',
  styleUrls: ['./details-component.css']
})
export class DetailsdataComponent {
background: any;

  constructor(private router: Router, private http: HttpClient, private dialog: MatDialog, private chartDialog: MatDialog, private detailsState: DetailsStateService) {}
  
  goBack() {
    setTimeout(() => {
    this.detailsState.rowData = undefined;
    this.router.navigate(['/']);
    }, 0); 
  }

  filters: AppConfig["filters"] = [];
  httpConfig: AppConfig["httpconfig"] = {} as any;
  columnshome: AppConfig["columns"] = [];
  columnsrootdetails: AppConfig["columnsrootdetails"] = [];
  columnsdetails: AppConfig["columnsdetails"] = [];
  columnsmeasuredetails: AppConfig["columnsmeasuredetails"] = [];
  columnsparametersdetails: AppConfig["columnsparametersdetails"] = [];
  queryhome: AppConfig["query"] = {} as any;
  querydetails: AppConfig["querydetails"] = {} as any;
  chartseries: AppConfig["chartseries"] = {} as any;

  filtervalues: { [key: string]: any } = {};
  row: any;
  unitsInfo: StructUnitsInfo[] = [];
  functionsInfo: functionsinfo[] = [];

  axesConfig: AxesConfig = {
    Plots: {},
    VisiblePlots: {},
    PlotColors: {},
    AxesScale: {}
  };
  readonly numMAXPlots: number = 10;
  measuresinfo: measuresinfo[] = [];

  ngOnInit() {

    if (this.detailsState.rowData !== undefined) {
      this.row = this.detailsState.rowData;
      this.unitsInfo = this.detailsState.unitsInfo;
      this.functionsInfo = this.detailsState.functionsInfo;
      this.axesConfig = this.detailsState.axesConfig; 
    }
    else {
      this.row = history.state.rowData;
      this.unitsInfo = history.state.unitsInfo;
      this.functionsInfo = history.state.functionsInfo;
      this.axesConfig = history.state.axesConfig;
    }  

    console.log("Riga ricevuta:", this.row);
    this.filtervalues['ID_Result'] = this.row['ID_Result'];

    this.http.get<AppConfig>('config/appconfig.json').subscribe({
      next: (config) => {
        console.log('CONFIG OK:', config);
          this.filters = config.filters;
          this.httpConfig = config.httpconfig;
          this.columnshome = config.columns;
          this.columnsrootdetails = config.columnsrootdetails;
          this.columnsdetails = config.columnsdetails;
          this.columnsmeasuredetails = config.columnsmeasuredetails;
          this.columnsparametersdetails = config.columnsparametersdetails;
          this.queryhome = config.query;
          this.querydetails = config.querydetails;
          this.chartseries = config.chartseries;
          
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
    
    this.http.post(this.httpConfig.baseurl + '/query/details', payload).subscribe({
      next: (data: any) => {
        // console.log("RISULTATO BACKEND:", data);
        this.results = data; 

        this.detailsState.rowData = this.row;
        this.detailsState.unitsInfo = this.unitsInfo;
        this.detailsState.functionsInfo = this.functionsInfo;
        this.detailsState.axesConfig = this.axesConfig;

        this.subShowRoot();
        this.subShowIcon();
      },
      error: (err) => {
        console.error("ERRORE BACKEND DETAILS:", err);
      }
    });

    this.filtervalues['ID_Result'] = undefined;        
  }

  currProgressiveGroup: number = 0;
  subIncrementProgressive(item: any): boolean {
    if (this.results.length === 1) {
      return true;
    }
    
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
            this.row[itemCol.field] = itemValue;
            break;
          case "LineID":
            itemValue = this.row[itemCol.field] + " - " + (this.unitsInfo.find(unit => unit.LineID === this.row[itemCol.field])?.LineDescr ?? "not found");
            break;
         case "UnitTypeID":
            if (typeof this.row[itemCol.field] === "string") {this.row[itemCol.field] = Number(this.row[itemCol.field].split('-')[0].trim());}            
            itemValue = this.row[itemCol.field] + " - " + (this.unitsInfo.find(unit => unit.UnitTypeID === this.row[itemCol.field])?.UnitTypeDescr ?? "not found");
            break;
         case "UnitID":
            if (typeof this.row[itemCol.field] === "string") {this.row[itemCol.field] = Number(this.row[itemCol.field].split('-')[0].trim());}
            itemValue = this.row[itemCol.field] + " - " + (this.unitsInfo.find(unit => unit.LineID === this.row["LineID"] && unit.UnitTypeID === this.row["UnitTypeID"] && unit.UnitID === this.row[itemCol.field])?.UnitDescr ?? "not found");
            break;

          default:
            itemValue = this.row[itemCol.field];
            break;
        }
        this.tableInfo.description = itemCol.name;
        this.tableInfo.value = itemValue; 
        this.detailsData.push({ description: this.tableInfo.description, value: this.tableInfo.value, bgColor: "#FFFFFF", textColor: "#0d0080"});
        
        this.selectedRowTests = null; // Deseleziona eventuale riga selezionata nei test
        this.selectedRowDetails = null; // Deseleziona eventuale riga selezionata nei dettagli
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
    let CurrProgressiveGroup: number = 0;

    for (itemRow of this.results)
    {
      if (itemRow['ProgressiveGroup'] == item['ProgressiveGroup']) {
        if (CurrProgressiveGroup !== Number(itemRow['ProgressiveGroup'])) {
          for (itemCol of this.columnsdetails) {
              if (itemCol.field !== 'TestType') {
                  this.tableInfo.description = itemCol.name;
                  
                  switch (itemCol.field) {
                    case "TestResult":
                    case "Result":
                      this.tableInfo.value = this.ResultDescription(itemRow[itemCol.field]);
                      break;
                    case "StartEventTime":
                    case "EndEventTime":
                      this.tableInfo.value = this.convertSecondiToTime(Number(itemRow[itemCol.field]));
                      break;
                    case "FunctionCode":
                      const funcCode = itemRow[itemCol.field];
                      if(funcCode !== 0) {
                        this.tableInfo.value = funcCode + " - " + (this.functionsInfo.find(func => func.FuncID === funcCode)?.FuncDescr ?? "");
                      }
                      else {
                        this.tableInfo.value = "0";
                      }
                      break;
                    default:
                      this.tableInfo.value = itemRow[itemCol.field];
                      break;
                  }
 
                  this.detailsData.push({ description: this.tableInfo.description, value: this.tableInfo.value, bgColor: "#FFFFFF", textColor: "#0d0080"});
              }
          }

          CurrProgressiveGroup = Number(itemRow['ProgressiveGroup']);
        }  
      }
    }

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
                          if (itemRow['Value'] == "") {
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

  selectedRowTests: any = null;
  selectedRowDetails: any = null;
  
  onSelectRow(row: any, tb: string) {
    switch (tb) {
      case "Tests":
        this.selectedRowTests = row;
        break;
      case "Details":
        this.selectedRowDetails = row;
        break;
    }
    
  }

  subLoadUnitsInfo(fieldName: string, fieldvalue: string): String  {
    switch (fieldName) {
      case "LineID":
        return this.unitsInfo.find(unit => unit.LineID === fieldvalue)?.LineDescr ?? "";
      case "UnitTypeID":
        return this.unitsInfo.find(unit => unit.UnitTypeID === fieldvalue)?.UnitTypeDescr ?? "";
      case "UnitID":
        return this.unitsInfo.find(unit => unit.UnitID === fieldvalue)?.UnitDescr ?? "";
      default:
        return ""
    }
  }

  exportDetails() {
    if (this.results.length == 0) {
      this.showDialog("No data to export!", "Export Error");
      return;
    }

    let columns: any[] = [];

    this.columnsrootdetails.forEach(col => {
      if (col.name.trim() !== "") {
        columns.push(col);
      }   
    });

    let rootContent = columns.map(f => {
        return `${f.name}: ` + (f.name.length >= 6 ? "\t" : " ".repeat(4) + "\t") + `${this.row[f.field]}`;
    }).join('\n') + '\n\r';


    let CurrProgressiveGroup: number = 0;
    let contentData: string = '';
    let headerDetails: string = '';
    let progressiveTest: number = 0;

    let detailsContent = this.results.map(itemRow => {

      headerDetails = '';  
      if (CurrProgressiveGroup !== Number(itemRow['ProgressiveGroup'])) {

        columns = [];
        this.columnsdetails.forEach(col => {
          if (col.field.trim() !== "") {
            columns.push(col);
          }
        });
        
        progressiveTest = 0;

        let columnValue:string = '';
        columns.forEach(col => {
          switch (col.field) {
            case "TestResult":
            case "Result":
              columnValue = this.ResultDescription(itemRow[col.field]);
              break;
            case "StartEventTime":
            case "EndEventTime":
              columnValue = this.convertSecondiToTime(Number(itemRow[col.field]));
              break;
            case "FunctionCode":
              const funcCode = itemRow[col.field];
              if(funcCode !== 0) {
                columnValue = funcCode + " - " + (this.functionsInfo.find(func => func.FuncID === funcCode)?.FuncDescr ?? "");
              }
              else {
                columnValue = "0";
              }
              break;
            default:
              columnValue = itemRow[col.field];
              break;
          }

          if (col.field.trim() !== "TestType") { 
            headerDetails += `${col.name}: \t ${columnValue}\n`;
          }
        });    
        headerDetails += '\n';

        CurrProgressiveGroup = Number(itemRow['ProgressiveGroup']);
      }

      contentData = '';
      columns.forEach(col => {
        if (col.field == 'TestType') {
            switch (itemRow[col.field]) {
              case 1:
                if (itemRow['M'] != "") {
                  contentData += `${'Descr'}.: \t ${itemRow['TestDescr']}\n`;
                  contentData += `${'Result'}: \t ${this.ResultDescription(itemRow['TestRes'])}\n`;
                }
                for (let i = 0; i < this.columnsmeasuredetails.length; i++) {
                    const itemMes = this.columnsmeasuredetails[i];
                    if (itemRow['Value'] == "") {
                        contentData += `${'Trigger'}: \t ${( itemRow['TestTimeOut'] == 1 ? "FAIL" : "PASS" )}\n`;
                        break;
                    }
                    else {
                        contentData += `${itemMes.name}: ${itemMes.name.length >= 6 ? "\t" : " ".repeat(4) + "\t" } ${itemRow[itemMes.field]}\n`;
                    }
                }
                break;
              default:
                if (Number(itemRow['TestType']) == 2) {
                  progressiveTest++;
                  contentData += "Actionament:  \t " + progressiveTest.toString() + "\n";
                }

                let parameterDetails: string = "";
                for (let iPar: number = 1; iPar <= 10; iPar++) {
                    if (itemRow["Valore" + iPar.toString()] !== "?") {
                      let descr = (itemRow["Descr" + iPar.toString()] !== "" ? itemRow["Descr" + iPar.toString()] : "Parameter" + iPar.toString());
                      parameterDetails += `${descr}: ${descr.length >= 6 ? "\t" :  " ".repeat(4) + "\t"} ${itemRow["Valore" + iPar.toString()]} ${itemRow["UM" + iPar.toString()]}\n`;
                    }
                }

                contentData += `${'Descr'}.: \t ${itemRow['TestDescr']}\n`;
                contentData += `${'Result'}: \t ${this.ResultDescription(itemRow['TestRes'])}\n`;
                contentData += parameterDetails;
                break;
            }
          }
          
      });

      return headerDetails + contentData;
    });

    let detailsComplete: string = '';
    detailsContent.forEach(item => {
       detailsComplete += item + '\n';
    });

    const finalContent = rootContent + detailsComplete;

    const blob = new Blob([finalContent], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Export-Details-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
    
  }

  setBusy(isBusy: boolean) {
    document.body.classList.toggle('busy', isBusy);
  }

  showDialog(message: string, title?: string ) {
    this.dialog.open(DialogContent, {
      data: { DialogMessage: message, DialogTitle: title ?? ''},
      disableClose: true,
      hasBackdrop: true,
    });
  }

  subOnChartPage() {
    if (!this.axesConfig.Plots?.["Plot" + this.row["UnitTypeID"].toString()])  {
      if (!this.subShowGraphParams()) {
        return;
      }
    }

    let KeyResult = this.row["ID_Result"];

    let rootData: tabledata[] = this.subGetRootData();
    let detailsData: tabledata[] = this.subGetDetailsData();

    this.router.navigate(['/pagina-chart'] , { state: { 
                                                        KeyResult: KeyResult,
                                                        rootData: rootData, 
                                                        detailsFields: detailsData, 
                                                        chartSeries: this.chartseries, 
                                                        axesConfig: this.axesConfig,
                                                        httpConfig: this.httpConfig } 
    });
  }
  
  subGetRootData(): tabledata[] {
    let info: tabledata[] = [];
    let itemValue: tabledata = {} as tabledata;
    this.columnsrootdetails.forEach(col => {
        switch (col.field) {
        case "":
            itemValue = { name: col.name, field: col.field, value: "", description: "" };
            break;
          case "LineID":
            itemValue = { name: col.name, field: col.field, value: this.row[col.field], description: (this.unitsInfo.find(unit => unit.LineID === this.row[col.field])?.LineDescr ?? "not found") };
            break;
         case "UnitTypeID":
            if (typeof this.row[col.field] === "string") {this.row[col.field] = Number(this.row[col.field].split('-')[0].trim());}            
            itemValue = { name: col.name, field: col.field, value: this.row[col.field], description: (this.unitsInfo.find(unit => unit.UnitTypeID === this.row[col.field])?.UnitTypeDescr ?? "not found") };
            break;
         case "UnitID":
            if (typeof this.row[col.field] === "string") {this.row[col.field] = Number(this.row[col.field].split('-')[0].trim());}
            itemValue = { name: col.name, field: col.field, value: this.row[col.field], description: (this.unitsInfo.find(unit => unit.LineID === this.row["LineID"] && unit.UnitTypeID === this.row["UnitTypeID"] && unit.UnitID === this.row[col.field])?.UnitDescr ?? "not found") };
            break;

          default:
            itemValue = { name: col.name, field: col.field, value: this.row[col.field], description: "" };
            break;
        }
        if (itemValue.name !== "" && itemValue.field !== "") {
          info.push({ name: itemValue.name, field: itemValue.field, value: itemValue.value, description: itemValue.description.toString().slice(0, 30) + (itemValue.description.toString().length > 30 ? "..." : "") });
        }
    });
    return info;
  }

  subGetDetailsData(): tabledata[] {
    let info: tabledata[] = []; 

    let testData: any; let f: any;
    let CurrProgressiveGroup: number = 0;

    for (testData of this.results)
    {
        if (CurrProgressiveGroup !== Number(testData['ProgressiveGroup'])) {

          let itemValue: tabledata = {} as tabledata; 

          for (f of this.columnsdetails) {
              
              switch (f.field) {
                case "ProgressiveGroup":
                  itemValue = { name: f.name, field: f.field, value: testData[f.field], description: "" };
                  break;
                case "TestDescription":
                  itemValue = { name: f.name, field: f.field, value: testData[f.field], description: "" };
                  break;
                case "TestResult":
                  itemValue = { name: f.name, field: f.field, value: this.ResultDescription(testData[f.field]), description: "" };
                  break;
                case "StartEventTime":
                  itemValue = { name: f.name, field: f.field, value: this.convertSecondiToTime(Number(testData[f.field])), description: "" };
                  break;
                case "EndEventTime":
                  itemValue = { name: f.name, field: f.field, value: this.convertSecondiToTime(Number(testData[f.field])), description: "" };
                  break;
                default:
                  itemValue = { name: "", field: "", value: "", description: "" };
                  break;
              }

              if (itemValue.field !== "" && itemValue.name !== "") {
                info.push({ name: itemValue.name, field: itemValue.field, value: itemValue.value.toString().slice(0, 20) + (itemValue.value.toString().length > 20 ? "..." : ""), description: itemValue.description.toString().slice(0, 30) + (itemValue.description.toString().length > 30 ? "..." : "") });
              }
          }
  
          CurrProgressiveGroup = Number(testData['ProgressiveGroup']);  

        }
    }

    return info;
  }

  subShowGraphParams(): boolean {
    
    let parameters = {
      UnitTypeID: this.row["UnitTypeID"],
      CommandType: 1
    }

    let configSaved = false;
    this.http.post(this.httpConfig.baseurl + '/query/measuresinfo', parameters).subscribe({
      next: (data: any) => {
        console.log("MEASURES INFO:", data);
        this.measuresinfo = data;
        if (!this.subChartDialogShow()) {
          configSaved = false;
        }
        configSaved = true;
      },
      error: (err) => {
        console.error("ERRORE BACKEND:", err);
        configSaved = false;
      }
    });	

    setTimeout(() => {
      return configSaved;
    }, 0);    

    return false;
  }

  subChartDialogShow(): boolean {
    let seriesItem: any[] = [];
    const dialogRef = this.chartDialog.open(ChartSettingsComponent, {
      data: { measuresinfo: this.measuresinfo, axesConfig: this.axesConfig, series: seriesItem },
      ariaModal: true,
      disableClose: true,
      hasBackdrop: true,
      width: '450px',
      height: '550px',
      maxWidth: '450px',
      maxHeight: '550px',
      panelClass: 'chart-settings-dialog'      
    });
    
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result !== undefined) {

        this.http.post(this.httpConfig.baseurl + '/query/saveplots', this.axesConfig).subscribe({
          next: (data: any) => {
            if(data.success==false) {
              this.showDialog("Error saving configuration: " + data.message, "Save Error");
              return false;
            }
            else {
              this.axesConfig = result;
              console.log("Config ricevuta dal dialog:", this.axesConfig);
              return true;
            }  
          },
          error: (err) => {
            console.error("ERRORE BACKEND:", err);
            return false;
          }
        });	        
        return false;
      }
      else {
        return false;
      } 
    });
    return false;  
  }

}