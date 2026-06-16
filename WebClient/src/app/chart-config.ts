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
  x: number | string,
  y: number | string,
  name: string,
  color: string
  pointX: number,
  pointY: number,
  id: string
}
export interface StructPlot {
  Plot: number[]
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
  Xmin: number;
  Xmax: number;
  YAxes1MIN: number;
  YAxes1MAX: number;
  YAxes2MIN: number;
  YAxes2MAX: number;
  YAxes3MIN: number;
  YAxes3MAX: number;
  YAxes4MIN: number;
  YAxes4MAX: number;
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

export interface ChartData {
  MeasurID: number[];
  MeasurColl: number[][];
}

export interface timeinfo {
  title: string;
  description: string;
}

export interface tablevalues {
  color: string;
  values: number[];
}

export interface tabledata {
  name: string;
  field: string;
  value: string;
  description: string;
}

export interface tabledetails {
  SequenceNumber: string;
  description: string;
  result: string;
  startSequence: string;
  endSequence: string;
}

export  enum  buttonsChart  {
  Default = 'Default',
  LoadXYAxis = 'LoadXYAxis',
  SaveXYAxis = 'SaveXYAxis',
  ToggleLegend = 'ToggleLegend',
  ShowGrid = 'ShowGrid',
  ShowPeaks = 'ShowPeaks',
  ShowConstantValues = 'ShowConstantValues',
  ShowTestsExecution = 'ShowTestsExecution'
}