export interface configFilters {
    name: string;
    type: string;
    values?: string[] | number[]
    format?: string;
}
export interface configColumns {
    name: string;
    with: number;
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
    filters: configFilters[];
    columns: configColumns[];
    query: structQuery;
}