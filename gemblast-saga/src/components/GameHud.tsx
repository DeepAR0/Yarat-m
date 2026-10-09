import { ArrowLeft, Check, LockKeyhole, Orbit, Trophy, Volume2, VolumeX, Zap } from 'lucide-react';
import { PRISM_COLORS, PRISM_DEFINITIONS, type StageConfig } from '../types/game';
import type { Profile, Session } from '../utils/session';
import { format } from '../utils/format';
import { PrismGemArtwork } from './PrismGemArtwork';

/** Game header, score/move metrics and the stage goal strip. */
export function GameHud({ session, stage: currentStage, gemStyle, sound, onBack, onToggleSound }: {
  session: Session; stage: StageConfig; gemStyle: Profile['gemStyle']; sound: boolean; onBack: () => void; onToggleSound: () => void;
}) {
  const loopGoal = currentStage.loopsTarget ?? (currentStage.requireLoop ? 1 : 0);
  return <>
    <div className="game-top"><button className="icon-button" aria-label="Ana ekrana dön, oyun kaydedilir" onClick={onBack}><ArrowLeft size={20}/></button><div><span className="eyebrow">{session.mode === 'classic' ? `BÖLÜM ${String(session.stageId).padStart(2, '0')}` : session.mode === 'daily' ? session.dailyKey : 'SINIRSIZ OYUN'}</span><h2>{session.mode === 'zen' ? 'Serbest akış' : currentStage.title}</h2></div><button className="icon-button" aria-label={sound ? 'Sesi kapat' : 'Sesi aç'} aria-pressed={sound} onClick={onToggleSound}>{sound ? <Volume2 size={20}/> : <VolumeX size={20}/>}</button></div>
    <div className="game-metrics"><div><span>PUAN</span><strong data-testid="score">{format(session.score)}</strong></div><div className={session.mode !== 'zen' && session.movesLeft <= 4 ? 'low-moves' : ''}><span>{session.mode === 'zen' ? 'AKIŞ' : 'HAMLE'}</span><strong data-testid="moves">{session.mode === 'zen' ? '∞' : session.movesLeft}</strong></div></div>
    <div className="targets" aria-label="Bölüm hedefleri">
      {session.mode !== 'zen' && <div className={`target ${session.score >= currentStage.targetScore ? 'done' : ''}`}><Trophy size={18}/><span>{format(Math.min(session.score, currentStage.targetScore))}<small> / {format(currentStage.targetScore)}</small></span><div className="target-track"><span style={{ width: `${Math.min(100, session.score / currentStage.targetScore * 100)}%` }}/></div></div>}
      {(session.mode === 'zen' ? PRISM_COLORS.map(color => ({ color, target: 0 })) : currentStage.quotas).map(q => <div className={`target ${q.target && session.collected[q.color] >= q.target ? 'done' : ''}`} key={q.color} aria-label={`${PRISM_DEFINITIONS[q.color].name}, ${session.collected[q.color]}${q.target ? ` / ${q.target}` : ''}`}><span className="target-glyph"><PrismGemArtwork gemStyle={gemStyle} cell={{ id: q.color, color: q.color, multiplier: 1, special: 'none', locked: false }} isSelected={false} isLoopHighlighted={false}/></span><span>{Math.min(session.collected[q.color], q.target || Infinity)}{q.target > 0 && <small> / {q.target}</small>}</span>{q.target > 0 && <div className="target-track"><span style={{ width: `${Math.min(100, session.collected[q.color] / q.target * 100)}%`, background: PRISM_DEFINITIONS[q.color].secondaryHex }}/></div>}</div>)}
      {loopGoal > 0 && <div className={`target target-rule ${session.loopsMade >= loopGoal ? 'done' : ''}`} aria-label={`Halka hedefi: ${session.loopsMade} / ${loopGoal}`}><Orbit size={18}/><span>{Math.min(session.loopsMade,loopGoal)} / {loopGoal}</span>{session.loopsMade >= loopGoal && <Check size={13}/>}</div>}
      {!!currentStage.sealsTarget && <div className={`target target-rule ${session.sealsOpened >= currentStage.sealsTarget ? 'done' : ''}`} aria-label={`Mühür hedefi: ${session.sealsOpened} / ${currentStage.sealsTarget}`}><LockKeyhole size={18}/><span>{Math.min(session.sealsOpened,currentStage.sealsTarget)} / {currentStage.sealsTarget}</span></div>}
      {!!currentStage.specialsTarget && <div className={`target target-rule ${session.specialsTriggered >= currentStage.specialsTarget ? 'done' : ''}`} aria-label={`Güç hedefi: ${session.specialsTriggered} / ${currentStage.specialsTarget}`}><Zap size={18}/><span>{Math.min(session.specialsTriggered,currentStage.specialsTarget)} / {currentStage.specialsTarget}</span></div>}
    </div>
  </>;
}
