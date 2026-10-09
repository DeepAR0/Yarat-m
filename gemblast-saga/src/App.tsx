/** @license SPDX-License-Identifier: Apache-2.0 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, ChevronRight, Diamond, Gift, Hand, MousePointer2, MoreHorizontal, Lightbulb, Map, Settings as SettingsIcon, Shuffle, Star, Trophy, X } from 'lucide-react';
import { CellData, GameMode, PRISM_DEFINITIONS, STAGES } from './types/game';
import { areNeighbors, Coord, previewClear, isValidPath } from './utils/boardEngine';
import { commitMove, createSession, defaultProfile, nextUnlocked, parseProfile, Profile, recordSession, Session, restartSession, sessionToOpen, shuffleSession, stageFor, starsFor } from './utils/session';
import { haptic, listenToAppState, nativeStartup, readSave, shareScore, writeSave } from './utils/native';
import { sound } from './utils/sound';
import { PrismGemArtwork } from './components/PrismGemArtwork';
import { JourneyMap } from './components/JourneyMap';
import { FlowIndicator } from './components/FlowIndicator';
import { Dialog } from './components/Dialog';
import { EraseDialog, GuideDialog, MoreDialog, PrivacyDialog, RestartDialog } from './components/GameDialogs';
import { GameHud } from './components/GameHud';
import { ResultDialog } from './components/ResultDialog';
import { CollectionPage } from './pages/CollectionPage';
import { SettingsPage } from './pages/SettingsPage';
import { format, modeLabel } from './utils/format';
import { findBestHint } from './utils/hint';
import { BOOSTERS, buyBooster, metaOf, pendingRewards, settleFinish, spendBooster, trackMove, type BoosterKind, type ChestKind, type FinishSummary, type Loot, claimLogin, claimMission, claimAchievement, openChest, describeLoot } from './utils/meta';
import { ChestDialog } from './components/ChestDialog';
import { localDateKey } from './types/game';
import { BoosterBar } from './components/BoosterBar';
import { RewardsPage } from './pages/RewardsPage';
import { GemBurst, GemEffects } from './components/GemEffects';
import { ChainEnergy } from './components/ChainEnergy';
import { GemFalls, MoveTimeline, planGemFalls } from './utils/movePresentation';
import { StoryPlayer } from './components/StoryPlayer';
import { resultRecord, type StoryRecord } from './utils/storyPresentation';
import { mysteryProgress } from './utils/mystery';
import { chainEnergy } from './utils/chainEnergy';
import { findLessonPath, Lesson } from './utils/lesson';
import { LessonCoach, LessonRoute } from './components/LessonCoach';
import { League } from './components/League';
import { leagueDay } from './utils/competition';
import { canRewardContinue, applyRewardContinue, applyBooster, applyStreakBonus, canUseBooster } from './utils/session';
import { adPrivacyRequired, prepareAdConsent, rewardedAdsAvailable, showAdPrivacy, watchContinueAd } from './utils/ads';

type Page = 'journey' | 'rewards' | 'collection' | 'settings' | 'league' | 'game';
type Overlay = 'guide' | 'more' | 'restart' | 'erase' | 'privacy' | 'story' | 'chest' | null;
type Presentation = { id: number; phase: 'clearing' | 'falling'; grid: CellData[][]; cleared: Set<string>; falls: GemFalls; step: { x: number; y: number } };
/** The record a finished attempt competes against, read before the attempt is recorded. */
const bestBefore = (profile: Profile, session: Session) => session.mode === 'classic' ? profile.stages[session.stageId]?.best ?? 0 :
  session.mode === 'daily' && session.dailyKey ? profile.dailyBest[session.dailyKey] ?? 0 : null;
const tabs = [{ id: 'journey', label: 'Macera', icon: Map }, { id: 'rewards', label: 'Ödüller', icon: Gift }, { id: 'league', label: 'Lig', icon: Trophy }, { id: 'collection', label: 'Koleksiyon', icon: Diamond }, { id: 'settings', label: 'Ayarlar', icon: SettingsIcon }] as const;

export default function App() {
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [ready, setReady] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [adBusy, setAdBusy] = useState(false);
  const [adNotice, setAdNotice] = useState('');
  const [privacyOptions, setPrivacyOptions] = useState(false);
  const [page, setPage] = useState<Page>(() => typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('league') === '1' ? 'league' : 'journey');
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [storyToPlay,setStoryToPlay] = useState<StoryRecord|null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [previousBest, setPreviousBest] = useState<number | null>(null);
  const [reward, setReward] = useState<FinishSummary | null>(null);
  const [aiming, setAiming] = useState<BoosterKind | null>(null);
  const [chestLoot, setChestLoot] = useState<{ kind: ChestKind; loot: Loot } | null>(null);
  const [path, setPath] = useState<Coord[]>([]);
  const [loop, setLoop] = useState(false);
  const [hint, setHint] = useState<Coord[]>([]);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const lessonRef = useRef(lesson); lessonRef.current = lesson;
  const [milestone, setMilestone] = useState<{ id: number; label: string; color: string; loop: boolean } | null>(null);
  const reachedPower = useRef(0);
  const [tapMode, setTapMode] = useState(false);
  const [feedback, setFeedback] = useState('Aynı renkte 3 taşı bağla. Halkayla tüm rengi temizle.');
  const [burst, setBurst] = useState<GemBurst | null>(null);
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [timeline] = useState(() => new MoveTimeline());
  const [systemReducedMotion, setSystemReducedMotion] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const effectId = useRef(0);
  const profileRef = useRef(profile);
  profileRef.current = profile;
  const session = profile.sessions[profile.lastMode];
  const sessionRef = useRef(session);
  sessionRef.current = session;
  const pathRef = useRef<Coord[]>([]);
  const loopRef = useRef(false);
  const pointerRef = useRef<number | null>(null);
  const resolvingRef = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const storageReadable = useRef(true);
  const boardRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const lastPage = useRef(page);

  const clearPath = useCallback(() => {
    pathRef.current = []; loopRef.current = false; pointerRef.current = null; reachedPower.current = 0;
    setMilestone(null);
    setPath([]); setLoop(false);
  }, []);
  const finishLesson = useCallback((kind: Lesson) => {
    setLesson(null);
    setProfile(p => ({ ...p, ...(kind === 'link' ? {tutorialSeen: true} : {loopTutorialSeen: true}) }));
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3600);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    if (!milestone) return;
    const timer = setTimeout(() => setMilestone(null), 850);
    return () => clearTimeout(timer);
  }, [milestone]);
  const persist = useCallback(async () => {
    if (!storageReadable.current) return;
    try { await writeSave(JSON.stringify(profileRef.current)); setSaveError(null); }
    catch { setSaveError('İlerleme kaydedilemedi. Cihaz depolamasını kontrol edip yeniden dene.'); }
  }, []);

  useEffect(() => {
    let alive = true;
    void (async () => {
      let loaded = defaultProfile();
      try { loaded = parseProfile(await readSave()); }
      catch { storageReadable.current = false; if (alive) setSaveError('Kayıt okunamadı. Mevcut kaydını korumak için yeni ilerleme henüz kaydedilmiyor. Yeniden dene.'); }
      if (!loaded.sessions[loaded.lastMode]) loaded = recordSession(loaded, createSession('classic', nextUnlocked(loaded)));
      if (alive) { setProfile(loaded); setReady(true); }
      await nativeStartup();
    })();
    return () => { alive = false; timeline.cancel(); };
  }, []);

  useEffect(() => {
    sound.setEnabled(profile.settings.sound);
    if (!ready || presentation) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => { void persist(); }, 180);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [profile, ready, persist, presentation]);

  useEffect(() => {
    if (!ready) return;
    const handleState = (active: boolean) => {
      if (!active) { clearPath(); timeline.finish(); sound.suspend(); void persist(); }
    };
    const visibility = () => handleState(!document.hidden);
    document.addEventListener('visibilitychange', visibility);
    let dispose: (() => void) | undefined, gone = false;
    void listenToAppState(handleState).then(fn => { if (gone) fn(); else dispose = fn; }).catch(() => {});
    return () => { gone = true; dispose?.(); document.removeEventListener('visibilitychange', visibility); };
  }, [ready, persist, clearPath, timeline]);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setSystemReducedMotion(query.matches);
    query.addEventListener('change', change);
    return () => query.removeEventListener('change', change);
  }, []);
  useEffect(() => {
    if (profile.settings.reducedMotion || systemReducedMotion || overlay) timeline.finish();
  }, [profile.settings.reducedMotion, systemReducedMotion, overlay, timeline]);

  useEffect(() => {
    document.title = `${page === 'game' && session ? modeLabel[session.mode] : tabs.find(t => t.id === page)?.label ?? 'Macera'} · Gemblast Saga`;
    if (lastPage.current !== page) { mainRef.current?.focus(); window.scrollTo({ top: 0 }); lastPage.current = page; }
  }, [page, session?.mode]);

  const updateSession = (next: Session) => {
    sessionRef.current = next;
    setProfile(previous => recordSession(previous, next));
  };
  useEffect(() => {
    if (!ready || !rewardedAdsAvailable()) return;
    let alive = true;
    void prepareAdConsent().then(() => adPrivacyRequired()).then(required => { if (alive) setPrivacyOptions(required); }).catch(() => {});
    return () => { alive = false; };
  }, [ready]);

  async function continueWithAd() {
    const attempt = sessionRef.current;
    if (adBusy || !attempt || !canRewardContinue(attempt) || !storageReadable.current) return;
    setAdBusy(true); setAdNotice(''); sound.suspend();
    try {
      // Preserve the lost attempt before leaving for a full-screen native ad.
      await writeSave(JSON.stringify(profileRef.current));
      const earned = await watchContinueAd(() => {
        if (sessionRef.current !== attempt) return;
        const next = applyRewardContinue(attempt);
        sessionRef.current = next;
        const updated = recordSession(profileRef.current, next);
        profileRef.current = updated;
        setProfile(updated);
        void writeSave(JSON.stringify(updated)).catch(() => setSaveError('Reklam ödülü kaydedilemedi. Cihaz depolamasını kontrol et.'));
        setFeedback('+5 hamle kazandın. Hedeflerini tamamla!');
      }, !profileRef.current.settings.sound);
      if (!earned) setAdNotice('Reklam tamamlanmadığı için ödül verilmedi. Yeniden deneyebilirsin.');
    } catch (error) { setAdNotice(error instanceof Error ? error.message : 'Reklam yüklenemedi. Yeniden deneyebilirsin.'); }
    finally { setAdBusy(false); setPrivacyOptions(await adPrivacyRequired()); }
  }

  /** Records a new session state; settles rewards, missions and streaks the moment an attempt ends. */
  const advance = useCallback((current: Session, next: Session, track?: (profile: Profile) => Profile) => {
    const before = profileRef.current;
    let after = recordSession(before, next);
    if (track) after = track(after);
    if (current.outcome === 'playing' && next.outcome !== 'playing') {
      setPreviousBest(bestBefore(before, current));
      const settled = settleFinish(before, after, next);
      after = settled.profile; setReward(settled.summary);
    }
    sessionRef.current = next; profileRef.current = after;
    setProfile(after);
  }, []);

  /** Clearing burst, then falling stones, with the board locked until the stones land. */
  const animate = useCallback((current: Session, next: Session, cleared: Coord[], anchor: Coord, burst: Omit<GemBurst, 'id' | 'gems'>, slow: boolean) => {
    resolvingRef.current = true;
    const drops = planGemFalls(current.grid, next.grid, anchor);
    const firstRect = boardRef.current?.querySelector('[data-cell-coord="0,0"]')?.getBoundingClientRect();
    const columnRect = boardRef.current?.querySelector('[data-cell-coord="0,1"]')?.getBoundingClientRect();
    const rowRect = boardRef.current?.querySelector('[data-cell-coord="1,0"]')?.getBoundingClientRect();
    const step = { x: firstRect && columnRect ? columnRect.left - firstRect.left : 50, y: firstRect && rowRect ? rowRect.top - firstRect.top : 50 };
    const id = ++effectId.current;
    const nextBurst: GemBurst = { ...burst, id, gems: cleared.map(coord => ({ coord, cell: current.grid[coord[0]][coord[1]] })) };
    if (saveTimer.current) { clearTimeout(saveTimer.current); saveTimer.current = null; }
    const base = { id, cleared: new Set(cleared.map(([r,c]) => `${r},${c}`)), falls: drops, step };
    timeline.start(id, drops, slow ? 180 : 140, profileRef.current.settings.reducedMotion || systemReducedMotion, {
      clearing: () => { setPresentation({ ...base, phase: 'clearing', grid: current.grid }); setBurst(nextBurst); },
      falling: () => setPresentation({ ...base, phase: 'falling', grid: next.grid }),
      settled: () => { resolvingRef.current = false; setPresentation(null); setBurst(null); },
    });
    if (next.outcome === 'won') { sound.playVictory(); void haptic('win', profileRef.current.settings.haptics); }
    else if (next.outcome === 'lost') sound.playGameOver();
  }, [timeline, systemReducedMotion]);

  const commit = useCallback(() => {
    const current = sessionRef.current;
    if (!current || resolvingRef.current) return;
    const chainSize = pathRef.current.length, wasLoop = loopRef.current;
    const drawnPath = [...pathRef.current];
    const firstCoord = pathRef.current[0], lastCoord = pathRef.current[chainSize - (wasLoop ? 2 : 1)];
    const move = commitMove(current, pathRef.current, wasLoop);
    clearPath();
    if (!move) return;
    const learning = lessonRef.current;
    if (learning === 'link' || learning === 'loop' && wasLoop) finishLesson(learning);
    const uniqueLength = chainSize - Number(wasLoop);
    advance(current, move.next, profile => trackMove(profile, move.result, uniqueLength, wasLoop));
    setHint([]);
    const color = PRISM_DEFINITIONS[current.grid[firstCoord[0]][firstCoord[1]].color].secondaryHex;
    animate(current, move.next, move.result.clearedCoords, lastCoord, { points: move.earned, loop: wasLoop, chainLength: uniqueLength, path: drawnPath, color,
      label: wasLoop ? 'RENK DALGASI!' : move.result.triggeredSpecialsCount > 1 ? 'ZİNCİR TEPKİSİ!' : uniqueLength >= 9 ? 'TAM GÜÇ!' : move.result.triggeredSpecialsCount ? 'ENERJİ DALGASI!' : uniqueLength >= 6 ? 'NOVA UYANDI!' : uniqueLength >= 4 ? 'GÜÇLÜ AKIŞ!' : 'ENERJİ TOPLANDI' },
      wasLoop || move.result.triggeredSpecialsCount > 0);
    const special = move.result.spawnedPower;
    setFeedback(move.next.outcome === 'won' ? 'Harika! Tüm hedefler tamamlandı.' : special === 'nova_3x3' ? '3× rezonans çekirdeği oluştu. Yeni bir zincire ekle!' : special !== 'none' ? 'Işık kanalı oluştu. Bir sonraki zincire ekle!' : `+${format(move.earned)} puan · ${move.result.clearedCount} taş temizlendi${move.result.unlockedCount ? ` · ${move.result.unlockedCount} mühür açıldı` : ''}`);
    if (move.next.outcome === 'playing') { sound.playChainRelease(uniqueLength, wasLoop); void haptic('match', profileRef.current.settings.haptics); }
  }, [clearPath, finishLesson, advance, animate]);

  /** Spends (or buys, then spends) a booster. Hammer and prism wait for a target stone. */
  const fireBooster = useCallback((kind: BoosterKind, target?: Coord) => {
    const current = sessionRef.current;
    if (!current || resolvingRef.current || !canUseBooster(current, kind)) return;
    if (kind !== 'moves' && !target) { clearPath(); setAiming(aim => aim === kind ? null : kind); return; }
    setAiming(null);
    const wallet = profileRef.current;
    const funded = metaOf(wallet).boosters[kind] > 0 ? wallet : buyBooster(wallet, kind);
    if (!funded) { setToast(`${BOOSTERS[kind].name} için ${BOOSTERS[kind].price} kristal gerekiyor. Görevler ve sandıklarla kristal kazan.`); return; }
    const spent = spendBooster(funded, kind)!;
    const used = applyBooster(current, kind, target);
    if (!used) return;
    profileRef.current = spent;
    advance(current, used.next);
    sound.playBoosterBlast(); void haptic('match', profileRef.current.settings.haptics);
    if (!used.result) { setFeedback('+3 hamle eklendi. Hedeflerine odaklan!'); return; }
    const color = PRISM_DEFINITIONS[current.grid[target![0]][target![1]].color].secondaryHex;
    animate(current, used.next, used.result.clearedCoords, target!, { points: used.earned, loop: kind === 'prism', chainLength: used.result.clearedCount, path: [target!], color,
      label: kind === 'prism' ? 'PRİZMA!' : 'ÇEKİÇ!' }, kind === 'prism');
    setHint([]);
    setFeedback(`${BOOSTERS[kind].name}: ${used.result.clearedCount} taş temizlendi · +${format(used.earned)} puan`);
  }, [advance, animate, clearPath]);

  const extendPath = useCallback((r: number, c: number) => {
    const current = sessionRef.current, active = pathRef.current;
    if (!current || resolvingRef.current || current.outcome !== 'playing') return;
    const cell = current.grid[r]?.[c];
    if (!cell || cell.locked) return;
    if (!active.length) {
      pathRef.current = [[r, c]]; setPath([[r, c]]); sound.playSelect();
      void haptic('select', profileRef.current.settings.haptics); return;
    }
    const first = active[0], last = active.at(-1)!;
    if (current.grid[first[0]][first[1]].color !== cell.color || (r === last[0] && c === last[1])) return;
    if (!areNeighbors(...last, r, c)) return;
    if (active.length > 1 && r === active.at(-2)![0] && c === active.at(-2)![1]) {
      pathRef.current = active.slice(0, -1); loopRef.current = false; setLoop(false); setPath(pathRef.current); return;
    }
    if (loopRef.current) return;
    const existing = active.findIndex(([pr, pc]) => pr === r && pc === c);
    if (existing !== -1) {
      if (existing !== 0 || active.length < 4) return;
      if (!isValidPath(current.grid, [...active, [r, c]], true)) { setToast('Çizgiler kesişmeden bir halka oluştur.'); return; }
      loopRef.current = true; setLoop(true);
    } else {
      sound.playSelect(active.length);

    }
    pathRef.current = [...active, [r, c]]; setPath(pathRef.current);
    const size = pathRef.current.length - Number(loopRef.current);
    const rank = loopRef.current ? 10 : size >= 9 ? 9 : size >= 6 ? 6 : size >= 5 ? 5 : size >= 4 ? 4 : 0;
    if (rank > reachedPower.current) {
      reachedPower.current = rank;
      const label = rank === 10 ? 'Renk dalgası hazır!' : rank === 9 ? 'Tam güç!' : rank === 6 ? '3× Nova hazır!' : rank === 5 ? '2× kanal hazır!' : 'Işık kanalı hazır!';
      setMilestone({id: ++effectId.current, label, color: PRISM_DEFINITIONS[cell.color].secondaryHex, loop: loopRef.current});
      sound.playCharge(rank);
      void haptic('select', profileRef.current.settings.haptics);
    }
  }, []);

  useEffect(() => {
    const up = (event: PointerEvent) => { if (pointerRef.current === event.pointerId) commit(); };
    const cancel = (event: PointerEvent) => { if (pointerRef.current === event.pointerId) clearPath(); };
    const blur = () => clearPath();
    window.addEventListener('pointerup', up); window.addEventListener('pointercancel', cancel); window.addEventListener('blur', blur);
    return () => { window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', cancel); window.removeEventListener('blur', blur); };
  }, [commit, clearPath]);

  function openGame(mode: GameMode, stageId?: number, day?: string) {
    setAdNotice('');
    timeline.cancel(); setPresentation(null); resolvingRef.current = false;
    clearPath(); setHint([]); setBurst(null); setFeedback('Aynı renkte 3 taşı bağla. Halkayla tüm rengi temizle.');
    const opened = sessionToOpen(profile, mode, stageId, mode === 'daily' ? new Date(`${day ?? leagueDay()}T12:00:00`) : new Date());
    const next = applyStreakBonus(opened, metaOf(profile).winStreak);
    if (next.streakBonus && next !== opened) setToast(`Alev serisi ${metaOf(profile).winStreak}: tahtada hazır güç taşları seni bekliyor!`);
    setReward(null); setAiming(null);
    updateSession(next); setPage('game');
    setOverlay(null);
    setLesson(!profile.tutorialSeen ? 'link' : mode === 'classic' && next.stageId === 4 && !profile.loopTutorialSeen && next.loopsMade === 0 ? 'loop' : null);
  }

  function goPage(target: Page) { timeline.finish(); clearPath(); setAiming(null); setOverlay(null); setLesson(null); setPage(target); }
  function restart() {
    setAdNotice('');
    if (!session) return;
    timeline.cancel(); setPresentation(null);
    clearPath(); resolvingRef.current = false; setBurst(null); setHint([]); setAiming(null); setReward(null);
    const quitting = session.mode === 'classic' && session.outcome === 'playing' && session.turns > 0;
    const base = quitting ? { ...profile, meta: { ...metaOf(profile), winStreak: 0 } } : profile;
    const next = applyStreakBonus(restartSession(session), metaOf(base).winStreak);
    sessionRef.current = next; setProfile(recordSession(base, next));
    setOverlay(null); setFeedback(session.mode === 'daily' ? 'Aynı günlük bulmaca. Yeni bir yol dene!' : 'Yeni taş dizilimi. Çekirdekleri bağla!');
  }
  async function share() {
    if (!session) return;
    try {
      const result = await shareScore(`Gemblast Saga ✦\n${modeLabel[session.mode]}${session.mode === 'classic' ? ` · Bölüm ${session.stageId}` : session.dailyKey ? ` · ${session.dailyKey}` : ''}\n${format(session.score)} puan${session.mode === 'zen' ? '' : ` · ${session.movesLeft} hamle kaldı`}\n${session.outcome === 'won' ? '⭐'.repeat(starsFor(session)) : '✦ Enerjiyi çiz, dünyayı uyandır.'}`);
      if (result === 'copied') setToast('Skor panoya kopyalandı.');
    } catch { setToast('Skor paylaşılamadı. Lütfen yeniden dene.'); }
  }

  async function retryStorage() {
    if (storageReadable.current) { await persist(); return; }
    try {
      let loaded = parseProfile(await readSave());
      if (!loaded.sessions[loaded.lastMode]) loaded = recordSession(loaded, createSession('classic', nextUnlocked(loaded)));
      storageReadable.current = true; timeline.finish(); clearPath(); setProfile(loaded); setSaveError(null); setPage('journey');
      setToast('Cihazındaki kayıt yeniden açıldı.');
    } catch { setSaveError('Kayıt hâlâ okunamıyor. Cihaz depolamasını kontrol edip yeniden dene.'); }
  }

  const playStory = (record:StoryRecord) => { setStoryToPlay(record); setOverlay('story'); };
  const unlocked = nextUnlocked(profile);
  const totalStars = Object.values(profile.stages).reduce((sum, entry) => sum + entry.stars, 0);
  const mystery = mysteryProgress(profile);
  const today = leagueDay();
  const localToday = localDateKey();
  const pending = pendingRewards(profile, localToday);
  const dailyFound = (profile.mysteryDays ?? profile.dailyWins).includes(today);
  const discoveryScene = session ? resultRecord(profile,session) : undefined;
  const currentStage = session ? stageFor(session) : STAGES[0];
  const lessonPath = useMemo(() => lesson && session ? findLessonPath(session.grid, lesson) : [], [lesson, session?.grid]);
  const activeColor = path.length && session ? PRISM_DEFINITIONS[session.grid[path[0][0]][path[0][1]].color] : null;
  const gameLocked = session?.outcome !== 'playing' || !!presentation;
  const displayGrid = presentation?.grid ?? session?.grid;
  const reducedMotion = profile.settings.reducedMotion || systemReducedMotion;
  const clearPreview = session ? previewClear(session.grid, path, loop) : { clearedCoords: [], triggeredSpecialsCount: 0 };
  const affected = new Set(clearPreview.clearedCoords.map(([r,c]) => `${r},${c}`));
  const chainCount = loop ? path.length - 1 : path.length;
  const energy = chainEnergy(chainCount, loop);
  const currentPower = loop || chainCount >= 6 ? '3× Nova' : chainCount === 5 ? '2× kanal' : chainCount === 4 ? 'Işık kanalı' : null;


  if (!ready || !session) return <div className="loading-screen"><Diamond size={44} /><h1>Gemblast Saga</h1><p role="status">Çekirdekler uyanıyor…</p></div>;

  return <div data-realm={Math.min(5, Math.floor(((page === 'game' && session.mode === 'classic' ? session.stageId : unlocked) - 1) / 10))} className={`app ${page === 'game' ? 'is-playing' : ''} ${profile.settings.reducedMotion ? 'reduce-motion' : ''}`}>
    <a className="skip-link" href="#main">İçeriğe geç</a>
    <header className="app-header">
      <button className="brand" data-home onClick={() => goPage('journey')} aria-label="Gemblast Saga, ana ekran"><span className="brand-mark"><img src={PRISM_DEFINITIONS.coral.artwork} width="44" height="44" alt=""/></span><span>GEMBLAST<small>S A G A</small></span></button>
      <nav className="desktop-nav" aria-label="Ana gezinme">{tabs.map(tab => <button key={tab.id} onClick={() => goPage(tab.id)} aria-current={page === tab.id ? 'page' : undefined}>{tab.label}{tab.id === 'rewards' && pending > 0 && <span className="nav-badge" aria-label={`${pending} ödül bekliyor`}>{pending}</span>}</button>)}</nav>
      <div className="header-actions"><button className="shard-total" aria-label={`${metaOf(profile).shards} kristal, ödüller`} onClick={() => goPage('rewards')}><span aria-hidden="true">✦</span>{format(metaOf(profile).shards)}</button><span className="star-total"><Star size={16} fill="currentColor"/>{totalStars}</span><button className="icon-button" aria-label="Nasıl oynanır" onClick={() => setOverlay('guide')}><Lightbulb size={20}/></button></div>
    </header>
    {saveError && <div className="save-error" role="alert"><span>{saveError}</span><button onClick={() => { void retryStorage(); }}>Yeniden dene</button></div>}
    <main id="main" ref={mainRef} tabIndex={-1} className={`main page-${page}`}>
      {page === 'rewards' && <RewardsPage profile={profile} today={localToday}
        onCheckIn={() => { const result = claimLogin(profile, localToday); if (!result) return; setProfile(result.profile); sound.playVictory(); setToast(result.reward.chest ? 'Haftalık hazine sandıklarına eklendi!' : `Günlük ödül: ${result.reward.label}`); }}
        onMission={id => { setProfile(p => claimMission(p, id, localToday)); sound.playSpecialCreation(); }}
        onOpenChest={() => { const result = openChest(profile); if (!result) return; setProfile(result.profile); setChestLoot({ kind: result.kind, loot: result.loot }); setOverlay('chest'); sound.playVictory(); void haptic('win', profile.settings.haptics); }}
        onBuy={kind => { const bought = buyBooster(profile, kind); if (bought) { setProfile(bought); sound.playSpecialCreation(); setToast(`${BOOSTERS[kind].name} envanterine eklendi.`); } }}
        onAchievement={id => { setProfile(p => claimAchievement(p, id)); sound.playVictory(); }}/>}
      {page === 'journey' && pending > 0 && <button className="reward-banner" onClick={() => goPage('rewards')}><Gift size={22}/><span><strong>{pending} ödül seni bekliyor</strong><small>Günlük giriş, görevler ve sandıklar</small></span><ArrowRight size={18}/></button>}
      {page === 'league' && <League best={profile.dailyBest} daily={profile.sessions.daily} onPlay={day => openGame('daily', undefined, day)}/> }
      {page === 'journey' && <JourneyMap profile={profile} reducedMotion={reducedMotion} dailyFound={dailyFound} onPlay={id => openGame('classic', id)} onDaily={() => openGame('daily')} onZen={() => openGame('zen', 1)} onStory={playStory}/>}

      {page === 'collection' && <CollectionPage profile={profile} onStory={playStory} onGemStyle={gemStyle => setProfile(p => ({...p, gemStyle}))}/>}

      {page === 'settings' && <SettingsPage settings={profile.settings} privacyOptions={privacyOptions}
        onToggle={key => setProfile(p => ({ ...p, settings: { ...p.settings, [key]: !p.settings[key] } }))}
        onAdPrivacy={() => { void showAdPrivacy().then(() => adPrivacyRequired()).then(setPrivacyOptions).catch(() => setToast('Reklam gizlilik seçenekleri açılamadı. Bağlantını kontrol edip yeniden dene.')); }}
        onGuide={() => setOverlay('guide')} onPrivacy={() => setOverlay('privacy')} onErase={() => setOverlay('erase')}/>}

      {page === 'game' && <div className="game-layout">
        <section className="game-surface" aria-label="Oyun alanı">
          <GameHud session={session} stage={currentStage} gemStyle={profile.gemStyle} sound={profile.settings.sound} onBack={() => goPage('journey')}
            onToggleSound={() => setProfile(p => ({ ...p, settings: { ...p.settings, sound: !p.settings.sound } }))}/>
          <FlowIndicator count={chainCount} affected={affected.size} loop={loop} resolving={presentation?.phase} tapMode={tapMode} cue={milestone}/>
          {lesson && !presentation && <LessonCoach lesson={lesson} path={lessonPath} count={chainCount} loop={loop} tapMode={tapMode} onSkip={() => finishLesson(lesson)}/> }
          {!lesson && session.mode === 'classic' && currentStage.lesson && <details className="level-tip"><summary><Lightbulb size={14}/>Bölüm ipucu<ChevronRight size={14}/></summary><p>{currentStage.lesson}</p></details>}
          <div className="board-wrap"><div ref={boardRef} className={`board ${aiming ? `aiming aiming-${aiming}` : ''} ${loop ? 'looping' : ''} ${path.length ? `charging charge-${energy.tier}` : ''} ${presentation ? `resolving-${presentation.phase}` : ''}`} aria-busy={!!presentation} aria-label="6 satır, 6 sütun kristal tahtası"
            onPointerMove={event => {
              if (pointerRef.current !== event.pointerId) return;
              const element = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-cell-coord]');
              if (element && boardRef.current?.contains(element)) { const [r, c] = element.dataset.cellCoord!.split(',').map(Number); extendPath(r, c); }
            }} onKeyDown={event => {
              if (event.key === 'Escape') { event.preventDefault(); clearPath(); }
              const cell = (event.target as HTMLElement).closest<HTMLElement>('[data-cell-coord]');
              if (!cell || !['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;
              event.preventDefault(); const [r, c] = cell.dataset.cellCoord!.split(',').map(Number);
              const nr = Math.max(0, Math.min(5, r + (event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0)));
              const nc = Math.max(0, Math.min(5, c + (event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0)));
              boardRef.current?.querySelector<HTMLButtonElement>(`[data-cell-coord="${nr},${nc}"]`)?.focus();
            }}>
            {lesson && !presentation && <LessonRoute path={lessonPath}/>}
            {milestone && <span key={milestone.id} className="chain-accent" style={{'--accent-color': milestone.color} as React.CSSProperties}/>}
            {activeColor && path.length > 1 && <ChainEnergy path={path} color={activeColor.dotColor} loop={loop} reducedMotion={reducedMotion}/>}
            <div className="board-grid">{displayGrid!.map((row, r) => row.map((cell, c) => {
              const selected = path.some(([pr, pc]) => pr === r && pc === c), hintIndex = hint.findIndex(([pr, pc]) => pr === r && pc === c), hinted = hintIndex >= 0;
              const def = PRISM_DEFINITIONS[cell.color];
              const lessonIndex = lessonPath.findIndex(([lr,lc]) => lr === r && lc === c);
              const lessonNext = lessonIndex === (loop ? -1 : chainCount >= (lesson === 'loop' ? 4 : 3) ? 0 : chainCount);
              const fall = presentation?.phase === 'falling' ? presentation.falls[cell.id] : undefined;
              const clearing = presentation?.phase === 'clearing' && presentation.cleared.has(`${r},${c}`);
              const loopHighlight = !selected && affected.has(`${r},${c}`);
              return <button key={`${r},${c}`} data-cell-coord={`${r},${c}`} className={`gem-cell ${selected || loopHighlight ? 'selected' : ''} ${hinted ? 'hinted' : ''} ${cell.locked ? 'frozen' : ''} ${cell.armor ? 'shelled' : ''} ${lessonIndex >= 0 && lesson ? 'lesson-stone' : ''} ${lessonIndex >= 0 && lesson && lessonNext ? 'lesson-next' : ''}`} style={{ '--gem-color': def.hex, '--gem-light': def.secondaryHex } as React.CSSProperties}
                aria-label={`${lesson && lessonIndex >= 0 ? `Alıştırma ${lessonIndex + 1}, ` : hinted ? `İpucu ${hintIndex + 1}, ` : ''}${def.name}, ${def.symbol} simgesi, satır ${r + 1}, sütun ${c + 1}${cell.locked ? cell.armor ? ', kristal kabuklu mühür' : ', mühürlü' : ''}${cell.special !== 'none' ? cell.special === 'nova_3x3' ? ', rezonans çekirdeği' : ', ışık kanalı' : ''}${cell.multiplier > 1 ? `, ${cell.multiplier} kat puan` : ''}`} aria-pressed={selected} aria-disabled={cell.locked || gameLocked}
                onPointerDown={event => {
                  if (aiming) { if (event.button === 0 && !gameLocked && !cell.locked) { event.preventDefault(); fireBooster(aiming, [r, c]); } return; }
                  if (tapMode || event.button !== 0 || gameLocked || cell.locked || resolvingRef.current || pointerRef.current !== null) return;
                  event.preventDefault(); event.currentTarget.focus({ preventScroll: true }); clearPath(); pointerRef.current = event.pointerId; extendPath(r, c);
                }} onClick={event => { if (aiming) { if (event.detail === 0 && !gameLocked && !cell.locked) fireBooster(aiming, [r, c]); return; } if (!gameLocked && (tapMode || event.detail === 0)) { if (event.detail === 0) setTapMode(true); extendPath(r, c); } }}>
                <div key={cell.id} className={`gem-motion ${fall ? 'falling' : ''} ${clearing ? 'clearing' : ''}`} onAnimationEnd={event => {
                  if (event.target === event.currentTarget && event.animationName === 'gem-fall' && presentation) timeline.landed(presentation.id, cell.id);
                }} style={fall ? { '--drop-x': `${fall.x * presentation!.step.x}px`, '--drop-y': `${fall.y * presentation!.step.y}px`, '--fall-duration': `${fall.duration}ms`, '--fall-delay': `${fall.delay}ms`, '--fall-opacity': fall.fresh ? 0 : 1 } as React.CSSProperties : undefined}><PrismGemArtwork gemStyle={profile.gemStyle} cell={cell} isSelected={selected} isLoopHighlighted={loopHighlight} chargeTier={selected || loopHighlight ? energy.tier : 0} previewPower={chainCount >= 4 && r === path[loop ? path.length-2 : path.length-1]?.[0] && c === path[loop ? path.length-2 : path.length-1]?.[1] ? (loop || chainCount >= 6 ? 'nova' : 'channel') : undefined}/></div>
                {!lesson && hinted && !selected && hint.length > 3 && <span className="lesson-step hint-step" aria-hidden="true">{hintIndex + 1}{hintIndex === 0 && hint.length > 1 && hint[0][0] === hint.at(-1)![0] && hint[0][1] === hint.at(-1)![1] ? '↺' : ''}</span>}
                {lesson && lessonIndex >= 0 && <span className="lesson-step" aria-hidden="true">{lessonIndex + 1}{lesson === 'loop' && lessonIndex === 0 ? '↺' : ''}</span>}
                {selected && <span className="chain-number">{path.findIndex(([pr, pc]) => pr === r && pc === c) + 1}</span>}
              </button>;
            }))}</div>
            {burst && <GemEffects burst={burst}/>}
          </div></div>
          <div className="game-status-row"><div className="game-feedback" role="status" aria-live="polite">{presentation ? presentation.phase === 'clearing' ? 'Enerji yayılıyor…' : 'Çekirdekler yerleşiyor…' : path.length ? loop ? `${affected.size} taş dalgaya katılıyor · halka 2× puan` : chainCount < 3 ? `${chainCount} taş seçildi · en az 3 bağla` : `${affected.size} taş temizlenecek${currentPower ? ` · ${currentPower} oluşacak` : ''}` : feedback}</div>
          <button className="link-commit" disabled={gameLocked || chainCount < 3} onClick={commit}><Check size={16}/>Patlat</button></div>
          <BoosterBar session={session} meta={metaOf(profile)} aiming={aiming} disabled={gameLocked} onUse={kind => fireBooster(kind)} onCancel={() => setAiming(null)}/>
          <div className="game-tools"><button className="input-mode-button" disabled={gameLocked} aria-pressed={tapMode} aria-label={tapMode ? 'Dokunarak bağla; sürükleme moduna geç' : 'Sürükleyerek bağla; dokunma moduna geç'} onClick={() => { clearPath(); setTapMode(!tapMode); }}>{tapMode ? <Hand size={20}/> : <MousePointer2 size={20}/>}<span>{tapMode ? 'Dokun' : 'Sürükle'}</span></button><button disabled={gameLocked} onClick={() => { clearPath(); const best = findBestHint(session); setHint(best?.path ?? []); setFeedback(best?.message ?? 'Bu tahtada bağlantı yok. Karıştırmayı dene.'); }}><Lightbulb size={21}/><span>İpucu</span></button><button disabled={gameLocked || session.shufflesLeft === 0} onClick={() => { if (resolvingRef.current) return; clearPath(); updateSession(shuffleSession(session)); setHint([]); setFeedback('Çekirdekler yeniden dizildi.'); }}><Shuffle size={21}/><span>Karıştır <b>{session.shufflesLeft}</b></span></button><button className="more-tool" onClick={() => { clearPath(); setOverlay('more'); }} aria-haspopup="dialog"><MoreHorizontal size={21}/><span>Diğer</span></button></div>
          {session.mode === 'daily' && session.dailyKey !== leagueDay() && <p className="quiet-note">Önceki günün bulmacasını oynuyorsun. Ana ekrandan bugünün bulmacasını açabilirsin.</p>}
        </section>
      </div>}
    </main>
    <nav className="bottom-nav" aria-label="Ana gezinme">{tabs.map(tab => <button key={tab.id} aria-current={page === tab.id || (page === 'game' && tab.id === 'journey') ? 'page' : undefined} onClick={() => goPage(tab.id)}><tab.icon size={22}/><span>{tab.label}</span>{tab.id === 'rewards' && pending > 0 && <span className="nav-badge" aria-label={`${pending} ödül bekliyor`}>{pending}</span>}</button>)}</nav>
    {toast && <div className="toast" role="status"><span>{toast}</span><button aria-label="Bildirimi kapat" onClick={() => setToast(null)}><X size={17}/></button></div>}
    {overlay === 'story' && storyToPlay && <Dialog key="story" className="story-dialog" title={storyToPlay.title} onClose={()=>setOverlay(null)}><StoryPlayer key={storyToPlay.id} record={storyToPlay} reducedMotion={reducedMotion}/><p className="story-transcript">{storyToPlay.text}</p><button className="primary-button full" onClick={()=>setOverlay(null)}>Devam et<ArrowRight size={18}/></button></Dialog>}
    {overlay === 'more' && <MoreDialog session={session} onClose={() => setOverlay(null)} onRestart={() => setOverlay('restart')} onShare={() => { setOverlay(null); void share(); }}
      onLearnLink={() => { setLesson('link'); setOverlay(null); }}
      onLearnLoop={() => { if (!findLessonPath(session.grid, 'loop').length) { setToast('Bu tahtada hazır dört taşlı halka yok. Taşları bağlayarak yeni bir halka yolu aç.'); setOverlay(null); return; } setLesson('loop'); setOverlay(null); }}
      onGuide={() => setOverlay('guide')}/>}
    {overlay === 'guide' && <GuideDialog gemStyle={profile.gemStyle} onClose={() => setOverlay(null)}/>}
    {overlay === 'chest' && chestLoot && <ChestDialog kind={chestLoot.kind} items={describeLoot(chestLoot.loot)} reducedMotion={reducedMotion} more={metaOf(profile).chests.length}
      onClose={() => { setOverlay(null); setChestLoot(null); }}
      onNext={() => { const result = openChest(profile); if (!result) return; setProfile(result.profile); setChestLoot({ kind: result.kind, loot: result.loot }); sound.playVictory(); }}/>}
    {overlay === 'restart' && <RestartDialog streakAtRisk={session.mode === 'classic' && session.outcome === 'playing' && session.turns > 0 && metaOf(profile).winStreak > 0} session={session} onClose={() => setOverlay(null)} onConfirm={restart}/>}
    {overlay === 'erase' && <EraseDialog onClose={() => setOverlay(null)} onConfirm={() => { clearPath(); setProfile(recordSession(defaultProfile(), createSession('classic'))); setOverlay(null); setToast('Bu cihazdaki oyun ilerlemesi sıfırlandı.'); }}/>}
    {overlay === 'privacy' && <PrivacyDialog onClose={() => setOverlay(null)}/>}
    {page === 'game' && session.outcome !== 'playing' && overlay === null && !presentation && !burst && <ResultDialog reward={reward} profile={profile} session={session} mystery={mystery} discoveryScene={discoveryScene} reducedMotion={reducedMotion}
      previousBest={previousBest} adBusy={adBusy} adNotice={adNotice} canSave={!saveError} onNavigate={goPage} onWatchAd={() => { void continueWithAd(); }}
      onNextStage={() => openGame('classic', session.stageId + 1)} onRestart={restart} onShare={() => { void share(); }}/>}
  </div>;
}
