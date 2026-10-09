import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createSession, defaultProfile, parseProfile, recordSession } from '../src/utils/session';
import { ENDING, mysteryProgress, styleAvailable } from '../src/utils/mystery';
import { MysteryJournal } from '../src/components/Mystery';
import { PrismGemArtwork } from '../src/components/PrismGemArtwork';

const day = (d: number) => new Date(`2026-10-${String(d).padStart(2,'0')}T12:00:00Z`);
test('A daily victory gives one permanent echo per actual day; replay and historical practice do not add echoes', () => {
  let p = defaultProfile();
  for (const d of [1,1,3,6,7,9,12,15,16]) {
    const win = {...createSession('daily', 1, day(d)), outcome:'won' as const};
    p = recordSession(p, win, day(d));
    p = parseProfile(JSON.stringify(p));
  }
  assert.equal(mysteryProgress(p).echoes,7);
  assert.equal(p.mysteryDays?.length,7);
  assert.equal(p.mysteryDays?.at(-1),'2026-10-15');
  const fresh = recordSession(defaultProfile(), {...createSession('daily',1,day(1)),outcome:'won'},day(9));
  assert.equal(mysteryProgress(fresh).echoes,0);
  assert.deepEqual(recordSession(defaultProfile(), {...createSession('daily',1,day(9)),outcome:'lost'},day(9)).mysteryDays,[]);
});
test('Legacy wins migrate to the journal without resetting progress or settings', () => {
  const p=defaultProfile();delete p.mysteryDays;p.dailyWins=['2026-10-01','2026-10-01','2026-10-03'];p.settings.sound=false;p.stages[1]={stars:2,best:800};
  const saved=parseProfile(JSON.stringify(p));
  assert.equal(mysteryProgress(saved).echoes,2);assert.equal(saved.stages[1].stars,2);assert.equal(saved.settings.sound,false);
});
test('Restoration follows a complete path and the ending requires both all stages and seven echoes', () => {
  const p=defaultProfile();p.stages[30]={stars:3,best:9000};
  assert.equal(mysteryProgress(p).restored,0);assert.equal(mysteryProgress(p).finale,false);
  for(let i=1;i<=30;i++)p.stages[i]={stars:1,best:9000};
  assert.equal(mysteryProgress(p).finale,false);
  p.mysteryDays=Array.from({length:7},(_,i)=>`2026-10-0${i+1}`);
  assert.equal(mysteryProgress(p).finale,true);
  assert.ok(renderToStaticMarkup(createElement(MysteryJournal,{profile:p})).includes(ENDING));
});
test('Locked journal does not reveal Mira or the ending', () => {
  const html=renderToStaticMarkup(createElement(MysteryJournal,{profile:defaultProfile()}));
  assert.ok(!html.includes('Mira'));assert.ok(!html.includes(ENDING));assert.ok(html.includes('Mühürlü kayıt'));
});
test('Cosmetic unlock is saved and changes only the sprite', () => {
  const p=defaultProfile();p.gemStyle='element';
  assert.equal(styleAvailable(p,'element'),false);assert.equal(parseProfile(JSON.stringify(p)).gemStyle,undefined);
  for(let i=1;i<=6;i++)p.stages[i]={stars:1,best:1000};
  assert.equal(styleAvailable(p,'element'),true);assert.equal(parseProfile(JSON.stringify(p)).gemStyle,'element');
  const html=renderToStaticMarkup(createElement(PrismGemArtwork,{cell:{id:'a',color:'cobalt',special:'none',multiplier:1,locked:false},isSelected:false,isLoopHighlighted:false,gemStyle:'element'}));
  assert.ok(html.includes('/cores/element-cobalt.webp'));assert.ok(!html.includes('/cores/motif-cobalt.webp'));
});
