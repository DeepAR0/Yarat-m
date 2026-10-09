import { Award, Check, Flame, Gift, Hammer, LockKeyhole, Plus, Sparkle, Star, Target } from 'lucide-react';
import type { Profile } from '../utils/session';
import { achievementBoard, BOOSTERS, CHESTS, LOGIN_REWARDS, loginStatus, metaOf, missionBoard, starChestProgress, type BoosterKind } from '../utils/meta';
import { format } from '../utils/format';

const BOOSTER_ICONS: Record<BoosterKind, typeof Hammer> = { hammer: Hammer, prism: Sparkle, moves: Plus };

/** Daily check-in, missions, chests, booster shop and achievements in one place. */
export function RewardsPage({ profile, today, onCheckIn, onMission, onOpenChest, onBuy, onAchievement }: {
  profile: Profile; today: string; onCheckIn: () => void; onMission: (id: string) => void; onOpenChest: () => void;
  onBuy: (kind: BoosterKind) => void; onAchievement: (id: string) => void;
}) {
  const meta = metaOf(profile), login = loginStatus(meta, today), board = missionBoard(meta, today);
  const chest = starChestProgress(profile), achievements = achievementBoard(profile);
  const doneAchievements = achievements.filter(a => a.claimed).length;
  // Claimable first, then the closest goals; finished ones sink to the bottom.
  const rank = (a: (typeof achievements)[number]) => a.claimed ? 2 : a.done ? -1 : 1 - a.progress / a.target;
  const ordered = [...achievements].sort((x, y) => rank(x) - rank(y));
  return <>
    <div className="page-intro compact"><h1>Ödüller</h1></div>
    <section className="wallet-strip" aria-label="Envanter">
      <div className="wallet-shards"><span className="shard-icon" aria-hidden="true">✦</span><strong>{format(meta.shards)}</strong><small>kristal</small></div>
      {(Object.keys(BOOSTERS) as BoosterKind[]).map(kind => { const Icon = BOOSTER_ICONS[kind]; return <div key={kind}><Icon size={18}/><strong>{meta.boosters[kind]}</strong><small>{BOOSTERS[kind].name}</small></div>; })}
      <div className={meta.winStreak ? 'wallet-streak lit' : 'wallet-streak'}><Flame size={18}/><strong>{meta.winStreak}</strong><small>alev serisi</small></div>
    </section>

    <section className="reward-card checkin-card" aria-labelledby="checkin-title">
      <header><h2 id="checkin-title">Günlük giriş</h2><span>{login.streak ? `${login.streak} gün üst üste` : 'Seriye bugün başla'}</span></header>
      {login.broken && <p className="reward-note">Bir gün kaçtı, takvim baştan başladı. Bugün yeniden başla!</p>}
      <ol className="checkin-days">{LOGIN_REWARDS.map((reward, i) => {
        const claimed = i < login.index || (!login.claimable && i === login.index), next = login.claimable && i === login.index;
        return <li key={i} className={`${claimed ? 'claimed' : ''} ${next ? 'next' : ''} ${i === 6 ? 'grand' : ''}`}><small>{i + 1}. gün</small>
          <span aria-hidden="true">{reward.chest ? <Gift size={20}/> : claimed ? <Check size={18}/> : reward.loot?.shards ? '✦' : <Sparkle size={18}/>}</span><b>{reward.label}</b></li>;
      })}</ol>
      <button className="primary-button full" disabled={!login.claimable} onClick={onCheckIn}>{login.claimable ? `Bugünün ödülünü al · ${LOGIN_REWARDS[login.index].label}` : 'Yarın yeni ödül seni bekliyor'}</button>
    </section>

    <section className="reward-card chest-card" aria-labelledby="chest-title">
      <header><h2 id="chest-title">Sandıklar</h2><span>{meta.chests.length ? `${meta.chests.length} sandık açılmayı bekliyor` : 'Yıldız topla, görevleri bitir'}</span></header>
      <div className="chest-row">
        <div className={`chest-visual ${meta.chests.length ? 'ready' : ''}`} data-tone={meta.chests[0] ? CHESTS[meta.chests[0]].tone : 'amber'} aria-hidden="true"><Gift size={42}/>{meta.chests.length > 1 && <b>×{meta.chests.length}</b>}</div>
        <div className="chest-info"><strong>{meta.chests[0] ? CHESTS[meta.chests[0]].name : 'Sonraki yıldız sandığı'}</strong>
          <div className="target-track" aria-label={`${chest.current} / ${chest.target} yıldız`}><span style={{ width: `${chest.current / chest.target * 100}%` }}/></div>
          <small><Star size={12} fill="currentColor"/> {chest.current} / {chest.target} yıldız · diyar bitirmek büyük hazine verir</small></div>
      </div>
      {meta.chests.length > 0 && <button className="primary-button full chest-open" onClick={onOpenChest}><Gift size={18}/>Sandığı aç</button>}
    </section>

    <section className="reward-card" aria-labelledby="missions-title">
      <header><h2 id="missions-title">Günlük görevler</h2><span>{board.bonusClaimed ? 'Görev sandığı alındı' : 'Üçü de bitince görev sandığı'}</span></header>
      <ul className="mission-list">{board.list.map(m => <li key={m.id} className={m.claimed ? 'claimed' : m.progress >= m.target ? 'ready' : ''}>
        <Target size={20}/><div><strong>{m.title}</strong><div className="target-track"><span style={{ width: `${m.progress / m.target * 100}%` }}/></div><small>{m.progress} / {m.target} · {m.reward} ✦</small></div>
        {m.claimed ? <Check size={20} aria-label="Alındı"/> : <button className="mission-claim" disabled={m.progress < m.target} onClick={() => onMission(m.id)}>Al</button>}
      </li>)}</ul>
    </section>

    <section className="reward-card" aria-labelledby="shop-title">
      <header><h2 id="shop-title">Kristal dükkânı</h2><span>Oyunda kazanılan kristalle</span></header>
      <ul className="shop-list">{(Object.keys(BOOSTERS) as BoosterKind[]).map(kind => { const Icon = BOOSTER_ICONS[kind]; return <li key={kind}>
        <Icon size={24}/><div><strong>{BOOSTERS[kind].name}</strong><small>{BOOSTERS[kind].text}</small></div>
        <button className="shop-buy" disabled={meta.shards < BOOSTERS[kind].price} onClick={() => onBuy(kind)}>{BOOSTERS[kind].price} ✦</button></li>; })}</ul>
    </section>

    <section className="reward-card" aria-labelledby="ach-title">
      <header><h2 id="ach-title">Başarımlar</h2><span>{doneAchievements} / {achievements.length}</span></header>
      <ul className="achievement-list">{ordered.slice(0, 4).map(a => <li key={a.id} className={`achievement ${a.claimed ? 'unlocked' : ''} ${a.done && !a.claimed ? 'ready' : ''}`}>
        <Award size={23}/><div><strong>{a.title}</strong><p>{a.text}</p>{!a.claimed && <small>{format(a.progress)} / {format(a.target)} · {a.reward} ✦</small>}</div>
        {a.claimed ? <Check size={20}/> : a.done ? <button className="mission-claim" onClick={() => onAchievement(a.id)}>Al</button> : <LockKeyhole size={17}/>}
      </li>)}</ul>
      {ordered.length > 4 && <details className="more-achievements"><summary>Diğer {ordered.length - 4} başarım</summary><ul className="achievement-list">{ordered.slice(4).map(a => <li key={a.id} className={`achievement ${a.claimed ? 'unlocked' : ''} ${a.done && !a.claimed ? 'ready' : ''}`}>
        <Award size={23}/><div><strong>{a.title}</strong><p>{a.text}</p>{!a.claimed && <small>{format(a.progress)} / {format(a.target)} · {a.reward} ✦</small>}</div>
        {a.claimed ? <Check size={20}/> : a.done ? <button className="mission-claim" onClick={() => onAchievement(a.id)}>Al</button> : <LockKeyhole size={17}/>}
      </li>)}</ul></details>}
    </section>
  </>;
}
