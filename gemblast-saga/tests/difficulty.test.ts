import test from 'node:test';
import assert from 'node:assert/strict';
import { STAGES, LEGACY_STAGES } from '../src/types/game';
import { createSession,commitMove,shuffleSession,stageFor,parseProfile,recordSession,defaultProfile,restartSession } from '../src/utils/session';
import witnesses from './fixtures/campaign-witnesses.json';
import type { Coord } from '../src/utils/boardEngine';

test('every non-tutorial stage has a real unassisted winning route on its witnessed starting seed',()=>{
  assert.equal(witnesses.length,STAGES.length-5);
  for(const witness of witnesses){
    let session=createSession('classic',witness.stageId,new Date('2026-10-08T12:00:00Z'),{seed:witness.seed,teachingLayout:false});
    for(const action of witness.actions){
      assert.equal(session.outcome,'playing',`stage ${witness.stageId}: trace continued after completion`);
      if('shuffle' in action)session=shuffleSession(session);
      else {
        const move=commitMove(session,action.path as Coord[],action.loop);
        assert.ok(move,`stage ${witness.stageId}: invalid path`);session=move.next;
      }
    }
    assert.equal(session.outcome,'won',`stage ${witness.stageId}: no unassisted win`);
    assert.equal(session.rewardedContinueUsed,undefined);
  }
});
test('an existing attempt keeps its original goals and stars; retry adopts the new difficulty',()=>{
  const legacy=createSession('classic',30);delete legacy.campaignVersion;
  legacy.movesLeft=LEGACY_STAGES[29].moves;
  const profile=recordSession(defaultProfile(),legacy);profile.stages['1']={stars:3,best:1000};
  const loaded=parseProfile(JSON.stringify(profile));
  assert.equal(stageFor(loaded.sessions.classic!).moves,LEGACY_STAGES[29].moves);
  assert.equal(stageFor(loaded.sessions.classic!).targetScore,LEGACY_STAGES[29].targetScore);
  assert.deepEqual(loaded.stages['1'],profile.stages['1']);
  const retry=restartSession(loaded.sessions.classic!,42);
  assert.equal(retry.campaignVersion,2);assert.equal(stageFor(retry).moves,STAGES[29].moves);
  assert.equal(stageFor(parseProfile(JSON.stringify(recordSession(profile,retry))).sessions.classic!).targetScore,STAGES[29].targetScore);
});
test('teaching encounters and the daily competition retain their original rules',()=>{
  for(let i=0;i<5;i++)assert.deepEqual(STAGES[i],LEGACY_STAGES[i]);
  const daily=createSession('daily',1,new Date('2026-10-08T12:00:00Z'));
  assert.equal(daily.campaignVersion,undefined);assert.equal(daily.movesLeft,24);assert.equal(stageFor(daily).targetScore,1100);
});
