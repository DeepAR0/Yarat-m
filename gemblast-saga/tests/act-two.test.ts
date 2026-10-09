import test from 'node:test';
import assert from 'node:assert/strict';
import { ACT_ONE_STAGES, CHAPTERS, STAGES } from '../src/types/game';
import { resolvePathOnGrid, createRNG, type Coord } from '../src/utils/boardEngine';
import { createSession, defaultProfile, parseProfile, recordSession } from '../src/utils/session';
import { mysteryProgress, STORY } from '../src/utils/mystery';
import { storyRecord } from '../src/utils/storyPresentation';

test('Act II adds three ten-stop realms with shelled seals and goals that match its seals', () => {
  assert.equal(STAGES.length, 60); assert.equal(CHAPTERS.length, 6);
  STAGES.forEach((stage, i) => assert.equal(stage.id, i + 1));
  for (const stage of STAGES.slice(ACT_ONE_STAGES)) {
    assert.ok(stage.armoredCoords?.length, `stage ${stage.id} has shells`);
    for (const [r, c] of stage.armoredCoords!) assert.ok(stage.lockedCoords.some(([lr, lc]) => lr === r && lc === c));
    assert.equal(stage.sealsTarget, stage.lockedCoords.length);
  }
  const session = createSession('classic', 51);
  assert.equal(session.grid.flat().filter(c => c.armor).length, STAGES[50].armoredCoords!.length);
  assert.ok(STAGES.slice(0, ACT_ONE_STAGES).every(s => !s.armoredCoords));
});

test('A shell takes one strike per move: it cracks first and the seal opens on a later move', () => {
  const session = createSession('zen');
  const grid = session.grid.map(row => row.map(cell => ({ ...cell, special: 'none' as const, multiplier: 1 as const })));
  grid[2][3] = { ...grid[2][3], locked: true, armor: 1 };
  // Touches the shell from above, left and below.
  const path: Coord[] = [[1, 3], [2, 2], [3, 3]];
  for (const [r, c] of path) grid[r][c].color = 'coral';
  const first = resolvePathOnGrid(grid, path, false, createRNG(1));
  assert.equal(first.unlockedCount, 0);
  assert.ok(first.nextGrid[2][3].locked && !first.nextGrid[2][3].armor);
  const again = first.nextGrid.map(row => row.map(cell => ({ ...cell, special: 'none' as const, multiplier: 1 as const })));
  for (const [r, c] of path) again[r][c] = { ...again[r][c], color: 'amber', locked: false };
  const second = resolvePathOnGrid(again, path, false, createRNG(2));
  assert.equal(second.unlockedCount, 1); assert.equal(second.nextGrid[2][3].locked, false);
});

test('Shelled boards survive saving; a shell on an open stone is rejected as damaged', () => {
  const session = createSession('classic', 45);
  const loaded = parseProfile(JSON.stringify(recordSession(defaultProfile(), session))).sessions.classic!;
  assert.equal(loaded.grid.flat().filter(c => c.armor).length, session.grid.flat().filter(c => c.armor).length);
  const broken = structuredClone(session); broken.grid[0][0] = { ...broken.grid[0][0], locked: false, armor: 1 };
  assert.equal(parseProfile(JSON.stringify(recordSession(defaultProfile(), broken))).sessions.classic, undefined);
});

test('The second act tells its story through stage 60; the tower finale still needs 30 stops and seven echoes', () => {
  assert.equal(STORY.length, 20); assert.equal(STORY.at(-1)!.stage, 60);
  const p = defaultProfile();
  for (let i = 1; i <= 60; i++) p.stages[i] = { stars: 1, best: 1 };
  assert.equal(mysteryProgress(p).epilogue, true); assert.equal(mysteryProgress(p).finale, false);
  p.mysteryDays = Array.from({ length: 7 }, (_, i) => `2026-10-0${i + 1}`);
  assert.equal(mysteryProgress(p).finale, true);
  assert.equal(storyRecord(p, 60)!.scene, 'finale');
  assert.equal(storyRecord(defaultProfile(), 31), undefined);
});
