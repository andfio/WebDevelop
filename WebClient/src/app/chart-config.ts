import { ApexAnnotations } from "ng-apexcharts";

export interface DataPoint {
  time: number[],
  measure: number[],
  color: string,
  name: string,
  AxisType: number
}
export interface AxisValues {
  seriesName: string[],
  axisIndex: number,
  min: number,
  max: number,
  value: number,
  textMin:number;
  textMax:number;
  DefaultMin:number;
  DefaultMax:number;
  enabled: boolean
}
export interface CursorValues {
  x: number,
  y: number,
  name: string,
  color: string
  pointX: number,
  pointY: number,
  id: string
}
export interface StructPlot {
  Plot: Number[]
}

export interface Plots {
  [key: string]: StructPlot;
}

export interface StructVisiblePlot {
  Plot: boolean[]
}

export interface VisiblePlots {
  [key: string]: StructVisiblePlot;
}

export interface StructPlotColors {
  Color: string[],
}

export interface PlotColors {
  [key: string]: StructPlotColors;
}

export interface StructAxesScale {
  Xmin: Number[];
  Xmax: Number[];
  YAxes1MIN: Number[];
  YAxes1MAX: Number[];
  YAxes2MIN: Number[];
  YAxes2MAX: Number[];
  YAxes3MIN: Number[];
  YAxes3MAX: Number[];
  YAxes4MIN: Number[];
  YAxes4MAX: Number[];
}
export interface AxesScale {
  [key: string]: StructAxesScale;
}

export interface AxesConfig {
  Plots: Plots;
  VisiblePlots: VisiblePlots;
  PlotColors: PlotColors;
  AxesScale: AxesScale;
}

export interface chartsettings {
  measure: string[];
  plotcolor: string[];
  enableplot: boolean[];
}

export interface measuresinfo {
  measureID: number;
  description: string;
  shortname: string;
  UM: string;
  offSet: number;
  axesposition: number;
  UnitTypeID: number;
}