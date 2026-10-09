import type { Coord } from './boardEngine';

export type LeagueAction = { kind: 'move'; path: Coord[]; loop: boolean } | { kind: 'shuffle' };
export interface CompetitionTrace { version: 1; actions: LeagueAction[] }
export const LEAGUES = [
  {name:'Filiz',min:0,tone:'seed'}, {name:'Köz',min:2000,tone:'coral'},
  {name:'Gelgit',min:6000,tone:'cobalt'}, {name:'Nova',min:12000,tone:'amber'},
  {name:'Eter',min:22000,tone:'violet'},
] as const;
export function leagueFor(score: number) {
  let index = 0;
  LEAGUES.forEach((league,i) => {if (score >= league.min) index=i;});
  return { ...LEAGUES[Math.max(0,index)], next: LEAGUES[index+1] ?? null };
}
export function leagueDay(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
  const part = (type: string) => parts.find(p=>p.type===type)!.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}
export function validDay(day: unknown): day is string {
  return typeof day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(day) && !Number.isNaN(Date.parse(day+'T12:00:00Z')) && new Date(day+'T12:00:00Z').toISOString().slice(0,10)===day;
}
export function leagueWeek(day: string) {
  const date = new Date(day+'T12:00:00Z');
  date.setUTCDate(date.getUTCDate() - (date.getUTCDay()+6)%7);
  return date.toISOString().slice(0,10);
}
export function validTrace(value: unknown): value is CompetitionTrace {
  if (!value || typeof value !== 'object') return false;
  const trace = value as CompetitionTrace;
  return trace.version===1 && Array.isArray(trace.actions) && trace.actions.length<=26 && trace.actions.every(action => {
    if (!action || typeof action !== 'object') return false;
    if (action.kind==='shuffle') return true;
    return action.kind==='move' && typeof action.loop==='boolean' && Array.isArray(action.path) && action.path.length>=3 && action.path.length<=37 && action.path.every(coord => Array.isArray(coord) && coord.length===2 && coord.every(n=>Number.isInteger(n)&&n>=0&&n<6));
  });
}
export interface LeaderboardRow { nickname:string; score:number; rank:number; days:number; mine:boolean }
export interface LeaderboardData {
  today:string; week:string; period:'daily'|'weekly'; rows:LeaderboardRow[];
  me:LeaderboardRow|null; total:number; signedIn:boolean;
  nickname:string|null; weeklyScore:number; weeklyRank:number|null;
}
