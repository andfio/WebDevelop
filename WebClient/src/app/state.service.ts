import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  filters: any[] = [];
  columns: any[] = [];
  query: any;
  results: any[] = [];
  filterValues: any = {};
  DateFormatFrom: string = "";
  DateFormatTo: string = "";
  linesItem : any[] = [];
  unitTypesItem: any[] = [];
  unitsItem: any[] = [];
  unitsInfo: any[] = []; 
  abortcodeInfo: any[] = [];
  modelsinfo: any[] = [];
  functionsinfo: any[] = [];
  SelectedRow: any;
}
