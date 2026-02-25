import { Component } from "@angular/core";
import {
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
import { DataPoint } from "./data-series";
import { DialogContent } from './dialog-component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: "app-chart",
  templateUrl: "./chart-component.html",
  styleUrls: ["./chart-component.css"],
  imports: [NgApexchartsModule]
})
export class ChartComponent {
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
  
  dates: [number[][], number[][]] = [[], []];
  public initChartData(): void {
    let DataPoint: DataPoint = {
      time: this.chartValues.time.split(';').map(Number),
      temperature: this.chartValues.temperature.split(';').map(Number),
      pressure: this.chartValues.pressure.split(';').map(Number)
    };

    for (let i = 0; i < DataPoint.time.length; i++) {
      this.dates[0][i] = [DataPoint.time[i], DataPoint.temperature[i]];
      this.dates[1][i]= [DataPoint.time[i], DataPoint.pressure[i]];
    }

    this.series = [
      {
        name: "Temp.(°C)",
        data: this.dates[0],
        type: 'line',
        color: "#00E396"
      },
      {
        name: "Press.(mbar)",
        data: this.dates[1],
        type: 'line',
        color: "#FEB019"
      } 
    ];
    this.chart = {
      type: "line",
      background: "#000000",
      stacked: false,
      redrawOnWindowResize: true,
      height: 700,
      width: 1200,
      zoom: {
        type: "x",
        enabled: true,
        autoScaleYaxis: true
        
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
      size: 0,
      hover: {
        size: 6
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
          seriesName: "Temp.(°C)",
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
            text: "Temperature (°C)",
            style: {
              color: "#00E396"
            },  
          },
        },
        {
          seriesName: "Press.(mbar)",
          opposite: true,
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
            text: "Pressure (mbar)",
            style: {
              color: "#FEB019"
            }
          }
        }
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
       shared: true,
       intersect: false,
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
        width: 1,
        curve: 'straight'
      };
  }

  subChartEvents() {
    this.chart = {
      ...this.chart,
      events: {
        markerClick: (event, chartContext, opts) => {
          this.showDialog(`Marker clicked at time: ${this.dates[opts.seriesIndex][opts.dataPointIndex]}, series: ${this.series[opts.seriesIndex].name}`, 'Marker Clicked');
          // this.showDialog(chartContext.w.globals.lastYAxis[opts.seriesIndex].seriesName, 'Chart Context');
        }
      }
    }  
  }

  showDialog(message: string, title?: string ) {
    this.dialog.open(DialogContent, {
      data: { DialogMessage: message, DialogTitle: title ?? ''},
      disableClose: true,
      hasBackdrop: true,
    });
  }
}
