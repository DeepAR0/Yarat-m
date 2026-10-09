import { Capacitor, registerPlugin } from '@capacitor/core';
import config from '../../release/config.json';
import { leagueWeek } from './competition';
export const gameCenterConfigured = () => Capacitor.getPlatform() === 'ios' && config.gameCenter.enabled;
export const GameCenter = registerPlugin<{
  authenticate(): Promise<{ alias: string }>;
  submit(options: { score: number; leaderboardId: string }): Promise<void>;
  open(options: { leaderboardId: string }): Promise<void>;
}>('GemblastGameCenter');
export function weeklyBest(best: Record<string, number>, today: string) {
  const week = leagueWeek(today);
  return Object.entries(best).filter(([day]) => day <= today && leagueWeek(day) === week).reduce((sum, [, score]) => sum + score, 0);
}
export const nativeLeaderboardId = (period: 'daily' | 'weekly') => period === 'daily' ? config.gameCenter.dailyLeaderboardId : config.gameCenter.weeklyLeaderboardId;

export async function gameCenterOperation<T>(task: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try { return await Promise.race([task, new Promise<never>((_,reject) => { timer=setTimeout(()=>reject(new Error('Game Center bağlantı süresi doldu.')), 30000); })]); }
  finally {clearTimeout(timer);}
}
