import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DetailsStateService {
  rowData: any | undefined = undefined;
  unitsInfo: any[] = [];
  functionsInfo: any[] = [];
  axesConfig: any = {};
}