import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createGrid, createRNG, refillGrid } from '../src/utils/boardEngine';
import { GemFalls, MoveTimeline, planGemFalls, Schedule } from '../src/utils/movePresentation';
import { GemEffects } from '../src/components/GemEffects';
import { PrismGemArtwork } from '../src/components/PrismGemArtwork';
import { ChainEnergy } from '../src/components/ChainEnergy';
import App from '../src/App';

function clock() {
  let now = 0;
  const tasks = new Set<{ fn: () => void; at: number }>();
  const schedule: Schedule = (fn, delay) => {
    const task = { fn, at: now + delay }; tasks.add(task);
    return () => tasks.delete(task);
  };
  return { schedule, get size() { return tasks.size; }, advance(ms: number) {
    const end = now + ms;
    while (true) {
      const task = [...tasks].filter(t => t.at <= end).sort((a,b) => a.at - b.at)[0];
      if (!task) break;
      now = task.at; tasks.delete(task); task.fn();
    }
    now = end;
  } };
}
const falls: GemFalls = { a: { x:0,y:-2,duration:308,delay:0,fresh:false }, b:{x:0,y:-4,duration:336,delay:25,fresh:true} };
function callbacks(events: string[]) { return { clearing:() => events.push('clear'), falling:() => events.push('fall'), settled:() => events.push('settled') }; }

test('The app renders its loading screen using the production timeline constructor', () => {
  const markup = renderToStaticMarkup(createElement(App));
  assert.ok(markup.includes('Gemblast Saga'));
  assert.ok(markup.includes('Çekirdekler uyanıyor…'));
});

test('The default timer completes a move without an injected test clock', async () => {
  const timeline = new MoveTimeline(), events: string[] = [];
  try {
    await new Promise<void>(resolve => {
      assert.equal(timeline.start(1, {}, 0, false, {
        ...callbacks(events),
        settled: () => { events.push('settled'); resolve(); },
      }), true);
      assert.deepEqual(events, ['clear']);
    });
    assert.deepEqual(events, ['clear', 'fall', 'settled']);
    assert.equal(timeline.running, false);
  } finally { timeline.cancel(); }
});

test('Clear precedes falling; input stays locked until all moving gems land', () => {
  const time=clock(), timeline=new MoveTimeline(time.schedule), events:string[]=[];
  assert.equal(timeline.start(1,falls,180,false,callbacks(events)),true);
  assert.deepEqual(events,['clear']); assert.ok(timeline.running);
  assert.equal(timeline.start(2,falls,180,false,callbacks(events)),false);
  timeline.landed(1,'a'); // An early child animation must not unlock the board.
  time.advance(180); assert.deepEqual(events,['clear','fall']);
  timeline.landed(1,'a'); assert.ok(timeline.running);
  timeline.landed(1,'a'); assert.ok(timeline.running);
  timeline.landed(1,'b'); assert.equal(timeline.running,false);
  assert.deepEqual(events,['clear','fall','settled']); assert.equal(time.size,0);
});
test('Missing animation events have a bounded fallback and never leave input locked', () => {
  const time=clock(), timeline=new MoveTimeline(time.schedule), events:string[]=[];
  timeline.start(1,falls,180,false,callbacks(events));
  time.advance(180+361+119); assert.ok(timeline.running);
  time.advance(1); assert.equal(timeline.running,false); assert.equal(time.size,0);
  assert.deepEqual(events,['clear','fall','settled']);
});
test('Reduced motion settles immediately without waiting for CSS events', () => {
  const time=clock(), timeline=new MoveTimeline(time.schedule), events:string[]=[];
  timeline.start(1,falls,180,true,callbacks(events));
  assert.deepEqual(events,['settled']); assert.equal(timeline.running,false); assert.equal(time.size,0);
});
test('Restart discards old timers; old landing events cannot settle the next move', () => {
  const time=clock(), timeline=new MoveTimeline(time.schedule), old:string[]=[], next:string[]=[];
  timeline.start(1,falls,180,false,callbacks(old)); timeline.cancel();
  timeline.start(2,falls,140,false,callbacks(next)); time.advance(140);
  timeline.landed(1,'a'); timeline.landed(1,'b'); assert.ok(timeline.running);
  timeline.landed(2,'a'); timeline.landed(2,'b'); time.advance(1000);
  assert.deepEqual(old,['clear']); assert.deepEqual(next,['clear','fall','settled']); assert.equal(time.size,0);
});
test('Leaving the app in either phase settles once, with no delayed state changes', () => {
  for (const beforeFall of [true,false]) {
    const time=clock(), timeline=new MoveTimeline(time.schedule), events:string[]=[];
    timeline.start(1,falls,140,false,callbacks(events)); if (!beforeFall) time.advance(140);
    timeline.finish(); timeline.finish(); time.advance(1000);
    assert.equal(events.filter(e=>e==='settled').length,1); assert.equal(time.size,0); assert.equal(timeline.running,false);
  }
});
test('Repeated multi-gem moves do not accumulate timers or keep an old input lock', () => {
  const time=clock(), timeline=new MoveTimeline(time.schedule);
  let settled=0;
  for(let id=1;id<=1000;id++) {
    timeline.start(id,falls,140,false,{clearing:()=>{},falling:()=>{},settled:()=>settled++});
    time.advance(140);
    if(id%2) { timeline.landed(id,'a'); timeline.landed(id,'b'); } else time.advance(1000);
    assert.equal(timeline.running,false); assert.equal(time.size,0);
  }
  assert.equal(settled,1000);
});
test('New gems occupy distinct entry slots; survivors start at their actual old rows', () => {
  const before=createGrid([],7), cleared=new Set(['1,0','3,0','5,0']);
  const after=refillGrid(before,cleared,'down',createRNG(17)), plan=planGemFalls(before,after);
  const entry=after.map((row,r)=>({r,cell:row[0]})).filter(({cell})=>!before.flat().some(old=>old.id===cell.id));
  assert.deepEqual(entry.map(({r,cell})=>r+plan[cell.id].y),[-3,-2,-1]);
  for(let r=0;r<6;r++) {
    const cell=after[r][0], old=before.findIndex(row=>row[0].id===cell.id);
    if(old>=0 && old!==r) assert.equal(plan[cell.id].y,old-r);
  }
  assert.ok(Object.values(plan).every(f=>f.duration+f.delay<=389));
});
test('A sealed column gets separate entry stacks and the seal itself never falls', () => {
  const before=createGrid([[2,0]],13), after=refillGrid(before,new Set(['1,0','4,0','5,0']),'down',createRNG(29));
  const plan=planGemFalls(before,after);
  assert.equal(plan[before[2][0].id],undefined);
  const lower=after.slice(3).map((row,i)=>({r:i+3,cell:row[0]})).filter(({cell})=>!before.flat().some(old=>old.id===cell.id));
  assert.deepEqual(lower.map(({r,cell})=>r+plan[cell.id].y),[1,2]);
});
test('A full-board explosion keeps shards bounded and never clones stone images', () => {
  const grid=createGrid([],17);
  grid[0].forEach(cell=>{cell.special='pulse_row';});
  const markup=renderToStaticMarkup(createElement(GemEffects,{burst:{id:1,points:3000,label:'ZİNCİR TEPKİSİ!',loop:true,chainLength:18,color:'#c8edcf',gems:grid.flatMap((row,r)=>row.map((cell,c)=>({coord:[r,c] as [number,number],cell})))}}));
  assert.ok((markup.match(/class="gem-particle"/g)?.length??0)<=72);
  assert.equal(markup.includes('<img'),false);
  assert.equal(markup.match(/class="laser-beam /g)?.length,1);
});
test('Each energy seed uses one sprite, and reduced-motion chains omit animated runners', () => {
  const cell=createGrid([],19)[0][0];
  const gem=renderToStaticMarkup(createElement(PrismGemArtwork,{cell,isSelected:true,isLoopHighlighted:false}));
  assert.equal(gem.match(/<img/g)?.length,1); assert.ok(gem.includes(`/cores/motif-${cell.color}.webp`));
  const chain=renderToStaticMarkup(createElement(ChainEnergy,{path:[[1,1],[1,2],[1,3]],color:'#a9e2d2',loop:false,reducedMotion:true}));
  assert.equal(chain.includes('animateMotion'),false); assert.ok(chain.includes('energy-current'));
});
