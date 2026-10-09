import { ArrowRight, ChevronRight, Flame, LockKeyhole, Trophy, Zap, Hand, MousePointer2, Lightbulb, Orbit, RotateCcw, Share2, ShieldCheck } from 'lucide-react';
import type { Profile, Session } from '../utils/session';
import { PRISM_DEFINITIONS, type StageConfig } from '../types/game';
import { format } from '../utils/format';
import { Dialog } from './Dialog';
import { PrismGemArtwork } from './PrismGemArtwork';

export function MoreDialog({ session, tapMode, onTapMode, onClose, onRestart, onShare, onLearnLink, onLearnLoop, onGuide }: {
  session: Session; tapMode: boolean; onTapMode: () => void; onClose: () => void; onRestart: () => void; onShare: () => void; onLearnLink: () => void; onLearnLoop: () => void; onGuide: () => void;
}) {
  return <Dialog title="Oyun seçenekleri" onClose={onClose}>
    <div className="more-actions">
      <button onClick={onTapMode}>{tapMode ? <MousePointer2 size={20}/> : <Hand size={20}/>}<span><strong>{tapMode ? 'Sürükleyerek bağla' : 'Dokunarak bağla'}</strong><small>{tapMode ? 'Parmağını taşların üzerinde gezdir' : 'Taşlara tek tek dokun, sonra Patlat'}</small></span><ChevronRight size={18}/></button>
      <button onClick={onRestart}><RotateCcw size={20}/><span><strong>Yeniden başla</strong><small>{session.mode === 'daily' ? 'Aynı günlük bulmacayı tekrar dene' : 'Yeni bir taş dizilimiyle dene'}</small></span><ChevronRight size={18}/></button>
      <button onClick={onShare}><Share2 size={20}/><span><strong>Skoru paylaş</strong><small>{format(session.score)} puan</small></span><ChevronRight size={18}/></button>
      <button disabled={session.outcome !== 'playing'} onClick={onLearnLink}><Hand size={20}/><span><strong>Bağlamayı öğren</strong><small>Tahta üzerinde kısa alıştırma</small></span><ChevronRight size={18}/></button>
      <button disabled={session.outcome !== 'playing'} onClick={onLearnLoop}><Orbit size={20}/><span><strong>Halkayı öğren</strong><small>Başlangıca dön, bütün rengi uyandır</small></span><ChevronRight size={18}/></button>
      <button onClick={onGuide}><Lightbulb size={20}/><span><strong>Tüm oyun kuralları</strong><small>Güçler, mühürler ve hedefler</small></span><ChevronRight size={18}/></button>
    </div>
  </Dialog>;
}

export function GuideDialog({ gemStyle, onClose }: { gemStyle: Profile['gemStyle']; onClose: () => void }) {
  return <Dialog title="Bağla. Halkayı kapat." onClose={onClose}><p className="dialog-lead">Aynı renkteki çekirdekleri bağla ve enerjiyi büyüt. Halkayı kapatıp bütün rengi uyandır.</p><div className="guide-chain" aria-hidden="true">{[1, 2, 3].map(n => <span key={n}><PrismGemArtwork gemStyle={gemStyle} cell={{ id: `guide-${n}`, color: 'coral', multiplier: 1, special: 'none', locked: false }} isSelected={true} isLoopHighlighted={false}/></span>)}<ArrowRight size={23}/><span className="guide-score">+90</span></div><ol className="guide-list"><li><strong>Aynı renkte en az 3 çekirdek bağla.</strong><p>Yatay, dikey veya çapraz sürükle. “Sürükle / Dokun” düğmesiyle bağlama modunu değiştirebilirsin. Klavyede oklarla ilerle, Enter ile seç.</p></li><li><strong>Taşlar her zaman aşağı düşer.</strong><p>Zinciri istediğin yönde çiz. Temizlenen boşluklar üstten dolar. Parlayan taşlar, hamlenden etkilenecek taşları gösterir.</p></li><li><strong>Halkayla bütün rengi temizle.</strong><p>Aynı renkten en az 4 taşı kesişmeden bağla ve başlangıç taşına dön. Tahtanın her yerindeki aynı renk açık taşlar temizlenir. Halka 2× puan ve 3× Nova kazandırır.</p></li><li><strong>Uzun zincirlerin enerjisini kullan.</strong><p>4 taş ışık kanalı; 5 taş 2× kanal; 6 ve üzeri 3× rezonans çekirdeği oluşturur. Kanal satır veya sütunu, rezonans çevresini temizler.</p></li><li><strong>Diyarın tüm hedeflerini tamamla.</strong><p>Puan ve renk hedeflerini; varsa halka, mühür veya güç hedefini bitir. Mühürlü taşları açmak için yanlarındaki taşları temizle.</p></li></ol><button className="primary-button full" onClick={onClose}>Anladım, başlayalım<ArrowRight size={18}/></button></Dialog>;
}

export function RestartDialog({ session, streakAtRisk = false, onClose, onConfirm }: { session: Session; streakAtRisk?: boolean; onClose: () => void; onConfirm: () => void }) {
  return <Dialog title="Yeniden başlayalım mı?" onClose={onClose}><p className="dialog-lead">Bu oyunun puanı ve hamleleri sıfırlanır. Kazandığın yıldızlar ve rekorlar korunur. {session.mode === 'daily' ? 'Günlük bulmacanın taş dizilimi aynı kalır.' : 'Taşlar yeni bir dizilimle başlar.'}</p>{streakAtRisk && <p className="streak-warning">Yarıda bırakırsan alev serin sıfırlanır.</p>}<div className="dialog-actions"><button className="secondary-button" onClick={onClose}>Oyuna dön</button><button className="primary-button" onClick={onConfirm}>Yeniden başla</button></div></Dialog>;
}

export function EraseDialog({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  return <Dialog title="İlerlemeni sıfırla" onClose={onClose}><p className="dialog-lead">Tüm yıldızların, rekorların ve kayıtlı oyunların bu cihazdan silinecek. Bu işlem geri alınamaz.</p><div className="dialog-actions"><button className="secondary-button" onClick={onClose}>Vazgeç</button><button className="danger-button" onClick={onConfirm}>Tümünü sıfırla</button></div></Dialog>;
}

export function PrivacyDialog({ onClose }: { onClose: () => void }) {
  return <Dialog title="Gizlilik ve verilerin" onClose={onClose}><div className="privacy-copy"><ShieldCheck size={34}/><p>Macera ilerlemesi, yıldızlar, rekorlar ve ayarlar cihazında tutulur. iOS uygulamasında isteğe bağlı AdMob ödüllü reklamları bulunur. Reklam sağlayıcısı reklam sunumu ve ölçümü için cihaz, ağ, etkileşim ve tanılama verilerini işleyebilir. Gizlilik seçeneklerin ilgili bölgelerde gösterilir; reddetmek oyuna erişimini engellemez.</p><p>Skorunu paylaşmayı seçersen, paylaşılacak metni ve hedef uygulamayı sen belirlersin. iOS liginde Game Center kullanılır; Apple oyuncu kimliğin ve skorların Apple hizmetine iletilir. Web skor ligine katılırsan oyuncu adın, hesap kimliğin ve doğrulanmış günlük skorların sunucuda saklanır. Sıralamada diğer oyuncular yalnızca oyuncu adını ve skorunu görür. Günlük hamle kaydın, sonucu doğrulamak için sen gönderdiğinde sunucuya iletilir; hamleler kalıcı olarak saklanmaz.</p><p>Yerel ilerlemeni Ayarlar’dan sıfırlayabilirsin. Lig ekranındaki “Sıralamadaki verilerimi sil” ile sunucudaki lig adını ve skorlarını silebilirsin. Uygulamayı kaldırmak sunucudaki lig verilerini silmez. Macera kayıtları cihazlar arasında otomatik eşitlenmez.</p><p><a href="./privacy.html" className="text-button">Tam gizlilik politikasını oku<ArrowRight size={16}/></a></p></div><button className="secondary-button full" onClick={onClose}>Kapat</button></Dialog>;
}

/** Pre-level card: what this stage asks, how many moves, and the streak bonus waiting on the board. */
export function StageIntro({ session, stage, gemStyle, streak, onClose }: { session: Session; stage: StageConfig; gemStyle: Profile['gemStyle']; streak: number; onClose: () => void }) {
  const loops = stage.loopsTarget ?? (stage.requireLoop ? 1 : 0);
  return <Dialog className="stage-intro" title={`Bölüm ${stage.id} · ${stage.title}`} onClose={onClose}>
    <div className="intro-moves"><strong>{session.movesLeft}</strong><span>hamle</span></div>
    <ul className="intro-goals" aria-label="Hedefler">
      <li><Trophy size={20}/><b>{format(stage.targetScore)}</b><small>puan</small></li>
      {stage.quotas.map(q => <li key={q.color}><span className="intro-gem"><PrismGemArtwork gemStyle={gemStyle} cell={{ id: q.color, color: q.color, multiplier: 1, special: 'none', locked: false }} isSelected={false} isLoopHighlighted={false}/></span><b>{q.target}</b><small>{PRISM_DEFINITIONS[q.color].name}</small></li>)}
      {loops > 0 && <li><Orbit size={20}/><b>{loops}</b><small>halka</small></li>}
      {!!stage.sealsTarget && <li><LockKeyhole size={20}/><b>{stage.sealsTarget}</b><small>mühür</small></li>}
      {!!stage.specialsTarget && <li><Zap size={20}/><b>{stage.specialsTarget}</b><small>güç</small></li>}
    </ul>
    {stage.lesson && <p className="intro-tip">{stage.lesson}</p>}
    {stage.armoredCoords?.length && !stage.lesson?.includes('abuk') ? <p className="intro-tip">Kristal kabuklu mühürler iki darbe ister.</p> : null}
    {session.streakBonus ? <p className="intro-streak"><Flame size={18}/>Alev serisi {streak}: tahtada {session.streakBonus} hazır güç taşı var!</p> : null}
    <button className="primary-button full" onClick={onClose}>Başla<ArrowRight size={18}/></button>
  </Dialog>;
}
