import { memo } from 'react';
import { LockKeyhole, Orbit, Zap } from 'lucide-react';
import { CellData, PRISM_DEFINITIONS } from '../types/game';
import { gemArtwork, type GemStyle } from '../utils/mystery';

/** One sprite, with motion only on charged stones, keeps cascades light. */
function PrismGemArtworkView({ cell, isSelected, isLoopHighlighted, chargeTier = 0, previewPower, gemStyle = 'motif' }: {
  cell: CellData; isSelected: boolean; isLoopHighlighted: boolean;
  chargeTier?: number; previewPower?: 'channel' | 'nova';
  gemStyle?: GemStyle;
}) {
  const def = PRISM_DEFINITIONS[cell.color];
  const charged = !cell.locked && (isSelected || isLoopHighlighted);
  return <div aria-hidden="true" className={`gem-art core-gem core-${cell.color} ${charged ? `charged core-charge-${chargeTier}` : ''} ${cell.locked ? 'sealed' : ''} ${cell.armor ? 'shelled' : ''} power-${cell.special}`}
    style={{ '--core-color': def.secondaryHex } as React.CSSProperties}>
    <span className="core-halo"/>
    <img className="core-sprite" src={gemArtwork(cell.color, gemStyle)} alt="" width="512" height="512" draggable={false}/>
    {charged && <span className="core-charge-aura"/>}
    {cell.special !== 'none' && !cell.locked && <span className={`power-mark ${cell.special}`}><span/></span>}
    {cell.armor && <span className="shell-mark"/>}
    {cell.locked && <span className="seal-mark"><LockKeyhole size={16}/></span>}
    {cell.multiplier > 1 && !cell.locked && <span className="gem-multiplier">{cell.multiplier}×</span>}
    {previewPower && !cell.locked && <span className="power-preview">{previewPower === 'nova' ? <Orbit size={11}/> : <Zap size={11}/>}<b>{previewPower === 'nova' ? '3×' : '+'}</b></span>}
  </div>;
}

export const PrismGemArtwork = memo(PrismGemArtworkView, (a, b) => a.gemStyle === b.gemStyle && a.isSelected === b.isSelected && a.isLoopHighlighted === b.isLoopHighlighted && a.chargeTier === b.chargeTier && a.previewPower === b.previewPower && a.cell.color === b.cell.color && a.cell.locked === b.cell.locked && a.cell.armor === b.cell.armor && a.cell.special === b.cell.special && a.cell.multiplier === b.cell.multiplier);
