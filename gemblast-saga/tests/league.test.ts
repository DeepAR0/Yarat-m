import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import { leagueAPI } from '../server/league';
import { LeagueError, nicknameFor, verifyLeagueRun } from '../server/replay';
import type { DBStatement, LeagueDB } from '../server/database';
import { leagueDay, leagueWeek, leagueFor } from '../src/utils/competition';
import { findSuggestedPath } from '../src/utils/boardEngine';
import { commitMove, createSession, defaultProfile, parseProfile, recordSession, shuffleSession } from '../src/utils/session';

const now=new Date('2026-10-08T12:00:00Z');
function completed(day='2026-10-08',shuffle=false) {
  let session=createSession('daily',1,new Date(day+'T12:00:00Z'));
  if(shuffle) session=shuffleSession(session);
  while(session.outcome==='playing') {
    const path=findSuggestedPath(session.grid);
    assert.ok(path);
    const move=commitMove(session,path,false);
    assert.ok(move);session=move.next;
  }
  return session;
}
const payload=(session=completed())=>({day:session.dailyKey,trace:session.competition,claimedScore:session.score});

class Statement implements DBStatement {
  constructor(private db:DatabaseSync,private sql:string,private values:SQLInputValue[]=[]) {}
  bind(...values:unknown[]) {return new Statement(this.db,this.sql,values as SQLInputValue[]);}
  async first<T>() {return (this.db.prepare(this.sql).get(...this.values)??null) as T|null;}
  async all<T>() {return {results:this.db.prepare(this.sql).all(...this.values) as T[]};}
  async run() {return {meta:{changes:Number(this.db.prepare(this.sql).run(...this.values).changes)}};}
}
function database():LeagueDB {
  const db=new DatabaseSync(':memory:');
  db.exec(readFileSync(new URL('../drizzle/0000_gorgeous_caretaker.sql',import.meta.url),'utf8'));
  return {
    prepare(sql){return new Statement(db,sql);},
    async batch(statements){db.exec('BEGIN');try {const results=[];for(const statement of statements)results.push(await statement.run());db.exec('COMMIT');return results;}catch(error){db.exec('ROLLBACK');throw error;}}
  };
}
function request(path:string,method='GET',id?:string,body?:unknown,origin?:string) {
  const headers=new Headers();
  if(id)headers.set('oai-authenticated-user-id',id);
  if(body!==undefined)headers.set('content-type','application/json');
  if(origin)headers.set('origin',origin);
  return new Request('https://game.test/api/league/'+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body)});
}
async function profile(db:LeagueDB,id:string,nickname:string) {
  assert.equal((await leagueAPI(request('profile','POST',id,{nickname}),db,now)).status,200);
}
async function score(db:LeagueDB,id:string,day='2026-10-08',shuffle=false) {
  const response=await leagueAPI(request('score','POST',id,payload(completed(day,shuffle))),db,now);
  assert.equal(response.status,200);return response.json();
}

test('League day changes at Istanbul midnight; weeks start Monday and tiers use total points',()=>{
  assert.equal(leagueDay(new Date('2026-10-11T20:59:59Z')),'2026-10-11');
  assert.equal(leagueDay(new Date('2026-10-11T21:00:00Z')),'2026-10-12');
  assert.equal(leagueWeek('2026-10-11'),'2026-10-05');
  assert.equal(leagueWeek('2026-10-12'),'2026-10-12');
  assert.equal(leagueFor(1999).name,'Filiz');assert.equal(leagueFor(2000).name,'Köz');
});

test('Server reproduces the completed daily run, including shuffle and saved progress',()=>{
  let session=shuffleSession(createSession('daily',1,now));
  const first=commitMove(session,findSuggestedPath(session.grid)!,false)!;
  session=parseProfile(JSON.stringify(recordSession(defaultProfile(),first.next))).sessions.daily!;
  while(session.outcome==='playing')session=commitMove(session,findSuggestedPath(session.grid)!,false)!.next;
  const verified=verifyLeagueRun(payload(session),now);
  assert.equal(verified.score,session.score);assert.equal(verified.turns,session.turns);
  const legacy=recordSession(defaultProfile(),createSession('daily',1,now));
  delete legacy.sessions.daily!.competition;
  assert.ok(parseProfile(JSON.stringify(legacy)).sessions.daily);
});

test('Replay rejects claimed scores, unfinished games, invalid paths, excessive shuffles and postgame actions',()=>{
  const valid=payload();
  assert.throws(()=>verifyLeagueRun({...valid,claimedScore:9999999},now),LeagueError);
  assert.throws(()=>verifyLeagueRun(payload(createSession('daily',1,now)),now),LeagueError);
  assert.throws(()=>verifyLeagueRun({...valid,trace:{version:1,actions:[{kind:'move',path:[[0,0],[0,0],[0,0]],loop:false}]}},now),LeagueError);
  assert.throws(()=>verifyLeagueRun({...valid,trace:{version:1,actions:[{kind:'shuffle'},{kind:'shuffle'},{kind:'shuffle'}]}},now),LeagueError);
  assert.throws(()=>verifyLeagueRun({...valid,trace:{version:1,actions:[...valid.trace!.actions,{kind:'shuffle'}]}},now),LeagueError);
  assert.throws(()=>verifyLeagueRun({...valid,day:'2026-10-09'},now),LeagueError);
  assert.throws(()=>verifyLeagueRun({...valid,day:'2026-09-30'},now),LeagueError);
  assert.throws(()=>verifyLeagueRun({...valid,day:'2026-02-30'},now),LeagueError);
});

test('Daily best is not inflated by repeats; weekly ranking sums different days and keeps tied ranks',async()=>{
  const db=database();await profile(db,'a','Köz');await profile(db,'b','Nova');
  const first=await score(db,'a');await score(db,'a');await score(db,'b');
  const daily=await (await leagueAPI(request('board?period=daily','GET','a'),db,now)).json();
  assert.equal(daily.total,2);assert.deepEqual(daily.rows.map((row:{rank:number})=>row.rank),[1,1]);
  assert.equal(daily.weeklyScore,first.best);assert.equal(daily.weeklyRank,1);
  const yesterday=await score(db,'a','2026-10-07');
  const weekly=await (await leagueAPI(request('board','GET','a'),db,now)).json();
  assert.equal(weekly.weeklyScore,first.best+yesterday.best);assert.equal(weekly.rows[0].days,2);
  const todayScores=[completed().score,completed('2026-10-08',true).score];
  await score(db,'a','2026-10-08',true);
  const best=await db.prepare('SELECT score FROM league_scores WHERE player_id=? AND day=?').bind('a','2026-10-08').first<{score:number}>();
  assert.equal(best!.score,Math.max(...todayScores));
});

test('Identity comes from Sites, public DTO hides identifiers, and deletion affects only the signed-in player',async()=>{
  const db=database();
  assert.equal((await leagueAPI(request('profile','POST',undefined,{nickname:'Test',player_id:'victim'}),db,now)).status,401);
  assert.equal((await leagueAPI(request('profile','POST','a',{nickname:'Test'},'https://evil.test'),db,now)).status,403);
  assert.throws(()=>nicknameFor('<script>'),LeagueError);assert.equal(nicknameFor('  Köz  Ustası  '),'Köz Ustası');
  await profile(db,'a','Köz');await profile(db,'b','Nova');await score(db,'a');await score(db,'b');
  const board=await (await leagueAPI(request('board'),db,now)).json();
  assert.equal(board.signedIn,false);
  assert.deepEqual(Object.keys(board.rows[0]).sort(),['days','mine','nickname','rank','score']);
  assert.equal((await leagueAPI(request('me','DELETE','a'),db,now)).status,200);
  const remaining=await (await leagueAPI(request('board','GET','b'),db,now)).json();
  assert.equal(remaining.total,1);assert.equal(remaining.rows[0].nickname,'Nova');
  assert.equal(await db.prepare('SELECT * FROM league_players WHERE player_id=?').bind('a').first(),null);
});

test('Invalid score submissions are bounded per hour and the next hour restores access',async()=>{
  const db=database();await profile(db,'a','Köz');const bad={...payload(),claimedScore:-1};
  for(let i=0;i<30;i++)assert.equal((await leagueAPI(request('score','POST','a',bad),db,now)).status,400);
  assert.equal((await leagueAPI(request('score','POST','a',payload()),db,now)).status,429);
  assert.equal((await leagueAPI(request('score','POST','a',payload()),db,new Date('2026-10-08T13:00:00Z'))).status,200);
});
