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
}
