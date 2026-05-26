import { Injectable } from '@angular/core';
import { signal } from '@angular/core';
import { tabledetails } from '../chart-config';

@Injectable({
  providedIn: 'root'
})
export class TestsExecutionChartDataService {

  detailsRows = signal<tabledetails[]>([]);

}