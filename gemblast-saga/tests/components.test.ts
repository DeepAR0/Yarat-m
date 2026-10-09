import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { STAGES } from '../src/types/game';
import { createSession, defaultProfile, stageFor } from '../src/utils/session';
import { mysteryProgress } from '../src/utils/mystery';
import { CollectionPage } from '../src/pages/CollectionPage';
import { SettingsPage } from '../src/pages/SettingsPage';
import { GameHud } from '../src/components/GameHud';
import { ResultDialog } from '../src/components/ResultDialog';

const noop = () => {};

test('Extracted pages render their profile data', () => {
  const profile = defaultProfile(); profile.stages[1] = { stars: 3, best: 500 }; profile.zenBest = 6000;
  const collection = renderToStaticMarkup(createElement(CollectionPage, { profile, onStory: noop, onGemStyle: noop }));
  assert.ok(collection.includes('Koleksiyon') && collection.includes('6.000'));
  const settings = renderToStaticMarkup(createElement(SettingsPage, { settings: { sound: false, haptics: true, reducedMotion: false }, privacyOptions: false, onToggle: noop, onAdPrivacy: noop, onGuide: noop, onPrivacy: noop, onErase: noop }));
  assert.ok(settings.includes('aria-checked="false"') && !settings.includes('Reklam gizlilik'));
});

test('Game HUD shows stage goals; result dialog offers the next stage after a win', () => {
  const session = createSession('classic', 9);
  const hud = renderToStaticMarkup(createElement(GameHud, { session, stage: stageFor(session), gemStyle: undefined, sound: true, onBack: noop, onToggleSound: noop }));
  assert.ok(hud.includes('BÖLÜM 09') && hud.includes(`Halka hedefi: 0 / ${STAGES[8].loopsTarget}`));
  const won = { ...session, outcome: 'won' as const, score: 1234 };
  const profile = defaultProfile();
  const html = renderToStaticMarkup(createElement(ResultDialog, { profile, session: won, mystery: mysteryProgress(profile), discoveryScene: undefined, reducedMotion: true,
    adBusy: false, adNotice: '', canSave: true, onNavigate: noop, onWatchAd: noop, onNextStage: noop, onRestart: noop, onShare: noop }));
  assert.ok(html.includes('Diyar uyandı!') && html.includes('1.234') && html.includes('Sonraki bölüm'));
});

test('The result dialog celebrates a beaten record but not a first clear or a lost classic attempt', () => {
  const profile = defaultProfile();
  const render = (session: ReturnType<typeof createSession>, previousBest: number | null) => renderToStaticMarkup(createElement(ResultDialog, { profile, session, mystery: mysteryProgress(profile), discoveryScene: undefined, reducedMotion: true,
    previousBest, adBusy: false, adNotice: '', canSave: true, onNavigate: noop, onWatchAd: noop, onNextStage: noop, onRestart: noop, onShare: noop }));
  const classic = createSession('classic', 3);
  assert.ok(render({ ...classic, outcome: 'won', score: 900 }, 500).includes('Yeni rekor!'));
  assert.ok(!render({ ...classic, outcome: 'won', score: 900 }, 0).includes('Yeni rekor!'));
  assert.ok(!render({ ...classic, outcome: 'lost', score: 900 }, 500).includes('Yeni rekor!'));
  assert.ok(render({ ...createSession('daily'), outcome: 'lost', score: 700 }, 300).includes('Önceki en iyi: 300'));
});
