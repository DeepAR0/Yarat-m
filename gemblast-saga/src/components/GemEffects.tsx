import { CellData, PRISM_DEFINITIONS } from '../types/game';
import { Coord } from '../utils/boardEngine';
import { chainEnergy } from '../utils/chainEnergy';
import { Orbit, Zap } from 'lucide-react';

export interface GemBurst {
  id: number;
  points: number;
  label: string;
  loop: boolean;
  chainLength: number;
  path?: Coord[];
  color: string;
  gems: { coord: Coord; cell: CellData }[];
}

const rays = [[-29, -36], [33, -28], [40, 11], [17, 42], [-23, 36], [-40, -6]];

export function GemEffects({ burst }: { burst: GemBurst }) {
  const energy = chainEnergy(burst.chainLength, burst.loop);
  // A full board uses fewer shards per gem, with a fixed total budget of 72.
  const rayCount = Math.min(4, Math.floor(72 / Math.max(1, burst.gems.length)));
  const beams = new Set<string>();
  const powers = burst.gems.filter(({ coord: [r, c], cell }) => {
    if (cell.special === 'none') return false;
    const key = cell.special === 'pulse_row' ? `row-${r}` : cell.special === 'pulse_col' ? `col-${c}` : `nova-${r},${c}`;
    if (beams.has(key)) return false;
    beams.add(key); return true;
  }).slice(0, 8);
  return <div key={burst.id} className={`burst-overlay energy-burst burst-tier-${energy.tier} ${burst.loop ? 'loop-burst' : ''}`} aria-hidden="true" style={{ '--energy-color': burst.color } as React.CSSProperties}>
    {burst.loop && burst.path && <svg className="loop-release-trace" viewBox="0 0 600 600"><path d={burst.path.map(([r,c],i) => `${i ? 'L' : 'M'}${c*100+50} ${r*100+50}`).join(' ') + ' Z'} fill="none" stroke={burst.color} strokeWidth="12" strokeLinejoin="miter"/></svg>}
    {energy.tier >= 3 && <span className="board-energy-wave"/>}
    {burst.gems.map(({ coord: [r, c], cell }, index) => {
      const color = PRISM_DEFINITIONS[cell.color].secondaryHex;
      return <div className="gem-explosion" key={`${r},${c}`} style={{ left: `${(c + .5) / 6 * 100}%`, top: `${(r + .5) / 6 * 100}%`, '--particle-color': color, '--burst-delay': `${Math.min(index * 5, 70)}ms` } as React.CSSProperties}>
        <span className="burst-ring"/>
        <span className="core-flash"/>
        {rays.slice(0, rayCount).map(([x, y], i) => <i className="gem-particle" key={i} style={{ '--ray-x': `${x * (1 + energy.tier * .12)}px`, '--ray-y': `${y * (1 + energy.tier * .12)}px`, '--spin': `${i * 70}deg` } as React.CSSProperties}/>)}
      </div>;
    })}
    {powers.map(({ coord: [r, c], cell }) => cell.special === 'nova_3x3'
      ? <span className="nova-wave" key={`nova-${r},${c}`} style={{ left: `${(c + .5) / 6 * 100}%`, top: `${(r + .5) / 6 * 100}%` }}/>
      : <span key={`laser-${r},${c}`} className={`laser-beam ${cell.special === 'pulse_col' ? 'vertical' : ''}`} style={cell.special === 'pulse_col' ? { left: `${(c + .5) / 6 * 100}%` } : { top: `${(r + .5) / 6 * 100}%` }}/>
    )}
    <span className="points-burst"><small>{burst.loop ? <Orbit size={14}/> : energy.tier >= 2 ? <Zap size={14}/> : null}{burst.label}</small>+{burst.points.toLocaleString('tr-TR')}</span>
  </div>;
}
