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
  ApexLegend,  
  ApexStates,
  ApexOptions
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
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';


@Component({
  selector: "app-chart",
  templateUrl: "./chart-component.html",
  styleUrls: ["./chart-component.css"],
  imports: [NgApexchartsModule, MatSliderModule, FormsModule, MatToolbarModule, MatButtonModule, MatIconModule]
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
  chartAxisOffSet: any[] = [];
  ngOnInit() {
    this.chartValues = history.state.chartValues;
    let axistype: number[] = history.state.chartSeries.axistypes.split(';').map(Number) 
    let axisposition: number[] = history.state.chartSeries.axisposition.split(';').map(Number)
    let axisregulatoroffset: number[] = history.state.chartSeries.axisregulatoroffset.split(';').map(Number) 
    for (let index = 0; index < axistype.length; index++) {
      this.chartSeries[axistype[index]] = []; 
      this.chartSeries[axistype[index]] = axisposition[index];
      this.chartAxisOffSet[axisposition[index]] = [];
      this.chartAxisOffSet[axisposition[index]] = axisregulatoroffset[index];
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
          seriesName: [""],
          axisIndex: 0,
          min: 0,
          max: 0,
          value: 0,
          textMin: 0,
          textMax: 0,
          DefaultMin: 0,
          DefaultMax: 0,          
          enabled: false
        }
      )      
    });

    //'AsseX'
    let minX = this.DataPoint[0].time[0];
    let maxX = this.DataPoint[0].time[this.DataPoint[0].time.length - 1];

    this.AxisValues[0] = {
        seriesName: [""],
        axisIndex: 0,
        min: minX,
        max: maxX,
        value: maxX,
        textMin: minX,
        textMax: maxX,
        DefaultMin: minX,
        DefaultMax: maxX,        
        enabled: true 
    }

    let seriesNames: any[] = [];
    let maxValue: any[] = []; let minValue: any[] = []; 
    let AxisIndex: number = 0;
    for (let s = 0; s < this.DataPoint.length; s++) {
      
      AxisIndex = this.DataPoint[s].AxisType;

      for (let i = 0; i < this.DataPoint[0].time.length; i++) {
          maxValue[AxisIndex] = maxValue[AxisIndex] || []
          if (this.DataPoint[s].measure[i] > maxValue[AxisIndex]) {
            maxValue[AxisIndex] = this.DataPoint[s].measure[i] 
          }
      }
      
      for (let i = this.DataPoint[0].time.length; i >= 0; i--) {
          minValue[AxisIndex] =  minValue[AxisIndex] || [maxValue[AxisIndex]]
           if (this.DataPoint[s].measure[i] < minValue[AxisIndex]) {
            minValue[AxisIndex] = this.DataPoint[s].measure[i] 
          }
      }

      seriesNames[AxisIndex] = seriesNames[AxisIndex] || []
      seriesNames[AxisIndex].push(this.DataPoint[s].name);

      this.AxisValues[AxisIndex] =
        {
          seriesName: seriesNames[AxisIndex],
          axisIndex: 0, 
          min: (minValue[AxisIndex] > 4 ? minValue[AxisIndex] : 0),
          max: maxValue[AxisIndex] + (maxValue[AxisIndex] * this.chartAxisOffSet[AxisIndex] / 100),
          value: ((maxValue[AxisIndex] - minValue[AxisIndex]) / 2),
          textMin: (minValue[AxisIndex] > 4 ? minValue[AxisIndex] : 0),
          textMax: maxValue[AxisIndex],
          DefaultMin: (minValue[AxisIndex] > 4 ? minValue[AxisIndex] : 0),
          DefaultMax: maxValue[AxisIndex],          
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
      redrawOnParentResize: true,
      redrawOnWindowResize: true,
      height: 500,
      width: '100%',
      zoom: {
        type: "xy",
        enabled: true,
        autoScaleYaxis: true,
        allowMouseWheelZoom: false
      },
      toolbar: {
        show: true,
        offsetX: 0,
        offsetY: 0,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: true 
        },
        autoSelected: 'zoom' 
      }
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

    let axisCount: number = 0;
    for (let AxisIndex = 1; AxisIndex < this.AxisValues.length; AxisIndex++) {
      
      if (this.AxisValues[AxisIndex].enabled == true) {
          
          switch (AxisIndex) {
          case 1: //1 ASSE A SINISTRA
              this.AxisValues[AxisIndex].axisIndex = axisCount;
              this.yaxis.push(
                {
                  seriesName: this.AxisValues[AxisIndex].seriesName,
                  min: this.AxisValues[AxisIndex].textMin,
                  max: this.AxisValues[AxisIndex].textMax,
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
                    text: this.AxisValues[AxisIndex].seriesName.join(", "),
                    style: {
                      color: "#FFFFFF"
                    },  
                  },
                },
              );
              break;

            case 2: //2° ASSE A SINISTRA
              this.AxisValues[AxisIndex].axisIndex = axisCount;
              this.yaxis.push(
                {
                  seriesName: this.AxisValues[AxisIndex].seriesName,
                  min: this.AxisValues[AxisIndex].textMin,
                  max: this.AxisValues[AxisIndex].textMax,
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
                    text: this.AxisValues[AxisIndex].seriesName.join(", "),
                    style: {
                      color: "#FFFFFF"
                    },  
                  },
                },
              );
              break;

            case 3: //1° ASSE A DESTRA
              this.AxisValues[AxisIndex].axisIndex = axisCount;
              this.yaxis.push(
                {
                  seriesName: this.AxisValues[AxisIndex].seriesName,
                  min: this.AxisValues[AxisIndex].textMin,
                  max: this.AxisValues[AxisIndex].textMax,
                  tickAmount: 10,
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
                    text: this.AxisValues[AxisIndex].seriesName.join(", "),
                    style: {
                      color: "#FFFFFF"
                    },  
                  },
                },
              );
              break;   
          }
          axisCount++;
      }
    }
    this.xaxis = {
      type: "numeric",
      position: 'bottom',
      min: this.AxisValues[0].textMin,
      max: this.AxisValues[0].textMax,      
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

     //this.resizeChart();

  }

  formatLabel(value: number): string {
    return `${value}`;
  }

  subShowAxisValues(value: any, index:number, type: string) {
    let axisIndex: number = 0;
    let numValue = Number(value);

    axisIndex = this.AxisValues[index].axisIndex;
    
    switch (type) {
    case 'slider':
      this.AxisValues[index].textMax = Number(numValue.toFixed(2));
      break;
    case 'input':
      if (numValue > this.AxisValues[index].max || numValue < this.AxisValues[index].min) {numValue = this.AxisValues[index].max, this.AxisValues[index].textMax = this.AxisValues[index].max }
      break;      
    }

    if (index > 0) {
      this.yaxis[axisIndex].min = this.AxisValues[index].textMin;
      this.yaxis[axisIndex].max = numValue;

      this.chartObj.updateOptions({
        yaxis: this.yaxis
      });
    }
    else
    {
      this.xaxis.max = numValue;
      this.xaxis.min = this.AxisValues[index].textMin;

      this.chartObj.updateOptions({
        xaxis: this.xaxis
      });

    }
  }

  subShowAxisMinValue (value: number, index:number) {
    let axisIndex: number = 0;
    let numValue = Number(value);

    axisIndex = this.AxisValues[index].axisIndex;

    if (numValue < this.AxisValues[index].min || numValue > this.AxisValues[index].max ) {  this.AxisValues[index].textMin = this.AxisValues[index].min }
    
    if(index > 0) {
      this.yaxis[axisIndex].min = numValue;
      this.yaxis[axisIndex].max = this.AxisValues[index].textMax;

      this.chartObj.updateOptions({
        yaxis: this.yaxis
      });
    }
    else
    {
      this.xaxis.min = numValue;
      this.xaxis.max = this.AxisValues[index].textMin;

      this.chartObj.updateOptions({
        xaxis: this.xaxis
      });

    }
  }
  subResetSliders(index: number) {
    let axisIndex: number = 0;

    axisIndex = this.AxisValues[index].axisIndex;

    this.AxisValues[index].textMax = this.AxisValues[index].DefaultMax;
    this.AxisValues[index].textMin = this.AxisValues[index].DefaultMin;
    this.AxisValues[index].value = ((this.AxisValues[index].textMax - this.AxisValues[index].textMin) / 2)

    if(index > 0) {
      this.yaxis[axisIndex].min = this.AxisValues[index].textMin;
      this.yaxis[axisIndex].max = this.AxisValues[index].textMax;

      this.chartObj.updateOptions({
        yaxis: this.yaxis
      });
    }
    else
    {
      this.xaxis.min = this.AxisValues[index].textMin
      this.xaxis.max = this.AxisValues[index].textMax;

      this.chartObj.updateOptions({
        xaxis: this.xaxis
      });

    }
  
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
