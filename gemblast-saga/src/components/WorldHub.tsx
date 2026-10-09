import { ArrowRight, Orbit, Star } from 'lucide-react';
import { CHAPTERS, type StageConfig } from '../types/game';
import type { Profile } from '../utils/session';
import { mysteryProgress } from '../utils/mystery';
import { CrystalArt } from './CrystalArt';
import { Emblem } from './Emblem';

export function WorldHub({ stage, profile, onPlay }: {stage:StageConfig;profile:Profile;onPlay:()=>void}) {
  const realm=Math.min(CHAPTERS.length-1,Math.floor((stage.id-1)/10)), mystery=mysteryProgress(profile);
  const stars=profile.stages[stage.id]?.stars??0;
  const resume=profile.sessions.classic?.outcome==='playing' && profile.sessions.classic.turns>0;
  return <section className={`world-hub world-hub-${realm}`} aria-label="Macera diyarın">
    <div className="world-hub-top"><span className="eyebrow">DİYAR 0{realm+1} · ÇEKİRDEKLERİN ÇAĞRISI</span><span className="world-stage-badge">{String(stage.id).padStart(2,'0')}<small>BÖLÜM</small></span></div>
    <div className="world-hub-body"><div className="world-hub-copy"><h1>{CHAPTERS[realm]}</h1><p>{mystery.finale?'Işık geri döndü. Şimdi bağlantının ustası ol.':'Kulenin yolunu aç. Kayıp ışığın sırrını keşfet.'}</p><span className="world-stage-title"><Orbit size={13} aria-hidden="true"/>{stage.title}</span></div><div className="realm-altar" aria-hidden="true"><svg viewBox="0 0 180 175" className="altar-lines"><path d="M90 8 159 49V126L90 166 21 126V49Z"/><path d="M90 24 144 57V117L90 150 36 117V57Z"/><circle cx="90" cy="87" r="55"/><path d="M90 8v16m69 25-15 8m15 69-15-9M90 166v-16m-69-24 15-9M21 49l15 8"/></svg><CrystalArt gemStyle={profile.gemStyle}/></div></div>
    <div className="world-mission-strip"><span><Star size={14} aria-hidden="true"/> {stars?`${stars}/3 yıldız`:'Yeni karşılaşma'}</span><span>{mystery.next?`Kayıt · Bölüm ${mystery.next.stage}`:mystery.finale?'Son Uyanış tamamlandı':`Kule ritmi · ${mystery.echoes}/7`}</span></div>
    <button className="primary-button adventure-button" onClick={onPlay}><Emblem kind="adventure"/><span>{resume?'Maceraya devam et':profile.stages[stage.id]?.stars?'Bölümü yeniden oyna':'Diyara gir'}</span><ArrowRight size={20} aria-hidden="true"/></button>
  </section>;
}
