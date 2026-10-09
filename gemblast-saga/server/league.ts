import { leagueDay, leagueWeek, type LeaderboardRow } from '../src/utils/competition';
import { LeagueError, nicknameFor, verifyLeagueRun } from './replay';
import { type LeagueDB } from './database';

const json = (data: unknown,status=200) => Response.json(data,{status,headers:{'cache-control':'no-store'}});
function identity(request: Request) {
  const id = request.headers.get('oai-authenticated-user-id');
  if (!id) throw new LeagueError(401,'Lig için hesabına giriş yap.');
  return id;
}
async function readBody(request:Request) {
  if (!(request.headers.get('content-type')??'').includes('application/json')) throw new LeagueError(415,'JSON oyun kaydı gerekiyor.');
  const declared = Number(request.headers.get('content-length'));
  if (declared>32768) throw new LeagueError(413,'Oyun kaydı çok büyük.');
  const text = await request.text();
  if (new TextEncoder().encode(text).length>32768) throw new LeagueError(413,'Oyun kaydı çok büyük.');
  try {return JSON.parse(text);} catch {throw new LeagueError(400,'Oyun kaydı okunamadı.');}
}
export async function leagueAPI(request:Request,db:LeagueDB,now=new Date()) {
  try {
    const path = new URL(request.url).pathname, today=leagueDay(now), week=leagueWeek(today);
    if (request.method!=='GET') {
      const origin = request.headers.get('origin');
      if (origin && origin!==new URL(request.url).origin) throw new LeagueError(403,'Bu istek oyun sayfasından gönderilmeli.');
      if (request.headers.get('sec-fetch-site')==='cross-site') throw new LeagueError(403,'Bu istek oyun sayfasından gönderilmeli.');
    }
    if (path==='/api/league/board' && request.method==='GET') {
      const period = new URL(request.url).searchParams.get('period')==='daily' ? 'daily' : 'weekly';
      const id = request.headers.get('oai-authenticated-user-id');
      const filter = period==='daily' ? 's.day = ?' : 's.week = ?';
      const group = `SELECT s.player_id,p.nickname,SUM(s.score) AS score,COUNT(*) AS days FROM league_scores s JOIN league_players p ON p.player_id=s.player_id WHERE ${filter} GROUP BY s.player_id`;
      const ranked = `WITH totals AS (${group}), ranked AS (SELECT *,RANK() OVER (ORDER BY score DESC) AS rank FROM totals)`;
      type Row={player_id:string;nickname:string;score:number;days:number;rank:number};
      const key = period==='daily'?today:week;
      const [top,mine,count,player,weekly] = await Promise.all([
        db.prepare(`${ranked} SELECT * FROM ranked ORDER BY score DESC,player_id LIMIT 50`).bind(key).all<Row>(),
        id ? db.prepare(`${ranked} SELECT * FROM ranked WHERE player_id=?`).bind(key,id).first<Row>() : null,
        db.prepare(`SELECT COUNT(*) AS total FROM (${group})`).bind(key).first<{total:number}>(),
        id ? db.prepare('SELECT nickname FROM league_players WHERE player_id=?').bind(id).first<{nickname:string}>() : null,
        id ? db.prepare('WITH totals AS (SELECT player_id,SUM(score) AS score FROM league_scores WHERE week=? GROUP BY player_id), ranked AS (SELECT *,RANK() OVER (ORDER BY score DESC) AS rank FROM totals) SELECT score,rank FROM ranked WHERE player_id=?').bind(week,id).first<{score:number;rank:number}>() : null,
      ]);
      const display = (row:Row):LeaderboardRow => ({nickname:row.nickname,score:row.score,days:row.days,rank:row.rank,mine:row.player_id===id});
      return json({today,week,period,rows:top.results.map(display),me:mine?display(mine):null,total:count?.total??0,signedIn:!!id,nickname:player?.nickname??null,weeklyScore:weekly?.score??0,weeklyRank:weekly?.rank??null});
    }
    if (path==='/api/league/profile' && request.method==='POST') {
      const id=identity(request), body=await readBody(request), nickname=nicknameFor(body?.nickname);
      await db.prepare('INSERT INTO league_players(player_id,nickname,updated_at) VALUES(?,?,?) ON CONFLICT(player_id) DO UPDATE SET nickname=excluded.nickname,updated_at=excluded.updated_at').bind(id,nickname,now.toISOString()).run();
      return json({nickname});
    }
    if (path==='/api/league/score' && request.method==='POST') {
      const id=identity(request), body=await readBody(request);
      if (!await db.prepare('SELECT nickname FROM league_players WHERE player_id=?').bind(id).first()) throw new LeagueError(400,'Önce lig ekranından bir oyuncu adı seç.');
      const window=now.toISOString().slice(0,13);
      const limit=await db.prepare('INSERT INTO league_limits(player_id,window,count) VALUES(?,?,1) ON CONFLICT(player_id) DO UPDATE SET window=excluded.window,count=CASE WHEN league_limits.window=excluded.window THEN league_limits.count+1 ELSE 1 END WHERE league_limits.window<>excluded.window OR league_limits.count<30').bind(id,window).run();
      if (!limit.meta.changes) throw new LeagueError(429,'Çok sık skor gönderildi. Biraz sonra yeniden dene.');
      const result=verifyLeagueRun(body,now);
      await db.prepare('INSERT INTO league_scores(player_id,day,week,score,turns,submitted_at) VALUES(?,?,?,?,?,?) ON CONFLICT(player_id,day) DO UPDATE SET score=excluded.score,turns=excluded.turns,submitted_at=excluded.submitted_at WHERE excluded.score>league_scores.score').bind(id,result.day,result.week,result.score,result.turns,now.toISOString()).run();
      const best=await db.prepare('SELECT score FROM league_scores WHERE player_id=? AND day=?').bind(id,result.day).first<{score:number}>();
      return json({accepted:true,score:result.score,best:best!.score,day:result.day});
    }
    if (path==='/api/league/me' && request.method==='DELETE') {
      const id=identity(request);
      await db.batch([
        db.prepare('DELETE FROM league_scores WHERE player_id=?').bind(id),
        db.prepare('DELETE FROM league_limits WHERE player_id=?').bind(id),
        db.prepare('DELETE FROM league_players WHERE player_id=?').bind(id),
      ]);
      return json({deleted:true});
    }
    return json({error:'Bu lig isteği bulunamadı.'},404);
  } catch (error) {
    if (error instanceof LeagueError) return json({error:error.message},error.status);
    console.error('League database request failed.');
    return json({error:'Lig şu anda açılamıyor. Oyunun ve cihazındaki kayıtların korunuyor; yeniden dene.'},503);
  }
}
