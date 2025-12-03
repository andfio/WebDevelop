export interface Filters {
    name: string;
    type: string;
    values?: string[] | number[]
    format?: string;
}
export interface Columns {
    name: string;
    field: string;
}
export interface ColumnsRootDetails {
    name: string;
    field: string;
}
export interface ColumnsDetails {
    name: string;
    field: string;
}
export interface ColumnsMeasureDetails {
    name: string;
    field: string;
}
export interface ColumnsParametersDetails {
    name: string;
    field: string;
}
export interface queryfilters {
    filters: string;
    sql: string;
}
export interface structQuery {
    select: string;
    from: string;
    where: string;
    conditions: queryfilters[];
}
export interface AppConfig {
    filters: Filters[];
    columns: Columns[];
    columnsrootdetails: ColumnsRootDetails[];
    columnsdetails: ColumnsDetails[];
    columnsmeasuredetails: ColumnsMeasureDetails[];
    columnsparametersdetails: ColumnsParametersDetails[];
    query: structQuery;
    querydetails: structQuery;
}
export interface filterValues {
  [key: string]: string | number | undefined;
}
