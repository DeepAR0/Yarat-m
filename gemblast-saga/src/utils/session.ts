import { CellData, FlowDirection, FLOW_DIRECTIONS, GameMode, localDateKey, getDailyStageConfig, PRISM_COLORS, PrismColor, StageConfig, STAGES, LEGACY_STAGES } from '../types/game';
import { Coord, createGrid, createRNG, ensurePlayable, flowForPath, isValidPath, resolvePathOnGrid, shuffleGrid } from './boardEngine';
import { type CompetitionTrace, validTrace, leagueDay } from './competition';
import { emptyMeta, parseMeta, type MetaState } from './meta';

export interface Session {
  mode: GameMode;
  stageId: number;
  dailyKey: string | null;
  grid: CellData[][];
  score: number;
  movesLeft: number;
  collected: Record<PrismColor, number>;
  shufflesLeft: number;
  rngState: number;
  outcome: 'playing' | 'won' | 'lost';
  turns: number;
  flow: FlowDirection;
  usedDirections: FlowDirection[];
  loopsMade: number;
  sealsOpened: number;
  specialsTriggered: number;
  competition?: CompetitionTrace;
  rewardedContinueUsed?: boolean;
  campaignVersion?: 2;
}
export interface Settings { sound: boolean; haptics: boolean; reducedMotion: boolean }
export interface Profile {
  version: 1;
  ruleset: 2;
  settings: Settings;
  stages: Record<string, { stars: number; best: number }>;
  dailyWins: string[];
  dailyBest: Record<string, number>;
  zenBest: number;
  sessions: Partial<Record<GameMode, Session>>;
  lastMode: GameMode;
  tutorialSeen: boolean;
  loopTutorialSeen?: boolean;
  mysteryDays?: string[];
  gemStyle?: 'motif' | 'element';
  meta?: MetaState;
}
export const emptyCounts = () => Object.fromEntries(PRISM_COLORS.map(c => [c, 0])) as Record<PrismColor, number>;
export const defaultProfile = (): Profile => ({ version: 1, ruleset: 2, settings: { sound: true, haptics: true, reducedMotion: false },
  stages: {}, dailyWins: [], mysteryDays: [], dailyBest: {}, zenBest: 0, sessions: {}, lastMode: 'classic', tutorialSeen: false, meta: emptyMeta() });

export function stageFor(session: Session): StageConfig {
  return session.mode === 'daily' ? getDailyStageConfig(new Date(`${session.dailyKey}T12:00:00`)) :
    (session.mode==='classic' && session.campaignVersion!==2 ? LEGACY_STAGES : STAGES)[session.stageId - 1] ?? STAGES[0];
}
export function createSession(mode: GameMode, stageId = 1, date = new Date(), options: { seed?: number; teachingLayout?: boolean } = {}): Session {
  const stage = mode === 'daily' ? getDailyStageConfig(date) : STAGES[stageId - 1] ?? STAGES[0];
  const rng = createRNG(mode === 'daily' ? stage.seed : options.seed ?? (mode === 'zen' ? undefined : stage.seed));
  const grid = createGrid(mode === 'zen' ? [] : stage.lockedCoords, rng);
  const teachingLayout = options.teachingLayout !== false;
  if (mode === 'classic' && teachingLayout && stage.id <= 5) {
    if (stage.id === 1) { for (let c = 1; c <= 3; c++) { grid[2][c].color = 'coral'; grid[4][c].color = 'cobalt'; } }
    if (stage.id === 2) { for (let c = 1; c <= 4; c++) { grid[1][c].color = 'coral'; grid[3][c].color = 'amber'; } }
    if (stage.id === 3) { for (let r = 1; r <= 4; r++) { grid[r][1].color = 'cobalt'; grid[r][4].color = 'emerald'; } }
    if (stage.id === 4) { for (let r = 1; r <= 3; r++) for (let c = 1; c <= 3; c++) grid[r][c].color = r === 2 && c === 2 ? 'amber' : 'violet'; }
    if (stage.id === 5) { for (let c = 0; c < 6; c++) { grid[1][c].color = 'emerald'; grid[4][c].color = 'amber'; } }
  }
  if (mode === 'classic' && teachingLayout && stage.id === 6) for (let c = 1; c <= 4; c++) grid[2][c].color = 'coral';
  if (mode === 'classic' && teachingLayout && stage.id === 7) {
    for (let c = 1; c <= 3; c++) grid[2][c].color = 'cobalt';
    grid[2][2].special = 'pulse_row';
  }
  // A replay with a ring goal still has a discoverable ring, at a varied location.
  if (mode === 'classic' && !teachingLayout && (stage.requireLoop || stage.loopsTarget)) {
    const squares: Coord[] = [];
    for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
      if ([grid[r][c], grid[r+1][c], grid[r][c+1], grid[r+1][c+1]].every(cell => !cell.locked)) squares.push([r,c]);
    }
    if (squares.length) {
      const [r,c] = squares[Math.floor(rng() * squares.length)];
      const color = stage.quotas[0]?.color ?? 'coral';
      for (const [dr,dc] of [[0,0],[0,1],[1,0],[1,1]]) grid[r+dr][c+dc].color = color;
    }
  }
  return { mode, stageId: stage.id, dailyKey: mode === 'daily' ? localDateKey(date) : null, grid,
    score: 0, movesLeft: stage.moves, collected: emptyCounts(), shufflesLeft: 2, rngState: rng.getState(), outcome: 'playing', turns: 0, flow: 'down', usedDirections: [], loopsMade: 0, sealsOpened: 0, specialsTriggered: 0,
    ...(mode==='daily' ? {competition:{version:1 as const,actions:[]}} : {}), ...(mode==='classic' ? {campaignVersion:2 as const} : {}) };
}
/** New classic/zen attempts reroll; daily attempts retain their original date seed. */
export function restartSession(previous: Session, seed = Math.floor(Math.random() * 0xffffffff)): Session {
  const date = previous.dailyKey ? new Date(`${previous.dailyKey}T12:00:00`) : new Date();
  if (previous.mode === 'daily') return createSession('daily', previous.stageId, date);
  const signature = (session: Session) => session.grid.flat().map(cell => `${cell.color}:${cell.special}`).join('|');
  const before = signature(previous);
  for (let attempt = 0; attempt < 8; attempt++) {
    const next = createSession(previous.mode, previous.stageId, date, {seed: (seed + attempt * 0x9e3779b9) >>> 0, teachingLayout: false});
    if (signature(next) !== before) return next;
  }
  // Finite fallback even for a pathological random source.
  const next = createSession(previous.mode, previous.stageId, date, {seed, teachingLayout: false});
  next.grid.forEach(row => row.forEach(cell => { if (!cell.locked) cell.color = PRISM_COLORS[(PRISM_COLORS.indexOf(cell.color) + 1) % PRISM_COLORS.length]; }));
  return next;
}
export function sessionToOpen(profile: Profile, mode: GameMode, stageId?: number, date = new Date()): Session {
  const saved = profile.sessions[mode];
  const sameAttempt = saved && (stageId === undefined || saved.stageId === stageId) && (mode !== 'daily' || saved.dailyKey === localDateKey(date));
  if (sameAttempt) return saved.outcome === 'playing' ? saved : restartSession(saved);
  return createSession(mode, stageId ?? nextUnlocked(profile), date);
}
export function commitMove(session: Session, path: Coord[], loop: boolean) {
  if (session.outcome !== 'playing' || !isValidPath(session.grid, path, loop)) return null;
  const rng = createRNG(session.rngState);
  const flow = flowForPath(path, loop, session.flow);
  const result = resolvePathOnGrid(session.grid, path, loop, rng, flow);
  const earned = result.clearedCount * 30 * result.totalMultiplier * (loop ? 2 : 1);
  const collected = { ...session.collected };
  PRISM_COLORS.forEach(c => { collected[c] += result.colorCounts[c]; });
  const next: Session = { ...session, grid: result.nextGrid, score: session.score + earned, collected,
    movesLeft: session.mode === 'zen' ? session.movesLeft : session.movesLeft - 1,
    turns: session.turns + 1, rngState: rng.getState(), flow, usedDirections: ['down'], loopsMade: session.loopsMade + Number(loop),
    sealsOpened: session.sealsOpened + result.unlockedCount, specialsTriggered: session.specialsTriggered + result.triggeredSpecialsCount,
    ...(session.competition ? {competition:{version:1 as const,actions:[...session.competition.actions,{kind:'move' as const,path:path.map(([r,c])=>[r,c] as Coord),loop}]}} : {}) };
  const stage = stageFor(next);
  if (session.mode !== 'zen') {
    if (next.score >= stage.targetScore && stage.quotas.every(q => collected[q.color] >= q.target) &&
      next.loopsMade >= (stage.loopsTarget ?? (stage.requireLoop ? 1 : 0)) && next.sealsOpened >= (stage.sealsTarget ?? 0) && next.specialsTriggered >= (stage.specialsTarget ?? 0)) next.outcome = 'won';
    else if (next.movesLeft <= 0) next.outcome = 'lost';
  }
  return { next, result, earned };
}
export function shuffleSession(session: Session): Session {
  if (session.outcome !== 'playing' || session.shufflesLeft <= 0) return session;
  const rng = createRNG(session.rngState);
  const grid = ensurePlayable(shuffleGrid(session.grid, rng), rng);
  return { ...session, grid, shufflesLeft: session.shufflesLeft - 1, rngState: rng.getState(),
    ...(session.competition ? {competition:{version:1 as const,actions:[...session.competition.actions,{kind:'shuffle' as const}]}} : {}) };
}
export function canRewardContinue(session: Session): boolean {
  return session.mode === 'classic' && session.outcome === 'lost' && session.movesLeft === 0 && !session.rewardedContinueUsed;
}
export function applyRewardContinue(session: Session): Session {
  if (!canRewardContinue(session)) return session;
  return { ...session, movesLeft: 5, outcome: 'playing', rewardedContinueUsed: true };
}
export function starsFor(session: Session) {
  if (session.outcome !== 'won') return 0;
  if (session.rewardedContinueUsed) return 1;
  const ratio = session.movesLeft / stageFor(session).moves;
  return ratio >= .35 ? 3 : ratio >= .15 ? 2 : 1;
}
export function nextUnlocked(profile: Profile): number {
  const firstIncomplete = STAGES.find(s => !profile.stages[s.id]?.stars);
  return firstIncomplete?.id ?? STAGES.length;
}
export function recordSession(profile: Profile, session: Session, date = new Date()): Profile {
  const next: Profile = { ...profile, sessions: { ...profile.sessions, [session.mode]: session }, lastMode: session.mode };
  if (session.mode === 'zen') next.zenBest = Math.max(next.zenBest, session.score);
  if (session.mode === 'daily' && session.dailyKey && session.outcome !== 'playing') {
    next.dailyBest = { ...profile.dailyBest, [session.dailyKey]: Math.max(profile.dailyBest[session.dailyKey] ?? 0, session.score) };
  }
  if (session.outcome !== 'won') return next;
  if (session.mode === 'classic') {
    const prior = profile.stages[session.stageId];
    next.stages = { ...profile.stages, [session.stageId]: { stars: Math.max(prior?.stars ?? 0, starsFor(session)), best: Math.max(prior?.best ?? 0, session.score) } };
  } else if (session.dailyKey) {
    if (session.dailyKey === leagueDay(date)) next.mysteryDays = [...new Set([...(profile.mysteryDays ?? profile.dailyWins), session.dailyKey])].slice(0, 7);
    next.dailyWins = [...new Set([...profile.dailyWins, session.dailyKey])].slice(-366);
    next.dailyBest = { ...profile.dailyBest, [session.dailyKey]: Math.max(profile.dailyBest[session.dailyKey] ?? 0, session.score) };
  }
  return next;
}

const isRecord = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value);
const count = (v: unknown): v is number => typeof v === 'number' && Number.isSafeInteger(v) && v >= 0;
const dateKey = (v: unknown): v is string => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(new Date(`${v}T12:00:00`).getTime());

export function validateSession(value: unknown, mode: GameMode): value is Session {
  if (!isRecord(value) || value.mode !== mode || !count(value.stageId) || !count(value.score) || !count(value.movesLeft) ||
    !count(value.shufflesLeft) || value.shufflesLeft > 2 || !count(value.rngState) || !count(value.turns) ||
    !['playing', 'won', 'lost'].includes(String(value.outcome)) || !FLOW_DIRECTIONS.includes(value.flow as FlowDirection) || !count(value.loopsMade) || !count(value.sealsOpened) || !count(value.specialsTriggered) ||
    !Array.isArray(value.usedDirections) || !value.usedDirections.every(d => FLOW_DIRECTIONS.includes(d as FlowDirection))) return false;
  if (mode === 'daily' ? !dateKey(value.dailyKey) : value.stageId < 1 || value.stageId > STAGES.length) return false;
  if (value.competition !== undefined && (mode!=='daily' || !validTrace(value.competition))) return false;
  if (value.rewardedContinueUsed !== undefined && (mode !== 'classic' || typeof value.rewardedContinueUsed !== 'boolean')) return false;
  if (value.campaignVersion !== undefined && (mode !== 'classic' || value.campaignVersion !== 2)) return false;
  const collected = value.collected;
  if (!isRecord(collected) || !PRISM_COLORS.every(c => count(collected[c]))) return false;
  const ids = new Set<string>();
  return Array.isArray(value.grid) && value.grid.length === 6 && value.grid.every(row =>
    Array.isArray(row) && row.length === 6 && row.every(cell => {
      if (!isRecord(cell) || typeof cell.id !== 'string' || ids.has(cell.id) || !PRISM_COLORS.includes(cell.color as PrismColor) ||
        ![1, 2, 3].includes(Number(cell.multiplier)) || !['none', 'pulse_row', 'pulse_col', 'nova_3x3'].includes(String(cell.special)) || typeof cell.locked !== 'boolean') return false;
      ids.add(cell.id); return true;
    }));
}
export function parseProfile(text: string | null): Profile {
  const profile = defaultProfile();
  if (!text) return profile;
  try {
    const raw: unknown = JSON.parse(text);
    if (!isRecord(raw) || raw.version !== 1) return profile;
    if (isRecord(raw.settings)) for (const key of ['sound', 'haptics', 'reducedMotion'] as const) {
      if (typeof raw.settings[key] === 'boolean') profile.settings[key] = raw.settings[key];
    }
    if (isRecord(raw.stages)) for (const stage of STAGES) {
      const entry = raw.stages[stage.id];
      if (isRecord(entry) && count(entry.stars) && entry.stars <= 3 && count(entry.best)) profile.stages[stage.id] = { stars: entry.stars, best: entry.best };
    }
    if (Array.isArray(raw.dailyWins)) profile.dailyWins = raw.dailyWins.filter(dateKey).slice(-366);
    profile.mysteryDays = [...new Set(Array.isArray(raw.mysteryDays) ? raw.mysteryDays.filter(dateKey) : profile.dailyWins)].slice(0, 7);
    if (raw.gemStyle === 'element' && Array.from({length:6}, (_, i) => profile.stages[i+1]?.stars).every(Boolean)) profile.gemStyle = 'element';
    if (isRecord(raw.dailyBest)) for (const [key, value] of Object.entries(raw.dailyBest)) if (dateKey(key) && count(value)) profile.dailyBest[key] = value;
    if (count(raw.zenBest)) profile.zenBest = raw.zenBest;
    profile.meta = parseMeta(raw.meta);
    if (raw.ruleset === 2 && typeof raw.tutorialSeen === 'boolean') profile.tutorialSeen = raw.tutorialSeen;
    if (raw.ruleset === 2 && typeof raw.loopTutorialSeen === 'boolean') profile.loopTutorialSeen = raw.loopTutorialSeen;
    if (raw.ruleset === 2 && isRecord(raw.sessions)) for (const mode of ['classic', 'daily', 'zen'] as const) if (validateSession(raw.sessions[mode], mode)) {
      const session = raw.sessions[mode];
      const rng = createRNG(session.rngState);
      // A single unplayable saved board drops only that attempt, never the rest of the profile.
      try { session.grid = ensurePlayable(session.grid, rng); } catch { continue; }
      session.rngState = rng.getState();
      profile.sessions[mode] = session;
    }
    if (['classic', 'daily', 'zen'].includes(String(raw.lastMode))) profile.lastMode = raw.lastMode as GameMode;
    return profile;
  } catch { return profile; }
}
