import { ArrowRight, Diamond, Share2, Sparkles, Trophy, Zap } from 'lucide-react';
import { STAGES } from '../types/game';
import { canRewardContinue, starsFor, type Profile, type Session } from '../utils/session';
import { ECHOES, type mysteryProgress } from '../utils/mystery';
import type { StoryRecord } from '../utils/storyPresentation';
import { rewardedAdsAvailable } from '../utils/ads';
import { format } from '../utils/format';
import { Dialog } from './Dialog';
import { StarRating } from './StarRating';
import { StoryPlayer } from './StoryPlayer';

export function ResultDialog({ profile, session, mystery, discoveryScene, reducedMotion, adBusy, adNotice, canSave, onNavigate, onWatchAd, onNextStage, onRestart, onShare }: {
  profile: Profile; session: Session; mystery: ReturnType<typeof mysteryProgress>; discoveryScene: StoryRecord | undefined; reducedMotion: boolean;
  adBusy: boolean; adNotice: string; canSave: boolean; onNavigate: (page: 'journey' | 'collection' | 'league') => void;
  onWatchAd: () => void; onNextStage: () => void; onRestart: () => void; onShare: () => void;
}) {
  return <Dialog key="result" className="result-dialog" title={session.outcome === 'won' ? 'Diyar uyandı!' : 'Bir bağlantı daha?'} onClose={() => { if (!adBusy) onNavigate('journey'); }}>
    {discoveryScene && <StoryPlayer key={discoveryScene.id} record={discoveryScene} reducedMotion={reducedMotion} compact/>}
    {!discoveryScene && <div className={`result-emblem ${session.outcome === 'won' ? 'won' : ''}`}>{session.outcome === 'won' ? <Trophy size={46}/> : <Diamond size={46}/>}</div>}
    {session.outcome === 'won' && <StarRating stars={starsFor(session)}/>}
    <p className="dialog-lead">{session.outcome === 'won' ? 'Tüm hedefleri tamamladın. Işık bir adım daha ilerledi.' : 'Hamleler bitti. Uzun zincirler ve renk dalgalarıyla yeniden dene.'}</p>
    {session.outcome === 'won' && session.mode === 'classic' && <div className="result-discovery"><strong>{mystery.unlocked.at(-1)?.title ?? 'İlk ışık'}</strong><p>{mystery.unlocked.at(-1)?.stage === session.stageId ? mystery.unlocked.at(-1)?.text : mystery.next ? `Yolun bir parçası onarıldı. Bölüm ${mystery.next.stage} sonunda yeni bir kayıt açılacak.` : 'Kulenin yolu açıldı. Son Uyanış için yedi yankıyı tamamla.'}</p><button className="text-button" onClick={() => onNavigate('collection')}>{mystery.finale ? 'Son Uyanış’ı oku' : 'Günlüğü aç'}<Sparkles size={16}/></button></div>}
    {session.outcome === 'won' && session.mode === 'daily' && <div className="result-discovery"><strong>{(profile.mysteryDays ?? profile.dailyWins).includes(session.dailyKey!) ? `Yankı ${Math.min(7, (profile.mysteryDays ?? profile.dailyWins).indexOf(session.dailyKey!) + 1)} · Günlüğüne kaydedildi` : 'Günlük bulmaca tamamlandı'}</strong><p>{(profile.mysteryDays ?? profile.dailyWins).includes(session.dailyKey!) ? ECHOES[(profile.mysteryDays ?? profile.dailyWins).indexOf(session.dailyKey!)]?.text : mystery.echoes === 7 ? 'Yedi yankı tamam. Günlük skorunu ligde geliştirebilirsin.' : 'Yeni yankı için bugünün bulmacasını kazan.'}</p><button className="text-button" onClick={() => onNavigate('collection')}>{mystery.finale ? 'Son Uyanış’ı oku' : 'Yankıları oku'}<Sparkles size={16}/></button></div>}
    <div className="result-score"><strong>{format(session.score)}</strong><span>PUAN</span></div>
    {rewardedAdsAvailable() && canRewardContinue(session) && <div className="reward-offer"><button className="primary-button full" disabled={adBusy || !canSave} onClick={onWatchAd}><Zap size={18}/>{adBusy ? 'Reklam hazırlanıyor…' : 'Reklam izle · +5 hamle'}</button><small>Bölüm başına bir kez. Reklamı tamamla, aynı tahtadan devam et. Bu denemede en fazla 1 yıldız kazanılır.</small></div>}
    {adNotice && <p role="status" className="league-notice">{adNotice}</p>}
    {adBusy && <p role="status">Reklam hazırlanıyor. Erken kapatırsan ödül verilmez.</p>}
    {session.mode === 'daily' ? <button disabled={adBusy} className="primary-button full" onClick={() => onNavigate('league')}>Skoru lige gönder<Trophy size={18}/></button> : session.outcome === 'won' && session.mode === 'classic' && session.stageId < STAGES.length ? <button disabled={adBusy} className="primary-button full" onClick={onNextStage}>Sonraki bölüm<ArrowRight size={18}/></button> : <button disabled={adBusy} className="primary-button full" onClick={session.outcome === 'won' ? () => onNavigate('journey') : onRestart}>{session.outcome === 'won' ? 'Ana ekrana dön' : 'Tekrar dene'}<ArrowRight size={18}/></button>}
    <div className="result-secondary" inert={adBusy}>{session.mode === 'daily' && <button className="text-button" onClick={onRestart}>Tekrar dene</button>}<button className="text-button" onClick={onShare}><Share2 size={17}/>Skoru paylaş</button><button className="text-button" onClick={() => onNavigate('journey')}>Bölümler</button></div>
  </Dialog>;
}
