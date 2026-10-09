import { commitMove, createSession, shuffleSession } from '../src/utils/session';
import { leagueDay, leagueWeek, validDay, validTrace } from '../src/utils/competition';

export class LeagueError extends Error {
  constructor(public status: number, message: string) {super(message);}
}
export function verifyLeagueRun(body: unknown, now = new Date()) {
  if (!body || typeof body !== 'object') throw new LeagueError(400,'Oyun kaydı eksik.');
  const input = body as Record<string,unknown>;
  if (!validDay(input.day) || !validTrace(input.trace)) throw new LeagueError(400,'Bu sonuç lig için doğrulanamıyor. Yeni bir günlük bulmaca dene.');
  const today = leagueDay(now), age = (Date.parse(today+'T12:00:00Z')-Date.parse(input.day+'T12:00:00Z'))/86400000;
  if (age<0 || age>6) throw new LeagueError(400,'Yalnızca son yedi günün bulmacaları gönderilebilir.');
  let session = createSession('daily',1,new Date(input.day+'T12:00:00Z'));
  for (const action of input.trace.actions) {
    if (session.outcome!=='playing') throw new LeagueError(400,'Oyun bittikten sonra ek hamle gönderilemez.');
    if (action.kind==='shuffle') {
      if (!session.shufflesLeft) throw new LeagueError(400,'Karıştırma hakkı aşıldı.');
      session = shuffleSession(session);
    } else {
      const move = commitMove(session,action.path,action.loop);
      if (!move) throw new LeagueError(400,'Hamle dizisi doğrulanamadı.');
      session = move.next;
    }
  }
  if (session.outcome==='playing') throw new LeagueError(400,'Skoru göndermek için günlük bulmacayı bitir.');
  if (input.claimedScore!==session.score) throw new LeagueError(400,'Skor oyun kaydıyla eşleşmiyor.');
  return {day:input.day,week:leagueWeek(input.day),score:session.score,turns:session.turns};
}
export function nicknameFor(value: unknown) {
  if (typeof value!=='string') throw new LeagueError(400,'Bir oyuncu adı yaz.');
  const name = value.normalize('NFKC').trim().replace(/\s+/g,' ');
  if ([...name].length<2 || [...name].length>20 || !/^[\p{L}\p{N} ._-]+$/u.test(name)) throw new LeagueError(400,'Adın 2–20 karakter olsun; harf, sayı, boşluk veya ._- kullanabilirsin.');
  return name;
}
