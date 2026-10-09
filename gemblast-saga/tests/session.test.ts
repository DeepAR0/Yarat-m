import test from 'node:test';
import assert from 'node:assert/strict';
import { localDateKey, STAGES } from '../src/types/game';
import { findSuggestedPath } from '../src/utils/boardEngine';
import { commitMove, createSession, defaultProfile, nextUnlocked, parseProfile, recordSession, shuffleSession, stageFor, starsFor } from '../src/utils/session';

test('Daily session reload preserves future RNG and scoring', () => {
  const session = createSession('daily', 1, new Date(2026, 9, 7));
  const profile = recordSession(defaultProfile(), session);
  const resumed = parseProfile(JSON.stringify(profile)).sessions.daily!;
  const path = findSuggestedPath(session.grid)!;
  const a = commitMove(session, path, false)!, b = commitMove(resumed, path, false)!;
  const normalize = (value: typeof a) => ({ score: value.next.score, collected: value.next.collected, rng: value.next.rngState, grid: value.next.grid.map(row => row.map(c => [c.color, c.special, c.multiplier, c.locked])) });
  assert.deepEqual(normalize(a), normalize(b));
  assert.equal(session.dailyKey, '2026-10-07');
});
test('A day uses a deterministic board; another day changes the seed', () => {
  const a = createSession('daily', 1, new Date(2026, 9, 7)), b = createSession('daily', 1, new Date(2026, 9, 8));
  assert.notEqual(stageFor(a).seed, stageFor(b).seed);
  assert.equal(localDateKey(new Date(2026, 9, 7)), '2026-10-07');
});
test('Both quota and score targets are required to win', () => {
  const session = createSession('classic');
  STAGES[0].quotas.forEach(q => { session.collected[q.color] = q.target; });
  session.score = 0;
  const path = findSuggestedPath(session.grid)!;
  const move = commitMove(session, path, false)!;
  assert.equal(move.next.outcome, 'playing');
  session.score = STAGES[0].targetScore;
  assert.equal(commitMove(session, path, false)!.next.outcome, 'won');
});
test('Winning the final move takes precedence over losing', () => {
  const session = createSession('classic'); session.movesLeft = 1; session.score = STAGES[0].targetScore;
  STAGES[0].quotas.forEach(q => { session.collected[q.color] = q.target; });
  const move = commitMove(session, findSuggestedPath(session.grid)!, false)!;
  assert.equal(move.next.outcome, 'won'); assert.equal(move.next.movesLeft, 0);
});
test('Zero moves loses; finished sessions and invalid paths cannot spend moves', () => {
  const session = createSession('classic'); session.movesLeft = 1;
  const result = commitMove(session, findSuggestedPath(session.grid)!, false)!;
  assert.equal(result.next.outcome, 'lost');
  assert.equal(commitMove(result.next, findSuggestedPath(result.next.grid)!, false), null);
  assert.equal(commitMove(session, [[0, 0]], false), null);
});
test('Zen remains playable without spending moves and records the best score', () => {
  const session = createSession('zen');
  const next = commitMove(session, findSuggestedPath(session.grid)!, false)!.next;
  assert.equal(next.movesLeft, session.movesLeft); assert.equal(next.outcome, 'playing');
  assert.equal(recordSession(defaultProfile(), next).zenBest, next.score);
});
test('Stars unlock sequentially; replay cannot lower best stars or score', () => {
  const session = createSession('classic'); session.outcome = 'won'; session.score = 2000;
  let profile = recordSession(defaultProfile(), session);
  assert.equal(nextUnlocked(profile), 2); assert.equal(starsFor(session), 3);
  session.movesLeft = 0; session.score = 800;
  profile = recordSession(profile, session);
  assert.equal(profile.stages[1].stars, 3); assert.equal(profile.stages[1].best, 2000);
});
test('Daily completion is recorded only once per date', () => {
  const session = createSession('daily'); session.outcome = 'won'; session.score = 1700;
  const profile = recordSession(recordSession(defaultProfile(), session), session);
  assert.equal(profile.dailyWins.length, 1);
});
test('Shuffle budget cannot go negative', () => {
  const a = shuffleSession(shuffleSession(createSession('classic')));
  assert.equal(a.shufflesLeft, 0); assert.equal(shuffleSession(a), a);
});
test('Corrupt storage is safely recovered; invalid sessions are dropped', () => {
  assert.deepEqual(parseProfile('{'), defaultProfile());
  const raw = recordSession(defaultProfile(), createSession('classic'));
  raw.sessions.classic!.grid[0][0].color = 'invalid' as never;
  assert.equal(parseProfile(JSON.stringify(raw)).sessions.classic, undefined);
  const valid = recordSession(defaultProfile(), createSession('classic'));
  assert.ok(parseProfile(JSON.stringify(valid)).sessions.classic);
});

test('Previous core progress migrates but incompatible active games do not', () => {
  const raw=recordSession(defaultProfile(),createSession('classic',2));
  raw.stages[1]={stars:3,best:700}; raw.settings.sound=false; raw.tutorialSeen=true;
  delete (raw as Partial<typeof raw>).ruleset;
  const restored=parseProfile(JSON.stringify(raw));
  assert.deepEqual(restored.stages[1],{stars:3,best:700});
  assert.equal(restored.settings.sound,false);
  assert.equal(restored.sessions.classic,undefined);
  assert.equal(restored.tutorialSeen,false);
  assert.equal(restored.ruleset,2);
});

test('An unplayable saved board drops only that attempt and keeps the rest of the profile', () => {
  const profile = recordSession(recordSession(defaultProfile(), createSession('classic', 1)), createSession('zen'));
  profile.stages[1] = { stars: 3, best: 900 };
  profile.sessions.classic!.grid.forEach(row => row.forEach(cell => { cell.locked = true; }));
  const loaded = parseProfile(JSON.stringify(profile));
  assert.equal(loaded.sessions.classic, undefined);
  assert.ok(loaded.sessions.zen);
  assert.equal(loaded.lastMode, 'zen');
  assert.deepEqual(loaded.stages[1], { stars: 3, best: 900 });
});
