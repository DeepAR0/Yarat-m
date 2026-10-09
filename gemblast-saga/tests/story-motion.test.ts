import test from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {defaultProfile,createSession} from '../src/utils/session';
import {STORY} from '../src/utils/mystery';
import {latestRecord,storyRecord,echoRecord,resultRecord,PROLOGUE} from '../src/utils/storyPresentation';
import {startStoryMotion, type StorySchedule} from '../src/utils/storyMotion';
import {StoryPlayer} from '../src/components/StoryPlayer';
import {MysteryJournal} from '../src/components/Mystery';

test('Stopping or leaving a scene cancels phases, and even late callbacks cannot alter the settled frame',()=>{
  const callbacks:(()=>void)[]=[],cancelled:number[]=[],phases:number[]=[];
  const schedule:StorySchedule=(fn)=>{const i=callbacks.push(fn)-1;return ()=>cancelled.push(i);};
  const stop=startStoryMotion(p=>phases.push(p),false,schedule);
  callbacks[0]();stop();callbacks[1]();callbacks[2]();
  assert.deepEqual(phases,[0,1]);assert.deepEqual(cancelled,[0,1,2]);
});
test('A scene reveals in order and reduced motion starts settled with no timers',()=>{
  const queue:{fn:()=>void;delay:number}[]=[],phases:number[]=[];
  startStoryMotion(p=>phases.push(p),false,(fn,delay)=>{queue.push({fn,delay});return ()=>{};});
  queue.sort((a,b)=>a.delay-b.delay).forEach(t=>t.fn());
  assert.deepEqual(phases,[0,1,2,3]);assert.ok(queue.at(-1)!.delay<5000);
  let timers=0;const still:number[]=[];
  startStoryMotion(p=>still.push(p),true,()=>{timers++;return ()=>{};});
  assert.deepEqual(still,[3]);assert.equal(timers,0);
});
test('Only unlocked story scenes can play; ordinary victories do not fabricate a discovery',()=>{
  const p=defaultProfile();assert.equal(latestRecord(p).id,'prologue');assert.equal(storyRecord(p,23),undefined);assert.equal(echoRecord(p,0),undefined);
  for(let i=1;i<=6;i++)p.stages[i]={stars:1,best:1000};
  assert.equal(resultRecord(p,{...createSession('classic',6),outcome:'won'})?.scene,'gate');
  assert.equal(resultRecord(p,{...createSession('classic',5),outcome:'won'}),undefined);
  assert.equal(resultRecord(p,createSession('classic',6)),undefined);
  assert.equal(storyRecord(p,23),undefined);
  const html=renderToStaticMarkup(createElement(MysteryJournal,{profile:p,onPlay:()=>{}}));
  assert.equal((html.match(/Sahneyi izle/g)??[]).length,3);assert.ok(!html.includes('Mira'));
});
test('Every story has a scene; reduced-motion player renders a static stage and a clear reading alternative',()=>{
  const p=defaultProfile();for(let i=1;i<=30;i++)p.stages[i]={stars:1,best:1000};
  assert.ok(new Set(STORY.map(s=>storyRecord(p,s.stage)?.scene)).size>=7);
  const html=renderToStaticMarkup(createElement(StoryPlayer,{record:PROLOGUE,reducedMotion:true}));
  assert.ok(html.includes('phase-3'));assert.ok(html.includes('Sabit sahne'));assert.ok(!html.includes('Animasyonu durdur'));assert.ok(!html.includes('Yeniden oynat'));
});
