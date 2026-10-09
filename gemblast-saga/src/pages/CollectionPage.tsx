import { Flame, Infinity as InfinityIcon, Star } from 'lucide-react';
import { PRISM_COLORS } from '../types/game';
import type { Profile } from '../utils/session';
import { GEM_STYLES, gemArtwork, styleAvailable } from '../utils/mystery';
import type { StoryRecord } from '../utils/storyPresentation';
import { format } from '../utils/format';
import { MysteryJournal } from '../components/Mystery';

type GemStyle = NonNullable<Profile['gemStyle']>;

export function CollectionPage({ profile, onStory, onGemStyle }: { profile: Profile; onStory: (record: StoryRecord) => void; onGemStyle: (style: GemStyle) => void }) {
  const totalStars = Object.values(profile.stages).reduce((sum, entry) => sum + entry.stars, 0);
  return <>
    <div className="page-intro compact"><h1>Koleksiyon</h1></div>
    <section className="stats-strip"><div><Star/><strong>{totalStars}</strong><span>Toplanan yıldız</span></div><div><Flame/><strong>{profile.dailyWins.length}</strong><span>Günlük zafer</span></div><div><InfinityIcon/><strong>{format(profile.zenBest)}</strong><span>Zen rekoru</span></div></section>
    <MysteryJournal profile={profile} onPlay={onStory}/>
    <div className="section-heading"><h2>Taş görünümü</h2></div>
    <section className="gem-styles" aria-label="Taş tasarımı seç">{GEM_STYLES.map(style => {
      const available = styleAvailable(profile, style.id), selected = (profile.gemStyle ?? 'motif') === style.id;
      return <button className={`gem-style ${selected ? 'selected' : ''}`} key={style.id} disabled={!available} aria-pressed={selected} onClick={() => onGemStyle(style.id)}><span className="style-samples" aria-hidden="true">{PRISM_COLORS.map(color => <img src={gemArtwork(color, style.id)} alt="" key={color} width="48" height="48" loading="lazy"/>)}</span><strong>{style.title}</strong><small>{style.description}</small><span>{selected ? 'Seçili' : available ? 'Bu görünümü kullan' : `Bölüm ${style.stage} sonunda açılır`}</span></button>;
    })}</section>
  </>;
}
