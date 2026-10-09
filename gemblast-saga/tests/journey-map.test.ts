import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { JourneyMap } from '../src/components/JourneyMap';
import { createSession, defaultProfile, type Profile } from '../src/utils/session';
import { STAGES } from '../src/types/game';
const render=(profile:Profile)=>renderToStaticMarkup(createElement(JourneyMap,{profile,reducedMotion:true,dailyFound:false,onPlay:()=>{},onDaily:()=>{},onZen:()=>{},onStory:()=>{}}));
const wins=(count:number)=>({...defaultProfile(),stages:Object.fromEntries(STAGES.slice(0,count).map(s=>[s.id,{stars:2,best:5000}]))});
test('map keeps all 30 stages in order, locks future stages, and gives a first playable stop',()=>{
 const html=render(defaultProfile());
 const nodes=[...html.matchAll(/aria-label="Bölüm (\d+),[^\"]*"/g)];
 assert.deepEqual(nodes.map(n=>Number(n[1])),STAGES.map(s=>s.id));
 assert.equal((html.match(/disabled=""/g)??[]).length,29);
 assert.match(nodes[0][0],/sıradaki bölüm/);assert.match(nodes[1][0],/kilitli/);
 assert.match(html,/Günlük yankı/);assert.match(html,/Konumum/);
 assert.doesNotMatch(html,/Mira|Unutulan isim|Boş yuvanın sırrı/);
});
test('contiguous progress lights the real realm and unlocks its next stop',()=>{
 const html=render(wins(10));
 assert.match(html,/map-realm-0 realm-restored/);
 assert.match(html,/Bölüm 11, [^\"]*sıradaki bölüm/);
 assert.equal((html.match(/disabled=""/g)??[]).length,19);
 assert.equal((html.match(/Geçit açıldı/g)??[]).length,1);
 assert.match(html,/10\/30 durak/);
 // A non-contiguous old result cannot wake a future diyar.
 const sparse=defaultProfile();sparse.stages[20]={stars:3,best:5000};
 assert.doesNotMatch(render(sparse),/realm-restored/);
});
test('all campaign wins leave the tower waiting for echoes; seven echoes expose the finale',()=>{
 const profile=wins(30);
 assert.doesNotMatch(render(profile),/Son Uyanış’ı izle/);
 assert.match(render(profile),/Eksik yankıyı bul/);
 profile.mysteryDays=['2026-10-01','2026-10-02','2026-10-03','2026-10-04','2026-10-05','2026-10-06','2026-10-07'];
 assert.match(render(profile),/Son Uyanış’ı izle/);
 assert.match(render(profile),/tower-awake/);
});
test('resume beacon follows saved earlier stage rather than the latest unlocked realm',()=>{
 const profile=wins(20);profile.sessions.classic=createSession('classic',3);profile.sessions.classic.turns=2;
 const html=render(profile);
 assert.match(html,/Köz Vadisi · Bölüm 3/);
 assert.match(html,/Maceraya devam et/);
 assert.match(html,/Bölüm 21, [^\"]*sıradaki bölüm/);
});
