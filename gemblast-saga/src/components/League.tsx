import { useCallback, useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { ArrowRight, Check, Crown, Flame, RefreshCw, Trophy, WifiOff } from 'lucide-react';
import { leagueFor, type LeaderboardData } from '../utils/competition';
import { LeagueAPIError, leagueRequest, readLeaderboard, submitLeagueScore } from '../utils/leagueClient';
import type { Session } from '../utils/session';
import { NativeLeague } from './NativeLeague';

const format=(n:number)=>n.toLocaleString('tr-TR');
export function League({daily,best,onPlay}:{daily?:Session;best:Record<string,number>;onPlay:(day:string)=>void}) {
  if (Capacitor.isNativePlatform()) return <NativeLeague daily={daily} best={best} onPlay={onPlay}/>;
  return <WebLeague daily={daily} onPlay={onPlay}/>;
}
function WebLeague({daily,onPlay}:{daily?:Session;onPlay:(day:string)=>void}) {
  const [period,setPeriod]=useState<'daily'|'weekly'>('weekly');
  const [data,setData]=useState<LeaderboardData|null>(null), [loading,setLoading]=useState(true);
  const [error,setError]=useState<string|null>(null), [authRequired,setAuthRequired]=useState(false);
  const [nickname,setNickname]=useState(''), [busy,setBusy]=useState(false), [notice,setNotice]=useState('');
  const native=Capacitor.isNativePlatform();
  const load=useCallback(async()=>{
    if (native) {setLoading(false);return;}
    setLoading(true);setError(null);
    try {const next=await readLeaderboard(period);setData(next);setNickname(next.nickname??'');setAuthRequired(!next.signedIn);}
    catch (error) {setError(error instanceof Error?error.message:'Lig açılamadı.');setAuthRequired(error instanceof LeagueAPIError&&error.status===401);}
    finally {setLoading(false);}
  },[period,native]);
  useEffect(()=>{void load();},[load]);
  const action=async(fn:()=>Promise<void>)=>{
    setBusy(true);setNotice('');
    try {await fn();}
    catch(error){setNotice(error instanceof Error?error.message:'İşlem tamamlanamadı.');if(error instanceof LeagueAPIError&&error.status===401)setAuthRequired(true);}
    finally{setBusy(false);}
  };
  const tier=leagueFor(data?.weeklyScore??0);
  const progress=tier.next ? Math.min(100,Math.max(0,((data?.weeklyScore??0)-tier.min)/(tier.next.min-tier.min)*100)) : 100;
  const eligible=!!daily?.competition&&daily.outcome!=='playing';
  return <>
    <div className="page-intro league-intro"><div className="eyebrow">AYNI BULMACA · GERÇEK SKORLAR</div><h1>Skor ligi</h1><p>Günlük bulmacayı oyna. Haftanın en iyi sonuçlarıyla ligini yükselt.</p></div>
    <>
      <section className={`league-summary league-tone-${tier.tone}`} aria-label="Haftalık lig ilerlemen"><div className="league-crest"><Crown size={28}/></div><div className="league-summary-copy"><span className="eyebrow">BU HAFTAKİ LİGİN</span><h2>{tier.name}</h2><strong>{format(data?.weeklyScore??0)} <small>puan</small></strong></div><span className="league-position">{data?.weeklyRank?'#'+data.weeklyRank:'—'}<small>haftalık sıra</small></span><div className="league-progress"><span style={{width:progress+'%'}}/></div><p>{tier.next ? `${tier.next.name} ligine ${format(Math.max(0,tier.next.min-(data?.weeklyScore??0)))} puan kaldı.` : 'En üst ligdesin. Haftalık sıranı yükselt!'}</p></section>
      <details className="league-rules"><summary>Lig nasıl hesaplanır?</summary><p>Haftalık puanın, pazartesiden pazara her günkü en iyi günlük bulmaca skorunun toplamıdır. Aynı gün yeniden oynamak puanını katlamaz; daha iyi sonucunu günceller. Herkes aynı taş dizilimi ve hamle hakkıyla başlar. Eşit puanlar aynı sırayı paylaşır. Günler Türkiye saatine göre değişir. Yeni hafta pazartesi 00.00’da başlar; puanın ve ligin yeniden hesaplanır.</p></details>
      {authRequired&&<section className="league-message"><h2>Skorun sana ait olsun</h2><p>Hesabına giriş yap, oyuncu adını seç ve günlük sonucunu gönder.</p><a className="primary-button" href="/signin-with-chatgpt?return_to=%2F%3Fleague%3D1" target="_top">Hesabımla giriş yap<ArrowRight size={18}/></a></section>}
      {data?.signedIn&&<form className="league-name" onSubmit={event=>{event.preventDefault();void action(async()=>{await leagueRequest('profile','POST',{nickname});await load();setNotice('Oyuncu adın kaydedildi.');});}}><label htmlFor="league-nickname">Sıralamadaki oyuncu adın</label><div><input id="league-nickname" value={nickname} onChange={event=>setNickname(event.target.value)} minLength={2} maxLength={20} placeholder="Örn. KözUstası" required autoComplete="off"/><button type="submit" className="secondary-button" disabled={busy||loading}>{busy?'Kaydediliyor…':data.nickname?'Güncelle':'Kaydet'}</button></div><small>Bu ad ve gönderdiğin skorlar diğer oyunculara görünür.</small></form>}
      {daily&&daily.outcome!=='playing'&&<section className="league-submit"><div><span className="eyebrow">GÜNLÜK SONUCUN · {daily.dailyKey}</span><h2>{format(daily.score)} <small>puan</small></h2><p>{eligible?'Bu sonucu doğrulatıp sıralamaya ekle.':'Bu oyun lig sürümünden önce başladı. Yeni günlük denemende skor gönderimi açılır.'}</p></div><button className="primary-button" disabled={!eligible||!data?.nickname||busy||authRequired} onClick={()=>{void action(async()=>{const sent=await submitLeagueScore(daily);await load();setNotice(`Sonucun doğrulandı. Bu günkü en iyi skorun ${format(sent.best)} puan.`);});}}>{busy?'Gönderiliyor…':'Lige gönder'}<Check size={16}/></button>{eligible&&!data?.nickname&&<small>Göndermek için önce giriş yapıp oyuncu adını kaydet.</small>}</section>}
      {notice&&<p className="league-notice" role="status">{notice}</p>}
      <div className="league-board-heading"><div className="league-period" aria-label="Sıralama dönemi"><button aria-pressed={period==='daily'} onClick={()=>setPeriod('daily')}>Bugün</button><button aria-pressed={period==='weekly'} onClick={()=>setPeriod('weekly')}>Bu hafta</button></div><button className="icon-button" aria-label="Lig sıralamasını yenile" disabled={loading||busy} onClick={()=>{void load();}}><RefreshCw size={17}/></button></div>
      {loading?<p className="league-loading" role="status">Skorlar getiriliyor…</p>:error?<section className="league-message" role="status"><WifiOff size={24}/><p>{error}</p><button className="secondary-button" onClick={()=>{void load();}}>Yeniden dene</button></section>:data&&<>
        <div className="league-board-meta"><span>{period==='daily'?data.today:`${data.week} haftası`}</span><span>{data.total} oyuncu</span></div>
        {data.rows.length?<table className="league-table"><caption className="sr-only">{period==='daily'?'Günlük':'Haftalık'} en iyi 50 oyuncu</caption><thead><tr><th scope="col">Sıra</th><th scope="col">Oyuncu</th><th scope="col">Puan</th></tr></thead><tbody>{data.rows.map((row,i)=><tr key={i} className={row.mine?'is-me':''}><td><span className={`rank-mark rank-${row.rank}`}>{row.rank<=3?<Trophy size={14}/>:null}{row.rank}</span></td><th scope="row"><span>{row.nickname}{row.mine&&<b>Sen</b>}</span>{period==='weekly'&&<small>{row.days}/7 gün · {leagueFor(row.score).name}</small>}</th><td>{format(row.score)}</td></tr>)}</tbody></table>:<section className="league-empty"><Trophy size={30}/><h2>İlk skoru sen gönder</h2><p>{period==='daily'?'Bugünün':'Bu haftanın'} sıralamasında henüz sonuç yok.</p></section>}
        {data.me&&!data.rows.some(row=>row.mine)&&<div className="league-own-rank"><strong>#{data.me.rank} · {data.me.nickname}</strong><span>{format(data.me.score)} puan</span></div>}
        <button className="primary-button full league-play" onClick={()=>onPlay(data.today)}><Flame size={19}/>Günlük bulmacayı oyna<ArrowRight size={18}/></button>
        {data.nickname&&<details className="league-delete"><summary>Sıralamadaki verilerimi sil</summary><p>Oyuncu adın ve sunucudaki tüm lig skorların silinir. Cihazındaki bölüm ilerlemen korunur.</p><button className="danger-button" disabled={busy} onClick={()=>{void action(async()=>{await leagueRequest('me','DELETE');await load();setNotice('Lig verilerin silindi. Cihazındaki ilerleme korunuyor.');});}}>Lig adımı ve skorlarımı sil</button></details>}
      </>}
    </>
  </>;
}
