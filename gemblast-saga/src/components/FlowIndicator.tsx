import { Check, Orbit, Zap } from 'lucide-react';
import { chainEnergy } from '../utils/chainEnergy';

/** The single status line above the board: chain energy while drawing, otherwise the latest feedback. */
export function FlowIndicator({ count, affected, loop, resolving, tapMode = false, cue, idle = '', onCommit }: {
  count: number; affected: number; loop: boolean; resolving?: 'clearing' | 'falling'; tapMode?: boolean;
  cue?: {id: number; label: string} | null; idle?: string; onCommit?: () => void;
}) {
  const energy = chainEnergy(count, loop);
  if (!count && !resolving) return <div className="flow-indicator flow-idle" role="status" aria-live="polite"><span className="flow-message">{idle}</span></div>;
  return <div className={`flow-indicator ${count > 1 ? 'preview' : ''} chain-level-${energy.tier}`} aria-label={loop ? `Renk dalgası: ${affected} taş etkilenecek` : `${count} taş bağlı, ${energy.label}`}>
    <span className="flow-label">{loop ? <Orbit size={16}/> : count >= 4 ? <Zap size={15}/> : null}{resolving ? resolving === 'clearing' ? 'Patlama' : 'Yerleşme' : `${count} çekirdek`}<strong key={cue?.id ?? 'state'} className={cue ? 'charge-message' : undefined} role={cue ? 'status' : undefined}>{resolving ? 'Sürüyor' : cue ? cue.label : count > 0 && count < 3 ? `${3-count} taş daha bağla` : count === 3 ? tapMode ? 'Patlat’a dokun' : 'Bırak, patlat' : energy.label}</strong></span>
    {count >= 3 && !resolving && <span className="clear-preview">{affected} taş</span>}
    {tapMode && onCommit && !resolving ? <button className="link-commit" disabled={count < 3} onClick={onCommit}><Check size={15}/>Patlat</button>
      : <span className="energy-meter" aria-hidden="true">{[3,4,5,6,9].map(n => <i key={n} className={count >= n || loop ? 'lit' : ''}/>)}</span>}
  </div>;
}
