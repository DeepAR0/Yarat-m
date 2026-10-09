export interface DBStatement {
  bind(...values: unknown[]): DBStatement;
  first<T = Record<string,unknown>>(): Promise<T|null>;
  all<T = Record<string,unknown>>(): Promise<{results:T[]}>;
  run(): Promise<{meta:{changes?:number}}>;
}
export interface LeagueDB {prepare(sql:string):DBStatement; batch(statements:DBStatement[]):Promise<unknown[]>}
