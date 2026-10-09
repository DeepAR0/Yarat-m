import { Hammer, Plus, Sparkle, X } from 'lucide-react';
import { BOOSTERS, type BoosterKind, type MetaState } from '../utils/meta';
import { canUseBooster, type Session } from '../utils/session';

const ICONS: Record<BoosterKind, typeof Hammer> = { hammer: Hammer, prism: Sparkle, moves: Plus };

/** In-game boosters. Owned ones show a count; empty ones show their crystal price and buy on tap. */
export function BoosterBar({ session, meta, aiming, disabled, onUse, onCancel }: {
  session: Session; meta: MetaState; aiming: BoosterKind | null; disabled: boolean; onUse: (kind: BoosterKind) => void; onCancel: () => void;
}) {
  if (session.mode === 'daily') return <p className="booster-note">Günlük bulmaca herkes için eşit: güçlendirici kullanılmaz.</p>;
  if (aiming) return <div className="booster-aim" role="status"><span>{aiming === 'hammer' ? 'Kırmak istediğin taşa dokun.' : 'Silmek istediğin rengin bir taşına dokun.'}</span>
    <button onClick={onCancel}><X size={16}/>Vazgeç</button></div>;
  return <div className="booster-bar" aria-label="Güçlendiriciler">
    {(Object.keys(BOOSTERS) as BoosterKind[]).filter(kind => kind !== 'moves' || session.mode === 'classic').map(kind => {
      const Icon = ICONS[kind], owned = meta.boosters[kind], affordable = owned > 0 || meta.shards >= BOOSTERS[kind].price;
      return <button key={kind} className={`booster booster-${kind} ${affordable ? '' : 'booster-poor'}`} disabled={disabled || !canUseBooster(session, kind)}
        aria-label={`${BOOSTERS[kind].name}: ${BOOSTERS[kind].text} ${owned ? `${owned} adet` : `${BOOSTERS[kind].price} kristal`}`} onClick={() => onUse(kind)}>
        <Icon size={20}/><span>{kind === 'moves' ? '3 Hamle' : BOOSTERS[kind].name}</span>{owned ? <b>{owned}</b> : <b className="booster-price">{BOOSTERS[kind].price}✦</b>}
      </button>;
    })}
  </div>;
}
