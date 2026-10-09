import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Preferences } from '@capacitor/preferences';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Share } from '@capacitor/share';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';

// Import earned progress once while retaining the previous ruleset for rollback.
export const SAVE_KEY = 'gemblast-saga.harmony-profile.v2';
export async function readSave() {
  const current = (await Preferences.get({ key: SAVE_KEY })).value;
  return current ?? (await Preferences.get({ key: 'gemblast-saga.core-profile.v1' })).value;
}
let writeQueue = Promise.resolve();
export function writeSave(value: string): Promise<void> {
  const task = writeQueue.catch(() => {}).then(() => Preferences.set({ key: SAVE_KEY, value }));
  writeQueue = task;
  return task;
}
export async function haptic(kind: 'select' | 'match' | 'win', enabled: boolean) {
  if (!enabled || !Capacitor.isNativePlatform()) return;
  try {
    if (kind === 'win') await Haptics.notification({ type: NotificationType.Success });
    else await Haptics.impact({ style: kind === 'match' ? ImpactStyle.Medium : ImpactStyle.Light });
  } catch { /* Unsupported hardware has no tactile feedback. */ }
}
export async function shareScore(text: string): Promise<'shared' | 'copied' | 'cancelled'> {
  try {
    if (Capacitor.isNativePlatform()) {
      await Share.share({ title: 'Gemblast Saga', text, dialogTitle: 'Skorunu paylaş' });
      return 'shared';
    }
    if (navigator.share) { await navigator.share({ title: 'Gemblast Saga', text }); return 'shared'; }
    if (!navigator.clipboard) throw new Error('Bu tarayıcıda paylaşım kullanılamıyor.');
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch (error) {
    if (error instanceof Error && (error.name === 'AbortError' || /cancel/i.test(error.message))) return 'cancelled';
    throw error;
  }
}
export async function nativeStartup() {
  if (!Capacitor.isNativePlatform()) return;
  await Promise.allSettled([StatusBar.setStyle({ style: Style.Light }), SplashScreen.hide({ fadeOutDuration: 200 })]);
}
export async function listenToAppState(onChange: (active: boolean) => void) {
  if (!Capacitor.isNativePlatform()) return () => {};
  const listener = await App.addListener('appStateChange', state => onChange(state.isActive));
  return () => { void listener.remove(); };
}
