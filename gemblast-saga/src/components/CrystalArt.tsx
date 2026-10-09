import { PrismGemArtwork } from './PrismGemArtwork';
import { PRISM_COLORS } from '../types/game';
import type { GemStyle } from '../utils/mystery';

export function CrystalArt({gemStyle}: {gemStyle?:GemStyle}) {
  return <div className="crystal-art" aria-hidden="true">
    <span className="crystal-orbit orbit-one"/><span className="crystal-orbit orbit-two"/>
    <span className="hero-flare flare-one"/><span className="hero-flare flare-two"/>
    {PRISM_COLORS.map(color => <div className={`hero-crystal hero-${color}`} key={color}>
      <PrismGemArtwork gemStyle={gemStyle} cell={{ id: `hero-${color}`, color, multiplier: 1, special: 'none', locked: false }} isSelected={false} isLoopHighlighted={false}/>
    </div>)}
    <span className="hero-spark spark-one">✦</span><span className="hero-spark spark-two">✧</span><span className="hero-spark spark-three">✦</span>
  </div>;
}
