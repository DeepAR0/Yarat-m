import type { LeaderboardData } from './competition';
import type { Session } from './session';

export class LeagueAPIError extends Error {
  constructor(public status:number,message:string) {super(message);}
}
export async function leagueRequest<T>(path:string,method='GET',body?:unknown):Promise<T> {
  const controller=new AbortController(), timer=setTimeout(()=>controller.abort(),10000);
  try {
    const response=await fetch('/api/league/'+path,{method,credentials:'same-origin',signal:controller.signal,headers:body===undefined?undefined:{'content-type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
    if (!(response.headers.get('content-type')??'').includes('application/json')) throw new LeagueAPIError(401,'Lig için hesabına giriş yap.');
    const data=await response.json();
    if (!response.ok) throw new LeagueAPIError(response.status,data.error??'Lig isteği tamamlanamadı.');
    return data as T;
  } catch (error) {
    if (error instanceof LeagueAPIError) throw error;
    throw new LeagueAPIError(0,'Lige bağlanılamadı. İnternet bağlantını kontrol edip yeniden dene.');
  } finally {clearTimeout(timer);}
}
export const readLeaderboard=(period:'daily'|'weekly')=>leagueRequest<LeaderboardData>('board?period='+period);
export function submitLeagueScore(session:Session) {
  return leagueRequest<{accepted:boolean;score:number;best:number;day:string}>('score','POST',{day:session.dailyKey,trace:session.competition,claimedScore:session.score});
}
