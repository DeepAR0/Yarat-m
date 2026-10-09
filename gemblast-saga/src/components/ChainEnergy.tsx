import { useId } from 'react';
import { Coord } from '../utils/boardEngine';
import { chainEnergy } from '../utils/chainEnergy';

export function ChainEnergy({ path, color, loop, reducedMotion }: { path: Coord[]; color: string; loop: boolean; reducedMotion: boolean }) {
  const uid = `energy-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const count = path.length - Number(loop), energy = chainEnergy(count, loop);
  const points = path.map(([r, c]) => [c * 100 + 50, r * 100 + 50]);
  const d = points.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ') + (loop ? ' Z' : ''), last = points.at(-1)!;
  return <svg className={`path-overlay energy-ribbon energy-tier-${energy.tier} ${loop ? 'energy-loop' : ''}`} viewBox="0 0 600 600" aria-hidden="true" strokeLinejoin="miter" strokeMiterlimit="4" style={{ '--energy-color': color, '--energy-speed': `${energy.speed}s` } as React.CSSProperties}>
    <defs><linearGradient id={uid} x1="0" y1="0" x2="1" y2="1"><stop stopColor={color}/><stop offset=".5" stopColor="#fff6d9"/><stop offset="1" stopColor={color}/></linearGradient></defs>
    {loop && <polygon points={points.map(p => p.join(',')).join(' ')} fill={color} fillOpacity=".09"/>}
    <path className="energy-sheath" d={d} fill="none" stroke={color} strokeWidth={energy.width + 18} strokeOpacity=".13" strokeLinecap="round"/>
    <path d={d} fill="none" stroke={color} strokeWidth={energy.width} strokeOpacity=".8" strokeLinecap="round"/>
    <path className="energy-current" d={d} fill="none" stroke={`url(#${uid})`} strokeWidth="3.5" strokeLinecap="round"/>
    {energy.tier >= 2 && <><path className="energy-filament" d={d} fill="none" stroke={color} strokeWidth={energy.width + 5} strokeOpacity=".3"/><path className="energy-filament reverse" d={d} fill="none" stroke="#fff6d9" strokeWidth="1.5" strokeOpacity=".65"/></>}
    {points.slice(0, loop ? -1 : undefined).map(([x, y], i) => <g key={i} className="energy-junction" transform={`translate(${x} ${y})`}>
      <circle r={14 + energy.tier * 2} fill="none" stroke={color} strokeWidth="2" strokeOpacity=".7"/>
      {energy.tier >= 3 && <path className="energy-star" d="M-24 0H-17M17 0H24M0-24V-17M0 17V24" stroke="#fff5cc" strokeWidth="2"/>}
    </g>)}
    {!reducedMotion && Array.from({ length: Math.min(3, Math.max(1, energy.tier)) }, (_, i) => <circle className="energy-runner" key={i} r={3 + energy.tier / 2} fill="#fff9e7"><animateMotion dur={`${energy.speed + .4}s`} begin={`${-i * .45}s`} repeatCount="indefinite" path={d}/></circle>)}
    <g className="energy-head" transform={`translate(${last[0]} ${last[1]})`}><circle className="energy-head-ring" r={24 + energy.tier * 2} stroke={color} strokeWidth="2" fill="none"/><path d="M0-11 3-3 11 0 3 3 0 11-3 3-11 0-3-3Z" fill="#fff8df"/></g>
  </svg>;
}
