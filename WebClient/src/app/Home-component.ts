import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig, filterValues, Filters, StructUnitsInfo, modelsinfo, abortcodeinfo, functionsinfo} from './app.config.json';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { StateService } from './state.service'
import { MatDialog } from '@angular/material/dialog';
import { DialogContent } from './dialog-component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, RouterOutlet],
  templateUrl: './Home-component.html',
  styleUrls: ['./Home-component.css'],
})
export class HomeComponent {
  constructor(private http: HttpClient, private router: Router, private state: StateService, private dialog: MatDialog) {}

  filters: AppConfig["filters"] = [];
  columns: AppConfig["columns"] = [];
  query: AppConfig["query"] = {} as any;
  httpconfig: AppConfig["httpconfig"] = {} as any;
  unitsInfo: StructUnitsInfo[] = [];
  modelsInfo: modelsinfo [] = [];
  abortcodeinfo: abortcodeinfo [] = [];
  functionsInfo: functionsinfo [] = [];

  ngOnInit() {

    if (this.state.results.length > 0) {
      this.filters = this.state.filters;
      this.columns = this.state.columns;
      this.query = this.state.query;
      this.results = this.state.results;
      this.filterValues = this.state.filterValues;
      this.DateFormatFrom = this.state.DateFormatFrom;
      this.DateFormatTo = this.state.DateFormatTo;
      this.linesItem = this.state.linesItem;
      this.unitTypesItem = this.state.unitTypesItem;
      this.unitsItem = this.state.unitsItem;
      this.unitsInfo = this.state.unitsInfo;
      this.abortcodeinfo = this.state.abortcodeInfo;
      this.modelsInfo = this.state.modelsinfo;
      this.functionsInfo = this.state.functionsinfo;
      this.selectedRow = this.state.SelectedRow;
      this.showPopup = this.state.showPopup;
      this.totalsummary = this.state.totalsummary;
      this.httpconfig = this.state.httpconfig;
      return; 
    }

    this.http.get<AppConfig>('config/appconfig.json').subscribe({
      next: (config) => {
        console.log('CONFIG OK:', config);
          this.filters = config.filters;
          this.columns = config.columns;
          this.query = config.query;
          this.httpconfig = config.httpconfig;

          this.subPost();

          this.filterValues = this.subDefaultValues();
      },
      error: (err) => {
        console.error('ERRORE CARICAMENTO JSON:', err);
      }
    });
  }

  subPost() {
    this.http.post(this.httpconfig.baseurl + '/query/informations', null).subscribe({
      next: (data: any) => {
        data.forEach((itemUnit: StructUnitsInfo) => {
          this.unitsInfo.push(itemUnit);
        });

        this.filterValues = this.subDefaultValues();

        this.linesItem = this.subLoadInfo("LineID");
        this.unitTypesItem =this.subLoadInfo("UnitTypeID");

      },
      error: (err) => {
        console.error("ERRORE BACKEND:", err);
      }
    });
    
    this.http.post(this.httpconfig.baseurl + '/query/modelsinfo', null).subscribe({
      next: (data: any) => {
        this.modelsInfo = data;
      },
      error: (err) => {
        console.error("ERRORE BACKEND:", err);
      }
    });	
    
    this.http.post(this.httpconfig.baseurl + '/query/abortcodeinfo', null).subscribe({
      next: (data: any) => {
        this.abortcodeinfo = data;
      },
      error: (err) => {
        console.error("ERRORE BACKEND:", err);
      }
    });
    
    this.http.post(this.httpconfig.baseurl + '/query/functionsinfo', null).subscribe({
      next: (data: any) => {
        this.functionsInfo = data;
      },
      error: (err) => {
        console.error("ERRORE BACKEND:", err);
      }
    });    

  }
  
  DateFormatFrom: string = new Date().toISOString().slice(0,10) + "T00:00";
  DateFormatTo: string = new Date().toISOString().slice(0,10) + "T23:59";

  filterValues: { [key: string]: any } = {};
  
  fvalues: filterValues = {}
  submit() {

    let mindate:Date = new Date("2000-01-01T00:00");
    let maxdate:Date = new Date("2030-01-01T00:00");

    let dtFrom: Date = new Date(this.DateFormatFrom);
    let dtTo: Date = new Date(this.DateFormatTo);

    if ((dtFrom < mindate || dtFrom > maxdate) || (dtTo < mindate || dtTo > maxdate))
    {
      this.showDialog("Date From or Date To out of range. check please!", "Invalid Date");
      return;
    }
      
    if(dtFrom > dtTo)
    {
      this.showDialog("Start Date > End Date. Check please!!", "Invalid Date");
      return;
    }

    this.filterValues['Start Date'] = this.DateFormatFrom;
    this.filterValues['End Date'] = this.DateFormatTo;

    let filter: Filters = {} as Filters

    this.filters.forEach(filter => {      
    
        const checkvalue: any = this.filterValues[filter.name]

        if(checkvalue!== null && checkvalue !== '') {
            this.fvalues[filter.name] = checkvalue !== '%' ? checkvalue : undefined;
        }

        if(checkvalue === '*' || checkvalue === '') {
            this.fvalues[filter.name] = undefined;
            this.filterValues[filter.name] = '%';
        }

        if(checkvalue.length > 1 && checkvalue.indexOf('*') >= 0 ) {
          this.fvalues[filter.name] = checkvalue.replaceAll('*','%');
        }

        switch (filter.name) {
          case "Line": 
          case "Unit Type":
          case "Units":
              if(checkvalue.indexOf('-') > 0) {
                this.fvalues[filter.name] = checkvalue.split('-')[0];
              }
              break;
          default:
            break;
        }

    })
    this.sendToBackend();
  }

  results: any[] = [];
  totalsummary: string = ''; showPopup: boolean = false;

  sendToBackend() {
    const payload = {
      filters: this.fvalues,
      query: this.query  
    };
    this.setBusy(true);
    this.http.post(this.httpconfig.baseurl + '/query', payload).subscribe({
      next: (data: any) => {
        // console.log("RISULTATO BACKEND:", data);
        this.results = data 

        /* salva tutto per ricaricare da details */
        this.state.results = this.results;
        this.state.filters = this.filters;
        this.state.columns = this.columns;
        this.state.query = this.query;
        this.state.filterValues = this.filterValues;
        this.state.DateFormatFrom = this.DateFormatFrom;
        this.state.DateFormatTo = this.DateFormatTo;
        this.state.linesItem = this.linesItem;
        this.state.unitTypesItem = this.unitTypesItem;
        this.state.unitsItem = this.unitsItem;
        this.state.unitsInfo = this.unitsInfo;
        this.state.abortcodeInfo = this.abortcodeinfo;
        this.state.modelsinfo = this.modelsInfo;
        this.state.functionsinfo = this.functionsInfo;        

         /* formatta i dati per la visualizzazione */

        this.results.forEach(itemRow => {
          this.columns.forEach(itemCol => {
            if(itemRow[itemCol.field] !== null) {
              if (itemCol.field == "Result")  
              {
                itemRow[itemCol.field] = this.ResultDescription(itemRow[itemCol.field])
              } 
              if (itemCol.field == "ModelCode") {
                let modeldescr: string = (this.modelsInfo.find(m => m.ModelCode === itemRow[itemCol.field])?.ModelDescr ?? "--");
                itemRow["VIB"] = modeldescr;
              }
              if (itemCol.field == "AbortCode") {
                let abortdescr: string = (this.abortcodeinfo.find(a => a.UnitTypeID === itemRow["UnitTypeID"] && a.AbortCode === itemRow[itemCol.field])?.AbortDescr ?? "--");
                itemRow["AbortCode"] = abortdescr;
              }
              if(itemCol.field == "UnitTypeID") {
                let unitdescr: string = (this.unitsInfo.find(u => u.LineID === itemRow["LineID"] && u.UnitTypeID === itemRow["UnitTypeID"] )?.UnitTypeDescr ?? "--");
                itemRow["UnitTypeID"] = itemRow["UnitTypeID"] + "-" + unitdescr;
              }                                         
              if(itemCol.field == "UnitID") {
                let unitdescr: string = (this.unitsInfo.find(u => u.LineID === itemRow["LineID"] && u.UnitTypeID === itemRow["UnitTypeID"] && u.UnitID === itemRow[itemCol.field])?.UnitDescr ?? "--");
                itemRow["UnitID"] = itemRow["UnitID"] + "-" + unitdescr;
              }
              if (itemCol.field =="Date_Time") {
                let dt: Date = new Date(itemRow[itemCol.field]);
                itemRow[itemCol.field] = dt.toISOString().slice(0,10).replace(/-/g,'/') + " " + dt.toISOString().slice(11,19);
              }
            }  
            if(itemRow[itemCol.field] == null) { itemRow[itemCol.field] = '--' }
          })
        })

        this.totalsummary =  this.subTotalSummary(this.results);
        this.showPopup = true;
        this.state.showPopup = this.showPopup;
        this.state.totalsummary = this.totalsummary;
        this.state.httpconfig = this.httpconfig;  
        
      },
      error: (err) => {
        console.error("ERRORE BACKEND:", err);
      }
    });

    this.filters.forEach(filter => {
      this.fvalues[filter.name] = undefined;        
    });

    this.setBusy(false);
  } 

  subTotalSummary(results: any[]): string {
    let total: number = results.length;
    let passed: number = 0;
    let failed: number = 0;
    let warning: number = 0;
    let interrupted: number = 0;
    let notfailfound: number = 0;

    try {
      results.forEach(item => {
        switch (Number(item["Result"].split('-')[0])) {
          case 1:
            passed++;
            break;
          case 0:
            failed++;
            break;
          case 4:
            warning++;
            break;
          case 2:
            interrupted++;
            break;  
          case 8:
            notfailfound++;
            break;                              
        }
      });

      return `Total= ${total} - Passed= ${passed} [${this.percentage(passed, total)}%] - Failed= ${failed} [${this.percentage(failed, total)}%] - Warning= ${warning} [${this.percentage(warning, total)}%] - Interrupted= ${interrupted} [${this.percentage(interrupted, total)}%] - Not Fail Found= ${notfailfound} [${this.percentage(notfailfound, total)}%]`;
    } catch(err) {
      console.error("Errore nel calcolo del summary: " + err);
      return `Total= ${total}`;
    }
    
  }

  percentage(partialValue: number, totalValue: number): number {
    try {
      return Number(((100 * partialValue) / totalValue).toFixed(2));
    } catch (err) {
      return partialValue;
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
  
  subOnDetailPage(row: any) {
    this.router.navigate(['/pagina-details'], {
      state: { rowData: row, unitsInfo: this.unitsInfo, functionsInfo: this.functionsInfo }   
    });
    this.state.SelectedRow = this.selectedRow;
  }

  selectedRow: any = null;
  
  onSelectRow(row: any) {
    this.selectedRow = row;
  }

  subCheckDate()
  {
    if (this.DateFormatFrom.length > 16) {        
      this.DateFormatFrom = new Date().toISOString().slice(0,10) + "T00:00"
    }

    if (this.DateFormatTo.length > 16) {        
      this.DateFormatTo = new Date().toISOString().slice(0,10) + "T23:59";
    }

  }

  subDefaultValues(): { [key: string]: any } {
    return {
      "DummyCode": "%",
      "Model Code": "%",
      "Program Code": "%",
      "Program Description": "%",
      "Defect": "%",
      "Fail Function": "%",
      "Result": "%",
      "Shift": "%",
      "Line": "%",
      "Unit Type": "%",
      "Unit": "%"
    };
  }

  linesItem : any[] = [];
  unitTypesItem: any[] = [];
  unitsItem: any[] = [];

  subLoadInfo(fieldName: string): any[] {
    let values: any[] = [];

    switch(fieldName) {
      case "LineID":
        return this.subLinesInfo();
      case "UnitTypeID":
        values = this.subUnitTypesInfo(this.filterValues['Line']);
        this.unitTypesItem = values;
        this.unitsItem = [];
        this.filterValues['Unit Type'] = '%';
        this.filterValues['Unit'] = '%';
        return values; 
      case "UnitID":
        if (this.filterValues['Unit Type'] !== undefined && this.filterValues['Unit Type'] !== '%') {
          this.unitsItem = this.subUnitsInfo(this.filterValues['Line'], this.filterValues['Unit Type']);
          this.filterValues['Unit'] = '%';
        }
        return [];
      default:
        return [];
    }      
  }

  subLinesInfo(): any[] {
    let values: any[] = [];
    let CurrLinedID: string = "";

    this.unitsInfo.forEach(item => {
        if (item.LineID !== CurrLinedID) {
          values.push(item.LineID + "-" + item.LineDescr);
          CurrLinedID = item.LineID;
        }
    });    
    return values;
  }

  subUnitTypesInfo(lineID: string): any[] {
    let values: any[] = [];

    this.unitsInfo.forEach(item => {
        switch (lineID) {
          case "%":      
            if (!values.includes(item.UnitTypeID + "-" + item.UnitTypeDescr)) {
              values.push(item.UnitTypeID + "-" + item.UnitTypeDescr);
            }
            break;
          default:
            if (item.LineID.toString() == lineID.substring(0, lineID.indexOf("-"))) {
              if (!values.includes(item.UnitTypeID + "-" + item.UnitTypeDescr)) {
                values.push(item.UnitTypeID + "-" + item.UnitTypeDescr);
              }
            }
        }

    });    
    return values.sort(item => item.UnitTypeID);
  } 

  subUnitsInfo(lineID: string, unitTypeID: string): any[] {

    let values: any[] = [];

    this.unitsInfo.forEach(item => {
        switch (lineID) {
          case "%":
            if (item.UnitTypeID == unitTypeID.substring(0, unitTypeID.indexOf("-"))) {
              if (!values.includes(item.UnitID + "-" + item.UnitDescr)) {
                values.push(item.UnitID + "-" + item.UnitDescr);
              }
            }
            break;
          default:
            if (item.LineID == lineID.substring(0, lineID.indexOf("-")) && item.UnitTypeID == unitTypeID.substring(0, unitTypeID.indexOf("-"))) {
              values.push(item.UnitID + "-" + item.UnitDescr);
            }
        }
    });
  
    return values;
  } 

  sortField: string = ''; 
  sortOrderAsc: boolean = false;
  sortList: any[] = [];
  subSortColumns(field: string) {
    if (this.results.length == 0) {
      return;
    }

    if (field !== 'ModelCode' && field !== 'DummyCode' && field !=='Date_Time') {
      return; 
    }  
    
    this.sortList = this.results

    switch (this.sortOrderAsc) {
      case true:
        this.sortOrderAsc = false;
        break;
      case false:
        this.sortOrderAsc = true;
        break;
    }

    if(field !== this.sortField) {
      this.sortField = field;
      this.sortOrderAsc = true;
    }

    if (!this.sortOrderAsc) {
      this.sortList.reverse();
      this.results = this.sortList;
      this.sortOrderAsc = true;
      return;
    }

    this.sortList.sort((a, b) => {
      if (a[field] < b[field]) {
        return -1;
      }
      if (a[field] > b[field]) {
        return 1;
      }
      return 0;
    });
    this.results = this.sortList;
  }

  subExportCSV() {
    if (this.results.length == 0) {
      this.showDialog("No data to export!", "Export Error");
      return;
    }

    let searchfilters = this.filters.map(f => `${f.name}= ${this.filterValues[f.name]}`).map(f => f.replaceAll('%','--')).join('\n') + '\n\n';

    let headerContent: string = this.columns.map(col => col.name).filter(col => col !== "ID_Result").join('\t') + '\n';

    let rowsContent: string = this.results.map(row => 
      this.columns.map(col => {
        let cellData = row[col.field];
        switch (col.field) {
          case "ModelCode":
          case "DummyCode":
          case "ProgramCode":  
            cellData = `'` + cellData + `'` // this.csvEscape(this.forceExcelText(cellData));
            break;
          default:
            break;
        }
        return cellData;
      }).splice(1, this.columns.length).join('\t')
    ).join('\n');

    let csvContent: string = searchfilters + headerContent + rowsContent;

    let blob = new Blob([csvContent], { type: 'text/tab-separated-values;charset=utf-8;' });
    let link = document.createElement("a");
    let url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "Export-List-" + new Date().toISOString().slice(0, 10) + ".xls");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

}