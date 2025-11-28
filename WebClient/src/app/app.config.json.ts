export interface Filters {
    name: string;
    type: string;
    values?: string[] | number[]
    format?: string;
}
export interface Columns {
    name: string;
    width: number;
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
    query: structQuery;
}
export interface filterValues {
  [key: string]: string | number | null;
}
