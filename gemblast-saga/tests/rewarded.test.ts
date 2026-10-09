import test from 'node:test';
import assert from 'node:assert/strict';
import { watchRewarded, type RewardPort } from '../src/utils/rewardedFlow';
import { applyRewardContinue, canRewardContinue, createSession, defaultProfile, parseProfile, recordSession, restartSession, starsFor } from '../src/utils/session';
import { weeklyBest } from '../src/utils/gameCenter';

function fakeAd(play: (fire: (event: string) => void) => Promise<{amount:number}>, load: () => Promise<unknown> = async()=>{}) {
  const listeners=new Map<string,()=>void>();
  let removed=0;
  const port: RewardPort={load,show:()=>play(event=>listeners.get(event)?.()),listen:async(event,callback)=>{
    listeners.set(event,callback); return {remove:async()=>{listeners.delete(event);removed++;}};
  }};
  return {port,removed:()=>removed};
}
test('early dismissal never gives a reward even if native promise remains pending',async()=>{
  let granted=0;
  const ad=fakeAd(async fire=>{fire('dismissed');return new Promise(()=>{});});
  assert.equal(await watchRewarded(ad.port,()=>granted++),false);
  assert.equal(granted,0);assert.equal(ad.removed(),3);
});
test('reward event, duplicate event and reward result grant exactly once',async()=>{
  let granted=0;
  const ad=fakeAd(async fire=>{fire('earned');fire('earned');fire('dismissed');return {amount:1};});
  assert.equal(await watchRewarded(ad.port,()=>granted++),true);
  assert.equal(granted,1);assert.equal(ad.removed(),3);
});
test('failed presentation restores controls without a reward',async()=>{
  let granted=0;
  const ad=fakeAd(async fire=>{fire('failed');return new Promise(()=>{});});
  await assert.rejects(watchRewarded(ad.port,()=>granted++));
  assert.equal(granted,0);assert.equal(ad.removed(),3);
});
test('loading timeout does not show or reward a late-loading ad',async()=>{
  let shown=0;
  const ad=fakeAd(async()=>{shown++;return {amount:1};},()=>new Promise(()=>{}));
  await assert.rejects(watchRewarded(ad.port,()=>{},5));assert.equal(shown,0);
});
test('SDK rejection and fullscreen timeout clean up listeners',async()=>{
  for (const play of [async()=>{throw new Error('SDK failed');},()=>new Promise<{amount:number}>(()=>{})]) {
    const ad=fakeAd(play);await assert.rejects(watchRewarded(ad.port,()=>{},100,5));assert.equal(ad.removed(),3);
  }
});
test('continue is persisted, once per classic attempt, keeps the board, and caps stars',()=>{
  const lost={...createSession('classic'),movesLeft:0,outcome:'lost' as const};
  const next=applyRewardContinue(lost);
  assert.equal(next.movesLeft,5);assert.equal(next.outcome,'playing');assert.equal(next.grid,lost.grid);
  assert.equal(canRewardContinue({...next,movesLeft:0,outcome:'lost'}),false);
  assert.equal(starsFor({...next,outcome:'won'}),1);
  const restored=parseProfile(JSON.stringify(recordSession(defaultProfile(),next))).sessions.classic!;
  assert.equal(restored.rewardedContinueUsed,true);
  assert.equal(restartSession(next).rewardedContinueUsed,undefined);
});
test('daily and zen cannot receive rewarded moves',()=>{
  for(const mode of ['daily','zen'] as const) {
    const lost={...createSession(mode),movesLeft:0,outcome:'lost' as const};
    assert.equal(applyRewardContinue(lost),lost);
  }
});
test('unfinished classic attempts and wins cannot earn continues',()=>{
  const session=createSession('classic');assert.equal(applyRewardContinue(session),session);
  const won={...session,outcome:'won' as const,movesLeft:0};assert.equal(applyRewardContinue(won),won);
});
test('a completed lost daily result is recorded; unfinished results are not',()=>{
  const session=createSession('daily',1,new Date('2026-10-08T12:00:00Z'));
  assert.equal(recordSession(defaultProfile(),{...session,score:100}).dailyBest['2026-10-08'],undefined);
  assert.equal(recordSession(defaultProfile(),{...session,outcome:'lost',score:100}).dailyBest['2026-10-08'],100);
});
test('weekly total excludes the previous week and future days across year boundaries',()=>{
  assert.equal(weeklyBest({'2025-12-28':1000,'2025-12-29':200,'2026-01-01':300,'2026-01-03':999},'2026-01-01'),500);
});
