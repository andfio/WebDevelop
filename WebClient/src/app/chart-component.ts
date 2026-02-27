import { Component } from "@angular/core";
import {
  ChartComponent as ApexChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexTitleSubtitle,
  ApexDataLabels,
  ApexFill,
  ApexMarkers,
  ApexYAxis,
  ApexXAxis,
  ApexTooltip,
  ApexStroke,
  ApexGrid,
  ApexLegend  
} from "ng-apexcharts";
import { NgApexchartsModule } from "ng-apexcharts";
import { chartvalues } from "./app.config.json";
import { DataPoint } from "./chart-config";
import { DialogContent } from './dialog-component';
import { MatDialog } from '@angular/material/dialog';
import { MatSliderModule } from '@angular/material/slider';
import { AxisValues } from "./chart-config";
import { FormsModule } from '@angular/forms';
import { CursorValues } from "./chart-config";
import {
  ViewChild,
  HostListener
} from '@angular/core';


@Component({
  selector: "app-chart",
  templateUrl: "./chart-component.html",
  styleUrls: ["./chart-component.css"],
  imports: [NgApexchartsModule, MatSliderModule, FormsModule]
})
export class ChartComponent {
  @ViewChild('chartObj') chartObj!: ApexChartComponent;

  public series: ApexAxisChartSeries = [];
  public chart: ApexChart = {
    type: 'area',       
    height: 350
  };
  public dataLabels: ApexDataLabels = {};
  public markers: ApexMarkers = {};
  public title: ApexTitleSubtitle = {};
  public fill: ApexFill = {};
  public yaxis: ApexYAxis[] = [];
  public xaxis: ApexXAxis = {};
  public tooltip: ApexTooltip = {};
  public stroke: ApexStroke = {};
  public grid: ApexGrid = {};
  public legend: ApexLegend = {};

  constructor(private dialog: MatDialog) { }

  chartValues: chartvalues = {} as any;
  ngOnInit() {
    this.chartValues = history.state.chartValues;
    this.initChartData();
    this.subChartEvents();
  }
  
  dates: any = [];
  DataPoint: DataPoint[] = [];
  public initChartData(): void {
     this.DataPoint = [
      {
        time: this.chartValues.time.split(';').map(Number),
        measure: this.chartValues.temperature.split(';').map(Number),
        name: "Temp.(°C)",
        color: "#00E396"
      },
      {
        time: this.chartValues.time.split(';').map(Number),
        measure: this.chartValues.pressure.split(';').map(Number),
        name: "Press.(mbar)",
        color: "#FEB019"
      },
      {
        time: this.chartValues.time.split(';').map(Number),
        measure: this.chartValues.voltage.split(';').map(Number),
        name: "Voltage (V)",
        color: "#FF0000"
      }
    ];

    for (let s = 0; s < this.DataPoint.length; s++) {
      this.dates[s] = [];
      for (let i = 0; i < this.DataPoint[0].time.length; i++) {
        this.dates[s].push([this.DataPoint[s].time[i], this.DataPoint[s].measure[i]]);
      }
    }

    for (let s = 0; s < this.DataPoint.length; s++) {
      this.series.push({
          name: this.DataPoint[s].name,
          data: this.dates[s],
          type: 'line',
          color: this.DataPoint[s].color
        });
    }; 
    this.chart = {
      type: "line",
      background: "#000000",
      stacked: false,
      redrawOnParentResize: false,
      redrawOnWindowResize: false,
      height: document.documentElement.clientHeight * 0.8,
      width: document.documentElement.clientWidth * 0.8,
      zoom: {
        type: "xy",
        enabled: true,
        autoScaleYaxis: true,
        allowMouseWheelZoom: false
      },
      toolbar: {
        autoSelected: "zoom"
      },
    };
    this.legend = {
      show: false
    };
    this.grid = {
      show: false
    };
    this.dataLabels = {
      enabled: false
    };
    this.markers = {
      size: 3,                 // <-- NON 0 (lascia la hit-area)
      strokeWidth: 0,          // niente bordo
      strokeColors: 'transparent',
      colors: ['transparent'], // interno trasparente (vale per tutte le serie)
      hover: {
        sizeOffset: 7          // quando passi sopra, li “vedi” (se vuoi)
      }
    };
    this.title = {
      text: "Test Chart",
      align: "left"
    };
    this.fill = {
      opacity: 1,
      type: 'solid'
    };
    this.yaxis = [
        {
          seriesName: ["Temp.(°C)", "Press.(mbar)", "Voltage (V)"],
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
            text: "Temperature (°C), Pressure (mbar), Voltage (V)",
            style: {
              color: "#00E396"
            },  
          },
        },
    ];
    this.xaxis = {
      type: "numeric",
      position: 'bottom',
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
        text: "Time (s)",
        style: {
          color: "#FFFFFF"
        }
      }  
    };   
    this.tooltip = {
       enabled: true,
       shared: false,
       intersect: true,
       x: {
         show: false
       },   
       y: {
         formatter: function (y) {
           if(typeof y !== "undefined") {
             return  y.toFixed(2); 
           }
           return y;            
         },
         title: {
           formatter: (seriesName: string) => seriesName + ": "
         }
       }
     };
      this.stroke = { 
        width: [1,1, 1],
      };
  }

  CursorValues: CursorValues[] = [];
  subChartEvents() {
    this.chart = {
      ...this.chart,
      events: {
        markerClick: (event, chartContext, opts) => {
          this.CursorValues.push({
            x: this.DataPoint[0].time[opts.dataPointIndex],
            y: this.DataPoint[opts.seriesIndex].measure[opts.dataPointIndex],
            name: this.series[opts.seriesIndex].name ?? '',
            color: this.DataPoint[opts.seriesIndex].color
          });
        }
      }
    }  
  }

  resizeChart() {

    setTimeout(() => {

      this.chartObj?.updateOptions({}, false, true, true);

    });

  }

  @HostListener('window:resize')

  onResize() {

    // this.resizeChart();

  }

  AxisValues: AxisValues[] = [];
  formatLabel(value: number): string {
    return `${value}`;
  }
  
  LoadXYAxis() {
  }

  SaveXYAxis() {
  }
  
  ToggleLegend() {
  }

  ShowGrid() {
  }

  showDialog(message: string, title?: string ) {
    this.dialog.open(DialogContent, {
      data: { DialogMessage: message, DialogTitle: title ?? ''},
      disableClose: true,
      hasBackdrop: true,
    });
  }
}
