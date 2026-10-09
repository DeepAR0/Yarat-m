import test from 'node:test';
import assert from 'node:assert/strict';
import { CellData, PRISM_COLORS, STAGES } from '../src/types/game';
import { createGrid, createRNG, ensurePlayable, findSuggestedPath, hasValidPath, isValidPath, resolvePathOnGrid, shuffleGrid } from '../src/utils/boardEngine';

const colors = (grid: CellData[][]) => grid.map(row => row.map(cell => [cell.color, cell.locked, cell.special, cell.multiplier]));
const gridWithPath = () => {
  const grid = createGrid([], 8);
  for (let c = 0; c < 6; c++) grid[0][c].color = 'coral';
  return grid;
};
test('Seeded RNG continues identically after saving its state', () => {
  const rng = createRNG(123); Array.from({ length: 37 }, rng);
  const resumed = createRNG(rng.getState());
  assert.deepEqual(Array.from({ length: 40 }, rng), Array.from({ length: 40 }, resumed));
});
test('All 30 levels generate playable grids over 100 seeds', () => {
  for (const stage of STAGES) for (let seed = 0; seed < 100; seed++) {
    const grid = createGrid(stage.lockedCoords, seed);
    assert.ok(hasValidPath(grid));
    assert.equal(grid.flat().filter(cell => cell.locked).length, stage.lockedCoords.length);
  }
});
test('Seeded boards have identical gameplay data', () => {
  assert.deepEqual(colors(createGrid(STAGES[3].lockedCoords, 123)), colors(createGrid(STAGES[3].lockedCoords, 123)));
});
test('Invalid, repeated, nonadjacent and frozen paths are rejected', () => {
  const grid = gridWithPath();
  assert.ok(isValidPath(grid, [[0, 0], [0, 1], [0, 2]], false));
  assert.equal(isValidPath(grid, [[0, 0], [0, 2], [0, 3]], false), false);
  assert.equal(isValidPath(grid, [[0, 0], [0, 1], [0, 0]], false), false);
  grid[0][1].locked = true;
  assert.equal(isValidPath(grid, [[0, 0], [0, 1], [0, 2]], false), false);
  assert.throws(() => resolvePathOnGrid(grid, [], false));
});
test('Only loops with four unique stones closing at the start are accepted', () => {
  const grid = gridWithPath(); grid[1][0].color = grid[1][1].color = 'coral';
  assert.ok(isValidPath(grid, [[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]], true));
  assert.equal(isValidPath(grid, [[0, 0], [0, 1], [1, 1], [0, 0]], true), false);
  assert.equal(isValidPath(grid, [[0, 0], [0, 1], [1, 1], [1, 0], [0, 1]], true), false);
});
test('Four, five and six stones generate the correct special power', () => {
  for (const length of [4, 5, 6]) {
    const grid = gridWithPath();
    const result = resolvePathOnGrid(grid, Array.from({ length }, (_, c) => [0, c]), false, createRNG(4));
    assert.equal(result.spawnedMultiplier, length === 4 ? 1 : length === 5 ? 2 : 3);
    assert.equal(result.spawnedPower === 'nova_3x3', length === 6);
    assert.equal(result.nextGrid.flat().filter(cell => cell.special !== 'none').length, 1);
  }
});
test('Uncleared frost remains fixed, adjacent frost unlocks, input is immutable', () => {
  const grid = gridWithPath(); grid[4][0].locked = true; grid[1][1].locked = true;
  const original = JSON.stringify(grid), frostId = grid[4][0].id;
  const result = resolvePathOnGrid(grid, [[0, 0], [0, 1], [0, 2]], false, createRNG(31));
  assert.equal(result.nextGrid[4][0].id, frostId);
  assert.ok(result.nextGrid[4][0].locked);
  assert.equal(result.unlockedCount, 1);
  assert.equal(JSON.stringify(grid), original);
});
test('Specials trigger once in a chain and never clear frozen tiles', () => {
  const grid = gridWithPath(); grid[0][1].special = 'pulse_row'; grid[0][4].special = 'pulse_col'; grid[3][4].locked = true;
  const result = resolvePathOnGrid(grid, [[0, 0], [0, 1], [0, 2]], false, createRNG(3));
  assert.equal(result.triggeredSpecialsCount, 2);
  assert.equal(result.clearedCoords.some(([r, c]) => r === 3 && c === 4), false);
  assert.equal(result.clearedCount, 10);
  assert.equal(PRISM_COLORS.reduce((sum, c) => sum + result.colorCounts[c], 0), result.clearedCount);
});
test('Shuffle preserves unlocked inventory and every frozen coordinate', () => {
  const grid = createGrid([[2, 2], [3, 3]], 7); grid[0][0].special = 'nova_3x3';
  const shuffled = shuffleGrid(grid, createRNG(32));
  assert.deepEqual(shuffled.flat().map(c => c.id).sort(), grid.flat().map(c => c.id).sort());
  assert.equal(shuffled[2][2].id, grid[2][2].id);
  assert.equal(shuffled[3][3].id, grid[3][3].id);
});
test('Deadlock fallback terminates even when RNG repeats the same value', () => {
  const grid = createGrid([], 8);
  grid.forEach((row, r) => row.forEach((cell, c) => { cell.color = PRISM_COLORS[(r * 2 + c) % 5]; }));
  const repaired = ensurePlayable(grid, () => .999);
  assert.ok(findSuggestedPath(repaired));
});
