import { Hammer, Lightbulb, MoreHorizontal, Plus, Shuffle, Sparkle, X } from 'lucide-react';
import { BOOSTERS, type BoosterKind, type MetaState } from '../utils/meta';
import { canUseBooster, type Session } from '../utils/session';

const ICONS: Record<BoosterKind, typeof Hammer> = { hammer: Hammer, prism: Sparkle, moves: Plus };
const SHORT: Record<BoosterKind, string> = { hammer: 'Çekiç', prism: 'Prizma', moves: '+3' };

/** One compact row: hint, shuffle, boosters (not in the daily puzzle) and the options menu. */
export function GameToolbar({ session, meta, aiming, disabled, onUse, onCancel, onHint, onShuffle, onMore }: {
  session: Session; meta: MetaState; aiming: BoosterKind | null; disabled: boolean; onUse: (kind: BoosterKind) => void; onCancel: () => void;
  onHint: () => void; onShuffle: () => void; onMore: () => void;
}) {
  if (aiming) return <div className="booster-aim" role="status"><span>{aiming === 'hammer' ? 'Kırmak istediğin taşa dokun.' : 'Silmek istediğin rengin bir taşına dokun.'}</span>
    <button onClick={onCancel}><X size={16}/>Vazgeç</button></div>;
  const boosters = session.mode === 'daily' ? [] : (Object.keys(BOOSTERS) as BoosterKind[]).filter(kind => kind !== 'moves' || session.mode === 'classic');
  return <div className="game-toolbar" aria-label="Oyun araçları">
    <button className="tool" disabled={disabled} onClick={onHint}><Lightbulb size={20}/><span>İpucu</span></button>
    <button className="tool" disabled={disabled || session.shufflesLeft === 0} onClick={onShuffle}><Shuffle size={20}/><span>Karıştır</span><b>{session.shufflesLeft}</b></button>
    {boosters.map(kind => {
      const Icon = ICONS[kind], owned = meta.boosters[kind], affordable = owned > 0 || meta.shards >= BOOSTERS[kind].price;
      return <button key={kind} className={`tool booster booster-${kind} ${affordable ? '' : 'booster-poor'}`} disabled={disabled || !canUseBooster(session, kind)}
        aria-label={`${BOOSTERS[kind].name}: ${BOOSTERS[kind].text} ${owned ? `${owned} adet` : `${BOOSTERS[kind].price} kristal`}`} onClick={() => onUse(kind)}>
        <Icon size={20}/><span>{SHORT[kind]}</span>{owned ? <b>{owned}</b> : <b className="booster-price">{BOOSTERS[kind].price}✦</b>}
      </button>;
    })}
    <button className="tool" onClick={onMore} aria-haspopup="dialog" aria-label="Diğer seçenekler"><MoreHorizontal size={20}/><span>Diğer</span></button>
  </div>;
}
