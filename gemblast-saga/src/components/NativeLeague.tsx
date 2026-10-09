import { useState } from 'react';
import { Crown, Flame, Trophy } from 'lucide-react';
import { leagueDay, leagueFor } from '../utils/competition';
import { GameCenter, gameCenterOperation, gameCenterConfigured, nativeLeaderboardId, weeklyBest } from '../utils/gameCenter';
import type { Session } from '../utils/session';
export function NativeLeague({daily,best,onPlay}:{daily?:Session;best:Record<string,number>;onPlay:(day:string)=>void}) {
  const [busy,setBusy] = useState(false), [notice,setNotice] = useState('');
  const today=leagueDay(), score=weeklyBest(best,today), tier=leagueFor(score);
  async function perform(period:'daily'|'weekly', submit=false) {
    if (busy) return;
    setBusy(true);setNotice('');
    try {
      await gameCenterOperation(GameCenter.authenticate());
      if (submit) {
        // Results belong to the currently active recurring occurrences only.
        if (!daily || daily.dailyKey !== leagueDay() || daily.outcome==='playing') throw new Error('Bugünkü bulmacayı tamamla.');
        await gameCenterOperation(GameCenter.submit({score:Math.max(best[today]??0,daily.score),leaderboardId:nativeLeaderboardId('daily')}));
        await gameCenterOperation(GameCenter.submit({score:weeklyBest({...best,[today]:Math.max(best[today]??0,daily.score)},today),leaderboardId:nativeLeaderboardId('weekly')}));
        setNotice('Skorun Game Center’a gönderildi.');
      } else await gameCenterOperation(GameCenter.open({leaderboardId:nativeLeaderboardId(period)}));
    } catch { setNotice('Game Center işlemi tamamlanamadı. İnternet bağlantını ve Ayarlar’daki Game Center hesabını kontrol edip yeniden dene.'); }
    finally {setBusy(false);}
  }
  return <>
    <div className="page-intro league-intro"><div className="eyebrow">GÜNLÜK BULMACA · GAME CENTER</div><h1>Skor ligi</h1><p>Aynı günlük bulmacayı çöz. Günlük ve haftalık skorunu Apple oyuncularıyla karşılaştır.</p></div>
    <section className={`league-summary league-tone-${tier.tone}`}><div className="league-crest"><Crown size={28}/></div><div className="league-summary-copy"><span className="eyebrow">BU CİHAZDA · HAFTALIK LİGİN</span><h2>{tier.name}</h2><strong>{score.toLocaleString('tr-TR')} <small>puan</small></strong></div><p>Her günün en iyi sonucu bir kez sayılır. Pazartesi yeni hafta başlar.</p></section>
    <details className="league-rules"><summary>Lig nasıl çalışır?</summary><p>Günler Türkiye saatine göre değişir. Günlük bulmacada reklam ödülü yoktur. Game Center isteğe bağlıdır; macera ve günlük oyun için giriş gerekmez. Sıralama Apple oyuncularını içerir; web ligi ayrı bir sıralamadır. Macera ilerlemesi ve haftalık puan hesabı cihazında tutulur; cihazlar arasında birleşmez. Gönderilen skorlarını Apple’ın Game Center hizmeti yönetir.</p></details>
    {gameCenterConfigured() ? <>
      <div className="league-period"><button disabled={busy} onClick={()=>{void perform('daily');}}>Günlük sıralama</button><button disabled={busy} onClick={()=>{void perform('weekly');}}>Haftalık sıralama</button></div>
      {daily?.dailyKey===today&&daily.outcome!=='playing'&&<section className="league-submit"><div><span className="eyebrow">BUGÜNKÜ SONUCUN</span><h2>{daily.score.toLocaleString('tr-TR')} <small>puan</small></h2></div><button className="primary-button" disabled={busy} onClick={()=>{void perform('daily',true);}}><Trophy size={18}/>{busy?'Gönderiliyor…':'Game Center’a gönder'}</button></section>}
    </> : <section className="league-message"><Trophy size={28}/><p>Game Center bu sürümde henüz etkinleştirilmedi. Günlük sonuçların cihazında saklanır.</p></section>}
    {notice&&<p className="league-notice" role="status">{notice}</p>}
    <button className="primary-button full league-play" disabled={busy} onClick={()=>onPlay(leagueDay())}><Flame size={19}/>Günlük bulmacayı oyna</button>
  </>;
}
