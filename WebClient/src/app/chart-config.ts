export interface DataPoint {
  time: number[],
  measure: number[],
  color: string,
  name: string,
  AxisType: number
}
export interface AxisValues {
  min: number,
  max: number
}
export interface CursorValues {
  x: number,
  y: number,
  name: string,
  color: string
}
