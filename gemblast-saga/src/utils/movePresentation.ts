import { CellData } from '../types/game';
import { Coord } from './boardEngine';

export interface GemFall { x: number; y: number; duration: number; delay: number; fresh: boolean }
export type GemFalls = Record<string, GemFall>;

/** Every new stone starts in a separate slot above its open column segment. */
export function planGemFalls(before: CellData[][], after: CellData[][], powerOrigin?: Coord): GemFalls {
  const positions = new Map(before.flatMap((row, r) => row.map((cell, c) => [cell.id, [r, c] as Coord] as const)));
  const falls: GemFalls = {};
  for (let c = 0; c < 6; c++) {
    let start = 0;
    while (start < 6) {
      if (after[start][c].locked) { start++; continue; }
      let end = start;
      while (end < 6 && !after[end][c].locked) end++;
      const incoming = after.slice(start, end).filter(row => !positions.has(row[c].id) && row[c].special === 'none').length;
      let incomingIndex = 0;
      for (let r = start; r < end; r++) {
        const cell = after[r][c], old = positions.get(cell.id);
        const origin = old ?? (cell.special !== 'none' && powerOrigin ? powerOrigin : [start - incoming + incomingIndex++, c]);
        const x = origin[1] - c, y = origin[0] - r;
        if (!old || x || y) falls[cell.id] = { x, y, fresh: !old, duration: 280 + Math.min(6, Math.max(Math.abs(x), Math.abs(y))) * 14, delay: c * 5 };
      }
      start = end;
    }
  }
  return falls;
}

export type Schedule = (fn: () => void, delay: number) => () => void;
const defaultSchedule: Schedule = (fn, delay) => { const timer = setTimeout(fn, delay); return () => clearTimeout(timer); };

/** Presentation is disposable; the committed session is never held by this timeline. */
export class MoveTimeline {
  private run = 0;
  private phase: 'idle' | 'clearing' | 'falling' = 'idle';
  private pending = new Set<string>();
  private timers = new Set<() => void>();
  private onSettled: (() => void) | null = null;
  constructor(private schedule: Schedule = defaultSchedule) {}
  get running() { return this.phase !== 'idle'; }

  start(id: number, falls: GemFalls, clearMs: number, reducedMotion: boolean, callbacks: { clearing: () => void; falling: () => void; settled: () => void }): boolean {
    if (this.running) return false;
    this.run = id; this.phase = 'clearing'; this.onSettled = callbacks.settled;
    this.pending = new Set(Object.keys(falls));
    if (reducedMotion) { this.finish(); return true; }
    callbacks.clearing();
    this.later(() => {
      if (this.run !== id || this.phase !== 'clearing') return;
      this.phase = 'falling'; callbacks.falling();
      if (!this.pending.size) { this.finish(); return; }
      // Missing animation events, disabled CSS or a slow frame cannot leave input locked.
      const maxFall = Math.max(...Object.values(falls).map(f => f.duration + f.delay));
      this.later(() => { if (this.run === id) this.finish(); }, maxFall + 120);
    }, clearMs);
    return true;
  }

  landed(id: number, gemId: string) {
    if (this.run !== id || this.phase !== 'falling') return;
    this.pending.delete(gemId);
    if (!this.pending.size) this.finish();
  }
  finish() {
    if (!this.running) return;
    const settled = this.onSettled;
    this.cancel(); settled?.();
  }
  cancel() {
    this.timers.forEach(cancel => cancel()); this.timers.clear();
    this.pending.clear(); this.phase = 'idle'; this.onSettled = null;
  }
  private later(fn: () => void, delay: number) {
    const cancel = this.schedule(() => { this.timers.delete(cancel); fn(); }, delay);
    this.timers.add(cancel);
  }
}
