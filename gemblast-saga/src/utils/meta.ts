import { localDateKey, PRISM_COLORS, PRISM_DEFINITIONS, type PrismColor } from '../types/game';
import { createRNG } from './boardEngine';
import { starsFor, type Profile, type Session } from './session';

/** Everything that brings a player back: a soft currency, boosters, a check-in calendar, daily missions, chests and achievements. */
export type BoosterKind = 'hammer' | 'prism' | 'moves';
export type ChestKind = 'star' | 'mission' | 'streak' | 'realm';
export interface MetaStats { wins: number; loops: number; novas: number; specials: number; gems: number; seals: number; boostersUsed: number; bestChain: number }
export interface MetaState {
  shards: number;
  boosters: Record<BoosterKind, number>;
  login: { streak: number; claimedDay: string | null };
  missions: { day: string; progress: Record<string, number>; claimed: string[]; bonusClaimed: boolean };
  starChestsOpened: number;
  realmChests: number[];
  chests: ChestKind[];
  achievements: string[];
  winStreak: number;
  stats: MetaStats;
}
export interface Loot { shards: number; boosters: Partial<Record<BoosterKind, number>> }

export const BOOSTERS: Record<BoosterKind, { name: string; text: string; price: number }> = {
  hammer: { name: 'Çekiç', text: 'Seçtiğin tek taşı kırar. Hamle harcamaz.', price: 60 },
  prism: { name: 'Prizma', text: 'Seçtiğin taşın rengini tahtadan siler. Hamle harcamaz.', price: 140 },
  moves: { name: '+3 Hamle', text: 'Bu denemeye üç hamle ekler.', price: 90 },
};
export const CHESTS: Record<ChestKind, { name: string; tone: string }> = {
  star: { name: 'Yıldız sandığı', tone: 'amber' },
  mission: { name: 'Görev sandığı', tone: 'emerald' },
  streak: { name: 'Haftalık hazine', tone: 'violet' },
  realm: { name: 'Diyar hazinesi', tone: 'cobalt' },
};
export const STARS_PER_CHEST = 12;

export const LOGIN_REWARDS: { label: string; loot?: Loot; chest?: ChestKind }[] = [
  { label: '40 kristal', loot: { shards: 40, boosters: {} } },
  { label: 'Çekiç', loot: { shards: 0, boosters: { hammer: 1 } } },
  { label: '70 kristal', loot: { shards: 70, boosters: {} } },
  { label: '+3 Hamle', loot: { shards: 0, boosters: { moves: 1 } } },
  { label: '100 kristal', loot: { shards: 100, boosters: {} } },
  { label: 'Prizma', loot: { shards: 0, boosters: { prism: 1 } } },
  { label: 'Haftalık hazine', chest: 'streak' },
];

export const emptyMeta = (day = localDateKey()): MetaState => ({
  shards: 100, boosters: { hammer: 1, prism: 1, moves: 1 }, login: { streak: 0, claimedDay: null },
  missions: { day, progress: {}, claimed: [], bonusClaimed: false }, starChestsOpened: 0, realmChests: [], chests: [], achievements: [], winStreak: 0,
  stats: { wins: 0, loops: 0, novas: 0, specials: 0, gems: 0, seals: 0, boostersUsed: 0, bestChain: 0 },
});

const isRecord = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === 'object' && !Array.isArray(v);
const count = (v: unknown, fallback = 0) => typeof v === 'number' && Number.isSafeInteger(v) && v >= 0 ? v : fallback;
const day = (v: unknown) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null;
const strings = (v: unknown, max = 64) => Array.isArray(v) ? [...new Set(v.filter((x): x is string => typeof x === 'string' && x.length <= 40))].slice(0, max) : [];

/** Accepts any stored value and returns a valid meta state; unknown or damaged fields fall back to defaults. */
export function parseMeta(raw: unknown): MetaState {
  const meta = emptyMeta();
  if (!isRecord(raw)) return meta;
  meta.shards = Math.min(count(raw.shards, meta.shards), 999_999);
  if (isRecord(raw.boosters)) for (const kind of Object.keys(BOOSTERS) as BoosterKind[]) meta.boosters[kind] = Math.min(count(raw.boosters[kind], meta.boosters[kind]), 999);
  if (isRecord(raw.login)) meta.login = { streak: count(raw.login.streak), claimedDay: day(raw.login.claimedDay) };
  if (isRecord(raw.missions) && day(raw.missions.day)) {
    const progress: Record<string, number> = {};
    if (isRecord(raw.missions.progress)) for (const [k, v] of Object.entries(raw.missions.progress)) if (MISSION_POOL.some(m => m.id === k)) progress[k] = count(v);
    meta.missions = { day: day(raw.missions.day)!, progress, claimed: strings(raw.missions.claimed, 3), bonusClaimed: raw.missions.bonusClaimed === true };
  }
  meta.starChestsOpened = count(raw.starChestsOpened);
  meta.realmChests = Array.isArray(raw.realmChests) ? [...new Set(raw.realmChests.filter(n => Number.isSafeInteger(n) && n >= 0 && n < 20) as number[])] : [];
  meta.chests = Array.isArray(raw.chests) ? raw.chests.filter((c): c is ChestKind => typeof c === 'string' && c in CHESTS).slice(0, 30) : [];
  meta.achievements = strings(raw.achievements).filter(id => ACHIEVEMENTS.some(a => a.id === id));
  meta.winStreak = Math.min(count(raw.winStreak), 999);
  if (isRecord(raw.stats)) for (const key of Object.keys(meta.stats) as (keyof MetaStats)[]) meta.stats[key] = count(raw.stats[key]);
  return meta;
}
export const metaOf = (profile: Profile): MetaState => profile.meta ?? emptyMeta();
const withMeta = (profile: Profile, meta: MetaState): Profile => ({ ...profile, meta });

export function grantLoot(meta: MetaState, loot: Loot): MetaState {
  const boosters = { ...meta.boosters };
  for (const [kind, n] of Object.entries(loot.boosters) as [BoosterKind, number][]) boosters[kind] = Math.min(999, boosters[kind] + n);
  return { ...meta, shards: Math.min(999_999, meta.shards + loot.shards), boosters };
}
export function describeLoot(loot: Loot): string[] {
  const parts = loot.shards ? [`${loot.shards} kristal`] : [];
  for (const [kind, n] of Object.entries(loot.boosters) as [BoosterKind, number][]) if (n) parts.push(`${n}× ${BOOSTERS[kind].name}`);
  return parts;
}

// ---------- Check-in calendar ----------
const previousDay = (key: string) => { const d = new Date(`${key}T12:00:00`); d.setDate(d.getDate() - 1); return localDateKey(d); };
export function loginStatus(meta: MetaState, today = localDateKey()) {
  const claimedToday = meta.login.claimedDay === today;
  const continues = meta.login.claimedDay === previousDay(today);
  const streak = claimedToday || continues ? meta.login.streak : 0;
  // The calendar shows the 7-day cycle the next claim (or today's claim) belongs to.
  const index = claimedToday ? (streak - 1) % 7 : streak % 7;
  return { claimable: !claimedToday, streak, index, broken: !claimedToday && !continues && meta.login.streak > 0 };
}
export function claimLogin(profile: Profile, today = localDateKey()): { profile: Profile; reward: (typeof LOGIN_REWARDS)[number] } | null {
  const meta = metaOf(profile), status = loginStatus(meta, today);
  if (!status.claimable) return null;
  const reward = LOGIN_REWARDS[status.index];
  let next: MetaState = { ...meta, login: { streak: status.streak + 1, claimedDay: today } };
  if (reward.loot) next = grantLoot(next, reward.loot);
  if (reward.chest) next = { ...next, chests: [...next.chests, reward.chest] };
  return { profile: withMeta(profile, next), reward };
}

// ---------- Daily missions ----------
export type MissionEvent = 'win' | 'loop' | 'nova' | 'special' | 'seal' | 'daily' | 'threeStar' | 'chain7' | 'booster' | `gems:${PrismColor}`;
interface MissionDef { id: string; title: (day: string) => string; target: number; reward: number; event: (day: string) => MissionEvent }
const dayColor = (key: string) => PRISM_COLORS[[...key].reduce((n, ch) => (n * 31 + ch.charCodeAt(0)) % 9973, 7) % PRISM_COLORS.length];
export const MISSION_POOL: MissionDef[] = [
  { id: 'win2', title: () => 'Macerada 2 bölüm kazan', target: 2, reward: 50, event: () => 'win' },
  { id: 'loop3', title: () => '3 halka kapat', target: 3, reward: 45, event: () => 'loop' },
  { id: 'nova2', title: () => '2 kez 3× Nova oluştur', target: 2, reward: 45, event: () => 'nova' },
  { id: 'special5', title: () => '5 güç taşı patlat', target: 5, reward: 40, event: () => 'special' },
  { id: 'gems', title: d => `${PRISM_DEFINITIONS[dayColor(d)].name} renginden 45 taş topla`, target: 45, reward: 40, event: d => `gems:${dayColor(d)}` },
  { id: 'seal4', title: () => '4 mühür aç', target: 4, reward: 45, event: () => 'seal' },
  { id: 'daily', title: () => 'Günlük bulmacayı kazan', target: 1, reward: 60, event: () => 'daily' },
  { id: 'star3', title: () => 'Bir bölümü 3 yıldızla bitir', target: 1, reward: 55, event: () => 'threeStar' },
  { id: 'chain7', title: () => '7 veya daha uzun bir zincir kur', target: 1, reward: 40, event: () => 'chain7' },
];
export function missionsFor(key: string) {
  const rng = createRNG([...key].reduce((n, ch) => (n * 131 + ch.charCodeAt(0)) >>> 0, 17));
  const pool = [...MISSION_POOL];
  const picked: MissionDef[] = [];
  while (picked.length < 3) picked.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
  return picked.map(m => ({ id: m.id, title: m.title(key), target: m.target, reward: m.reward, event: m.event(key) }));
}
/** Rolls the mission board over to `today` when needed. */
export function freshMissions(meta: MetaState, today = localDateKey()): MetaState {
  return meta.missions.day === today ? meta : { ...meta, missions: { day: today, progress: {}, claimed: [], bonusClaimed: false } };
}
export function missionBoard(meta: MetaState, today = localDateKey()) {
  const state = freshMissions(meta, today).missions;
  const list = missionsFor(today).map(m => ({ ...m, progress: Math.min(m.target, state.progress[m.id] ?? 0), claimed: state.claimed.includes(m.id) }));
  return { list, allClaimed: list.every(m => m.claimed), bonusClaimed: state.bonusClaimed, claimable: list.filter(m => !m.claimed && m.progress >= m.target).length };
}
export function trackEvents(meta: MetaState, events: Partial<Record<MissionEvent, number>>, today = localDateKey()): MetaState {
  const fresh = freshMissions(meta, today);
  const progress = { ...fresh.missions.progress };
  for (const m of missionsFor(today)) if (events[m.event]) progress[m.id] = Math.min(m.target, (progress[m.id] ?? 0) + events[m.event]!);
  return { ...fresh, missions: { ...fresh.missions, progress } };
}
export function claimMission(profile: Profile, id: string, today = localDateKey()): Profile {
  let meta = freshMissions(metaOf(profile), today);
  const board = missionBoard(meta, today), mission = board.list.find(m => m.id === id);
  if (!mission || mission.claimed || mission.progress < mission.target) return profile;
  meta = grantLoot({ ...meta, missions: { ...meta.missions, claimed: [...meta.missions.claimed, id] } }, { shards: mission.reward, boosters: {} });
  if (meta.missions.claimed.length === 3 && !meta.missions.bonusClaimed) meta = { ...meta, missions: { ...meta.missions, bonusClaimed: true }, chests: [...meta.chests, 'mission'] };
  return withMeta(profile, meta);
}

// ---------- Moves and finished attempts ----------
/** Mission/stat bookkeeping for one committed move. */
export function trackMove(profile: Profile, move: { clearedCount: number; colorCounts: Record<PrismColor, number>; spawnedPower: string; triggeredSpecialsCount: number; unlockedCount: number },
  chainLength: number, loop: boolean, today = localDateKey()): Profile {
  const meta = metaOf(profile);
  const events: Partial<Record<MissionEvent, number>> = { loop: Number(loop), nova: Number(move.spawnedPower === 'nova_3x3'), special: move.triggeredSpecialsCount, seal: move.unlockedCount, chain7: Number(chainLength >= 7) };
  for (const color of PRISM_COLORS) events[`gems:${color}`] = move.colorCounts[color];
  const s = meta.stats;
  const stats = { ...s, loops: s.loops + Number(loop), novas: s.novas + events.nova!, specials: s.specials + move.triggeredSpecialsCount,
    gems: s.gems + move.clearedCount, seals: s.seals + move.unlockedCount, bestChain: Math.max(s.bestChain, chainLength) };
  return withMeta(profile, { ...trackEvents(meta, events, today), stats });
}

export interface FinishSummary { shards: number; firstClear: boolean; starsGained: number; winStreak: number; chests: ChestKind[] }
/**
 * Rewards for an attempt that just ended, comparing the profile before and after the attempt was recorded.
 * Replays pay a little; improvements (new stars, first clears) pay well.
 */
export function settleFinish(before: Profile, after: Profile, session: Session, today = localDateKey()): { profile: Profile; summary: FinishSummary } {
  let meta = metaOf(after);
  let shards = 0, starsGained = 0, firstClear = false;
  const events: Partial<Record<MissionEvent, number>> = {};
  if (session.mode === 'classic') {
    if (session.outcome === 'won') {
      const prior = before.stages[session.stageId]?.stars ?? 0, now = after.stages[session.stageId]?.stars ?? 0;
      starsGained = Math.max(0, now - prior); firstClear = prior === 0;
      shards = (firstClear ? 25 : 5) + starsGained * 10;
      events.win = 1; if (starsFor(session) === 3) events.threeStar = 1;
      meta = { ...meta, winStreak: meta.winStreak + 1, stats: { ...meta.stats, wins: meta.stats.wins + 1 } };
    } else meta = { ...meta, winStreak: 0 };
  } else if (session.mode === 'daily' && session.outcome === 'won') {
    const first = !before.dailyWins.includes(session.dailyKey!);
    shards = first ? 40 : 5; events.daily = 1;
  }
  meta = trackEvents(meta, events, today);
  meta = grantLoot(meta, { shards, boosters: {} });
  const synced = syncChests(withMeta(after, meta));
  const chests = metaOf(synced).chests.slice(meta.chests.length);
  return { profile: synced, summary: { shards, firstClear, starsGained, winStreak: metaOf(synced).winStreak, chests } };
}

/** Queues star and realm chests the profile has earned but not yet received. */
export function syncChests(profile: Profile): Profile {
  const meta = metaOf(profile);
  const stars = Object.values(profile.stages).reduce((n, s) => n + s.stars, 0);
  const due = Math.floor(stars / STARS_PER_CHEST) - meta.starChestsOpened;
  const realms: number[] = [];
  for (let realm = 0; realm * 10 < 200; realm++) {
    const ids = Array.from({ length: 10 }, (_, i) => realm * 10 + i + 1);
    if (!ids.every(id => profile.stages[id]?.stars)) break;
    if (!meta.realmChests.includes(realm)) realms.push(realm);
  }
  if (due <= 0 && !realms.length) return profile;
  return withMeta(profile, { ...meta, starChestsOpened: meta.starChestsOpened + Math.max(0, due), realmChests: [...meta.realmChests, ...realms],
    chests: [...meta.chests, ...Array.from({ length: Math.max(0, due) }, () => 'star' as const), ...realms.map(() => 'realm' as const)] });
}
export function starChestProgress(profile: Profile) {
  const stars = Object.values(profile.stages).reduce((n, s) => n + s.stars, 0);
  return { stars, current: stars % STARS_PER_CHEST, target: STARS_PER_CHEST };
}

/** Opens the first queued chest. Contents are seeded by how many chests were opened, so they are stable but varied. */
export function openChest(profile: Profile): { profile: Profile; kind: ChestKind; loot: Loot } | null {
  const meta = metaOf(profile);
  const kind = meta.chests[0];
  if (!kind) return null;
  const opened = meta.stats.wins * 7 + meta.starChestsOpened * 13 + meta.realmChests.length * 31 + meta.chests.length + meta.login.streak;
  const rng = createRNG(opened * 2654435761 >>> 0);
  const scale = kind === 'realm' ? 3 : kind === 'streak' ? 2.5 : kind === 'mission' ? 1.2 : 1;
  const loot: Loot = { shards: Math.round((40 + Math.floor(rng() * 50)) * scale), boosters: {} };
  const kinds: BoosterKind[] = ['hammer', 'moves', 'prism'];
  const pulls = kind === 'star' ? 1 : kind === 'mission' ? 1 : kind === 'streak' ? 2 : 3;
  for (let i = 0; i < pulls; i++) { const b = kinds[Math.floor(rng() * (rng() < .25 ? 3 : 2))]; loot.boosters[b] = (loot.boosters[b] ?? 0) + 1; }
  return { profile: withMeta(profile, grantLoot({ ...meta, chests: meta.chests.slice(1) }, loot)), kind, loot };
}

// ---------- Shop and booster spending ----------
export function buyBooster(profile: Profile, kind: BoosterKind): Profile | null {
  const meta = metaOf(profile), price = BOOSTERS[kind].price;
  if (meta.shards < price) return null;
  return withMeta(profile, grantLoot({ ...meta, shards: meta.shards - price }, { shards: 0, boosters: { [kind]: 1 } }));
}
export function spendBooster(profile: Profile, kind: BoosterKind, today = localDateKey()): Profile | null {
  const meta = metaOf(profile);
  if (meta.boosters[kind] <= 0) return null;
  const spent = { ...meta, boosters: { ...meta.boosters, [kind]: meta.boosters[kind] - 1 }, stats: { ...meta.stats, boostersUsed: meta.stats.boostersUsed + 1 } };
  return withMeta(profile, trackEvents(spent, { booster: 1 }, today));
}

// ---------- Achievements ----------
type AchievementDef = { id: string; title: string; text: string; target: number; reward: number; value: (p: Profile, m: MetaState) => number };
const completedStages = (p: Profile) => Object.values(p.stages).filter(s => s.stars > 0).length;
const totalStars = (p: Profile) => Object.values(p.stages).reduce((n, s) => n + s.stars, 0);
export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'stage1', title: 'İlk uyanış', text: 'İlk macera bölümünü tamamla.', target: 1, reward: 30, value: completedStages },
  { id: 'stage10', title: 'Vadinin ışığı', text: '10 bölüm tamamla.', target: 10, reward: 80, value: completedStages },
  { id: 'stage30', title: 'Üç diyar', text: '30 bölüm tamamla.', target: 30, reward: 200, value: completedStages },
  { id: 'stage60', title: 'Kulenin ötesi', text: '60 bölüm tamamla.', target: 60, reward: 400, value: completedStages },
  { id: 'stars45', title: 'Yıldız avcısı', text: '45 yıldız topla.', target: 45, reward: 120, value: totalStars },
  { id: 'stars150', title: 'Takımyıldız', text: '150 yıldız topla.', target: 150, reward: 350, value: totalStars },
  { id: 'loops25', title: 'Halka ustası', text: '25 halka kapat.', target: 25, reward: 100, value: (_, m) => m.stats.loops },
  { id: 'novas20', title: 'Nova kalbi', text: '20 kez 3× Nova oluştur.', target: 20, reward: 100, value: (_, m) => m.stats.novas },
  { id: 'chain10', title: 'Uzun yol', text: '10 taşlık bir zincir kur.', target: 10, reward: 90, value: (_, m) => m.stats.bestChain },
  { id: 'gems2000', title: 'Taş seli', text: 'Toplam 2.000 taş temizle.', target: 2000, reward: 150, value: (_, m) => m.stats.gems },
  { id: 'daily7', title: 'Yedi yankı', text: '7 günlük bulmaca kazan.', target: 7, reward: 150, value: p => p.dailyWins.length },
  { id: 'login7', title: 'Sadık bekçi', text: '7 gün üst üste giriş yap.', target: 7, reward: 120, value: (_, m) => m.login.streak },
  { id: 'zen5000', title: 'Zen ustası', text: 'Serbest akışta 5.000 puana ulaş.', target: 5000, reward: 80, value: p => p.zenBest },
  { id: 'streak5', title: 'Alev serisi', text: 'Üst üste 5 bölüm kazan.', target: 5, reward: 100, value: (_, m) => m.winStreak },
];
export function achievementBoard(profile: Profile) {
  const meta = metaOf(profile);
  return ACHIEVEMENTS.map(a => {
    const value = Math.min(a.target, a.value(profile, meta)), claimed = meta.achievements.includes(a.id);
    return { ...a, progress: value, done: value >= a.target, claimed };
  });
}
export function claimAchievement(profile: Profile, id: string): Profile {
  const entry = achievementBoard(profile).find(a => a.id === id);
  if (!entry || !entry.done || entry.claimed) return profile;
  const meta = metaOf(profile);
  return withMeta(profile, grantLoot({ ...meta, achievements: [...meta.achievements, id] }, { shards: entry.reward, boosters: {} }));
}

/** Count of things waiting for the player; drives the badge on the rewards tab. */
export function pendingRewards(profile: Profile, today = localDateKey()) {
  const meta = metaOf(profile);
  return Number(loginStatus(meta, today).claimable) + missionBoard(meta, today).claimable + meta.chests.length + achievementBoard(profile).filter(a => a.done && !a.claimed).length;
}
