import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig, filterValues, Filters, StructUnitsInfo} from './app.config.json';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { StateService } from './state.service'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, RouterOutlet],
  templateUrl: './Home-component.html',
  styleUrls: ['./Home-component.css']
})
export class HomeComponent {
  constructor(private http: HttpClient, private router: Router, private state: StateService) {}

  filters: AppConfig["filters"] = [];
  columns: AppConfig["columns"] = [];
  query: AppConfig["query"] = {} as any;
  unitsInfo: StructUnitsInfo[] = [];

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
      return; // <-- evita reset
    }

    this.http.get<AppConfig>('config/appconfig.json').subscribe({
      next: (config) => {
        console.log('CONFIG OK:', config);
          this.filters = config.filters;
          this.columns = config.columns;
          this.query = config.query;

          this.filterValues = this.subDefaultValues();
      },
      error: (err) => {
        console.error('ERRORE CARICAMENTO JSON:', err);
      }
    });

    this.http.post('http://localhost:61694/api/query/informations', null).subscribe({
      next: (data: any) => {
        data.forEach((itemUnit: StructUnitsInfo) => {
          this.unitsInfo.push(itemUnit);
        });

        this.linesItem = this.subLoadInfo("LineID");
        this.unitTypesItem = this.subLoadInfo("UnitTypeID");

      },
      error: (err) => {
        console.error("ERRORE BACKEND:", err);
      }
    });		

  }
  
  DateFormatFrom: string = new Date().toISOString().slice(0,10) + "T00:00"
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
      alert("Date From or Date To out of range. check please!");
      return;
    }
      
    if(dtFrom > dtTo)
    {
      alert("Date To > Date From. Check please!!");
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

  sendToBackend() {
    const payload = {
      filters: this.fvalues,
      query: this.query  
    };

    this.http.post('http://localhost:61694/api/query', payload).subscribe({
      next: (data: any) => {
        console.log("RISULTATO BACKEND:", data);
        this.results = data; 

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
        /* fine salvataggio */

        this.results.forEach(itemRow => {
          this.columns.forEach(itemCol => {
            if(itemRow[itemCol.field] !== null) {
              if (itemCol.field == "Result")  
              {
                itemRow[itemCol.field] = this.ResultDescription(itemRow[itemCol.field])
              } 
              
            }  
            if(itemRow[itemCol.field] == null) { itemRow[itemCol.field] = '--' }
          })
        })
      },
      error: (err) => {
        console.error("ERRORE BACKEND:", err);
      }
    });

    this.filters.forEach(filter => {
      this.fvalues[filter.name] = undefined;        
    });
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
      state: { rowData: row }   
    });
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

    switch(fieldName) {
      case "LineID":
        return this.subLinesInfo();
      case "UnitTypeID":
        return this.subUnitTypesInfo(); 
      case "UnitID":
        if (this.filterValues['Unit Type'] !== undefined && this.filterValues['Unit Type'] !== '%') {
          this.unitsItem = this.subUnitsInfo(this.filterValues['Line'], this.filterValues['Unit Type']);
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

  subUnitTypesInfo(): any[] {
    let values: any[] = [];

    this.unitsInfo.forEach(item => {
        if (!values.includes(item.UnitTypeID + "-" + item.UnitTypeDescr)) {
          values.push(item.UnitTypeID + "-" + item.UnitTypeDescr);
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
              values.push(item.UnitID + "-" + item.UnitDescr);
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
}