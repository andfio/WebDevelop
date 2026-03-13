import { Component } from "@angular/core";
import { ChangeDetectorRef } from '@angular/core';
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
  ApexAnnotations
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
//Menu Pagina
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
//gestione cursori grafico
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { CurrencyPipe } from "@angular/common";

@Component({
  selector: "app-chart",
  templateUrl: "./chart-component.html",
  styleUrls: ["./chart-component.css"],
  imports: [NgApexchartsModule, MatSliderModule, FormsModule, MatIconModule, MatMenuModule, MatButtonModule, MatSlideToggleModule]
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
  public annotations: ApexAnnotations[] = []

  constructor(private dialog: MatDialog, private cd: ChangeDetectorRef) { }

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
    
    for (let index = 0; index < 3; index++) {
        this.CursorValues.push({
          x: 0,
          y: 0,
          name: (index < 2 ? "--" : 'Difference'),
          color: "#FFFFFF",
          pointX: 0,
          pointY: 0,
          id: ""
        });
    }

    this.initChartData();
    this.subChartEvents();
  }

  ngAfterViewInit() {
    this.updateChartHeight();
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
    let maxCursorValue: any[] = []; let minValue: any[] = []; 
    let AxisIndex: number = 0;
    for (let s = 0; s < this.DataPoint.length; s++) {
      
      AxisIndex = this.DataPoint[s].AxisType;

      for (let i = 0; i < this.DataPoint[0].time.length; i++) {
          maxCursorValue[AxisIndex] = maxCursorValue[AxisIndex] || []
          if (this.DataPoint[s].measure[i] > maxCursorValue[AxisIndex]) {
            maxCursorValue[AxisIndex] = this.DataPoint[s].measure[i] 
          }
      }
      
      for (let i = this.DataPoint[0].time.length; i >= 0; i--) {
          minValue[AxisIndex] =  minValue[AxisIndex] || [maxCursorValue[AxisIndex]]
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
          max: maxCursorValue[AxisIndex] + (maxCursorValue[AxisIndex] * this.chartAxisOffSet[AxisIndex] / 100),
          value: ((maxCursorValue[AxisIndex] - minValue[AxisIndex]) / 2),
          textMin: (minValue[AxisIndex] > 4 ? minValue[AxisIndex] : 0),
          textMax: maxCursorValue[AxisIndex],
          DefaultMin: (minValue[AxisIndex] > 4 ? minValue[AxisIndex] : 0),
          DefaultMax: maxCursorValue[AxisIndex],          
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
      height: document.querySelector('#chart-details-mngt')?.clientHeight ?? '500px',
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
      size: 3,                 
      strokeWidth: 0,          
      strokeColors: 'transparent',
      colors: ['transparent'], 
      hover: {
        sizeOffset: 7          
      }
    };
    this.title = {
      text: "",
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
  
  isAddPointAnnotation: boolean = false;
  subChartEvents() {
    this.chart = {
      ...this.chart,
      events: {
        markerClick: (event, chartContext, opts) => {
          if (this.isAddPointAnnotation == true) { return }
          if (opts.dataPointIndex == null || opts.seriesIndex == null) {return}
          if (opts.dataPointIndex < 0 || opts.seriesIndex < 0) return;
          
          if (this.IsCursorsEnabled[0] == true && this.IsCursorsEnabled[1] == false) {
              this.subAddAnnotations(opts)
          }
        },
        click: (event, chartContext, opts) => {
          if (this.isAddPointAnnotation == true) { return }
          if (this.IsCursorsEnabled[0] == false) { return }
          
          if (this.IsCursorsEnabled[1] == false) {
              for (let i=0; i < this.CursorValues.length; i++) {
                if ((this.CursorValues[i].pointX >= opts.globals.clientX -6 && this.CursorValues[i].pointX <= opts.globals.clientX + 6) && 
                    (this.CursorValues[i].pointY >= opts.globals.clientY -6 && this.CursorValues[i].pointY <= opts.globals.clientY + 6 ) ) {
                    this.chartObj.removeAnnotation(this.CursorValues[i].id);
                    this.CursorValues = this.clearCursor(i);
                    this.CursorValues = this.clearCursor(this.CursorValues.length - 1)
                    this.cd.detectChanges()
                    break;
                }
              }
          }
          else
          {
              const plotRect = this.getPlotRect(chartContext);
              if (!plotRect) return;

              const px = event.clientX - plotRect.left;
              const py = event.clientY - plotRect.top;

              if (px < 0 || px > plotRect.width || py < 0 || py > plotRect.height) {
                return;
              }

              const nearest = this.findNearestSeriesByScreenDistance(px, py, plotRect, chartContext);
              if (!nearest) return;

              // valori reali del punto più vicino sulla linea
              const xValue = nearest.dataPoint.x;
              const yValue = nearest.dataPoint.y;

              for (let i=0; i < this.CursorValues.length; i++) {
                if ((this.CursorValues[i].pointX >= xValue -6 && this.CursorValues[i].pointX <= xValue + 6) && 
                    (this.CursorValues[i].pointY >= yValue -6 && this.CursorValues[i].pointY <= yValue + 6 ) ) {
                    this.chartObj.removeAnnotation(this.CursorValues[i].id);
                    this.CursorValues = this.clearCursor(i);
                    this.CursorValues = this.clearCursor(this.CursorValues.length - 1)
                    this.cd.detectChanges()
                    return;
                }
              }

              this.subAddAnnotations(xValue, yValue);

          }          
        }
      }
    }

  }

  subAddAnnotations(xValue: number, yValue: number): void;
  subAddAnnotations(opts: any): void;

  subAddAnnotations(typeArg?: any | number, yvalue?: number): void {
    let opts; let xValue;
    if (typeof typeArg !== 'number') {
      opts = typeArg;
    }
    else
    {
      xValue = typeArg;
    }


    let curIndex: number = -1;
    for (let i=0; i < this.CursorValues.length; i++) {
      if (this.CursorValues[i].name == "--") {
        curIndex = i;
        break;
      }
    }    

    if (curIndex < 0) { return }

    this.isAddPointAnnotation = true;

    let annotation: ApexAnnotations = {}
    if (this.IsCursorsEnabled[1] == false) {

      annotation = {
        id: `cursor-${opts.seriesIndex}-${opts.dataPointIndex}`,
        x: this.DataPoint[0].time[opts.dataPointIndex],
        y: this.DataPoint[opts.seriesIndex].measure[opts.dataPointIndex],
        yAxisIndex: this.AxisValues[this.DataPoint[opts.seriesIndex].AxisType].axisIndex,
        seriesIndex: opts.seriesIndex,
        marker: {
          size: 6,
          fillColor: '#FFFFFF',
          strokeColor: '#FFFFFF',
          shape: 'circle'
        }
      } as ApexAnnotations;

    }
    else
    {
      annotation = {
        id: `cursor-${opts.w.globals.clientX}-${opts.w.globals.clientY}`,
        x: opts.w.globals.clientX,
        y: opts.w.globals.clientY,
        marker: {
          size: 6,
          fillColor: '#FFFFFF',
          strokeColor: '#FFFFFF',
          shape: 'circle'
        }
      } as ApexAnnotations;
    }  

    
    this.chartObj.addPointAnnotation(annotation, true);

    setTimeout(() => {
      this.isAddPointAnnotation = false;
    }, 0);

    let cursor: any = {}
    if (this.IsCursorsEnabled[1] == false) {
      cursor = { 
        x: this.DataPoint[0].time[opts.dataPointIndex],
        y: this.DataPoint[opts.seriesIndex].measure[opts.dataPointIndex],
        name: this.DataPoint[opts.seriesIndex].name,
        color: this.DataPoint[opts.seriesIndex].color,
        pointX: opts.w.globals.clientX,
        pointY: opts.w.globals.clientY,
        id:`cursor-${opts.seriesIndex}-${opts.dataPointIndex}`,
      } as CursorValues
    } 
    else
    {
      cursor = { 
        x: xValue,
        y: yvalue,
        name: "--",
        color: "#ffffff",
        pointX: xValue,
        pointY: yvalue,
        id:`cursor-${xValue}-${yvalue}`,
      } as CursorValues
    }

    this.CursorValues = this.UpdateCursor(cursor, curIndex);
    this.cd.detectChanges() 

    this.CursorDifference();
  }

  clearCursor(index: number): CursorValues[] {
    let cursorvalues: CursorValues[] = this.CursorValues

    for (let i=0; i < cursorvalues.length; i++) {
      if (i == index) {
        cursorvalues[i] = { 
          x: 0,
          y: 0,
          name:  (i != (cursorvalues.length - 1) ? "--" : "Difference"),
          color: "#ffffff",
          pointX: 0,
          pointY: 0,
          id: ""
        }
        break;
      }
    }
  
    this.CursorValues = [];
    return cursorvalues
  }
  

  cursortype: boolean = true;
  CursorDifference() {
    for (let i=0; i < this.CursorValues.length; i++) {
      if (this.CursorValues[i].name == "--") {
        return;
      }
    }
    
    let cursorname: string = this.CursorValues[0].name;
    this.cursortype = true;
    for (let i = 1; i < this.CursorValues.length; i++) {
      if (this.CursorValues[i].name !== cursorname) {
        this.cursortype = false;
        break;
      }
    }

    let timeValue: number = 0; let measureValue: number = 0;

    for (let i=0; i <  this.CursorValues.length; i++) {
      timeValue = this.CursorValues[i].x - timeValue
      measureValue = this.CursorValues[i].y - measureValue
    }

    let cursor: CursorValues = {
      x: Number(Math.abs(timeValue).toFixed(2)),
      y: Number(Math.abs(measureValue).toFixed(2)),
      name: "Difference",
      color: "#F5F5F5",
      pointX: 0,
      pointY: 0,
      id: "Difference"
    }

    this.CursorValues = this.UpdateCursor(cursor, 2);
    this.cd.detectChanges()

  }

  UpdateCursor(cursors: CursorValues, index: number): CursorValues[] {
    let cursorvalues: CursorValues[] = this.CursorValues

    for (let i=0; i < cursorvalues.length; i++) {
      if (i == index) {
        cursorvalues[i] = { 
          x: cursors.x,
          y: cursors.y,
          name:  cursors.name,
          color: cursors.color,
          pointX: cursors.pointX,
          pointY: cursors.pointY,
          id: cursors.id
        }
        break;
      }
    }
  
    this.CursorValues = [];
    return cursorvalues
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

  buttonpressed: { [key: string]: boolean } = {}
  ShowTestsExecution(button: string) {
    this.buttonpressed[button] = !this.buttonpressed[button];
  }

  ShowPeaks(button: string) {
    this.buttonpressed[button] = !this.buttonpressed[button];
  }

  ShowConstantValues(button: string) {
    this.buttonpressed[button] = !this.buttonpressed[button];
  }  

  ShowTestsAree(button: string) {
    this.buttonpressed[button] = !this.buttonpressed[button];
  }

  measureSelected: string = '';
  measures: any[] = [];

  IsCursorsEnabled: boolean[] = [false, false];
  subCursorsEnabled(checked: any) {
    if(checked == false) {
      this.chartObj.clearAnnotations();
      for(let index = 0; index <= this.CursorValues.length; index++) {
        this.CursorValues = this.clearCursor(index);
      }
      this.cd.detectChanges();
      this.cursortype = true;
    }
  }

  subCursorsMode(checked: any) {

  }

  private findNearestSeriesByScreenDistance(
    px: number,
    py: number,
    plotRect: DOMRect,
    chartContext: any
  ): {
    seriesIndex: number;
    seriesName: string;
    segmentIndex: number;
    distance: number;
    dataPoint: { x: number; y: number };
  } | null {
    const series = chartContext?.w?.config?.series;
    if (!Array.isArray(series) || series.length === 0) return null;

    let best: {
      seriesIndex: number;
      seriesName: string;
      segmentIndex: number;
      distance: number;
      dataPoint: { x: number; y: number };
    } | null = null;

    for (let sIndex = 0; sIndex < series.length; sIndex++) {
      const serie = series[sIndex];
      const data = serie?.data;
      if (!Array.isArray(data) || data.length < 2) continue;

      const yAxisIndex = this.findYAxisIndexForSeries(serie.name);
      const yRange = this.getVisibleYRangeForAxis(yAxisIndex, chartContext);
      const xRange = this.getVisibleXRange(chartContext);

      if (!xRange || !yRange) continue;

      const normalized = this.normalizeSeriesData(data);
      if (normalized.length < 2) continue;

      for (let i = 0; i < normalized.length - 1; i++) {
        const p1 = normalized[i];
        const p2 = normalized[i + 1];

        if (p1.x == null || p1.y == null || p2.x == null || p2.y == null) continue;

        const sx1 = this.dataXToPixel(p1.x, xRange.min, xRange.max, plotRect.width);
        const sy1 = this.dataYToPixel(p1.y, yRange.min, yRange.max, plotRect.height);

        const sx2 = this.dataXToPixel(p2.x, xRange.min, xRange.max, plotRect.width);
        const sy2 = this.dataYToPixel(p2.y, yRange.min, yRange.max, plotRect.height);

        const proj = this.projectPointOnSegment(px, py, sx1, sy1, sx2, sy2);

        if (!best || proj.distance < best.distance) {
          // t = posizione proiettata sul segmento: 0..1
          const xValue = p1.x + (p2.x - p1.x) * proj.t;
          const yValue = p1.y + (p2.y - p1.y) * proj.t;

          best = {
            seriesIndex: sIndex,
            seriesName: serie.name ?? `Serie ${sIndex}`,
            segmentIndex: i,
            distance: proj.distance,
            dataPoint: {
              x: xValue,
              y: yValue
            }
          };
        }
      }
    }

    return best;
  }

  private getPlotRect(chartContext: any): DOMRect | null {
    const gridEl = chartContext?.el?.querySelector('.apexcharts-grid');
    if (!gridEl) return null;
    return gridEl.getBoundingClientRect();
  }

  private projectPointOnSegment(
    px: number,
    py: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): {
    t: number;
    projX: number;
    projY: number;
    distance: number;
  } {
    const dx = x2 - x1;
    const dy = y2 - y1;

    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) {
      const dist = Math.hypot(px - x1, py - y1);
      return { t: 0, projX: x1, projY: y1, distance: dist };
    }

    let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));

    const projX = x1 + t * dx;
    const projY = y1 + t * dy;
    const distance = Math.hypot(px - projX, py - projY);

    return { t, projX, projY, distance };
  }

  private normalizeSeriesData(data: any[]): Array<{ x: number; y: number }> {
    const result: Array<{ x: number; y: number }> = [];

    for (const p of data) {
      let x: number | null = null;
      let y: number | null = null;

      if (Array.isArray(p) && p.length >= 2) {
        x = this.toNumberX(p[0]);
        y = this.toNumberY(p[1]);
      } else if (p && typeof p === 'object') {
        x = this.toNumberX(p.x);
        y = this.toNumberY(p.y);
      }

      if (x !== null && y !== null) {
        result.push({ x, y });
      }
    }

    return result;
  }

  private toNumberX(value: any): number | null {
    if (typeof value === 'number' && !isNaN(value)) {
      return value;
    }

    if (typeof value === 'string') {
      // prova numero puro
      const n = Number(value);
      if (!isNaN(n)) return n;

      // prova datetime string
      const d = new Date(value).getTime();
      if (!isNaN(d)) return d;
    }

    if (value instanceof Date) {
      const d = value.getTime();
      return isNaN(d) ? null : d;
    }

    return null;
  }

  private toNumberY(value: any): number | null {
    if (typeof value === 'number' && !isNaN(value)) {
      return value;
    }

    if (typeof value === 'string') {
      const n = Number(value);
      return isNaN(n) ? null : n;
    }

    return null;
  }

  private dataXToPixel(x: number, minX: number, maxX: number, width: number): number {
    return ((x - minX) / (maxX - minX)) * width;
  }

  private dataYToPixel(y: number, minY: number, maxY: number, height: number): number {
    return height - ((y - minY) / (maxY - minY)) * height;
  }

  private getVisibleYRangeForAxis(
    yAxisIndex: number,
    chartContext: any
  ): { min: number; max: number } | null {
    const yaxes = Array.isArray(this.yaxis) ? this.yaxis : [this.yaxis];
    const axis = yaxes[yAxisIndex];
    if (!axis) return null;

    if (typeof axis.min === 'number' && typeof axis.max === 'number') {
      return { min: axis.min, max: axis.max };
    }

    // fallback: prova a leggere dalle globals interne
    const globals = chartContext?.w?.globals;
    const minArr = globals?.minYArr;
    const maxArr = globals?.maxYArr;

    if (
      Array.isArray(minArr) &&
      Array.isArray(maxArr) &&
      typeof minArr[yAxisIndex] === 'number' &&
      typeof maxArr[yAxisIndex] === 'number'
    ) {
      return {
        min: minArr[yAxisIndex],
        max: maxArr[yAxisIndex]
      };
    }

    return null;
  }  

  private findYAxisIndexForSeries(seriesName: string): number {
    const yaxes = Array.isArray(this.yaxis) ? this.yaxis : [this.yaxis];

    for (let i = 0; i < yaxes.length; i++) {
      const axisSeriesName = yaxes[i]?.seriesName;

      if (typeof axisSeriesName === 'string' && axisSeriesName === seriesName) {
        return i;
      }

      if (Array.isArray(axisSeriesName) && axisSeriesName.includes(seriesName)) {
        return i;
      }
    }

    return 0;
  }

  private getVisibleXRange(chartContext: any): { min: number; max: number } | null {
    const min = chartContext?.w?.globals?.minX;
    const max = chartContext?.w?.globals?.maxX;

    if (typeof min !== 'number' || typeof max !== 'number') {
      return null;
    }

    return { min, max };
  }  

  showDialog(message: string, title?: string ) {
    this.dialog.open(DialogContent, {
      data: { DialogMessage: message, DialogTitle: title ?? ''},
      disableClose: true,
      hasBackdrop: true,
    });
  }

  private updateChartHeight(): void {
    const panel = document.querySelector('#chart-details-mngt') as HTMLElement | null;
    const newHeight = panel?.clientHeight ?? 500;

    this.chartObj?.updateOptions({
      chart: {
        height: newHeight
      }
    });
  }

  @HostListener('window:resize')
  onResize() {
    this.updateChartHeight();
  }
}
