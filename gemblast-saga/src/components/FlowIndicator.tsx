import { ArrowDown, Orbit, Zap } from 'lucide-react';
import { chainEnergy } from '../utils/chainEnergy';

export function FlowIndicator({ count, affected, loop, resolving, tapMode = false, cue }: { count: number; affected: number; loop: boolean; resolving?: 'clearing' | 'falling'; tapMode?: boolean; cue?: {id: number; label: string} | null }) {
  const energy = chainEnergy(count, loop);
  return <div className={`flow-indicator ${count > 1 ? 'preview' : ''} chain-level-${energy.tier}`} aria-label={loop ? `Renk dalgası: ${affected} taş etkilenecek` : count ? `${count} taş bağlı, ${energy.label}` : 'Akış: aşağı'}>
    <span className="flow-label">{loop ? <Orbit size={16}/> : count >= 4 ? <Zap size={15}/> : null}{resolving ? resolving === 'clearing' ? 'Patlama' : 'Yerleşme' : count ? `${count} çekirdek` : 'Akış'}<strong key={cue?.id ?? 'state'} className={cue ? 'charge-message' : undefined} role={cue ? 'status' : undefined}>{resolving ? 'Sürüyor' : cue ? cue.label : count > 0 && count < 3 ? `${3-count} taş daha bağla` : count === 3 ? tapMode ? 'Patlat’a dokun' : 'Bırak, patlat' : count ? energy.label : 'Aşağı'}</strong></span>
    {count >= 3 && !resolving && <span className="clear-preview">{affected} taş</span>}
    {count > 0 ? <span className="energy-meter" aria-hidden="true">{[3,4,5,6,9].map(n => <i key={n} className={count >= n || loop ? 'lit' : ''}/>)}</span> : <span className="flow-compass" aria-hidden="true"><span className="active"><ArrowDown size={17}/></span></span>}
  </div>;
}
