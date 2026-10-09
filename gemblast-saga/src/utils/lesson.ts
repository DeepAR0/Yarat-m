import { CellData } from '../types/game';
import { areNeighbors, Coord, findSuggestedPath, isValidPath } from './boardEngine';

export type Lesson = 'link' | 'loop';

/** Small, bounded search on the current board; never changes the player's stones. */
export function findLessonPath(grid: CellData[][], lesson: Lesson): Coord[] {
  if (lesson === 'link') return findSuggestedPath(grid) ?? [];
  for (let r = 0; r < 6; r++) for (let c = 0; c < 6; c++) {
    if (grid[r][c].locked) continue;
    const color = grid[r][c].color;
    const visit = (path: Coord[]): Coord[] | null => {
      if (path.length === 4) {
        const ring = [...path, path[0]];
        return isValidPath(grid, ring, true) ? ring : null;
      }
      const [lastR,lastC] = path.at(-1)!;
      for (let nr = Math.max(0,lastR-1); nr <= Math.min(5,lastR+1); nr++) for (let nc = Math.max(0,lastC-1); nc <= Math.min(5,lastC+1); nc++) {
        if (!areNeighbors(lastR,lastC,nr,nc) || grid[nr][nc].locked || grid[nr][nc].color !== color || path.some(([pr,pc]) => pr === nr && pc === nc)) continue;
        const found = visit([...path,[nr,nc]]);
        if (found) return found;
      }
      return null;
    };
    const found = visit([[r,c]]);
    if (found) return found;
  }
  return [];
}
