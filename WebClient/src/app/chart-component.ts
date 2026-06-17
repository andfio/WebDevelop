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
  ApexAnnotations,
  PointAnnotations
} from "ng-apexcharts";
import { NgApexchartsModule } from "ng-apexcharts";
import { DataPoint, timeinfo, tablevalues } from "./chart-config";
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
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatDividerModule} from '@angular/material/divider';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {buttonsChart} from "./chart-config";
//gestione cursori grafico
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
//richieste http
import { HttpClient } from '@angular/common/http';
//gestione file GPlot.ini (GPlot.json)
import { AxesConfig } from "./chart-config";
import { ChartSettingsComponent } from './chart-settings-component';
// Parse dei dati di ACQ 
import { ChartData} from "./chart-config";
//Router
import { Router } from '@angular/router';
//Tabella dettagli
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {tabledata, tabledetails} from "./chart-config";
//Tests Execution chart
import {TestsExecutionChartComponent} from './testsExecution/tests-chart-component';
import {TestsExecutionChartDataService} from "./testsExecution/tests-chart-service";

@Component({
  selector: "app-chart",
  templateUrl: "./chart-component.html",
  styleUrls: ["./chart-component.css"],
  imports: [NgApexchartsModule, MatSliderModule, FormsModule,MatDividerModule, MatSelectModule, MatFormFieldModule, MatIconModule, MatMenuModule, MatButtonModule, MatSlideToggleModule, MatTooltipModule, MatButtonToggleModule, MatToolbarModule, TestsExecutionChartComponent]
})
export class ChartComponent {
[x: string]: any;
  @ViewChild('chartObj') chartObj!: ApexChartComponent;

  public series: ApexAxisChartSeries = [];
  public chart: ApexChart = {
    type: 'area',       
    height: 350,
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
  public annotations: ApexAnnotations = {};

  constructor(private dialog: MatDialog, private cd: ChangeDetectorRef, private http: HttpClient, private chartDialog: MatDialog, private router: Router, public testExecution: TestsExecutionChartDataService) { }
  
  chartData: ChartData = {
    MeasurID: [],
    MeasurColl: []
  };

  rowData: any = {};
  rootfields: any[] = [];
  tableData: any[] = [];
  detailsRows: tabledetails[] = []; 
  headerInfos: any[] = [];
  sequenceHeaders: any[] = [];

  chartSeries: any[] = []
  chartAxisOffSet: any[] = [];

  measuresinfo: any[] = [];
  httpConfig: any = {} as any;

  axesConfig: AxesConfig = {
    Plots: {},
    VisiblePlots: {},
    PlotColors: {},
    AxesScale: {}
  };
  readonly numMAXPlots: number = 10;
  KeyPlot: string = "Plot";
  KeyResult: string = "";
  MeasureID: number[] = [];
  MeasurColl: number[][] = [];

  defaultMeasureIDs: number[] = [];
  
  ngOnInit() {
    this.rowData = this.buildrowData(history.state.rootData);
    this.rootfields = this.buildrootFields(history.state.rootData);
    this.tableData = this.buildtableData(history.state.rootData);
    this.detailsRows = this.buildDetailsRows(history.state.detailsFields);
    this.headerInfos = history.state.headerInfos;
    this.sequenceHeaders = history.state.sequenceHeaders;
    this.httpConfig = history.state.httpConfig;
    this.axesConfig = history.state.axesConfig;

    this.testExecution.detailsRows.set(this.buildDetailsChart(history.state.detailsFields));

    this.KeyResult = history.state.KeyResult;
    
    this.subInitChartSeries();
    this.subInitCursors();
    this.subInitButtonsPressed();

    let UnitTypeID = this.rowData[this.rootfields.find(x => x.field === 'UnitTypeID').field];
    this.KeyPlot = "Plot" + UnitTypeID.toString();

    this.subPost();
  }

  ngAfterViewInit() {
    this.updateChartHeight();
  }

  buildrowData(rootData: tabledata[]): { [key: string]: any } {
    return rootData.reduce((acc, item) => {
      acc[item.field] = item.value;
      return acc;
    }, {} as { [key: string]: any });
  }

  buildrootFields(rootData: tabledata[]): any[] {
     return rootData.map((item) => {
      return { name: item.name, field: item.field };
    });
  }

  buildtableData(rootData: tabledata[]): any[] {
    return rootData.map((item) => {
      return { name: item.name, value: item.value, description: item.description };
    });
  }

  buildDetailsRows(detailsFields: tabledata[]): any[] {
    let rows: any[] = [];
    let currentRow: tabledetails = {} as tabledetails;

    for (let item of detailsFields) {
      switch (item.field) {
        case "ProgressiveGroup":
          currentRow.SequenceNumber = item.value;
          break;

        case "TestDescription":
          currentRow.description = item.value;
          break;

        case "TestResult":
          currentRow.result = item.value;
          break;

        case "StartStabTime":
          currentRow.startSequence = this.convertSecondiToTime(Number(item.value));
          break;

        case "EndEventTime":
          currentRow.endSequence = this.convertSecondiToTime(Number(item.value));
          rows.push(currentRow);
          currentRow = {} as tabledetails;
          break;
      }
    }

    return rows;
  }  

  buildDetailsChart(detailsFields: any[]): any[] {
    const rows: any[] = [];
    let currentRow: any = {};

    for (const item of detailsFields) {
      switch (item.field) {
        case "ProgressiveGroup":
          currentRow.SequenceNumber = item.value;
          break;

        case "TestDescription":
          currentRow.description = item.value;
          break;

        case "TestResult":
          currentRow.result = item.value;
          break;

        case "StartStabTime":
          currentRow.startSequence = Number(item.value);
          break;

        case "EndEventTime":
          currentRow.endSequence = Number(item.value);
          rows.push(currentRow);
          currentRow = {};
          break;
      }
    }

    return rows;
  } 

  subPost() {
    this.subParserMeasureData(this.KeyResult);
  }
  
  subParserMeasureData(KeyResult: string) {
    const payload = {
      ID_Result: KeyResult
    }

    this.http.post(this.httpConfig.baseurl + '/query/acquisitionstring', payload).subscribe({
      next: (data: any) => {
        this.chartData = data;
        this.MeasureID = this.chartData.MeasurID;
        this.MeasurColl = this.chartData.MeasurColl;
        this.subInitMeasuresInfo();
      },
      error: (err) => {
        console.error("ERRORE BACKEND:", err);
      }
    });	 
  }

  subInitMeasuresInfo() {
    let UnitTypeIDSelected = this.rowData[this.rootfields.find((x => x.field === 'UnitTypeID')).field];
    const parameters = {
      UnitTypeID: UnitTypeIDSelected,
      CommandType: 1 //measures
    }

    setTimeout(() => {
    this.http.post(this.httpConfig.baseurl + '/query/measuresinfo', parameters).subscribe({
      next: (data: any) => {
        this.measuresinfo = data;
        this.ShowChart();
        this.defaultMeasureIDs = this.getDefaultMeasureIDs();
      },
      error: (err) => {
        console.error("ERRORE BACKEND:", err);
      }
    });
    }, 0);
    this.tableheadertime();	   
  }

  timeinfo: timeinfo[] = [];
  tableheadertime() { 
    
      this.timeinfo.push({
        title: `ABS Time`,
        description: `[hh:mm]-(ss.mm)`
      },
      {
        title: `Time`,
        description: `sec`
      }
    );
    
  }

  ShowChart() {
    this.initChartData();
    this.subChartEvents();
  }

  subInitChartSeries() {
    let chartSeriesConfig: any = history.state.chartSeries;
    let axistype: number[] = chartSeriesConfig.axistypes.split(';').map(Number) 
    let axisposition: number[] = chartSeriesConfig.axisposition.split(';').map(Number)
    let axisregulatoroffset: number[] = chartSeriesConfig.axisregulatoroffset.split(';').map(Number) 
    for (let index = 0; index < axistype.length; index++) {
      this.chartSeries[axistype[index]] = []; 
      this.chartSeries[axistype[index]] = axisposition[index];
      this.chartAxisOffSet[axisposition[index]] = [];
      this.chartAxisOffSet[axisposition[index]] = axisregulatoroffset[index];
    }
    
    for(let i=0; i < this.chartSeries.length - 1; i++) {
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
    };

  }

  subInitCursors() {
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
  }

  subInitButtonsPressed() {
      Object.values(buttonsChart).forEach((value: string) => {
      this.buttonpressed[value] = false;
    });
  }

  subResetBtn(esclusion?: string[]) {
    Object.values(buttonsChart).forEach((value: string) => {
      if (esclusion != undefined) {
        if (!esclusion.includes(value)) {
          this.buttonpressed[value] = false;
        }
      }
      else      {
        this.buttonpressed[value] = false;
      }
    }); 
  }

  dates: any = [];
  DataPoint: DataPoint[] = [];
  AxisSeries: any[] = [];
  AxisValues: AxisValues[] = [];
  CursorValues: CursorValues[] = [];

  public initChartData(): void {

     let timeValues: number[] = [];
     let measuresValues: number[][] = [];

     for (let i = 0; i < this.MeasurColl.length; i++) {

        let values: number[] = this.MeasurColl[i];
        timeValues.push(Math.round(values[0] * 100) / 100);
        for (let index = 1; index < this.MeasureID.length; index++) {
          measuresValues[index] = measuresValues[index] || [];
          measuresValues[index].push(Math.round(values[index] * 100) / 100);
        }

     }

     for (let index = 1; index < this.MeasureID.length; index++) {
        if (this.measuresinfo.find((x) => x.measureID == this.MeasureID[index]) !== undefined) {   
            let plotIndex = this.axesConfig.Plots[this.KeyPlot].Plot.findIndex(x => x == this.MeasureID[index])
            if (plotIndex !== -1) { 
                if (this.axesConfig.VisiblePlots[this.KeyPlot].Plot[plotIndex] == true) {
                    let dataPoint: DataPoint = {  
                      time: timeValues,
                      measure: measuresValues[index],
                      name: this.measuresinfo.find((x) => x.measureID == this.MeasureID[index]).shortname,
                      color:  this.axesConfig.PlotColors[this.KeyPlot].Color[plotIndex],
                      AxisType: this.chartSeries[this.measuresinfo.find((x) => x.measureID == this.MeasureID[index]).axesposition]
                    }
                    this.DataPoint.push(dataPoint);
                }
            }
        }   
     }  

    for (let s = 0; s < this.DataPoint.length; s++) {
      this.dates[s] = [];
      for (let i = 0; i < this.DataPoint[0].time.length; i++) {
        this.dates[s].push([this.DataPoint[s].time[i], this.DataPoint[s].measure[i]]);
      }
    }

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
          minValue[AxisIndex] =  minValue[AxisIndex] || []
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
          min: minValue[AxisIndex],
          max: (maxValue[AxisIndex] * this.chartAxisOffSet[AxisIndex] / 100),
          value: maxValue[AxisIndex],
          textMin: minValue[AxisIndex],
          textMax: maxValue[AxisIndex],
          DefaultMin: minValue[AxisIndex],
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
      },
      animations: { 
        enabled: false
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
    // for (let axisIndex = 1; axisIndex < this.AxisValues.length; axisIndex++) {
    for (let axisIndex = this.AxisValues.length - 1; axisIndex >= 0; axisIndex--) {  
      if (this.AxisValues[axisIndex].enabled == true) {
          
          switch (axisIndex) {
          case 1: //1 ASSE A SINISTRA
              this.AxisValues[axisIndex].axisIndex = axisCount;
              this.yaxis.push(
                {
                  seriesName: this.AxisValues[axisIndex].seriesName,
                  min: this.AxisValues[axisIndex].textMin,
                  max: this.AxisValues[axisIndex].textMax,
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
                    text: this.AxisValues[axisIndex].seriesName.join(", "),
                    style: {
                      color: "#FFFFFF"
                    },  
                  },
                },
              );
              break;

            case 2: //2° ASSE A SINISTRA
              this.AxisValues[axisIndex].axisIndex = axisCount;
              this.yaxis.push(
                {
                  seriesName: this.AxisValues[axisIndex].seriesName,
                  min: this.AxisValues[axisIndex].textMin,
                  max: this.AxisValues[axisIndex].textMax,
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
                    text: this.AxisValues[axisIndex].seriesName.join(", "),
                    style: {
                      color: "#FFFFFF"
                    },  
                  },
                },
              );
              break;

            case 3: //1° ASSE A DESTRA
              this.AxisValues[axisIndex].axisIndex = axisCount;
              this.yaxis.push(
                {
                  seriesName: this.AxisValues[axisIndex].seriesName,
                  min: this.AxisValues[axisIndex].textMin,
                  max: this.AxisValues[axisIndex].textMax,
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
                    text: this.AxisValues[axisIndex].seriesName.join(", "),
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
           formatter: (seriesName: string) => (seriesName == undefined ? "" : seriesName + ": ")
         }
       }
     };
    this.stroke = { 
        width: [1,1, 1],
    };
    

    this.subLoadAxisConfig(this.KeyPlot);
    this.cd.detectChanges()
  }

  public subColumnValues(shortname: string, measureIndex?: any): tablevalues {
    let measures: tablevalues | null = null;
    this.DataPoint.forEach(dp => {
      for (let i=0; i < this.measuresinfo.length; i++) {
        if (dp.name == shortname) {
          measures = { color: dp.color, values: dp.measure };
          break;
        }
      }
    });
    
    if (measures == null) {
        let values: number[] = [];

        if (measureIndex != undefined)
        {
            for(let r = 0; r < this.MeasurColl.length; r++ )
            {
              let float: number[] = this.MeasurColl[r];

              values.push(float[measureIndex]);
            }

            measures = { color: "silver", values: values };
        }
        else
        {
           measures = { color: "silver", values: values };
        }
    }

    return measures;
  } 

  subGetUM(measureID: number): string {
    const measure = this.measuresinfo.find(m => m.measureID === measureID);
    return measure ? measure.UM : "";
  }

  subGetShortname(measureID: number): string {
    const measure = this.measuresinfo.find(m => m.measureID === measureID);
    return measure ? measure.shortname : "";
  }

  subGetShortnameAxisY(measureID: number): string {
        const measure = this.measuresinfo.find(m => m.measureID === measureID); 
        return (measure ? this.AxisValues.find((axis) => axis.seriesName?.includes(measure.shortname)) ? measure.shortname : "" : "");
  }

  getDefaultMeasureIDs(): number[] {
    let defaultMeasureIDs: number[] = [];
     for (let i = 0; i < this.MeasureID.length; i++) {
        if (this.subGetShortnameAxisY(this.MeasureID[i]) !== "") {
          defaultMeasureIDs.push(this.MeasureID[i]);
        }
      }

    this.measureSelected = defaultMeasureIDs.length > 0 ? this.subGetShortname(defaultMeasureIDs[0]) : "";  
    return defaultMeasureIDs;
  }

  hideDetails: boolean = false;
  toggleDetails() {
    this.hideDetails = !this.hideDetails;
  }

  blnShowGraph: boolean = true;
  SetPanel() {
      this.blnShowGraph = !this.blnShowGraph;
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

              this.subAddAnnotations(xValue, yValue, nearest.seriesIndex);

          }          
        }
      }
    }

  }

  subAddAnnotations(xValue: number, yValue: number, seriesIndex: number): void;
  subAddAnnotations(opts: any): void;

  subAddAnnotations(typeArg?: any | number, yvalue?: number, seriesIndex?: number): void {
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

    let annotation: PointAnnotations = {}
    if (this.IsCursorsEnabled[1] == false) {

      annotation = {
        id: `cursor-${opts.seriesIndex}-${opts.dataPointIndex}`,
        x: this.DataPoint[0].time[opts.dataPointIndex],
        y: this.DataPoint[opts.seriesIndex].measure[opts.dataPointIndex],
        yAxisIndex: this.AxisValues[this.DataPoint[opts.seriesIndex].AxisType].axisIndex,
        seriesIndex: opts.seriesIndex,
        marker: {
          size: 6,
          fillColor: (curIndex == 0 ? '#FFFFFF' : "#FFFF00" ),
          strokeColor: (curIndex == 0 ? '#FFFFFF' : "#FFFF00" ),
          shape: 'circle'
        }
      } as PointAnnotations;

    }
    else
    {
      let key: string = ("cursor-" + xValue?.toString().replace('.', '-') + "-" + yvalue?.toString().replace('.', '-'));
      annotation = {
        id: key,
        x: xValue,
        y: yvalue,
        yAxisIndex: this.AxisValues[this.DataPoint[seriesIndex!].AxisType].axisIndex,
        seriesIndex: seriesIndex,
        marker: {
          size: 6,
          fillColor: (curIndex == 0 ? '#FFFFFF' : "#FFFF00" ),
          strokeColor: (curIndex == 0 ? '#FFFFFF' : "#FFFF00" ),
          shape: 'circle'
        }
      } as PointAnnotations;
    }  
    
    this.chartObj.addPointAnnotation(annotation, true);

    setTimeout(() => {
      this.isAddPointAnnotation = false;
    }, 0);

    let cursor: any = {}
    let key: string = ("cursor-" + xValue?.toString().replace('.', '-') + "-" + yvalue?.toString().replace('.', '-'));
    if (this.IsCursorsEnabled[1] == false) {
      cursor = { 
        x: Number(this.DataPoint[0].time[opts.dataPointIndex].toFixed(2)),
        y: Number(this.DataPoint[opts.seriesIndex].measure[opts.dataPointIndex].toFixed(2)),
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
        x: Number(xValue?.toFixed(2)),
        y: Number(yvalue?.toFixed(2)),
        name: this.DataPoint[seriesIndex!].name,
        color: this.DataPoint[seriesIndex!].color,
        pointX: xValue,
        pointY: yvalue,
        id: key,
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
    for (let i = 1; i < this.CursorValues.length - 1; i++) {
      if (this.CursorValues[i].name !== cursorname) {
        this.cursortype = false;
        break;
      }
    }

    let timeValue: number = 0; let measureValue: number = 0; let measureUM: string[] = [];

    for (let i=0; i <  this.CursorValues.length - 1; i++) {
      if (typeof this.CursorValues[i].x === 'string') {
        timeValue = Number((this.CursorValues[i].x as string).substring(0, (this.CursorValues[i].x as string).indexOf(" ")))  - timeValue
      } 
      if (typeof this.CursorValues[i].y === 'string') {
        measureValue = Number((this.CursorValues[i].y as string).substring(0, (this.CursorValues[i].y as string).indexOf(" "))) - measureValue
      }
      
      measureUM[i] = this.CursorValues[i].name;
       
    }

    let measureUMequivalent: string = "";
    for (let i=0; i < measureUM.length; i++) {
      measureUM[i] = this.getMeasureUM(measureUM[i]);
    }

    if (measureUM.every(um => um === measureUM[0])) {
      measureUMequivalent = measureUM[0];
    }
    else    {
      measureUMequivalent = "";
    }

    let cursor: CursorValues = {
      x: Number(Math.abs(timeValue).toFixed(2)),
      y: Number(Math.abs(measureValue).toFixed(2)) + " " + measureUMequivalent,
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

    for (let i=0; i < cursorvalues.length ; i++) {
      if (i == index) {
        cursorvalues[i] = { 
          x: cursors.x + " sec",
          y: cursors.y + this.getMeasureUM(cursors.name),
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

  getMeasureUM(cursorShortName: string): string {
    let measure = this.measuresinfo.find((x) => x.shortname == cursorShortName);
    if (measure !== undefined) {
      return " " + measure.UM;
    }
    return "";
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
      // if (numValue > this.AxisValues[index].max || numValue < this.AxisValues[index].min) {numValue = this.AxisValues[index].max, this.AxisValues[index].textMax = this.AxisValues[index].max }
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

    // if (numValue < this.AxisValues[index].min || numValue > this.AxisValues[index].max ) {  this.AxisValues[index].textMin = this.AxisValues[index].min }
    
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
    this.AxisValues[index].value = this.AxisValues[index].textMax;

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

  buttonpressed: { [key: string]: boolean } = {}
  buttonNames = buttonsChart;
  
  LoadXYAxis(button: string) {

    this.http.post(this.httpConfig.baseurl + '/query/loadplots', null).subscribe({
    next: (data: any) => {
        if(data.success==true) {
          this.axesConfig = data.config;
          this.subLoadAxisConfig(this.KeyPlot);
        } 
        else {
          if (data.message == "NO_FILE")
          {
            console.warn("No plot configuration file found.");
          };
        }
      },
      error: (err) => {
        console.error("ERRORE BACKEND:", err);
      }
    });	  
  }
  

  SaveXYAxis(button: string) {
    
    for (let index = 0; index < this.AxisValues.length; index++) {
      
      if (this.AxisValues[index].enabled == true) {
        switch (index) {
          case 0: 
            this.axesConfig.AxesScale[this.KeyPlot].Xmin = this.AxisValues[index].textMin;
            this.axesConfig.AxesScale[this.KeyPlot].Xmax = this.AxisValues[index].textMax;
            break;
          case 1:
            this.axesConfig.AxesScale[this.KeyPlot].YAxes1MIN = this.AxisValues[index].textMin;
            this.axesConfig.AxesScale[this.KeyPlot].YAxes1MAX = this.AxisValues[index].textMax;
            break;
          case 2:
            this.axesConfig.AxesScale[this.KeyPlot].YAxes2MIN = this.AxisValues[index].textMin;
            this.axesConfig.AxesScale[this.KeyPlot].YAxes2MAX = this.AxisValues[index].textMax;
            break;
          case 3:
            this.axesConfig.AxesScale[this.KeyPlot].YAxes3MIN = this.AxisValues[index].textMin;
            this.axesConfig.AxesScale[this.KeyPlot].YAxes3MAX = this.AxisValues[index].textMax;
            break;
          case 4:
            this.axesConfig.AxesScale[this.KeyPlot].YAxes4MIN = this.AxisValues[index].textMin;
            this.axesConfig.AxesScale[this.KeyPlot].YAxes4MAX = this.AxisValues[index].textMax;    
            break;
        }

      }  
    }

    this.http.post(this.httpConfig.baseurl + '/query/saveplots', this.axesConfig).subscribe({
      next: (data: any) => {
        if(data.success==false) {
            console.error("ERRORE BACKEND:", data.message);   
        }
      },
      error: (err) => {
        console.error("ERRORE BACKEND:", err);
      }
    });	
  }
  
  ToggleLegend(button: string) {
    this.subChartDialogShow();
  }

  ShowGrid(button: string) {
    this.buttonpressed[button] = !this.buttonpressed[button];
    if (this.buttonpressed[button] == true) { 
      
      this.grid = {
        show: true,
        borderColor: '#90A4AE',
        strokeDashArray: 0,
        position: 'back',
        xaxis: {
          lines: {
            show: true  
          }
        },
        yaxis: {
          lines: {  
            show: true
          }
        }
      }
    }
    else {
      this.grid = {
        show: false
      };
    }
    this.chartObj.updateOptions({
      grid: this.grid
    });
  }
  
  showTestsExecution: boolean = false;
  ShowTestsExecution(button: string) {
    this.buttonpressed[button] = !this.buttonpressed[button];
    this.showTestsExecution = this.buttonpressed[button];
     this.subResetBtn([button]);
  }

  measureSelected: string = '';
  ShowPeaks(button: string) {
    this.buttonpressed[button] = !this.buttonpressed[button];

    if (!this.buttonpressed[button]) {
      this.chartObj.updateOptions({
        annotations: {
          points: []
        }
      });
      return;
    }
    this.subResetBtn([button]);

    let measures: number[] = this.DataPoint.find(dp => dp.name == this.measureSelected)?.measure || [];
    if (measures.length == 0) { return }
    let measureID: number = this.MeasureID.find(m => this.subGetShortname(m) == this.measureSelected) || -1; 

    let currValue: number = 0;
    let prevValue: number = 0;
    let lastValue: number = 0;
    let isPeak: boolean = false;
    let points: PointAnnotations[] = [];
    for(let x = 0; x < measures.length - 1; x++)
    {

        isPeak = false;

        if ((this.DataPoint[0].time[x + 1] - this.DataPoint[0].time[x]) > 0 ) {
          currValue = (measures[x + 1] - measures[x]) / (this.DataPoint[0].time[x + 1] - this.DataPoint[0].time[x])

          if ((currValue < prevValue) && (currValue < 0 && prevValue > 0) ) {
            isPeak = true;
          }

          if ((currValue > prevValue) && (currValue > 0 && prevValue < 0) ) {
            isPeak = true;
          }

            if(isPeak == true && (lastValue < Number(measures[x].toFixed(3))) && (Math.abs(currValue - prevValue) > 0.2)) {

              points.push({
                x: this.DataPoint[0].time[x],  
                y: Number(measures[x].toFixed(3)),
                  yAxisIndex: this.subGetAxisIndex(measureID),
                  seriesIndex: this.subGetSeriesIndex(measureID),
                  label: {
                    text: measures[x].toFixed(3).toString(),
                    position: 'top',
                    style: {
                      color: this.subGetColorByPlot(measureID),
                      background: "#000000",
                      fontFamily: "Arial, sans-serif",
                      fontSize: '10px',
                    }
                  }
                }  
              );    
                
              lastValue = Number(measures[x].toFixed(3));
            } 
          

          prevValue = currValue;
        }
    }

    this.chartObj.updateOptions({
      annotations: {
        points: points
      }
    });
    this.cd.detectChanges()
  }

  ShowConstantValues(button: string) {
    this.buttonpressed[button] = !this.buttonpressed[button];

    if (!this.buttonpressed[button]) {
      this.chartObj.updateOptions({
        annotations: {
          points: []
        }
      });
      return;
    }
    this.subResetBtn([button]);

    let measures: number[] = this.DataPoint.find(dp => dp.name == this.measureSelected)?.measure || [];
    if (measures.length == 0) { return }
    let measureID: number = this.MeasureID.find(m => this.subGetShortname(m) == this.measureSelected) || -1; 
    let measureUM: string = this.subGetUM(measureID);

    let currDiff: number = 0;
    let currValue: number = 0;
    let prevValue: number = 0;
    let lastValue: number = 0;
    let deltaValue: number = 0;
    let labelText: string = "";
    let points: PointAnnotations[] = [];
    for(let x = 0; x < measures.length - 1; x++)
    {

        if ((this.DataPoint[0].time[x + 1] - this.DataPoint[0].time[x]) > 0 ) {
          currDiff = (measures[x + 1] - measures[x]) / (this.DataPoint[0].time[x + 1] - this.DataPoint[0].time[x])

          if(x > 0 && currDiff != prevValue && currDiff == 0) {
            currValue = Number(measures[x].toFixed(3));

            if (lastValue != 0) { 
              deltaValue = currValue - lastValue;
            }    

            if(lastValue == 0 || Number(deltaValue.toFixed(3)) > 0.1) {

              if (lastValue != 0) {
                labelText = currValue + " " + measureUM + " (" + deltaValue.toFixed(3) + " " + measureUM + " )";
              }
              else
              {
                labelText = currValue + " " + measureUM;
              }

              lastValue = currValue;

              points.push({
                x: this.DataPoint[0].time[x],  
                y: Number(measures[x].toFixed(3)),
                  yAxisIndex: this.subGetAxisIndex(measureID),
                  seriesIndex: this.subGetSeriesIndex(measureID),
                  label: {
                    text: labelText,
                    position: 'top',
                    style: {
                      color: this.subGetColorByPlot(measureID),
                      background: "#000000",
                      fontFamily: "Arial, sans-serif",
                      fontSize: '10px',
                    }
                  }
                }
              );    
              
            }
            else
            {
              currDiff = 0;
            }
                
          } 
          
          prevValue = currDiff;

        }
        
    }

    this.chartObj.updateOptions({
      annotations: {
        points: points
      }
    });
    this.cd.detectChanges()
  }  

  subLoadAxisConfig(key: string) {
    if (this.axesConfig.AxesScale[key].Xmin == 0 && this.axesConfig.AxesScale[key].Xmax == 0) { return }
    for (let index = 0; index < this.AxisValues.length; index++) {
      
      if (this.AxisValues[index].enabled == true) {
        switch (index) {
          case 0: 
            this.AxisValues[index].min = this.axesConfig.AxesScale[key].Xmin;
            this.AxisValues[index].max = (this.axesConfig.AxesScale[key].Xmax * this.chartAxisOffSet[index] / 100);
            this.AxisValues[index].value = this.axesConfig.AxesScale[key].Xmax;
            this.AxisValues[index].textMin = this.axesConfig.AxesScale[key].Xmin;
            this.AxisValues[index].textMax = this.axesConfig.AxesScale[key].Xmax;
            this.AxisValues[index].DefaultMin = this.axesConfig.AxesScale[key].Xmin;
            this.AxisValues[index].DefaultMax = this.axesConfig.AxesScale[key].Xmax;
            this.xaxis.max = this.AxisValues[index].textMax;
            this.xaxis.min = this.AxisValues[index].textMin;
            break;
          case 1:
            this.AxisValues[index].min = this.axesConfig.AxesScale[key].YAxes1MIN;
            this.AxisValues[index].max = (this.axesConfig.AxesScale[key].YAxes1MAX * this.chartAxisOffSet[index] / 100);
            this.AxisValues[index].value = this.axesConfig.AxesScale[key].YAxes1MAX;
            this.AxisValues[index].textMin = this.axesConfig.AxesScale[key].YAxes1MIN;
            this.AxisValues[index].textMax = this.axesConfig.AxesScale[key].YAxes1MAX;
            this.AxisValues[index].DefaultMin = this.axesConfig.AxesScale[key].YAxes1MIN;
            this.AxisValues[index].DefaultMax = this.axesConfig.AxesScale[key].YAxes1MAX;                  
            break;
          case 2:
            this.AxisValues[index].min = this.axesConfig.AxesScale[key].YAxes2MIN;
            this.AxisValues[index].max = (this.axesConfig.AxesScale[key].YAxes2MAX * this.chartAxisOffSet[index] / 100);
            this.AxisValues[index].value = this.axesConfig.AxesScale[key].YAxes2MAX;
            this.AxisValues[index].textMin = this.axesConfig.AxesScale[key].YAxes2MIN;
            this.AxisValues[index].textMax = this.axesConfig.AxesScale[key].YAxes2MAX;
            this.AxisValues[index].DefaultMin = this.axesConfig.AxesScale[key].YAxes2MIN;
            this.AxisValues[index].DefaultMax = this.axesConfig.AxesScale[key].YAxes2MAX;                
            break;
          case 3:
            this.AxisValues[index].min = this.axesConfig.AxesScale[key].YAxes3MIN;
            this.AxisValues[index].max = (this.axesConfig.AxesScale[key].YAxes3MAX * this.chartAxisOffSet[index] / 100);
            this.AxisValues[index].value = this.axesConfig.AxesScale[key].YAxes3MAX;
            this.AxisValues[index].textMin = this.axesConfig.AxesScale[key].YAxes3MIN;
            this.AxisValues[index].textMax = this.axesConfig.AxesScale[key].YAxes3MAX;
            this.AxisValues[index].DefaultMin = this.axesConfig.AxesScale[key].YAxes3MIN;
            this.AxisValues[index].DefaultMax = this.axesConfig.AxesScale[key].YAxes3MAX;   
            break;
          case 4:
            this.AxisValues[index].min = this.axesConfig.AxesScale[key].YAxes4MIN;
            this.AxisValues[index].max = (this.axesConfig.AxesScale[key].YAxes4MAX * this.chartAxisOffSet[index] / 100);
            this.AxisValues[index].value = this.axesConfig.AxesScale[key].YAxes4MAX;
            this.AxisValues[index].textMin = this.axesConfig.AxesScale[key].YAxes4MIN;
            this.AxisValues[index].textMax = this.axesConfig.AxesScale[key].YAxes4MAX;
            this.AxisValues[index].DefaultMin = this.axesConfig.AxesScale[key].YAxes4MIN;
            this.AxisValues[index].DefaultMax = this.axesConfig.AxesScale[key].YAxes4MAX;    
            break;
        }
        
        if (index > 0) {
          this.yaxis[this.AxisValues[index].axisIndex].min = this.AxisValues[index].textMin;
          this.yaxis[this.AxisValues[index].axisIndex].max = this.AxisValues[index].textMax;          
        }  
      }
    }

    this.chartObj.updateOptions({
      xaxis: this.xaxis,
      yaxis: this.yaxis
    });
  
  }

  subGetAxisIndex(measureID: number): number {

    let seriesName: string = this.subGetShortname(measureID);

    for (let index = 1; index < this.AxisValues.length; index++) {
      if (this.AxisValues[index].enabled == true) {
        if (this.AxisValues[index].seriesName.includes(seriesName)) {
          return this.AxisValues[index].axisIndex;
        }
      }
    }

    return -1;
  }

  subGetSeriesIndex(measureID: number): number {

    let seriesName: string = this.subGetShortname(measureID);

    for (let index = 0; index < this.series.length; index++) {
        if (this.series[index].name?.includes(seriesName)) {
          return index;
        }
    }

    return -1;
  }

  subGetColorByPlot(measureID: number): string {
    let index = this.axesConfig.Plots[this.KeyPlot].Plot.indexOf(measureID);
    return this.axesConfig.PlotColors[this.KeyPlot].Color[index];
  }

  subPrintGraphAndData() {
  
    this.subChangeGraphColors("#000000");
  
    this.chartObj.updateOptions({
      chart: {
        background: "#FFFFFF"
      },
      yaxis: this.yaxis,
      xaxis: this.xaxis
    });

    this.chartObj.dataURI().then((res: { imgURI: string } | { blob: Blob }) => {
      if ('imgURI' in res && typeof res.imgURI === 'string') {
        const base64Only = res.imgURI.replace(/^data:image\/png;base64,/, '');

        const payload = {
          fileName: 'chart.png',
          contentType: 'image/png',
          imageBase64: base64Only,
          MeasurID: this.MeasureID,
          measuresInfo: this.measuresinfo,
          MeasurColl: this.MeasurColl,
          seriesItems: this.subGetSeries(this.series),
          axesConfig: this.axesConfig,
          headerData: this.subHeaderInformations(this.tableData),
          sequenceData: this.detailsRows,
          sequencesHeaders: this.sequenceHeaders
        };

        this.http.post<any>(this.httpConfig.baseurl + '/query/printgraphdata', payload).subscribe({
          next: (res) => {
            if (res.result = "OK") 
            {
              let byteArray = Uint8Array.from(atob(res.fileBase64), c => c.charCodeAt(0));
              let blob = new Blob([byteArray], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              });
              let url = window.URL.createObjectURL(blob);
              let a = document.createElement('a');
              a.href = url;
              a.download = res.filename;
              a.click();
              window.URL.revokeObjectURL(url);
            }
          },
          error: (err) => console.error(err)
        });
      };
    });

    this.subChangeGraphColors("#FFFFFF");
    this.chartObj?.updateOptions({
      chart: {
        background: "#000000"
      },
      yaxis: this.yaxis,
      xaxis: this.xaxis
    });
  }

  subChangeGraphColors(currColor: string) {
    this.yaxis.forEach((item: ApexYAxis) => {      
        item.axisTicks = item.axisTicks ?? {};
        item.axisTicks.color = currColor;

        item.axisBorder = item.axisBorder ?? {}; 
        item.axisBorder.color = currColor;
        
        item.labels = item.labels ?? {};
        item.labels.style = item.labels.style ?? {};
        item.labels.style.colors = currColor;
        
        item.title = item.title ?? {};
        item.title.style = item.title.style ?? {};
        item.title.style.color = currColor;
    })
    
    this.xaxis.axisTicks = this.xaxis.axisTicks ?? {};
    this.xaxis.axisTicks.color = currColor

    this.xaxis.axisBorder = this.xaxis.axisBorder ?? {};
    this.xaxis.axisBorder.color = currColor

    this.xaxis.labels =  this.xaxis.labels ?? {};
    this.xaxis.labels.style =  this.xaxis.labels.style ?? {};
    this.xaxis.labels.style.colors = currColor;

    this.xaxis.title = this.xaxis.title ?? {};
    this.xaxis.title.style =  this.xaxis.title.style ?? {};
    this.xaxis.title.style.color = currColor;
  }

  subHeaderInformations(header: tabledata[]): any[] {
    let r: any[] = [];
    this.headerInfos.forEach(i => {
      let itm = header.find(h => h.name == i.field) ?? null;
      if (itm != null) {
        r.push({name: i.name, value: itm.value, description: itm.description });
      } 
    })

    r.push ({name: "Date Print", value: new Date().toISOString().replace("T", " ").replace("Z", " "), description: ""});

    return r;
  }
  
  subGetSeries(series: any[]): any[] {
    let seriesItem: any[] = [];
    for (let s = 0; s < series.length; s++) {
      seriesItem.push(this.getMeasureID(this.series[s].name?.toString() ?? "") ?? -2);
    }
    return seriesItem;
  }

  subChartDialogShow() {
    let seriesItem: any[] = [];
    for (let s = 0; s < this.series.length; s++) {
      seriesItem.push(this.getMeasureID(this.series[s].name?.toString() ?? "") ?? -2);
    }
    const dialogRef = this.chartDialog.open(ChartSettingsComponent, {
      data: { measuresinfo: this.measuresinfo, axesConfig: this.axesConfig, series: seriesItem },
      ariaModal: true,
      disableClose: true,
      hasBackdrop: true,     
    });
    
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result !== undefined) {

        this.axesConfig = result;

        this.series.forEach(s => {
          let measureID = this.getMeasureID(s.name?.toString() ?? "") ?? -2;
          let index = this.axesConfig.Plots[this.KeyPlot].Plot.indexOf(measureID);
          if (index !== -1) {
            if (this.axesConfig.VisiblePlots[this.KeyPlot].Plot[index] == false) {
              s.hidden = true;
            }
            else            {
              this.chartObj.showSeries(s.name ?? "");
              s.hidden = false;   
            }
          }
        });  

        this.chartObj.updateOptions({
          series: this.series,        
        });

      } 
    });
  }

  getMeasureID(measureName: string): number | null {
    const measure = this.measuresinfo.find(x => x.shortname === measureName);
    return measure ? measure.measureID : -99;
  }

  IsCursorsEnabled: boolean[] = [false, false];
  subCursorsEnabled(checked: any) {
    if(checked == false) {
      this.IsCursorsEnabled[1] = false;
      this.resetAnnotation();
      this.cursortype = true;
    }
    else {
      if (this.IsCursorsEnabled[1] == true && this.IsCursorsEnabled[0] == true) {
        this.subCursorsFreeMode(true);
      }

      if (this.buttonpressed[this.buttonNames.ShowPeaks] || this.buttonpressed[this.buttonNames.ShowConstantValues]) {
        this.chartObj.updateOptions({
          annotations: {
            points: []
          }
        });
      }
      this.subResetBtn();
    }
  }

  subCursorsFreeMode(checked: any) {
    if (this.IsCursorsEnabled[1] == true && this.IsCursorsEnabled[0] == false) { return }
    this.resetAnnotation();
    this.cursortype = false;
  }

  resetAnnotation() {
      this.chartObj.clearAnnotations();
      for(let index = 0; index <= this.CursorValues.length; index++) {
        this.CursorValues = this.clearCursor(index);
      }
      this.cd.detectChanges();
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

  convertSecondiToTime(a: number): string {
    let tot_sec = a;
    let tot_min = Math.floor(tot_sec / 60);
    let tot_ore = Math.floor(tot_min / 60);

    tot_sec = tot_sec - (tot_min * 60);
    tot_min = tot_min - (tot_ore * 60);

    // --- Formattazione dei secondi come "00.00"
    const str_tot_sec = tot_sec.toFixed(2).padStart(5, "0");

    // --- Formattazione minuti a 2 cifre
    const str_tot_min = String(tot_min).padStart(2, "0");

    // --- Le ore rimangono senza zeri iniziali (comportamento VB6 in questo caso)
    const str_tot_ore = String(tot_ore).padStart(2, "0");

    return `${str_tot_ore}:${str_tot_min} - (${str_tot_sec})`;
  }

  @HostListener('window:resize')
  onResize() {
    this.updateChartHeight();
  }

  goBack() {
    this.router.navigate(['pagina-details']);
  }

}
