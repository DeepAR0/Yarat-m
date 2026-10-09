import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { STAGES } from '../src/types/game';
import { createSession, restartSession, sessionToOpen, recordSession, defaultProfile, parseProfile, commitMove, validateSession } from '../src/utils/session';
import { findSuggestedPath, isValidPath } from '../src/utils/boardEngine';
import { findLessonPath } from '../src/utils/lesson';
import { FlowIndicator } from '../src/components/FlowIndicator';
import { LessonCoach } from '../src/components/LessonCoach';

const layout = (s: ReturnType<typeof createSession>) => s.grid.map(row => row.map(cell => [cell.color,cell.special,cell.locked]));

test('Classic replays change actual stone layout, reset only the attempt and preserve seals and goals', () => {
  for (const stage of STAGES) for (let seed = 0; seed < 20; seed++) {
    const before = createSession('classic', stage.id);
    before.score = 900; before.turns = 3; before.movesLeft = 1; before.shufflesLeft = 0;
    const next = restartSession(before, seed);
    assert.notDeepEqual(layout(next), layout(before));
    assert.deepEqual(next.grid.flatMap((row,r) => row.flatMap((cell,c) => cell.locked ? [[r,c]] : [])), stage.lockedCoords);
    assert.equal(next.stageId, stage.id); assert.equal(next.movesLeft, stage.moves);
    assert.equal(next.score, 0); assert.equal(next.turns, 0); assert.equal(next.shufflesLeft, 2);
    assert.equal(next.outcome, 'playing'); assert.ok(validateSession(next,'classic'));
    assert.ok(findSuggestedPath(next.grid));
    if (stage.requireLoop || stage.loopsTarget) assert.ok(isValidPath(next.grid, findLessonPath(next.grid, 'loop'), true));
  }
});

test('Even replaying an untouched rerolled board with the same seed yields a new layout', () => {
  const a = restartSession(createSession('classic', 8), 42);
  const b = restartSession(a, 42);
  assert.notDeepEqual(layout(a), layout(b));
  const zen = createSession('zen');
  assert.notDeepEqual(layout(zen), layout(restartSession(zen, 19)));
});

test('Daily restart retains its original day, stones and future random sequence', () => {
  const before = createSession('daily', 1, new Date(2026,9,7));
  const after = restartSession(before, 999);
  assert.equal(after.dailyKey, before.dailyKey);
  assert.deepEqual(layout(after), layout(before));
  assert.equal(after.rngState, before.rngState);
  const path = findSuggestedPath(before.grid)!;
  const a = commitMove(before,path,false)!, b = commitMove(after,path,false)!;
  assert.deepEqual(layout(a.next), layout(b.next));
});

test('Continue preserves a playing board, a finished replay is fresh, and daily entry advances to today', () => {
  const s = createSession('classic',2), profile = recordSession(defaultProfile(),s);
  assert.equal(sessionToOpen(profile,'classic',2),s);
  s.outcome = 'won';
  const replay = sessionToOpen(profile,'classic',2);
  assert.equal(replay.outcome,'playing'); assert.notDeepEqual(layout(replay),layout(s));
  const yesterday = createSession('daily',1,new Date(2026,9,7));
  const dailyProfile = recordSession(profile,yesterday);
  assert.equal(sessionToOpen(dailyProfile,'daily',undefined,new Date(2026,9,8)).dailyKey,'2026-10-08');
});

test('Rerolled attempts resume their board and future RNG exactly after saving', () => {
  const s = restartSession(createSession('classic',9),217);
  const p = recordSession(defaultProfile(),s); p.stages[1]={stars:3,best:2000}; p.tutorialSeen=true; p.loopTutorialSeen=true;
  const loaded = parseProfile(JSON.stringify(p)), resumed = loaded.sessions.classic!;
  assert.equal(loaded.tutorialSeen,true); assert.equal(loaded.loopTutorialSeen,true);
  assert.deepEqual(loaded.stages[1],p.stages[1]);
  assert.deepEqual(resumed.grid,s.grid); assert.equal(resumed.rngState,s.rngState);
  const path = findSuggestedPath(s.grid)!;
  const a = commitMove(s,path,false)!, b = commitMove(resumed,path,false)!;
  assert.deepEqual(layout(a.next),layout(b.next)); assert.equal(a.earned,b.earned);
});

test('Lessons find legal chains and noncrossing rings on real boards without editing any stone', () => {
  const s = createSession('classic',4), before = JSON.stringify(s.grid);
  assert.ok(isValidPath(s.grid,findLessonPath(s.grid,'link'),false));
  const ring = findLessonPath(s.grid,'loop');
  assert.equal(ring.length,5); assert.deepEqual(ring[0],ring.at(-1));
  assert.ok(isValidPath(s.grid,ring,true)); assert.equal(JSON.stringify(s.grid),before);
  const noRing = createSession('classic',1).grid;
  noRing.forEach(row => row.forEach(cell => {cell.locked=true;}));
  assert.deepEqual(findLessonPath(noRing,'loop'),[]);
});

test('Touch and drag lessons give the correct release action; an open chain does not complete the ring lesson', () => {
  const flow = (tapMode: boolean) => renderToStaticMarkup(createElement(FlowIndicator,{count:3,affected:3,loop:false,tapMode}));
  assert.ok(flow(true).includes('Patlat’a dokun')); assert.ok(!flow(true).includes('Bırak, patlat'));
  assert.ok(flow(false).includes('Bırak, patlat'));
  const ringProps = {lesson:'loop' as const,path:[[1,1],[1,2],[2,2],[2,1],[1,1]] as [number,number][],count:4,loop:false,tapMode:true,onSkip:()=>{}};
  const open = renderToStaticMarkup(createElement(LessonCoach,ringProps));
  assert.ok(open.includes('başlangıca dön')); assert.ok(!open.includes('Hazır!'));
  const closed = renderToStaticMarkup(createElement(LessonCoach,{...ringProps,loop:true}));
  assert.ok(closed.includes('Hazır! Patlat’a dokun.')); assert.ok(closed.includes('Alıştırmayı atla'));
});
