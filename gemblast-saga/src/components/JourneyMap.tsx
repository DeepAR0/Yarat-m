import { useId, useRef, useState, type CSSProperties } from 'react';
import { ArrowRight, BookOpen, Check, Flag, Infinity, LocateFixed, LockKeyhole, Orbit, Play, Star } from 'lucide-react';
import { CHAPTERS, PRISM_DEFINITIONS, STAGES, type StageConfig } from '../types/game';
import { nextUnlocked, stageFor, type Profile } from '../utils/session';
import { gemArtwork, mysteryProgress, STORY } from '../utils/mystery';
import { FINALE, latestRecord, storyRecord, type StoryRecord } from '../utils/storyPresentation';
import { Dialog } from './Dialog';
import { Emblem } from './Emblem';
import { StoryScene } from './StoryPlayer';

const points = [ [50,80], [72,165], [74,250], [54,335], [29,420], [26,505], [46,590], [71,675], [69,760], [50,845] ];
const colors = ['coral','cobalt','violet'] as const;
const places = [ ['Kül fenerleri','Uyuyan kapı','Köz geçidi'], ['Sessiz kaynak','Batık tapınak','Gelgit köprüsü'], ['Gökyüzü sunağı','Işık halkası','Kule geçidi'] ];
const goals = ['Fenerleri yak, vadinin kapısını aç.','Suyu geri getir, batık kaydı bul.','Yıldızları birleştir, kuleye ulaş.'];
const trail = (a:number[],b:number[]) => `M ${a[0]*3.6} ${a[1]} C ${a[0]*3.6} ${(a[1]+b[1])/2} ${b[0]*3.6} ${(a[1]+b[1])/2} ${b[0]*3.6} ${b[1]}`;

/** Vector terrain changes with actual contiguous campaign wins. No ambient animation. */
function Terrain({realm,restored}:{realm:number;restored:number}) {
  const id=useId().replaceAll(':','');
  return <svg className="map-terrain" viewBox="0 0 360 940" preserveAspectRatio="none" aria-hidden="true">
    <defs><linearGradient id={`land-${id}`} x2="0" y2="1"><stop stopColor="var(--map-land-top)"/><stop offset="1" stopColor="var(--map-land-bottom)"/></linearGradient></defs>
    <path d="M0 55 42 20 76 65 125 14 158 55 210 20 254 69 300 15 360 57V940H0Z" fill={`url(#land-${id})`}/>
    <path d="M0 48 42 20 76 65 125 14 158 55 210 20 254 69 300 15 360 57" fill="none" stroke="var(--map-ridge)" strokeWidth="3"/>
    {[0,1,2,3,4].map(i=><g key={i} transform={`translate(${i%2?292:22},${130+i*155})`}><path d="m0 30 18-28 27 12 9 40-41 10Z" fill="var(--map-rock)" stroke="var(--map-ridge)"/><path d="m18 2 5 38 31 14M23 40 0 30" fill="none" stroke="var(--map-ridge)"/></g>)}
    {realm===0 && <>{[0,1,2,3,4].map(i=><g key={i} transform={`translate(${i%2?65:290},${90+i*170})`}><path d="m-22 23 8-10h28l8 10-22 10Z" fill="var(--map-rock)" stroke="var(--map-ridge)"/><path d="M-12 10v-30h24v30M-16-20h32l-5-9h-22Z" fill="#324849" stroke="#a78f6b"/>{restored>=i*2+1?<><circle cy="-7" r="20" fill="#ffc56c" opacity=".15"/><path d="M0 4C-16-3-5-10-3-21 12-10 13-2 0 4" fill="#ffc56c"/></>:<path d="M-7-14h14V0H-7Z" fill="#162c32"/>}</g>)}<path d="M8 370 55 342 84 365 40 398Z" fill="#634d44" stroke="#a78f6b"/></>}
    {realm===1 && <><path d="M0 180C120 100 260 180 360 95M0 420C130 350 235 455 360 340M0 680C100 560 240 650 360 560" fill="none" stroke={restored>0?'#338a99':'#243b47'} strokeWidth="32"/><path d="M0 180C120 100 260 180 360 95M0 420C130 350 235 455 360 340M0 680C100 560 240 650 360 560" fill="none" stroke={restored>=5?'#96e6e3':'#486575'} strokeWidth="4"/>{[0,1,2].map(i=><g key={i} transform={`translate(${i%2?290:50},${290+i*220})`}><path d="M-28 28v-14l28-12 28 12v14ZM-20 13v-47h9v43M11 9v-43h9v47M-26-34 0-48l26 14Z" fill="#446571" stroke={restored>=i*3+2?'#91e4db':'#68818b'}/></g>)}</>}
    {realm===2 && <><path d="M12 200 50 95 98 210 64 245ZM247 465 290 345 350 475 293 515ZM8 770 58 625 112 780 58 825Z" fill="#665a81" stroke="#a999c3"/>{[0,1,2,3,4,5].map(i=><g key={i}><path d={`M${i%2?302:55} ${130+i*117}l5 10 10 5-10 5-5 10-5-10-10-5 10-5Z`} fill={restored>=i+1?'#f5d68f':'#666578'}/>{i<5&&<path d={`M${i%2?302:55} ${145+i*117}L${i%2?55:302} ${262+i*117}`} stroke={restored>=i+2?'#d8c1f2':'#57536a'} strokeDasharray="3 8" opacity=".55"/>}</g>)}</>}
    <g transform="translate(180 892)"><path d="M-60 30v-53l20-16h80l20 16v53M-40 30V-9Q0-52 40-9v39" fill="var(--map-rock)" stroke={restored===10?'var(--map-glow)':'var(--map-ridge)'} strokeWidth="5"/><path d="M-20 30V0Q0-20 20 0v30" fill={restored===10?'var(--map-glow)':'#142936'}/></g>
  </svg>;
}

export function JourneyMap({profile,reducedMotion,onPlay,onDaily,onZen,onStory,dailyFound}:{profile:Profile;reducedMotion:boolean;onPlay:(stageId?:number)=>void;onDaily:()=>void;onZen:()=>void;onStory:(record:StoryRecord)=>void;dailyFound:boolean}) {
  const unlocked=nextUnlocked(profile), mystery=mysteryProgress(profile);
  const saved=profile.sessions.classic;
  const resume=saved?.outcome==='playing' && saved.turns>0;
  const stage=saved?.outcome==='playing'?stageFor(saved):STAGES[unlocked-1];
  const [selected,setSelected]=useState<StageConfig|null>(null);
  const realmRefs=useRef<(HTMLElement|null)[]>([]);
  const currentRef=useRef<HTMLButtonElement|null>(null);
  const jump=(target:HTMLElement|null)=>{target?.focus({preventScroll:true});target?.scrollIntoView({behavior:reducedMotion?'instant':'smooth',block:'center'});};
  const openStory=(record:StoryRecord)=>{setSelected(null);onStory(record);};
  const selectedRecord=selected?storyRecord(profile,selected.id):undefined;
  const selectedMystery=STORY.find(s=>s.stage===selected?.id);
  return <div className="adventure-world">
    <div className="adventure-heading"><div><span className="eyebrow">ÇEKİRDEKLERİN ÇAĞRISI</span><h1>Işığın yolu</h1></div><button className="icon-button" aria-label="Son hikâye kaydını izle" onClick={()=>onStory(latestRecord(profile))}><BookOpen size={22}/></button></div>
    <button className="map-continue" onClick={()=>onPlay(saved?.outcome==='playing'?undefined:unlocked)}><img src={gemArtwork(colors[Math.floor((stage.id-1)/10)],profile.gemStyle)} width="64" height="64" alt=""/><span><small>{CHAPTERS[Math.floor((stage.id-1)/10)]} · Bölüm {stage.id}</small><strong>{resume?'Maceraya devam et':mystery.restored===30?'Yıldızlarını geliştir':'Sıradaki bölüme gir'}</strong><span>{stage.title}</span></span><Play size={22} fill="currentColor" aria-hidden="true"/></button>
    <div className="map-sidequests"><button onClick={onDaily}><Emblem kind="echo"/><span><strong>Günlük yankı</strong><small>{mystery.echoes===7?'Ritim tamamlandı · yeni bulmaca':dailyFound?'Bugünün yankısı bulundu':`Kule için yankı ${mystery.echoes+1}/7`}</small></span>{dailyFound?<Check size={18}/>:<ArrowRight size={18}/>}</button><button onClick={onZen} aria-label="Serbest akış, hamle sınırı yok"><Infinity size={22}/><span>Serbest</span></button></div>
    <nav className="map-compass" aria-label="Haritada gezin"><div>{CHAPTERS.map((name,i)=><button key={name} onClick={()=>jump(realmRefs.current[i])} aria-label={`${name} bölgesine git`}><span>{i+1}</span>{name.split(' ')[0]}</button>)}</div><button onClick={()=>jump(currentRef.current)}><LocateFixed size={17}/>Konumum</button></nav>
    <p className="map-hint"><Flag size={15}/>Bir durağa dokun. Zaferlerin diyarı yeniden aydınlatır.</p>
    {CHAPTERS.map((name,realm)=>{
      const restored=Math.min(10,Math.max(0,mystery.restored-realm*10));
      return <section key={name} className={`map-realm map-realm-${realm} ${restored===10?'realm-restored':''}`} aria-labelledby={`realm-title-${realm}`}>
        <header ref={el=>{realmRefs.current[realm]=el;}} tabIndex={-1} className="map-realm-heading"><span className="map-realm-seal">0{realm+1}</span><div><h2 id={`realm-title-${realm}`}>{name}</h2><p>{goals[realm]}</p></div><span className="realm-status">{restored===10?<Check size={18}/>:`${restored}/10`}<small>{restored===10?'Uyandı':'Işık yolu'}</small></span></header>
        <div className="map-landscape"><Terrain realm={realm} restored={restored}/>
          <svg className="map-trail" viewBox="0 0 360 940" preserveAspectRatio="none" aria-hidden="true"><path className="trail-connector" d="M180 0V80M180 845V940"/>{points.slice(1).map((point,i)=><g key={i}><path className="trail-base" d={trail(points[i],point)}/><path className={`trail-stitch ${restored>i?'trail-lit':''}`} d={trail(points[i],point)}/></g>)}</svg>
          <div className="map-place place-one" aria-hidden="true">{places[realm][0]}</div><div className="map-place place-two" aria-hidden="true">{places[realm][1]}</div>
          {STAGES.slice(realm*10,realm*10+10).map((level,i)=>{
            const locked=level.id>unlocked,stars=profile.stages[level.id]?.stars??0,current=level.id===unlocked;
            const milestone=STORY.some(s=>s.stage===level.id);
            return <div key={level.id} className={`map-stop ${current?'stop-current':''} ${stars?'stop-complete':''} ${locked?'stop-locked':''} ${i===9?'stop-gate':''}`} style={{left:`${points[i][0]}%`,top:points[i][1]} as CSSProperties}>
              {current&&<span className="map-you">Buradasın</span>}
              <button ref={current?currentRef:undefined} disabled={locked} className="map-level" aria-label={`Bölüm ${level.id}, ${level.title}, ${locked?'kilitli':current && mystery.restored<30?'sıradaki bölüm':`${stars} yıldız`}${milestone?', hikâye durağı':''}`} onClick={()=>setSelected(saved?.outcome==='playing' && saved.stageId===level.id?stageFor(saved):level)}><span className="map-level-number">{level.id}</span>{locked?<LockKeyhole className="node-mark" size={14}/>:i===9?<Flag className="node-mark" size={14}/>:milestone?<BookOpen className="node-mark" size={13}/>:null}</button>
              <span className="map-stars" aria-hidden="true">{[1,2,3].map(n=><Star key={n} size={12} fill={n<=stars?'currentColor':'none'} className={n<=stars?'earned':''}/>)}</span>
            </div>;
          })}
          <span className="map-gate-label">{restored===10?'Geçit açıldı':places[realm][2]}</span>
        </div>
      </section>;
    })}
    <section className={`map-final-tower ${mystery.finale?'tower-awake':''}`} aria-label="Son Uyanış"><div className="map-tower-scene"><StoryScene kind={mystery.finale?'finale':'gate'} phase={mystery.finale?3:2} compact/></div><Emblem kind="seal"/><div><span className="eyebrow">YOLUN SONUNDA BİR SIR VAR</span><h2>Kilitli kule</h2><p>{mystery.finale?'Işık geri döndü. Son Uyanış seni bekliyor.':`Üç diyarın ışığını ve yedi günlük yankıyı birleştir.`}</p><div className="tower-keys"><span>{mystery.restored}/30 durak</span><span>{mystery.echoes}/7 yankı</span></div></div>{mystery.finale?<button className="primary-button full" onClick={()=>onStory(FINALE)}>Son Uyanış’ı izle<Play size={18}/></button>:<button className="secondary-button full" onClick={mystery.restored===30?onDaily:()=>jump(currentRef.current)}>{mystery.restored===30?'Eksik yankıyı bul':'Işık yolunu tamamla'}<ArrowRight size={18}/></button>}</section>
    {selected&&<Dialog className="map-stage-dialog" title={`Bölüm ${selected.id} · ${selected.title}`} onClose={()=>setSelected(null)}><span className="eyebrow">{CHAPTERS[Math.floor((selected.id-1)/10)]}</span><div className="stage-map-metrics"><span><strong>{selected.moves}</strong>hamle</span><span><strong>{selected.targetScore.toLocaleString('tr-TR')}</strong>puan hedefi</span><span><strong>{profile.stages[selected.id]?.stars??0}/3</strong>yıldız</span></div><div className="map-stage-quotas">{selected.quotas.map(q=><span key={q.color}><img src={gemArtwork(q.color,profile.gemStyle)} width="40" height="40" alt={PRISM_DEFINITIONS[q.color].name}/><strong>{q.target}</strong></span>)}</div><div className="map-stage-specials">{!!(selected.loopsTarget||selected.requireLoop)&&<span><Orbit size={16}/>{selected.loopsTarget??1} halka</span>}{!!selected.sealsTarget&&<span><LockKeyhole size={16}/>{selected.sealsTarget} mühür</span>}{!!selected.specialsTarget&&<span><Star size={16}/>{selected.specialsTarget} güç tetikle</span>}</div>{selectedMystery&&<div className="map-discovery"><BookOpen size={20}/><span>{selectedRecord?selectedRecord.title:'Bu durakta yeni bir hikâye kaydı var.'}{selected.id===6&&<small>Kristal yankılar taş görünümü burada açılır.</small>}</span>{selectedRecord&&<button className="icon-button" aria-label="Bu durakta bulunan hikâyeyi izle" onClick={()=>openStory(selectedRecord)}><Play size={18}/></button>}</div>}<button className="primary-button full" onClick={()=>{setSelected(null);onPlay(selected.id);}}>{profile.stages[selected.id]?.stars?'Yıldızlarını geliştir':'Bölümü oyna'}<ArrowRight size={18}/></button></Dialog>}
  </div>;
}
