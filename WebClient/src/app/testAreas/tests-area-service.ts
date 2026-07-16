import { Injectable } from '@angular/core';
import { signal } from '@angular/core';
import { measuresData } from '../chart-config';

@Injectable({
  providedIn: 'root'
})
export class TestsAreaService {

  measuresData = signal<measuresData[]>([]);

}