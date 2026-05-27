import { Component } from '@angular/core';
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
import { TestsExecutionChartDataService } from './tests-chart-service';
import {
  AfterViewInit,
  ElementRef,
  OnDestroy,
  ViewChild,
  HostListener
} from '@angular/core';

@Component({
  selector: 'tests-execution-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './tests-chart-component.html',
  styleUrls: ['./tests-chart-component.css']
})
export class TestsExecutionChartComponent implements AfterViewInit, OnDestroy {
  constructor(private router: Router, private http: HttpClient, public testExecution: TestsExecutionChartDataService) { }

  @ViewChild('chartObj') chartObj!: ApexChartComponent;  
  @ViewChild('chartWrapper') chartWrapper!: ElementRef<HTMLElement>;

  private resizeObserver?: ResizeObserver;
  private readonly fallbackChartHeight = 500;

  series: ApexAxisChartSeries = [];
  chart: ApexChart = {
    type: 'area',       
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
 
  detailsRows: any[] = []; 

  ngOnInit() {
    this.detailsRows = this.testExecution.detailsRows();
    if (this.detailsRows.length === 0) {
      return;
    }

    this.initChartData();
  } 
  
  initChartData () {
    this.series = [
      {
        data: this.detailsRows.map(row => ({
          x: row.description,
          y: [Number(row.startSequence), Number(row.endSequence)],
          fillColor: this.subGetResultColor(row.result)
        }))
      }
    ];
    this.chart = {
      type: 'rangeBar',
      background: "#000000",
      stacked: false,
      redrawOnParentResize: true,
      redrawOnWindowResize: true,
      height: this.getChartHeight(),
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
      enabled: true,
      textAnchor: 'start',
      offsetX: 8,
      formatter: (_val, opts) => {
        const row = this.detailsRows[opts.dataPointIndex];
        return row.nr + " - " + row.description;
      },
      style: {
        fontSize: '8px',
        fontFamily: 'Tahoma',
        fontWeight: 500,
        colors: ['#FFFFFF']
      },
      background: {
        enabled: false
      }
    };

    this.plotOptions = {
      bar: {
        horizontal: true,
        barHeight: '60%',
        rangeBarGroupRows: false,
        dataLabels: {
          maxItems: this.detailsRows.length,
          position: 'right',
          orientation: 'horizontal',
          hideOverflowingLabels: false
        }
      }
    };
    this.yaxis = [
      {
        labels: {
          show: false
        },
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        }
      }
    ];    
    this.xaxis = {
      type: "numeric",
      position: 'bottom',
      min: Number(this.detailsRows[0].startSequence),
      max: Number(this.detailsRows[this.detailsRows.length - 1].endSequence),
      decimalsInFloat: 2,      
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
      title: {  
        text: "Time (s)",
        style: {
          color: "#FFFFFF"
        }
      },
      labels: {  
        style: {
          colors: "#FFFFFF"
        }
      }  
    }; 
    this.tooltip = {
      custom: ({ seriesIndex, dataPointIndex, w }) => {
        const point = w.config.series[seriesIndex].data[dataPointIndex];
        const start = Number(point.y[0]).toFixed(2);
        const end = Number(point.y[1]).toFixed(2);

        return `
          <div style="padding: 6px 8px;">
            <div>${point.x}</div>
            <div>${start} - ${end}</div>
          </div>
        `;
      }
    };  
  }

  ngAfterViewInit(): void {
    this.resizeObserver = new ResizeObserver(() => this.updateChartHeight());
    this.resizeObserver.observe(this.chartWrapper.nativeElement);

    requestAnimationFrame(() => this.updateChartHeight());
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  subGetResultColor(result: string): string {
    let r = result.split("-")[0];
    switch (r) {
      case "1":
        return "#00ff00"
      case "0":
        return "#ff0000"
      case "4":
        return "#FFFF00"
      case "7":
        return "#00CCFF"
      default:
        return "#FFFFFF"
    }
  } 

  getTickAmount(): number {
    return (Math.round(this.detailsRows[this.detailsRows.length - 1].endSequence * 5))
  }

  private updateChartHeight(): void {
    const newHeight = this.getChartHeight();

    this.chart = {
      ...this.chart,
      height: newHeight
    };

    this.chartObj?.updateOptions({
      chart: {
        height: newHeight
      }
    });
  }  

  private getChartHeight(): number {
    return this.chartWrapper?.nativeElement.clientHeight || this.fallbackChartHeight;
  }

  // getChartHeight(): number {
  //   const rowHeight = 36;
  //   const minHeight = this.chartWrapper?.nativeElement.clientHeight || this.fallbackChartHeight;

  //   return Math.max(minHeight, this.detailsRows.length * rowHeight);
  // }


  @HostListener('window:resize')
  onResize() {
    this.updateChartHeight();
  }

}
