import test from 'node:test';
import assert from 'node:assert/strict';
import { createSession, defaultProfile, parseProfile, recordSession, type Profile } from '../src/utils/session';
import { achievementBoard, buyBooster, claimAchievement, claimLogin, claimMission, emptyMeta, loginStatus, metaOf, missionBoard, missionsFor, openChest,
  parseMeta, pendingRewards, settleFinish, spendBooster, STARS_PER_CHEST, syncChests, trackEvents } from '../src/utils/meta';

const won = (stageId: number, movesLeft: number) => ({ ...createSession('classic', stageId), outcome: 'won' as const, movesLeft, score: 9999 });

test('Old saves without meta start with a starter wallet; damaged meta fields fall back safely', () => {
  const old = defaultProfile(); delete old.meta;
  const loaded = parseProfile(JSON.stringify(old));
  assert.equal(metaOf(loaded).shards, 100);
  const meta = parseMeta({ shards: -5, boosters: { hammer: 3, prism: 'x' }, chests: ['star', 'bogus'], achievements: ['stage1', 'nope'], login: { streak: 4, claimedDay: 'bad' } });
  assert.equal(meta.shards, 100); assert.equal(meta.boosters.hammer, 3); assert.equal(meta.boosters.prism, 1);
  assert.deepEqual(meta.chests, ['star']); assert.deepEqual(meta.achievements, ['stage1']); assert.equal(meta.login.claimedDay, null);
  const round = parseProfile(JSON.stringify({ ...loaded, meta: { ...metaOf(loaded), shards: 777 } }));
  assert.equal(metaOf(round).shards, 777);
});

test('Check-in calendar advances on consecutive days, resets after a gap, and pays a chest on day 7', () => {
  let profile: Profile = defaultProfile();
  const days = ['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05', '2026-10-06', '2026-10-07'];
  for (const day of days) { const result = claimLogin(profile, day)!; assert.ok(result); profile = result.profile; assert.equal(claimLogin(profile, day), null); }
  assert.equal(metaOf(profile).login.streak, 7);
  assert.deepEqual(metaOf(profile).chests, ['streak']);
  assert.equal(loginStatus(metaOf(profile), '2026-10-08').index, 0); // a new week begins
  const gap = loginStatus(metaOf(profile), '2026-10-10');
  assert.ok(gap.broken && gap.index === 0 && gap.streak === 0);
});

test('Daily missions are stable per day, track events, pay once, and award a chest when all three are claimed', () => {
  assert.deepEqual(missionsFor('2026-10-09'), missionsFor('2026-10-09'));
  assert.equal(new Set(missionsFor('2026-10-09').map(m => m.id)).size, 3);
  let profile = defaultProfile();
  const today = '2026-10-09', list = missionsFor(today);
  let meta = metaOf(profile);
  for (const m of list) meta = trackEvents(meta, { [m.event]: m.target + 5 }, today);
  profile = { ...profile, meta };
  assert.equal(missionBoard(meta, today).claimable, 3);
  const before = metaOf(profile).shards;
  for (const m of list) profile = claimMission(profile, m.id, today);
  assert.equal(metaOf(profile).shards, before + list.reduce((n, m) => n + m.reward, 0));
  assert.deepEqual(metaOf(profile).chests, ['mission']);
  assert.equal(claimMission(profile, list[0].id, today), profile);
  assert.equal(missionBoard(metaOf(profile), '2026-10-10').claimable, 0); // a new day starts fresh
});

test('Finishing pays first clears and new stars, builds and breaks the win streak, and queues star chests', () => {
  let profile = defaultProfile();
  for (let id = 1; id <= 4; id++) {
    const session = won(id, 99);
    const after = recordSession(profile, session);
    const { profile: next, summary } = settleFinish(profile, after, session, '2026-10-09');
    assert.ok(summary.firstClear); assert.equal(summary.starsGained, 3); assert.equal(summary.shards, 55);
    profile = next;
  }
  assert.equal(metaOf(profile).winStreak, 4);
  assert.deepEqual(metaOf(profile).chests, ['star']); // 12 stars
  const replay = won(1, 99), again = settleFinish(profile, recordSession(profile, replay), replay, '2026-10-09');
  assert.equal(again.summary.shards, 5);
  const lost = { ...createSession('classic', 5), outcome: 'lost' as const };
  assert.equal(metaOf(settleFinish(profile, recordSession(profile, lost), lost).profile).winStreak, 0);
  assert.equal(syncChests(profile), profile); // already granted, never twice
  assert.equal(STARS_PER_CHEST, 12);
});

test('Chests open in order with varied loot; shop and booster spending respect the wallet', () => {
  let profile: Profile = { ...defaultProfile(), meta: { ...emptyMeta(), shards: 0, chests: ['star', 'realm'] } };
  const first = openChest(profile)!; assert.equal(first.kind, 'star'); assert.ok(first.loot.shards > 0);
  const second = openChest(first.profile)!; assert.equal(second.kind, 'realm'); assert.ok(second.loot.shards > first.loot.shards);
  assert.equal(openChest(second.profile), null);
  profile = second.profile;
  assert.equal(buyBooster({ ...profile, meta: { ...metaOf(profile), shards: 10 } }, 'prism'), null);
  const bought = buyBooster({ ...profile, meta: { ...metaOf(profile), shards: 500 } }, 'hammer')!;
  assert.equal(metaOf(bought).shards, 440);
  let spent: Profile | null = { ...defaultProfile(), meta: { ...emptyMeta(), boosters: { hammer: 1, prism: 0, moves: 0 } } };
  spent = spendBooster(spent, 'hammer'); assert.ok(spent); assert.equal(spendBooster(spent!, 'hammer'), null);
});

test('Achievements become claimable once and the rewards badge counts everything waiting', () => {
  let profile = recordSession(defaultProfile(), won(1, 99));
  const entry = achievementBoard(profile).find(a => a.id === 'stage1')!;
  assert.ok(entry.done && !entry.claimed);
  const before = metaOf(profile).shards;
  profile = claimAchievement(profile, 'stage1');
  assert.equal(metaOf(profile).shards, before + entry.reward);
  assert.equal(claimAchievement(profile, 'stage1'), profile);
  assert.equal(pendingRewards(profile, '2026-10-09'), 1); // only today's check-in remains
});
