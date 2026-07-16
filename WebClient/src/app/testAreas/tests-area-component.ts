import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  ChartComponent as ApexChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexTitleSubtitle,
  ApexDataLabels,
  ApexPlotOptions,
  ApexFill,
  ApexMarkers,
  ApexYAxis,
  ApexXAxis,
  ApexTooltip,
  ApexStroke,
  ApexGrid,
  ApexLegend,  
  ApexAnnotations
} from "ng-apexcharts";
import { NgApexchartsModule } from "ng-apexcharts";

import {
  ElementRef,
  ViewChild,
} from '@angular/core';

import { TestsAreaService } from "../testAreas/tests-area-service"
import { measuresData } from "../chart-config"

@Component({
  selector: 'tests-area-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './tests-area-component.html',
  styleUrls: ['./tests-area-component.css']
})
export class TestsAreaComponent {
  constructor(private router: Router, private http: HttpClient, public testsArea: TestsAreaService) { }

  @ViewChild('chartWrapper') chartWrapper!: ElementRef<HTMLElement>

  series: ApexAxisChartSeries = [];
  chart: ApexChart = {
    type: 'line',       
    height: 350
  };
  dataLabels: ApexDataLabels = {};
  markers: ApexMarkers = {};
  title: ApexTitleSubtitle = {};
  fill: ApexFill = {};
  yaxis: ApexYAxis[] = [];
  xaxis: ApexXAxis = {};
  tooltip: ApexTooltip = {};
  stroke: ApexStroke = {};
  grid: ApexGrid = {};
  legend: ApexLegend = {};
  plotOptions: ApexPlotOptions = {};
  annotations: ApexAnnotations[] = []
  
  measuresData: measuresData[] = []; 
  timeStamps: any[] = [];

  ngOnInit() {
    this.measuresData = this.testsArea.measuresData();
    this.timeStamps = this.measuresData.map((measure: measuresData) => measure.startStabTime);
    this.initChartData();
  }

  initChartData() {
    this.series = [
      {
        name: 'measures',
        data: this.measuresData.map(row => ({
          x: [row.minLimit, row.maxLimit],
          y: [Number(row.startStabTime), Number(row.endEventTime)]
        }))
      }
    ];
    this.chart = {
      type: 'rangeBar',
      background: "#000000",
      stacked: false,
      redrawOnParentResize: true,
      redrawOnWindowResize: true,
      height: (this.chartWrapper?.nativeElement.clientHeight || 500),
      width: '100%',
      zoom: {
        type: "xy",
        enabled: false,
        autoScaleYaxis: true,
        allowMouseWheelZoom: false
      },
      toolbar: {
        show: false,
        offsetX: 0,
        offsetY: 0,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: true,         
        },
        autoSelected: 'zoom',
      }
    };
    this.plotOptions = {
      bar: {
        horizontal: false,
        rangeBarOverlap: true,
      }
    }
    this.legend = {
      show: false
    }
    this.yaxis = [
      {
        seriesName: ['measures'],
        min: Number(this.measuresData[0].startStabTime),
        max: Number(this.measuresData[this.measuresData.length - 1].endEventTime),
        tickAmount: 10,
        opposite: false,      
        axisTicks: {
          show: true,
          color: '#FFFFFF',
          width: 6
        },
        axisBorder: {
          show: true,
          color: "#FFFFFF",
          width: 2
        },
        labels: {
          style: {
            colors: "#FFFFFF"
          }           
        },
        title: {
          text: 'Time (s)',
          style: {
            color: "#FFFFFF"
          },  
        },
      }
    ];
    this.xaxis = {
      type: "numeric",
      position: 'bottom',
      min: Number(this.timeStamps[0]),
      max: Number(this.timeStamps[this.timeStamps.length - 1]),
      tickAmount: 20,
      axisTicks: {
          show: true,
          borderType: 'solid',
          color: '#FFFFFF',
          height: 6,
          offsetX: 0,
          offsetY: 0
      },
      axisBorder: {
          show: true,
          color: '#FFFFFF',
          height: 1,
          offsetX: 0,
          offsetY: 0
      },      
      crosshairs: {
        show: true,
        width: 1
      },
      labels: {
        style: {
          colors: "#FFFFFF"
        }
      },
      title: {  
        text: "Limits (min/max)",
        style: {
          color: "#FFFFFF"
        }
      } 
    }    
  }
}