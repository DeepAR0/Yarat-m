import { Check, Compass, Flame, Infinity as InfinityIcon, LockKeyhole, Sparkles, Star } from 'lucide-react';
import { PRISM_COLORS, PRISM_DEFINITIONS } from '../types/game';
import type { Profile } from '../utils/session';
import { GEM_STYLES, gemArtwork, styleAvailable } from '../utils/mystery';
import type { StoryRecord } from '../utils/storyPresentation';
import { format } from '../utils/format';
import { MysteryJournal } from '../components/Mystery';
import { PrismGemArtwork } from '../components/PrismGemArtwork';

type GemStyle = NonNullable<Profile['gemStyle']>;

export function CollectionPage({ profile, onStory, onGemStyle }: { profile: Profile; onStory: (record: StoryRecord) => void; onGemStyle: (style: GemStyle) => void }) {
  const totalStars = Object.values(profile.stages).reduce((sum, entry) => sum + entry.stars, 0);
  const completed = Object.values(profile.stages).filter(entry => entry.stars > 0).length;
  return <>
    <div className="page-intro"><div className="eyebrow">BEŞ ÇEKİRDEK · TEK ENERJİ</div><h1>Koleksiyonun</h1><p>Köz, Gelgit, Güneş, Eter ve Yaşam. Alev, damla, yıldız, kristal ve yaprak: her çekirdeğin kendine özgü bir simgesi var.</p></div>
    <section className="stats-strip"><div><Star/><strong>{totalStars}</strong><span>Toplanan yıldız</span></div><div><Flame/><strong>{profile.dailyWins.length}</strong><span>Günlük zafer</span></div><div><InfinityIcon/><strong>{format(profile.zenBest)}</strong><span>Zen rekoru</span></div></section>
    <MysteryJournal profile={profile} onPlay={onStory}/>
    <div className="section-heading"><h2>Taş görünümün</h2><span>Yalnızca görünüm</span></div>
    <section className="gem-styles" aria-label="Taş tasarımı seç">{GEM_STYLES.map(style => {
      const available = styleAvailable(profile, style.id), selected = (profile.gemStyle ?? 'motif') === style.id;
      return <button className={`gem-style ${selected ? 'selected' : ''}`} key={style.id} disabled={!available} aria-pressed={selected} onClick={() => onGemStyle(style.id)}><span className="style-samples" aria-hidden="true">{PRISM_COLORS.map(color => <img src={gemArtwork(color, style.id)} alt="" key={color} width="48" height="48" loading="lazy"/>)}</span><strong>{style.title}</strong><small>{style.description}</small><span>{selected ? 'Seçili' : available ? 'Bu görünümü kullan' : `Bölüm ${style.stage} sonunda açılır`}</span></button>;
    })}</section>
    <section className="crystal-collection">{PRISM_COLORS.map(color => {
      const def = PRISM_DEFINITIONS[color];
      return <div key={color} className="collection-gem" style={{ '--gem-color': def.hex } as React.CSSProperties}><div className="gem-preview"><PrismGemArtwork gemStyle={profile.gemStyle} cell={{ id: color, color, multiplier: 1, special: 'none', locked: false }} isSelected={false} isLoopHighlighted={false}/></div><h2>{def.name}</h2><span>{def.symbol} simgesi</span></div>;
    })}</section>
    <div className="section-heading"><h2>Kazandığın izler</h2></div><section className="achievement-list">
      {[{ title: 'İlk uyanış', text: 'İlk macera bölümünü tamamla.', done: completed >= 1, icon: Sparkles }, { title: 'Diyar gezgini', text: '10 macera bölümünü tamamla.', done: completed >= 10, icon: Compass }, { title: 'Günün yıldızı', text: 'Bir günlük bulmacayı tamamla.', done: profile.dailyWins.length >= 1, icon: Flame }, { title: 'Zen ustası', text: 'Zen modunda 5.000 puana ulaş.', done: profile.zenBest >= 5000, icon: InfinityIcon }].map(a => <div className={`achievement ${a.done ? 'unlocked' : ''}`} key={a.title}><a.icon size={23}/><div><strong>{a.title}</strong><p>{a.text}</p></div>{a.done ? <Check size={20}/> : <LockKeyhole size={17}/>}</div>)}
    </section>
  </>;
}
