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
import { chartseries, chartvalues } from "./app.config.json";
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
  chartSeries: any[] =  [];
  ngOnInit() {
    this.chartValues = history.state.chartValues;
    let axistype: number[] = history.state.chartSeries.axistypes.split(';').map(Number) 
    let axisposition: number[] = history.state.chartSeries.axisposition.split(';').map(Number) 
    for (let index = 0; index < axistype.length; index++) {
      this.chartSeries[axistype[index]] = []; 
      this.chartSeries[axistype[index]] = axisposition[index];
    }
    
    this.initChartData();
    this.subChartEvents();
  }
  
  dates: any = [];
  DataPoint: DataPoint[] = [];
  AxisSeries: any[] = [];
  AxisValues: AxisValues[] = [];
  CursorValues: CursorValues[] = [];

  public initChartData(): void {
     this.DataPoint = [
      {
        time: this.chartValues.time.split(';').map(Number),
        measure: this.chartValues.temperature.split(';').map(Number),
        name: "Temp.(°C)",
        color: "#00E396",
        AxisType: this.chartSeries[2]
      },
      {
        time: this.chartValues.time.split(';').map(Number),
        measure: this.chartValues.pressure.split(';').map(Number),
        name: "Press.(mbar)",
        color: "#FEB019",
        AxisType: this.chartSeries[2]
      },
      {
        time: this.chartValues.time.split(';').map(Number),
        measure: this.chartValues.voltage.split(';').map(Number),
        name: "Voltage (V)",
        color: "#FF0000",
        AxisType: this.chartSeries[4]
      }
    ];

    for (let s = 0; s < this.DataPoint.length; s++) {
      this.dates[s] = [];
      for (let i = 0; i < this.DataPoint[0].time.length; i++) {
        this.dates[s].push([this.DataPoint[s].time[i], this.DataPoint[s].measure[i]]);
      }
    }

    this.chartSeries.forEach(AxisItem => {
      this.AxisValues.push (
        {
          min: 0,
          max: 0,
          value: 0,
          textMin: 0,
          textMax: 0,
          enabled: false
        }
      )      
    });

    //'AsseX'
    this.AxisValues[0] = {
        min: this.DataPoint[0].time[0],
        max: this.DataPoint[0].time[this.DataPoint[0].time.length - 1],
        value: this.DataPoint[0].time[this.DataPoint[0].time.length - 1],
        textMin: this.DataPoint[0].time[0],
        textMax: this.DataPoint[0].time[this.DataPoint[0].time.length - 1],
        enabled: true 
    }

    let maxValue: number = 0; let minValue: number = 0;
    for (let s = 0; s < this.DataPoint.length; s++) {
      maxValue: this.AxisValues[this.DataPoint[s].AxisType].max;
      for (let i = 0; i < this.DataPoint[0].time.length; i++) {
          if (this.DataPoint[s].measure[i] > maxValue) {
            maxValue = this.DataPoint[s].measure[i] 
          }
      }
      minValue: this.AxisValues[this.DataPoint[s].AxisType].min;
      for (let i = this.DataPoint[0].time.length; i = 0; i--) {
           if (minValue > this.DataPoint[s].measure[i]) {
            minValue = this.DataPoint[s].measure[i] 
          }
      }

      this.AxisValues[this.DataPoint[s].AxisType] =
        {
          min: minValue,
          max: maxValue,
          value: maxValue,
          textMin: minValue,
          textMax: maxValue,
          enabled: true
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
    let seriesName: any[] = []
    for (let s = 0; s < this.DataPoint.length; s++) {
      seriesName[s+1] = seriesName[s+1] || [];
      
      switch (this.DataPoint[s].AxisType) {
      case 1: 
        seriesName[this.DataPoint[s].AxisType].push(this.DataPoint[s].name);
        break;
      case 2:
        seriesName[this.DataPoint[s].AxisType].push(this.DataPoint[s].name)
        break;
      case 3:
        seriesName[this.DataPoint[s].AxisType].push(this.DataPoint[s].name)
        break;
      }
    }           

    for (let seriesindex = 1; seriesindex < seriesName.length; seriesindex++) {
      
      if (seriesName[seriesindex].length > 0) {
          switch (seriesindex) {
          case 1: //1 ASSE A SINISTRA
              this.AxisValues[seriesindex].enabled = true          
              this.yaxis.push(
                {
                  seriesName: seriesName[seriesindex],
                  min: this.AxisValues[seriesindex].min,
                  max: this.AxisValues[seriesindex].max,
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
                    text: seriesName[seriesindex].join(", "),
                    style: {
                      color: "#FFFFFF"
                    },  
                  },
                },
              );
              break;

            case 2: //2° ASSE A SINISTRA
              this.AxisValues[seriesindex].enabled = true
              this.yaxis.push(
                {
                  seriesName: seriesName[seriesindex],
                  min: this.AxisValues[seriesindex].min,
                  max: this.AxisValues[seriesindex].max,
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
                    text: seriesName[seriesindex].join(", "),
                    style: {
                      color: "#FFFFFF"
                    },  
                  },
                },
              );
              break;

            case 3: //1° ASSE A DESTRA
              this.AxisValues[seriesindex].enabled = true
              this.yaxis.push(
                {
                  seriesName: seriesName[seriesindex],
                  min: this.AxisValues[seriesindex].min,
                  max: this.AxisValues[seriesindex].max,
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
                    text: seriesName[seriesindex].join(", "),
                    style: {
                      color: "#FFFFFF"
                    },  
                  },
                },
              );
              break;   
          }
      }
    }
    this.xaxis = {
      type: "numeric",
      position: 'bottom',
      min: this.AxisValues[0].min,
      max: this.AxisValues[0].max,      
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

  formatLabel(value: number): string {
    return `${value}`;
  }

  subShowAxisValues(value: any, index:number, type: string) {
    let numValue = Number(value);
    
    switch (type) {
    case 'slider':
      this.AxisValues[index].textMax = Number(numValue.toFixed(2));
      break;
    case 'input':
      if (numValue > this.AxisValues[index].max || numValue < this.AxisValues[index].min) {numValue = this.AxisValues[index].max, this.AxisValues[index].textMax = this.AxisValues[index].max }
      this.AxisValues[index].value = numValue;
      break;      
    }

    this.yaxis[index].min = this.AxisValues[index].textMin;
    this.yaxis[index].max = numValue;

    this.chartObj.updateOptions({
      yaxis: this.yaxis
    });

  }

  subShowAxisMinValue (value: number, index:number) {
      if (value < this.AxisValues[index].min || value > this.AxisValues[index].max ) {  this.AxisValues[index].textMin = this.AxisValues[index].min }
      this.yaxis[index].min = value;
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
