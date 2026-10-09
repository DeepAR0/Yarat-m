import { ArrowRight, Gift } from 'lucide-react';
import { CHESTS, type ChestKind } from '../utils/meta';
import { Dialog } from './Dialog';

/** Chest reveal: the lid bursts, then the loot lines rise one by one. */
export function ChestDialog({ kind, items, more, reducedMotion, onClose, onNext }: {
  kind: ChestKind; items: string[]; more: number; reducedMotion: boolean; onClose: () => void; onNext: () => void;
}) {
  return <Dialog key={`${kind}-${items.join()}`} className={`chest-dialog ${reducedMotion ? 'still' : ''}`} title={CHESTS[kind].name} onClose={onClose}>
    <div className="chest-reveal" data-tone={CHESTS[kind].tone} aria-hidden="true"><span className="chest-rays"/><Gift size={64}/></div>
    <ul className="chest-loot" aria-label="Sandıktan çıkanlar">{items.map((item, i) => <li key={item} style={{ animationDelay: `${300 + i * 220}ms` }}>{item}</li>)}</ul>
    {more > 0 ? <button className="primary-button full" onClick={onNext}><Gift size={18}/>Sıradaki sandığı aç ({more})</button>
      : <button className="primary-button full" onClick={onClose}>Harika!<ArrowRight size={18}/></button>}
  </Dialog>;
}
