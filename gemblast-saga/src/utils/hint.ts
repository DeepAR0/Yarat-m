import { BOARD_SIZE, Coord, findSuggestedPath, isValidPath, previewClear } from './boardEngine';
import { stageFor, type Session } from './session';

export interface Hint { path: Coord[]; loop: boolean; cleared: number; message: string }

const MAX_LENGTH = 9;
const NODE_BUDGET_PER_START = 400;

/**
 * Picks the most useful move for the current goals instead of the first three-stone chain:
 * missing color quotas, pending ring/seal/power goals, then raw clear size and power creation.
 * The search is bounded, so a board full of one color still answers instantly.
 */
export function findBestHint(session: Session): Hint | null {
  const { grid } = session;
  const stage = stageFor(session);
  const zen = session.mode === 'zen';
  const need = new Map(zen ? [] : stage.quotas.map(q => [q.color, Math.max(0, q.target - session.collected[q.color])]));
  const loopsNeeded = zen ? 0 : Math.max(0, (stage.loopsTarget ?? (stage.requireLoop ? 1 : 0)) - session.loopsMade);
  const sealsNeeded = zen ? 0 : Math.max(0, (stage.sealsTarget ?? 0) - session.sealsOpened);
  const specialsNeeded = zen ? 0 : Math.max(0, (stage.specialsTarget ?? 0) - session.specialsTriggered);

  let best: { value: number; path: Coord[]; loop: boolean; cleared: number } | null = null;
  const evaluate = (path: Coord[], loop: boolean) => {
    const { clearedCoords, triggeredSpecialsCount } = previewClear(grid, path, loop);
    if (!clearedCoords.length) return;
    const cleared = new Set(clearedCoords.map(([r, c]) => `${r},${c}`));
    const perColor = new Map<string, number>();
    for (const [r, c] of clearedCoords) perColor.set(grid[r][c].color, (perColor.get(grid[r][c].color) ?? 0) + 1);
    let goal = 0;
    for (const [color, missing] of need) goal += Math.min(missing, perColor.get(color) ?? 0);
    let seals = 0;
    if (sealsNeeded) for (let r = 0; r < BOARD_SIZE; r++) for (let c = 0; c < BOARD_SIZE; c++) {
      if (grid[r][c].locked && [[-1, 0], [1, 0], [0, -1], [0, 1]].some(([dr, dc]) => cleared.has(`${r + dr},${c + dc}`))) seals++;
    }
    const unique = loop ? path.length - 1 : path.length;
    const power = loop || unique >= 6 ? 3 : unique >= 4 ? 1.5 : 0;
    const value = clearedCoords.length + goal * 3 + Math.min(seals, sealsNeeded) * 6 + Math.min(triggeredSpecialsCount, specialsNeeded) * 8 +
      (loop && loopsNeeded ? 25 : 0) + power + triggeredSpecialsCount;
    if (!best || value > best.value) best = { value, path, loop, cleared: clearedCoords.length };
  };

  for (let r = 0; r < BOARD_SIZE; r++) for (let c = 0; c < BOARD_SIZE; c++) {
    if (grid[r][c].locked) continue;
    let nodes = 0;
    const color = grid[r][c].color;
    const visit = (path: Coord[], seen: Set<string>) => {
      if (++nodes > NODE_BUDGET_PER_START) return;
      if (path.length >= 3) evaluate(path, false);
      const [lr, lc] = path[path.length - 1];
      if (path.length >= 4 && Math.max(Math.abs(lr - r), Math.abs(lc - c)) === 1) {
        const ring: Coord[] = [...path, [r, c]];
        if (isValidPath(grid, ring, true)) evaluate(ring, true);
      }
      if (path.length >= MAX_LENGTH) return;
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        const nr = lr + dr, nc = lc + dc, key = `${nr},${nc}`;
        if ((!dr && !dc) || nr < 0 || nc < 0 || nr >= BOARD_SIZE || nc >= BOARD_SIZE || seen.has(key)) continue;
        const cell = grid[nr][nc];
        if (cell.locked || cell.color !== color) continue;
        seen.add(key); visit([...path, [nr, nc]], seen); seen.delete(key);
      }
    };
    visit([[r, c]], new Set([`${r},${c}`]));
  }

  const found = best as { path: Coord[]; loop: boolean; cleared: number } | null;
  if (!found) {
    const fallback = findSuggestedPath(grid);
    return fallback ? { path: fallback, loop: false, cleared: fallback.length, message: 'Parlayan üç çekirdeği bağla.' } : null;
  }
  const unique = found.loop ? found.path.length - 1 : found.path.length;
  const message = found.loop ? `Parlayan halkayı kapat: ${found.cleared} taş temizlenir.`
    : unique >= 6 ? `${unique} taşı bağla: 3× Nova oluşur, ${found.cleared} taş temizlenir.`
    : unique >= 4 ? `${unique} taşı bağla: ışık kanalı oluşur, ${found.cleared} taş temizlenir.`
    : `Parlayan ${unique} çekirdeği bağla: ${found.cleared} taş temizlenir.`;
  return { ...found, message };
}
