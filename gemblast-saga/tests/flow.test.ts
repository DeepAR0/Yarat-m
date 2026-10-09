import test from 'node:test';
import assert from 'node:assert/strict';
import { CellData, FLOW_DIRECTIONS, STAGES } from '../src/types/game';
import { Coord, createGrid, createRNG, flowForPath, isValidPath, previewClear, refillGrid, resolvePathOnGrid } from '../src/utils/boardEngine';
import { commitMove, createSession, defaultProfile, parseProfile, recordSession } from '../src/utils/session';

const ring: Coord[] = [[1,1],[1,2],[1,3],[2,3],[3,3],[3,2],[3,1],[2,1],[1,1]];
function ringGrid() {
  const grid = createGrid([], 41);
  grid.flat().forEach(cell => { cell.color = 'cobalt'; });
  ring.forEach(([r,c]) => { grid[r][c].color = 'violet'; });
  grid[2][2].color = 'amber';
  grid[5][5].color = 'violet';
  grid[0][5].color = 'violet';
  grid[4][4].color = 'violet'; grid[4][4].locked = true;
  return grid;
}
test('Every chain and closed ring uses fixed downward gravity', () => {
  assert.equal(flowForPath([[1,1],[1,2],[1,3]]), 'down');
  assert.equal(flowForPath([[1,3],[1,2],[1,1]]), 'down');
  assert.equal(flowForPath([[3,1],[2,1],[1,1]]), 'down');
  assert.equal(flowForPath([[1,1],[2,1],[3,1]]), 'down');
  assert.equal(flowForPath([[1,1],[2,2],[3,3]]), 'down');
  assert.equal(flowForPath([[1,1],[2,2],[2,3]]), 'down');
  assert.equal(flowForPath(ring, true, 'up'), 'down');
});
test('Four directions compact survivors in stable order and refill at the opposite edge', () => {
  const grid = createGrid([], 17), before = JSON.stringify(grid);
  for (const direction of FLOW_DIRECTIONS) {
    const horizontal = direction === 'left' || direction === 'right';
    const line = (i:number): Coord => horizontal ? [2,i] : [i,2];
    const cleared = new Set([line(1),line(4)].map(([r,c]) => `${r},${c}`));
    const result = refillGrid(grid, cleared, direction, createRNG(37));
    const cells = Array.from({length:6},(_,i) => result[line(i)[0]][line(i)[1]]);
    const survivorIds = [0,2,3,5].map(i => grid[line(i)[0]][line(i)[1]].id);
    const towardStart = direction === 'left' || direction === 'up';
    assert.deepEqual(cells.slice(towardStart?0:2,towardStart?4:6).map(c=>c.id), survivorIds);
    assert.ok(cells.slice(towardStart?4:0,towardStart?6:2).every(c=>c.isNew));
    assert.equal(new Set(result.flat().map(c=>c.id)).size,36);
  }
  assert.equal(JSON.stringify(grid), before);
});
test('Sealed cells split horizontal and vertical flow into independent segments', () => {
  for (const direction of FLOW_DIRECTIONS) {
    const grid = createGrid([], 13), horizontal = direction === 'left' || direction === 'right';
    const line = (i:number): Coord => horizontal ? [2,i] : [i,2];
    const [r,c] = line(2); grid[r][c].locked = true;
    const result = refillGrid(grid,new Set([line(1),line(4)].map(([y,x])=>`${y},${x}`)),direction,createRNG(29));
    assert.equal(result[r][c].id,grid[r][c].id);
    assert.ok(result[r][c].locked);
    const beforeSegment = [0,1].map(i=>result[line(i)[0]][line(i)[1]]);
    const afterSegment = [3,4,5].map(i=>result[line(i)[0]][line(i)[1]]);
    assert.ok(beforeSegment.some(cell=>cell.id===grid[line(0)[0]][line(0)[1]].id));
    assert.ok(!beforeSegment.some(cell=>cell.id===grid[line(3)[0]][line(3)[1]].id));
    assert.ok(afterSegment.some(cell=>cell.id===grid[line(3)[0]][line(3)[1]].id));
  }
});
test('Closing a ring clears remote same-color gems and preserves other interior colors and seals', () => {
  const grid = ringGrid(), remote = grid[5][5].id, interior = grid[2][2].id, sealed = grid[4][4].id, before = JSON.stringify(grid);
  const result = resolvePathOnGrid(grid,ring,true,createRNG(59),'left');
  assert.equal(result.clearedCount,10);
  assert.equal(result.colorCounts.violet,10); assert.equal(result.colorCounts.amber,0);
  assert.equal(result.enclosedCount,0);
  assert.equal(result.nextGrid.flat().some(c=>c.id===remote),false);
  assert.ok(result.nextGrid.flat().some(c=>c.id===interior));
  assert.ok(result.nextGrid.flat().some(c=>c.id===sealed));
  assert.equal(result.nextGrid.flat().filter(c=>c.special==='nova_3x3').length,1);
  assert.equal(JSON.stringify(grid),before);
});
test('An enclosed seal unlocks through its neighbors but is not collected on that move', () => {
  const grid = ringGrid(); grid[2][2].locked = true; const id=grid[2][2].id;
  const result = resolvePathOnGrid(grid,ring,true,createRNG(59),'up');
  assert.equal(result.clearedCount,10); assert.equal(result.enclosedCount,0); assert.equal(result.unlockedCount,1);
  assert.ok(result.nextGrid.flat().some(c=>c.id===id && !c.locked));
});
test('Self-intersecting bow-tie loops are rejected before spending a move', () => {
  const grid = ringGrid();
  const cross:Coord[] = [[1,1],[2,2],[1,2],[2,1],[1,1]];
  cross.forEach(([r,c])=>{grid[r][c].color='violet';});
  assert.equal(isValidPath(grid,cross,true),false);
  const session = createSession('classic',4); session.grid=grid;
  assert.equal(commitMove(session,cross,true),null); assert.equal(session.movesLeft,12);
});
test('Reversed three-gem chains refill identically; saves preserve downward flow', () => {
  const session = createSession('classic',2);
  const path:Coord[] = [[1,1],[1,2],[1,3]];
  const right=commitMove(session,path,false)!,left=commitMove(session,[...path].reverse(),false)!;
  assert.equal(right.next.flow,'down');assert.equal(left.next.flow,'down');
  assert.deepEqual(right.next.grid.map(row=>row.map(c=>c.color)),left.next.grid.map(row=>row.map(c=>c.color)));
  const restored = parseProfile(JSON.stringify(recordSession(defaultProfile(),left.next))).sessions.classic!;
  assert.equal(restored.flow,'down');assert.deepEqual(restored.usedDirections,['down']);
  assert.equal(restored.rngState,left.next.rngState);
  assert.deepEqual(restored.grid,left.next.grid);
});
test('Direction goals are removed; ring goals remain required alongside score and colors', () => {
  const session=createSession('classic',2);session.score=STAGES[1].targetScore;
  STAGES[1].quotas.forEach(q=>{session.collected[q.color]=q.target;});
  const path:Coord[]=[[1,1],[1,2],[1,3]];
  assert.equal(commitMove(session,path,false)!.next.outcome,'won');
  assert.equal(commitMove(session,[...path].reverse(),false)!.next.outcome,'won');
  const resonance=createSession('classic',4);resonance.score=STAGES[3].targetScore;
  STAGES[3].quotas.forEach(q=>{resonance.collected[q.color]=q.target;});
  assert.equal(commitMove(resonance,[[1,1],[1,2],[1,3]],false)!.next.outcome,'playing');
  const loopMove=commitMove(resonance,ring,true)!;assert.equal(loopMove.next.outcome,'won');assert.equal(loopMove.next.loopsMade,1);
});

test('Selection preview includes remote ring gems and chained powers without mutating the board', () => {
  const grid=ringGrid(); grid[5][5].special='pulse_row'; const before=JSON.stringify(grid);
  const preview=previewClear(grid,ring,true), result=resolvePathOnGrid(grid,ring,true,createRNG(31));
  assert.deepEqual(preview.clearedCoords,result.clearedCoords);
  assert.ok(preview.clearedCoords.some(([r,c])=>r===5 && c===0));
  assert.equal(preview.triggeredSpecialsCount,1);
  assert.equal(JSON.stringify(grid),before);
});

test('Seal and special objectives require the matching actions', () => {
  const seal=createSession('classic',6); seal.score=STAGES[5].targetScore;
  STAGES[5].quotas.forEach(q=>{seal.collected[q.color]=q.target;});
  const opened=commitMove(seal,[[2,1],[2,2],[2,3],[2,4]],false)!;
  assert.equal(opened.next.sealsOpened,2); assert.equal(opened.next.outcome,'won');
  const special=createSession('classic',7); special.score=STAGES[6].targetScore;
  STAGES[6].quotas.forEach(q=>{special.collected[q.color]=q.target;});
  const fired=commitMove(special,[[2,1],[2,2],[2,3]],false)!;
  assert.equal(fired.next.specialsTriggered,1); assert.equal(fired.next.outcome,'won');
});
test('The first five teaching encounters have short deterministic winning routes', () => {
  const plans:{paths:Coord[][];loop?:boolean}[]=[
    {paths:[[[2,1],[2,2],[2,3]],[[4,1],[4,2],[4,3]]]},
    {paths:[[[1,4],[1,3],[1,2],[1,1]],[[3,4],[3,3],[3,2],[3,1]]]},
    {paths:[[[4,1],[3,1],[2,1],[1,1]],[[4,4],[3,4],[2,4],[1,4]]]},
    {paths:[ring],loop:true},
    {paths:[Array.from({length:6},(_,c):Coord=>[1,c]),Array.from({length:6},(_,c):Coord=>[4,c])]},
  ];
  plans.forEach((plan,i)=>{
    let session=createSession('classic',i+1);
    for(const path of plan.paths){const move=commitMove(session,path,!!plan.loop);assert.ok(move,`stage ${i+1}`);session=move.next;}
    assert.equal(session.outcome,'won',`stage ${i+1} score ${session.score}`);
    assert.ok(session.turns<=2);
  });
});

