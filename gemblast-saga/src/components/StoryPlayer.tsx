import { useEffect, useId, useState } from 'react';
import { RotateCcw, Square } from 'lucide-react';
import type { SceneKind, StoryRecord } from '../utils/storyPresentation';
import { startStoryMotion } from '../utils/storyMotion';

/** A small vector stage, not a background image. Its final frame remains readable. */
export function StoryScene({ kind, phase=3, compact=false }: {kind:SceneKind;phase?:number;compact?:boolean}) {
  const id=useId().replace(/:/g,'');
  const gate=kind==='gate'||kind==='finale', ring=kind==='ring'||kind==='finale';
  return <div className={`story-scene scene-${kind} phase-${phase} ${compact?'compact':''}`} aria-hidden="true">
    <svg viewBox="0 0 360 210" focusable="false">
      <defs><linearGradient id={`${id}-stone`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="var(--scene-stone-top, #fffefa)"/><stop offset="1" stopColor="var(--scene-stone-bottom, #c8ded6)"/></linearGradient><linearGradient id={`${id}-light`} x1="0" y1="1" x2="1" y2="0"><stop stopColor="#5aaf94"/><stop offset="1" stopColor="#e2bd65"/></linearGradient></defs>
      <ellipse cx="180" cy="187" rx="117" ry="10" fill="var(--scene-ground, #b3d7c8)" opacity=".3"/>
      <g className="scene-distant" fill="var(--scene-distant, #dcebe3)"><path d="M28 181 65 126 104 181Z"/><path d="M258 181 291 112 335 181Z"/><path d="M52 181 84 149 118 181Z"/></g>
      {kind==='trail' && <g className="scene-trail" fill="#b09b67">{[0,1,2,3,4].map(i=><ellipse key={i} cx={136+i*9} cy={176-i*7} rx="3" ry="5" transform={`rotate(-25 ${136+i*9} ${176-i*7})`}/>)}</g>}
      <g className="scene-tower" fill={`url(#${id}-stone)`} stroke="var(--scene-outline, #7caa98)" strokeWidth="1.5"><path d="M139 182 147 78 213 78 221 182Z"/><path d="M141 80 180 40 219 80Z"/><path d="M145 180H215M148 151H212M150 123H210" opacity=".35"/><path d="M169 91H191V111H169Z" fill="#f2d99a"/></g>
      <g className="scene-beacon" fill="none" stroke="#d6b45c" strokeWidth="1.5"><circle cx="180" cy="101" r="24"/><circle cx="180" cy="101" r="38" strokeDasharray="3 7"/></g>
      {gate && <g className="scene-gate"><path d="M162 182V141Q180 113 198 141V182" fill="#f8e5ac" stroke="#b9ae81"/><path className="gate-left" d="M162 182V141Q170 129 180 128V182Z" fill="var(--scene-door, #d9e7dd)" stroke="#81ad9c"/><path className="gate-right" d="M180 128Q190 129 198 141V182H180Z" fill="var(--scene-door-top, #e7eee1)" stroke="#81ad9c"/></g>}
      {kind==='memory' && <g className="scene-memory" fill="#fff7de" stroke="#c3aa65"><path d="M119 124 151 116 156 154 123 162Z"/><path d="m126 134 21-5m-19 13 18-4m-16 12 14-3"/></g>}
      {kind==='tide' && <g className="scene-tide" fill="none" stroke="#79b9b2" strokeWidth="3"><path d="M41 167Q67 153 93 167T145 167T197 167T249 167T301 167"/><path d="M58 179Q82 168 106 179T154 179T202 179T250 179T298 179" opacity=".5"/></g>}
      <g className="scene-link" fill="none" stroke={`url(#${id}-light)`} strokeWidth="3" strokeLinecap="round"><path pathLength="1" d={ring?'M95 137 137 58 223 58 265 137 223 178 137 178Z':'M93 157 136 146 180 101 224 146 267 157'}/></g>
      <g className="scene-cores" strokeWidth="1.2" stroke="#fff">{[[95,137,'#e98671'],[137,58,'#7babdb'],[223,58,'#e1bd5b'],[265,137,'#80b891'],[223,178,'#b69bcd']].map(([x,y,c],i)=><path className={`scene-core core-${i}`} key={i} d={`M${x} ${Number(y)-8}l7 8-7 8-7-8Z`} fill={String(c)}/>)}</g>
      {kind==='constellation' && <circle className="scene-empty" cx="137" cy="178" r="8" fill="none" stroke="#87b7a2" strokeDasharray="3 3"/>}
      {kind==='finale' && <g className="scene-keeper" fill="var(--scene-keeper, #638d7b)"><circle cx="180" cy="153" r="4"/><path d="m173 174 3-15h8l3 15Z"/><path d="m173 175-7 8m20-8 8 8" fill="none" stroke="var(--scene-keeper, #638d7b)" strokeWidth="3"/></g>}
      <g className="scene-sparks" fill="#c5a252">{[[120,83],[244,99],[107,119],[243,44],[182,20]].map(([x,y],i)=><path key={i} d={`M${x} ${y-3}l1 2 2 1-2 1-1 2-1-2-2-1 2-1Z`}/>)}</g>
    </svg>
  </div>;
}

export function StoryPlayer({ record, reducedMotion=false, compact=false }: {record:StoryRecord;reducedMotion?:boolean;compact?:boolean}) {
  const [phase,setPhase]=useState(reducedMotion?3:0),[run,setRun]=useState(0);
  const [stopped,setStopped]=useState(false);
  useEffect(()=>{
    if(reducedMotion||stopped){setPhase(3);return;}
    if(document.hidden){setPhase(3);return;}
    const stop=startStoryMotion(setPhase);
    const finish=()=>{if(document.hidden){stop();setPhase(3);}};
    document.addEventListener('visibilitychange',finish);
    return ()=>{stop();document.removeEventListener('visibilitychange',finish);};
  },[record.id,run,reducedMotion,stopped]);
  function finish(){setPhase(3);setStopped(true);}
  const displayPhase=stopped||reducedMotion?3:phase;
  const replay=()=>{setStopped(false);setRun(n=>n+1);};
  return <div className={`story-player ${compact?'compact':''}`}>
    <StoryScene kind={record.scene} phase={displayPhase} compact={compact}/>
    <div className="story-caption" aria-live="off"><span className="story-beats" aria-hidden="true">{[1,2,3].map(n=><i key={n} className={displayPhase>=n?'shown':''}/>)}</span><p>{record.cues[Math.max(0,Math.min(2,displayPhase-1))]}</p></div>
    <div className="story-controls">{!reducedMotion && <button className="text-button" onClick={displayPhase<3?finish:replay}>{displayPhase<3?<Square size={13}/>:<RotateCcw size={14}/>} {displayPhase<3?'Animasyonu durdur':'Yeniden oynat'}</button>}{reducedMotion&&<small>Hareket azaltıldı · Sabit sahne</small>}</div>
  </div>;
}
