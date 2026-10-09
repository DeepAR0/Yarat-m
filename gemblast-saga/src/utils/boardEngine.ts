import { CellData, FlowDirection, PRISM_COLORS, PrismColor, SpecialPower } from '../types/game';

export const BOARD_SIZE = 6;
export type Coord = [number, number];
export type SeededRNG = (() => number) & { getState: () => number };
let sequence = 0;
const nextId = () => `gem_${++sequence}_${Math.random().toString(36).slice(2, 10)}`;

export function createRNG(seed = Math.floor(Math.random() * 0xffffffff)): SeededRNG {
  let state = seed >>> 0;
  const rng = (() => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }) as SeededRNG;
  rng.getState = () => state;
  return rng;
}

export const pickColor = (rng: () => number = Math.random): PrismColor =>
  PRISM_COLORS[Math.min(PRISM_COLORS.length - 1, Math.floor(rng() * PRISM_COLORS.length))];

function newCell(rng: () => number): CellData {
  return { id: nextId(), color: pickColor(rng), multiplier: 1, special: 'none', locked: false, isNew: true };
}

export function createGrid(lockedCoords: Coord[], seedOrRng?: number | (() => number), armoredCoords: Coord[] = []): CellData[][] {
  const rng = typeof seedOrRng === 'function' ? seedOrRng : createRNG(seedOrRng);
  const locked = new Set(lockedCoords.map(([r, c]) => `${r},${c}`));
  const armored = new Set(armoredCoords.map(([r, c]) => `${r},${c}`));
  const grid = Array.from({ length: BOARD_SIZE }, (_, r) =>
    Array.from({ length: BOARD_SIZE }, (_, c): CellData => {
      const cell: CellData = { ...newCell(rng), locked: locked.has(`${r},${c}`) };
      if (cell.locked && armored.has(`${r},${c}`)) cell.armor = 1;
      return cell;
    }));
  return ensurePlayable(grid, rng);
}

export function areNeighbors(r1: number, c1: number, r2: number, c2: number): boolean {
  return Math.max(Math.abs(r1 - r2), Math.abs(c1 - c2)) === 1;
}

export function findSuggestedPath(grid: CellData[][]): Coord[] | null {
  for (let r = 0; r < BOARD_SIZE; r++) for (let c = 0; c < BOARD_SIZE; c++) {
    if (grid[r][c].locked) continue;
    const stack: Coord[][] = [[[r, c]]];
    while (stack.length) {
      const path = stack.pop()!;
      if (path.length >= 3) return path;
      const [cr, cc] = path[path.length - 1];
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        const nr = cr + dr, nc = cc + dc;
        if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE || (!dr && !dc)) continue;
        const cell = grid[nr][nc];
        if (!cell.locked && cell.color === grid[r][c].color && !path.some(([pr, pc]) => pr === nr && pc === nc)) {
          stack.push([...path, [nr, nc]]);
        }
      }
    }
  }
  return null;
}

export const hasValidPath = (grid: CellData[][]) => findSuggestedPath(grid) !== null;

export function flowForPath(path: Coord[], loop = false, fallback: FlowDirection = 'down'): FlowDirection {
  // Kept as a compatibility entrypoint; drawing direction never changes gravity.
  return 'down';
}

function crossedLoop(path: Coord[]): boolean {
  const turn = (a: Coord, b: Coord, c: Coord) => (b[1] - a[1]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[1] - a[1]);
  for (let i = 0; i < path.length - 1; i++) for (let j = i + 2; j < path.length - 1; j++) {
    if (i === 0 && j === path.length - 2) continue;
    const a = path[i], b = path[i + 1], c = path[j], d = path[j + 1];
    if (turn(a, b, c) * turn(a, b, d) < 0 && turn(c, d, a) * turn(c, d, b) < 0) return true;
  }
  return false;
}

/** Cell centers inside a simple loop. Boundary stones are handled by the path itself. */
export function enclosedCells(path: Coord[]): Coord[] {
  const boundary = new Set(path.map(([r, c]) => `${r},${c}`));
  const result: Coord[] = [];
  for (let r = 0; r < BOARD_SIZE; r++) for (let c = 0; c < BOARD_SIZE; c++) {
    if (boundary.has(`${r},${c}`)) continue;
    let inside = false;
    for (let i = 0, j = path.length - 1; i < path.length; j = i++) {
      const [yr, xc] = path[i], [py, px] = path[j];
      if ((yr > r) !== (py > r) && c < (px - xc) * (r - yr) / (py - yr) + xc) inside = !inside;
    }
    if (inside) result.push([r, c]);
  }
  return result;
}

/** Compact toward the chosen edge, independently between fixed sealed cells. */
export function refillGrid(grid: CellData[][], cleared: Set<string>, direction: FlowDirection, rng: () => number,
  spawn?: { coord: Coord; cell: CellData }): CellData[][] {
  const next: CellData[][] = grid.map(row => row.map(cell => ({ ...cell, isNew: false })));
  for (let line = 0; line < BOARD_SIZE; line++) {
    const coords = Array.from({ length: BOARD_SIZE }, (_, i): Coord => direction === 'down' ? [5 - i, line] : direction === 'up' ? [i, line] : direction === 'right' ? [line, 5 - i] : [line, i]);
    let segment: Coord[] = [];
    const fillSegment = () => {
      const survivors: CellData[] = [];
      for (const [r, c] of segment) {
        if (spawn && r === spawn.coord[0] && c === spawn.coord[1]) survivors.push(spawn.cell);
        else if (!cleared.has(`${r},${c}`)) survivors.push(next[r][c]);
      }
      segment.forEach(([r, c], i) => { next[r][c] = survivors[i] ?? newCell(rng); });
      segment = [];
    };
    for (const coord of coords) {
      if (next[coord[0]][coord[1]].locked) fillSegment(); else segment.push(coord);
    }
    fillSegment();
  }
  return next;
}

export function shuffleGrid(grid: CellData[][], rng: () => number): CellData[][] {
  const unlocked = grid.flat().filter(cell => !cell.locked).map(cell => ({ ...cell, isNew: true }));
  for (let i = unlocked.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [unlocked[i], unlocked[j]] = [unlocked[j], unlocked[i]];
  }
  let i = 0;
  return grid.map(row => row.map(cell => cell.locked ? { ...cell, isNew: false } : unlocked[i++]));
}

export function ensurePlayable(grid: CellData[][], rng: () => number): CellData[][] {
  let candidate = grid;
  for (let attempt = 0; attempt < 24 && !hasValidPath(candidate); attempt++) candidate = shuffleGrid(candidate, rng);
  if (hasValidPath(candidate)) return candidate;
  // A finite fallback guarantees a playable chain even after unlucky shuffles.
  candidate = candidate.map(row => row.map(cell => ({ ...cell })));
  for (let r = 0; r < BOARD_SIZE; r++) for (let c = 0; c < BOARD_SIZE; c++) {
    if (candidate[r][c].locked) continue;
    const neighbors: Coord[] = [];
    for (let nr = 0; nr < BOARD_SIZE; nr++) for (let nc = 0; nc < BOARD_SIZE; nc++) {
      if (!candidate[nr][nc].locked && areNeighbors(r, c, nr, nc)) neighbors.push([nr, nc]);
    }
    if (neighbors.length >= 2) {
      for (const [nr, nc] of neighbors.slice(0, 2)) candidate[nr][nc].color = candidate[r][c].color;
      return candidate;
    }
  }
  throw new Error('Bu tahtada üç taşlık bağlantı için yeterli açık alan yok.');
}

export function isValidPath(grid: CellData[][], path: Coord[], loop: boolean): boolean {
  if (path.length < 3) return false;
  const seen = new Set<string>();
  const first = grid[path[0]?.[0]]?.[path[0]?.[1]];
  if (!first || first.locked) return false;
  for (let i = 0; i < path.length; i++) {
    const [r, c] = path[i], cell = grid[r]?.[c], key = `${r},${c}`;
    if (!cell || cell.locked || cell.color !== first.color) return false;
    if (i && !areNeighbors(...path[i - 1], r, c)) return false;
    if (seen.has(key)) {
      if (!loop || i !== path.length - 1 || r !== path[0][0] || c !== path[0][1] || seen.size < 4) return false;
    }
    seen.add(key);
  }
  return !loop || (path.length >= 5 && path.at(-1)![0] === path[0][0] && path.at(-1)![1] === path[0][1] && !crossedLoop(path));
}

export function previewClear(grid: CellData[][], path: Coord[], isClosedLoop: boolean) {
  if (!isValidPath(grid, path, isClosedLoop)) return { clearedCoords: [] as Coord[], triggeredSpecialsCount: 0 };
  const primaryColorCleared = grid[path[0][0]][path[0][1]].color;
  const cleared = new Set<string>();
  path.forEach(([r, c]) => cleared.add(`${r},${c}`));
  // Closing at the starting gem sweeps this color across the entire board.
  // Other colors inside the ring stay unless a pre-existing special reaches them.
  if (isClosedLoop) grid.forEach((row, r) => row.forEach((cell, c) => {
    if (!cell.locked && cell.color === primaryColorCleared) cleared.add(`${r},${c}`);
  }));
  const triggeredSpecialsCount = expandSpecials(grid, cleared);
  const clearedCoords = [...cleared].map(key => key.split(',').map(Number) as Coord);
  return { clearedCoords, triggeredSpecialsCount };
}

/** Grows `cleared` (keys "r,c") through every power stone it reaches; returns how many powers fired. */
function expandSpecials(grid: CellData[][], cleared: Set<string>): number {
  const queue = [...cleared];
  let triggeredSpecialsCount = 0;
  for (let i = 0; i < queue.length; i++) {
    const [r, c] = queue[i].split(',').map(Number);
    const power = grid[r][c].special;
    if (power === 'none') continue;
    triggeredSpecialsCount++;
    for (let nr = 0; nr < BOARD_SIZE; nr++) for (let nc = 0; nc < BOARD_SIZE; nc++) {
      const affected = power === 'pulse_row' ? nr === r : power === 'pulse_col' ? nc === c : Math.abs(nr - r) <= 1 && Math.abs(nc - c) <= 1;
      const key = `${nr},${nc}`;
      if (affected && !grid[nr][nc].locked && !cleared.has(key)) { cleared.add(key); queue.push(key); }
    }
  }
  return triggeredSpecialsCount;
}

/**
 * Strikes the seals beside a cleared stone. Each seal takes at most one strike per move:
 * a shelled seal loses its shell, a plain seal opens. Returns how many seals opened.
 */
function hitSeals(grid: CellData[][], r: number, c: number, hit: Set<string>): number {
  let opened = 0;
  for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
    const cell = grid[r + dr]?.[c + dc], key = `${r + dr},${c + dc}`;
    if (!cell?.locked || hit.has(key)) continue;
    hit.add(key);
    if (cell.armor) delete cell.armor; else { cell.locked = false; opened++; }
  }
  return opened;
}

/** Booster blast: clears the given open stones (plus any powers they reach), opens adjacent seals and refills. */
export function blastCells(grid: CellData[][], seeds: Coord[], rng: () => number) {
  const cleared = new Set(seeds.filter(([r, c]) => grid[r]?.[c] && !grid[r][c].locked).map(([r, c]) => `${r},${c}`));
  if (!cleared.size) return null;
  const triggeredSpecialsCount = expandSpecials(grid, cleared);
  const clearedCoords = [...cleared].map(key => key.split(',').map(Number) as Coord);
  const colorCounts = Object.fromEntries(PRISM_COLORS.map(color => [color, 0])) as Record<PrismColor, number>;
  const next: CellData[][] = grid.map(row => row.map(cell => ({ ...cell, isNew: false })));
  let unlockedCount = 0, totalMultiplier = 1;
  const hit = new Set<string>();
  for (const [r, c] of clearedCoords) {
    colorCounts[grid[r][c].color]++;
    totalMultiplier = Math.min(27, totalMultiplier * grid[r][c].multiplier);
    unlockedCount += hitSeals(next, r, c, hit);
  }
  const filled = refillGrid(next, cleared, 'down', rng);
  return { nextGrid: ensurePlayable(filled, rng), clearedCoords, clearedCount: cleared.size, colorCounts, totalMultiplier, unlockedCount, triggeredSpecialsCount };
}

export function resolvePathOnGrid(grid: CellData[][], path: Coord[], isClosedLoop: boolean, rng: () => number = Math.random, direction: FlowDirection = 'down') {
  if (!isValidPath(grid, path, isClosedLoop)) throw new Error('Geçersiz kristal bağlantısı.');
  const primaryColorCleared = grid[path[0][0]][path[0][1]].color;
  const { clearedCoords, triggeredSpecialsCount } = previewClear(grid, path, isClosedLoop);
  const cleared = new Set(clearedCoords.map(([r,c]) => `${r},${c}`));
  const enclosed: Coord[] = [];
  const colorCounts = Object.fromEntries(PRISM_COLORS.map(color => [color, 0])) as Record<PrismColor, number>;
  const next: CellData[][] = grid.map(row => row.map(cell => ({ ...cell, isNew: false })));
  let unlockedCount = 0, totalMultiplier = 1;
  const hit = new Set<string>();
  for (const [r, c] of clearedCoords) {
    colorCounts[grid[r][c].color]++;
    // Cap chain multipliers so a large special chain remains a finite, readable score.
    totalMultiplier = Math.min(27, totalMultiplier * grid[r][c].multiplier);
    unlockedCount += hitSeals(next, r, c, hit);
  }
  let spawnedPower: SpecialPower = 'none';
  let spawnedMultiplier: 1 | 2 | 3 = 1;
  const uniqueLength = isClosedLoop ? path.length - 1 : path.length;
  if (isClosedLoop || uniqueLength >= 6) { spawnedPower = 'nova_3x3'; spawnedMultiplier = 3; }
  else if (uniqueLength === 5) { spawnedPower = rng() > .5 ? 'pulse_row' : 'pulse_col'; spawnedMultiplier = 2; }
  else if (uniqueLength === 4) {
    const a = path.at(-2)!, b = path.at(-1)!;
    spawnedPower = Math.abs(a[1] - b[1]) >= Math.abs(a[0] - b[0]) ? 'pulse_row' : 'pulse_col';
  }
  const spawnCoord = isClosedLoop ? path[path.length - 2] : path.at(-1)!;
  const spawnCell = spawnedPower === 'none' ? undefined : { ...newCell(rng), color: primaryColorCleared, special: spawnedPower, multiplier: spawnedMultiplier };
  const filled = refillGrid(next, cleared, 'down', rng, spawnCell ? { coord: spawnCoord, cell: spawnCell } : undefined);
  return { nextGrid: ensurePlayable(filled, rng), clearedCoords, clearedCount: cleared.size, colorCounts, direction: 'down' as FlowDirection, enclosedCount: enclosed.length,
    primaryColorCleared, totalMultiplier, unlockedCount, spawnedPower, spawnedMultiplier, triggeredSpecialsCount };
}
