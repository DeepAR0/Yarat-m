import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidPath } from '../src/utils/boardEngine';
import { PRISM_COLORS, type PrismColor } from '../src/types/game';
import { createSession } from '../src/utils/session';
import { findBestHint } from '../src/utils/hint';

// Paint the board in a pattern that never forms a same-color neighbor pair, then add test shapes.
function blankBoard(mode: 'classic' | 'zen' = 'zen', stage = 1) {
  const session = createSession(mode, stage, new Date(), { seed: 1, teachingLayout: false });
  session.grid.forEach((row, r) => row.forEach((cell, c) => { cell.locked = false; cell.special = 'none'; cell.multiplier = 1; cell.color = PRISM_COLORS[(r * 2 + c) % 5]; }));
  return session;
}
const paint = (session: ReturnType<typeof blankBoard>, color: PrismColor, coords: [number, number][]) => coords.forEach(([r, c]) => { session.grid[r][c].color = color; });

test('The hint returns a valid move from the strongest color group', () => {
  const session = blankBoard();
  assert.equal(findBestHint(session), null);
  paint(session, 'coral', [[0, 0], [0, 1], [0, 2]]);
  paint(session, 'cobalt', [[5, 0], [5, 1], [5, 2], [5, 3], [5, 4]]);
  const hint = findBestHint(session)!;
  assert.ok(isValidPath(session.grid, hint.path, hint.loop));
  assert.equal(session.grid[hint.path[0][0]][hint.path[0][1]].color, 'cobalt');
  assert.ok(hint.cleared >= 5 && hint.message.includes(String(hint.cleared)));
});

test('Missing color quotas outweigh a slightly bigger off-goal clear', () => {
  const session = blankBoard('classic', 1); // stage 1 asks for coral and cobalt
  paint(session, 'amber', [[0, 0], [0, 1], [0, 2], [0, 3]]);
  paint(session, 'coral', [[5, 0], [5, 1], [5, 2]]);
  const hint = findBestHint(session)!;
  assert.equal(session.grid[hint.path[0][0]][hint.path[0][1]].color, 'coral');
});

test('A pending ring goal surfaces a closable ring', () => {
  const session = blankBoard('classic', 4); // stage 4 requires a ring
  paint(session, 'violet', [[2, 2], [2, 3], [3, 2], [3, 3]]);
  const hint = findBestHint(session)!;
  assert.ok(hint.loop && isValidPath(session.grid, hint.path, true));
  assert.ok(hint.message.includes('halka'));
});

test('A single-color board is searched within a bounded time', () => {
  const session = blankBoard();
  session.grid.forEach(row => row.forEach(cell => { cell.color = 'amber'; }));
  const start = performance.now();
  const hint = findBestHint(session)!;
  assert.ok(performance.now() - start < 1500);
  assert.ok(isValidPath(session.grid, hint.path, hint.loop));
});
