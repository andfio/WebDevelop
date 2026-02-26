export interface DataPoint {
  time: number[],
  measure: number[],
  color: string,
  name: string
}
export interface AxisValues {
  min: number,
  max: number
}