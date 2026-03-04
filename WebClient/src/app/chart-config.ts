export interface DataPoint {
  time: number[],
  measure: number[],
  color: string,
  name: string,
  AxisType: number
}
export interface AxisValues {
  min: number,
  max: number,
  value: number,
  textMin:number;
  textMax:number;
  enabled: boolean
}
export interface CursorValues {
  x: number,
  y: number,
  name: string,
  color: string
}
