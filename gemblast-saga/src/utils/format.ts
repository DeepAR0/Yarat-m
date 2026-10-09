import type { GameMode } from '../types/game';

export const format = (value: number) => value.toLocaleString('tr-TR');
export const modeLabel: Record<GameMode, string> = { classic: 'Macera', daily: 'Günlük uyanış', zen: 'Serbest akış' };
