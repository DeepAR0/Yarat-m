import test from 'node:test';
import assert from 'node:assert/strict';
import { applyBooster, applyStreakBonus, canUseBooster, createSession, parseProfile, recordSession, defaultProfile } from '../src/utils/session';

test('Hammer breaks one stone without spending a move and is deterministic', () => {
  const session = createSession('classic', 8);
  const open = session.grid.flatMap((row, r) => row.flatMap((cell, c) => cell.locked || cell.special !== 'none' ? [] : [[r, c] as [number, number]]))[0];
  const a = applyBooster(session, 'hammer', open)!, b = applyBooster(session, 'hammer', open)!;
  assert.deepEqual(a.next.grid.map(r => r.map(c => c.color)), b.next.grid.map(r => r.map(c => c.color)));
  assert.equal(a.next.movesLeft, session.movesLeft); assert.equal(a.next.turns, 0);
  assert.equal(a.result!.clearedCount, 1); assert.equal(a.next.score, 30); assert.equal(a.next.boostersUsed, 1);
  const color = session.grid[open[0]][open[1]].color;
  assert.equal(a.next.collected[color], 1);
  const locked = session.grid.flatMap((row, r) => row.flatMap((cell, c) => cell.locked ? [[r, c] as [number, number]] : []))[0];
  assert.equal(applyBooster(session, 'hammer', locked), null);
});

test('Prism clears every open stone of the chosen color; +3 moves only in adventure', () => {
  const session = createSession('zen');
  const color = session.grid[0][0].color;
  const total = session.grid.flat().filter(c => !c.locked && c.color === color).length;
  const prism = applyBooster(session, 'prism', [0, 0])!;
  assert.ok(prism.next.collected[color] >= total);
  assert.equal(applyBooster(session, 'moves'), null);
  const classic = createSession('classic', 3);
  assert.equal(applyBooster(classic, 'moves')!.next.movesLeft, classic.movesLeft + 3);
});

test('Boosters are refused on the daily puzzle and after an attempt ends; booster sessions survive a save round-trip', () => {
  const daily = createSession('daily', 1, new Date('2026-10-09T12:00:00'));
  for (const kind of ['hammer', 'prism', 'moves'] as const) assert.equal(canUseBooster(daily, kind), false);
  assert.equal(canUseBooster({ ...createSession('classic', 2), outcome: 'lost' }, 'hammer'), false);
  const boosted = applyBooster(createSession('classic', 9), 'moves')!.next;
  assert.equal(parseProfile(JSON.stringify(recordSession(defaultProfile(), boosted))).sessions.classic?.boostersUsed, 1);
});

test('Win streaks seed fresh attempts with power stones exactly once', () => {
  const fresh = createSession('classic', 12);
  assert.equal(applyStreakBonus(fresh, 0), fresh);
  const bonus = applyStreakBonus(fresh, 5);
  const powers = bonus.grid.flat().filter(c => c.special !== 'none').map(c => c.special).sort();
  assert.deepEqual(powers, ['nova_3x3', 'pulse_col', 'pulse_row']);
  assert.equal(bonus.streakBonus, 3);
  assert.equal(applyStreakBonus(bonus, 5), bonus);
  assert.equal(applyStreakBonus(createSession('zen'), 3).streakBonus, undefined);
});

import { continueWithMoves, missingGoals } from '../src/utils/session';
import { metaOf, restoreStreak, settleFinish } from '../src/utils/meta';
import { STAGES } from '../src/types/game';

test('A lost attempt lists what was missing and can continue with +3 moves, getting its win streak back', () => {
  const lost = { ...createSession('classic', 34), outcome: 'lost' as const, movesLeft: 0, score: 100 };
  const missing = missingGoals(lost);
  assert.ok(missing.some(m => m.includes('puan')) && missing.some(m => m.includes('halka')) && missing.some(m => m.includes('mühür')));
  assert.deepEqual(missingGoals(createSession('zen')), []);
  const resumed = continueWithMoves(lost);
  assert.equal(resumed.outcome, 'playing'); assert.equal(resumed.movesLeft, 3);
  assert.equal(continueWithMoves(resumed), resumed);
  let profile = defaultProfile(); profile = { ...profile, meta: { ...metaOf(profile), winStreak: 4 } };
  const settled = settleFinish(profile, recordSession(profile, lost), lost);
  assert.equal(metaOf(settled.profile).winStreak, 0); assert.equal(settled.summary.lostStreak, 4);
  assert.equal(metaOf(restoreStreak(settled.profile, settled.summary.lostStreak)).winStreak, 4);
  assert.ok(STAGES[33].loopsTarget);
});
