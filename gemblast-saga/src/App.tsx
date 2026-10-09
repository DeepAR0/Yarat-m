/** @license SPDX-License-Identifier: Apache-2.0 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, Orbit, ChevronRight, Compass, Diamond, Flame, Infinity as InfinityIcon, Hand, MousePointer2, MoreHorizontal, Lightbulb, LockKeyhole, Map, RotateCcw, Settings as SettingsIcon, Share2, ShieldCheck, Shuffle, Sparkles, Star, Trophy, Volume2, VolumeX, X, Zap } from 'lucide-react';
import { CellData, GameMode, localDateKey, PRISM_COLORS, PRISM_DEFINITIONS, STAGES } from './types/game';
import { areNeighbors, Coord, findSuggestedPath, previewClear, isValidPath } from './utils/boardEngine';
import { commitMove, createSession, defaultProfile, nextUnlocked, parseProfile, Profile, recordSession, Session, restartSession, sessionToOpen, shuffleSession, stageFor, starsFor } from './utils/session';
import { haptic, listenToAppState, nativeStartup, readSave, shareScore, writeSave } from './utils/native';
import { sound } from './utils/sound';
import { PrismGemArtwork } from './components/PrismGemArtwork';
import { JourneyMap } from './components/JourneyMap';
import { FlowIndicator } from './components/FlowIndicator';
import { Dialog } from './components/Dialog';
import { GemBurst, GemEffects } from './components/GemEffects';
import { ChainEnergy } from './components/ChainEnergy';
import { GemFalls, MoveTimeline, planGemFalls } from './utils/movePresentation';
import { StoryPlayer } from './components/StoryPlayer';
import { Emblem } from './components/Emblem';
import { resultRecord, type StoryRecord } from './utils/storyPresentation';
import { MysteryJournal } from './components/Mystery';
import { ECHOES, GEM_STYLES, gemArtwork, mysteryProgress, styleAvailable } from './utils/mystery';
import { chainEnergy } from './utils/chainEnergy';
import { findLessonPath, Lesson } from './utils/lesson';
import { LessonCoach, LessonRoute } from './components/LessonCoach';
import { League } from './components/League';
import { leagueDay } from './utils/competition';
import { canRewardContinue, applyRewardContinue } from './utils/session';
import { adPrivacyRequired, prepareAdConsent, rewardedAdsAvailable, showAdPrivacy, watchContinueAd } from './utils/ads';

type Page = 'journey' | 'collection' | 'settings' | 'league' | 'game';
type Overlay = 'guide' | 'more' | 'restart' | 'erase' | 'privacy' | 'story' | null;
type Presentation = { id: number; phase: 'clearing' | 'falling'; grid: CellData[][]; cleared: Set<string>; falls: GemFalls; step: { x: number; y: number } };
const format = (value: number) => value.toLocaleString('tr-TR');
const modeLabel: Record<GameMode, string> = { classic: 'Macera', daily: 'Günlük uyanış', zen: 'Serbest akış' };
const tabs = [{ id: 'journey', label: 'Macera', icon: Map }, { id: 'league', label: 'Lig', icon: Trophy }, { id: 'collection', label: 'Koleksiyon', icon: Diamond }, { id: 'settings', label: 'Ayarlar', icon: SettingsIcon }] as const;

function StarRating({ stars, label = true }: { stars: number; label?: boolean }) {
  return <span className="star-rating" aria-label={label ? `${stars} / 3 yıldız` : undefined} aria-hidden={!label}>
    {[1, 2, 3].map(i => <Star key={i} size={15} className={i <= stars ? 'earned' : ''} fill={i <= stars ? 'currentColor' : 'none'} />)}
  </span>;
}

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
    resolvingRef.current = true;
    sessionRef.current = move.next;
    setProfile(previous => recordSession(previous, move.next));
    setHint([]);
    const uniqueLength = chainSize - Number(wasLoop);
    const committedPath = move.result.clearedCoords;
    const drops = planGemFalls(current.grid, move.next.grid, lastCoord);
    const firstRect = boardRef.current?.querySelector('[data-cell-coord="0,0"]')?.getBoundingClientRect();
    const columnRect = boardRef.current?.querySelector('[data-cell-coord="0,1"]')?.getBoundingClientRect();
    const rowRect = boardRef.current?.querySelector('[data-cell-coord="1,0"]')?.getBoundingClientRect();
    const step = { x: firstRect && columnRect ? columnRect.left - firstRect.left : 50, y: firstRect && rowRect ? rowRect.top - firstRect.top : 50 };
    const id = ++effectId.current;
    const color = PRISM_DEFINITIONS[current.grid[firstCoord[0]][firstCoord[1]].color].secondaryHex;
    const nextBurst: GemBurst = { id, points: move.earned, loop: wasLoop, chainLength: uniqueLength, path: drawnPath, color,
      label: wasLoop ? 'RENK DALGASI!' : move.result.triggeredSpecialsCount > 1 ? 'ZİNCİR TEPKİSİ!' : uniqueLength >= 9 ? 'TAM GÜÇ!' : move.result.triggeredSpecialsCount ? 'ENERJİ DALGASI!' : uniqueLength >= 6 ? 'NOVA UYANDI!' : uniqueLength >= 4 ? 'GÜÇLÜ AKIŞ!' : 'ENERJİ TOPLANDI',
      gems: move.result.clearedCoords.map(coord => ({ coord, cell: current.grid[coord[0]][coord[1]] })) };
    if (saveTimer.current) { clearTimeout(saveTimer.current); saveTimer.current = null; }
    const base = { id, cleared: new Set(committedPath.map(([r,c]) => `${r},${c}`)), falls: drops, step };
    timeline.start(id, drops, wasLoop || move.result.triggeredSpecialsCount ? 180 : 140, profileRef.current.settings.reducedMotion || systemReducedMotion, {
      clearing: () => { setPresentation({ ...base, phase: 'clearing', grid: current.grid }); setBurst(nextBurst); },
      falling: () => setPresentation({ ...base, phase: 'falling', grid: move.next.grid }),
      settled: () => { resolvingRef.current = false; setPresentation(null); setBurst(null); },
    });
    const special = move.result.spawnedPower;
    setFeedback(move.next.outcome === 'won' ? 'Harika! Tüm hedefler tamamlandı.' : special === 'nova_3x3' ? '3× rezonans çekirdeği oluştu. Yeni bir zincire ekle!' : special !== 'none' ? 'Işık kanalı oluştu. Bir sonraki zincire ekle!' : `+${format(move.earned)} puan · ${move.result.clearedCount} taş temizlendi${move.result.unlockedCount ? ` · ${move.result.unlockedCount} mühür açıldı` : ''}`);
    if (move.next.outcome === 'won') { sound.playVictory(); void haptic('win', profileRef.current.settings.haptics); }
    else if (move.next.outcome === 'lost') sound.playGameOver();
    else { sound.playChainRelease(uniqueLength, wasLoop); void haptic('match', profileRef.current.settings.haptics); }
  }, [clearPath, timeline, systemReducedMotion, finishLesson]);

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
    const next = sessionToOpen(profile, mode, stageId, mode === 'daily' ? new Date(`${day ?? leagueDay()}T12:00:00`) : new Date());
    updateSession(next); setPage('game');
    setOverlay(null);
    setLesson(!profile.tutorialSeen ? 'link' : mode === 'classic' && next.stageId === 4 && !profile.loopTutorialSeen && next.loopsMade === 0 ? 'loop' : null);
  }

  function goPage(target: Page) { timeline.finish(); clearPath(); setOverlay(null); setLesson(null); setPage(target); }
  function restart() {
    setAdNotice('');
    if (!session) return;
    timeline.cancel(); setPresentation(null);
    clearPath(); resolvingRef.current = false; setBurst(null); setHint([]);
    updateSession(restartSession(session));
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
  const dailyFound = (profile.mysteryDays ?? profile.dailyWins).includes(today);
  const completed = Object.values(profile.stages).filter(entry => entry.stars > 0).length;
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
  const loopGoal = currentStage.loopsTarget ?? (currentStage.requireLoop ? 1 : 0);
  const energy = chainEnergy(chainCount, loop);
  const currentPower = loop || chainCount >= 6 ? '3× Nova' : chainCount === 5 ? '2× kanal' : chainCount === 4 ? 'Işık kanalı' : null;


  if (!ready || !session) return <div className="loading-screen"><Diamond size={44} /><h1>Gemblast Saga</h1><p role="status">Çekirdekler uyanıyor…</p></div>;

  return <div data-realm={Math.min(2, Math.floor(((page === 'game' && session.mode === 'classic' ? session.stageId : unlocked) - 1) / 10))} className={`app ${page === 'game' ? 'is-playing' : ''} ${profile.settings.reducedMotion ? 'reduce-motion' : ''}`}>
    <a className="skip-link" href="#main">İçeriğe geç</a>
    <header className="app-header">
      <button className="brand" data-home onClick={() => goPage('journey')} aria-label="Gemblast Saga, ana ekran"><span className="brand-mark"><img src={PRISM_DEFINITIONS.coral.artwork} width="44" height="44" alt=""/></span><span>GEMBLAST<small>S A G A</small></span></button>
      <nav className="desktop-nav" aria-label="Ana gezinme">{tabs.map(tab => <button key={tab.id} onClick={() => goPage(tab.id)} aria-current={page === tab.id ? 'page' : undefined}>{tab.label}</button>)}</nav>
      <div className="header-actions"><span className="star-total"><Star size={16} fill="currentColor"/>{totalStars}</span><button className="icon-button" aria-label="Nasıl oynanır" onClick={() => setOverlay('guide')}><Lightbulb size={20}/></button></div>
    </header>
    {saveError && <div className="save-error" role="alert"><span>{saveError}</span><button onClick={() => { void retryStorage(); }}>Yeniden dene</button></div>}
    <main id="main" ref={mainRef} tabIndex={-1} className={`main page-${page}`}>
      {page === 'league' && <League best={profile.dailyBest} daily={profile.sessions.daily} onPlay={day => openGame('daily', undefined, day)}/> }
      {page === 'journey' && <JourneyMap profile={profile} reducedMotion={reducedMotion} dailyFound={dailyFound} onPlay={id => openGame('classic', id)} onDaily={() => openGame('daily')} onZen={() => openGame('zen', 1)} onStory={playStory}/>}

      {page === 'collection' && <>
        <div className="page-intro"><div className="eyebrow">BEŞ ÇEKİRDEK · TEK ENERJİ</div><h1>Koleksiyonun</h1><p>Köz, Gelgit, Güneş, Eter ve Yaşam. Alev, damla, yıldız, kristal ve yaprak: her çekirdeğin kendine özgü bir simgesi var.</p></div>
        <section className="stats-strip"><div><Star/><strong>{totalStars}</strong><span>Toplanan yıldız</span></div><div><Flame/><strong>{profile.dailyWins.length}</strong><span>Günlük zafer</span></div><div><InfinityIcon/><strong>{format(profile.zenBest)}</strong><span>Zen rekoru</span></div></section>
        <MysteryJournal profile={profile} onPlay={playStory}/>
        <div className="section-heading"><h2>Taş görünümün</h2><span>Yalnızca görünüm</span></div>
        <section className="gem-styles" aria-label="Taş tasarımı seç">{GEM_STYLES.map(style => {
          const available = styleAvailable(profile, style.id), selected = (profile.gemStyle ?? 'motif') === style.id;
          return <button className={`gem-style ${selected ? 'selected' : ''}`} key={style.id} disabled={!available} aria-pressed={selected} onClick={() => setProfile(p => ({...p, gemStyle: style.id}))}><span className="style-samples" aria-hidden="true">{PRISM_COLORS.map(color => <img src={gemArtwork(color, style.id)} alt="" key={color} width="48" height="48" loading="lazy"/>)}</span><strong>{style.title}</strong><small>{style.description}</small><span>{selected ? 'Seçili' : available ? 'Bu görünümü kullan' : `Bölüm ${style.stage} sonunda açılır`}</span></button>;
        })}</section>
        <section className="crystal-collection">{PRISM_COLORS.map(color => {
          const def = PRISM_DEFINITIONS[color];
          return <div key={color} className="collection-gem" style={{ '--gem-color': def.hex } as React.CSSProperties}><div className="gem-preview"><PrismGemArtwork gemStyle={profile.gemStyle} cell={{ id: color, color, multiplier: 1, special: 'none', locked: false }} isSelected={false} isLoopHighlighted={false}/></div><h2>{def.name}</h2><span>{def.symbol} simgesi</span></div>;
        })}</section>
        <div className="section-heading"><h2>Kazandığın izler</h2></div><section className="achievement-list">
          {[{ title: 'İlk uyanış', text: 'İlk macera bölümünü tamamla.', done: completed >= 1, icon: Sparkles }, { title: 'Diyar gezgini', text: '10 macera bölümünü tamamla.', done: completed >= 10, icon: Compass }, { title: 'Günün yıldızı', text: 'Bir günlük bulmacayı tamamla.', done: profile.dailyWins.length >= 1, icon: Flame }, { title: 'Zen ustası', text: 'Zen modunda 5.000 puana ulaş.', done: profile.zenBest >= 5000, icon: InfinityIcon }].map(a => <div className={`achievement ${a.done ? 'unlocked' : ''}`} key={a.title}><a.icon size={23}/><div><strong>{a.title}</strong><p>{a.text}</p></div>{a.done ? <Check size={20}/> : <LockKeyhole size={17}/>}</div>)}
        </section>
      </>}

      {page === 'settings' && <>
        <div className="page-intro"><div className="eyebrow">OYUNU KENDİ RİTMİNE AYARLA</div><h1>Ayarlar</h1><p>Daha sakin, daha sessiz ya da daha dokunsal.</p></div>
        <section className="settings-list">{([{ key: 'sound', title: 'Oyun sesleri', text: 'Zincir boyunca yükselen notalar ve rezonans sesleri.' }, { key: 'haptics', title: 'Dokunsal geri bildirim', text: 'Desteklenen iPhone modellerinde hafif titreşim.' }, { key: 'reducedMotion', title: 'Hareketi azalt', text: 'Çekirdek hareketlerini ve ışık dalgalarını sadeleştir.' }] as const).map(setting => <div className="setting-row" key={setting.key}><div><strong id={`setting-${setting.key}`}>{setting.title}</strong><p>{setting.text}</p></div><button role="switch" aria-checked={profile.settings[setting.key]} aria-labelledby={`setting-${setting.key}`} className="switch" onClick={() => setProfile(p => ({ ...p, settings: { ...p.settings, [setting.key]: !p.settings[setting.key] } }))}><span/></button></div>)}</section>
        <section className="settings-links"><a href="./support.html" className="secondary-button"><Lightbulb size={20}/>Yardım ve destek<ChevronRight size={18}/></a>{privacyOptions && <button onClick={() => { void showAdPrivacy().then(() => adPrivacyRequired()).then(setPrivacyOptions).catch(() => setToast('Reklam gizlilik seçenekleri açılamadı. Bağlantını kontrol edip yeniden dene.')); }}><ShieldCheck size={20}/>Reklam gizlilik tercihleri<ChevronRight size={18}/></button>}<button onClick={() => setOverlay('guide')}><Lightbulb size={20}/>Nasıl oynanır<ChevronRight size={18}/></button><button onClick={() => setOverlay('privacy')}><ShieldCheck size={20}/>Gizlilik ve verilerin<ChevronRight size={18}/></button><button className="danger-link" onClick={() => setOverlay('erase')}><RotateCcw size={20}/>Tüm ilerlemeyi sıfırla<ChevronRight size={18}/></button></section>
        <div className="about-app"><Diamond size={24}/><strong>Gemblast Saga</strong><span>Sürüm 1.8.0 · Enerjiyi çiz, dünyayı uyandır.</span></div>
      </>}

      {page === 'game' && <div className="game-layout">
        <section className="game-surface" aria-label="Oyun alanı">
          <div className="game-top"><button className="icon-button" aria-label="Ana ekrana dön, oyun kaydedilir" onClick={() => goPage('journey')}><ArrowLeft size={20}/></button><div><span className="eyebrow">{session.mode === 'classic' ? `BÖLÜM ${String(session.stageId).padStart(2, '0')}` : session.mode === 'daily' ? session.dailyKey : 'SINIRSIZ OYUN'}</span><h2>{session.mode === 'zen' ? 'Serbest akış' : currentStage.title}</h2></div><button className="icon-button" aria-label={profile.settings.sound ? 'Sesi kapat' : 'Sesi aç'} aria-pressed={profile.settings.sound} onClick={() => setProfile(p => ({ ...p, settings: { ...p.settings, sound: !p.settings.sound } }))}>{profile.settings.sound ? <Volume2 size={20}/> : <VolumeX size={20}/>}</button></div>
          <div className="game-metrics"><div><span>PUAN</span><strong data-testid="score">{format(session.score)}</strong></div><div className={session.mode !== 'zen' && session.movesLeft <= 4 ? 'low-moves' : ''}><span>{session.mode === 'zen' ? 'AKIŞ' : 'HAMLE'}</span><strong data-testid="moves">{session.mode === 'zen' ? '∞' : session.movesLeft}</strong></div></div>
          <div className="targets" aria-label="Bölüm hedefleri">
            {session.mode !== 'zen' && <div className={`target ${session.score >= currentStage.targetScore ? 'done' : ''}`}><Trophy size={18}/><span>{format(Math.min(session.score, currentStage.targetScore))}<small> / {format(currentStage.targetScore)}</small></span><div className="target-track"><span style={{ width: `${Math.min(100, session.score / currentStage.targetScore * 100)}%` }}/></div></div>}
            {(session.mode === 'zen' ? PRISM_COLORS.map(color => ({ color, target: 0 })) : currentStage.quotas).map(q => <div className={`target ${q.target && session.collected[q.color] >= q.target ? 'done' : ''}`} key={q.color} aria-label={`${PRISM_DEFINITIONS[q.color].name}, ${session.collected[q.color]}${q.target ? ` / ${q.target}` : ''}`}><span className="target-glyph"><PrismGemArtwork gemStyle={profile.gemStyle} cell={{ id: q.color, color: q.color, multiplier: 1, special: 'none', locked: false }} isSelected={false} isLoopHighlighted={false}/></span><span>{Math.min(session.collected[q.color], q.target || Infinity)}{q.target > 0 && <small> / {q.target}</small>}</span>{q.target > 0 && <div className="target-track"><span style={{ width: `${Math.min(100, session.collected[q.color] / q.target * 100)}%`, background: PRISM_DEFINITIONS[q.color].secondaryHex }}/></div>}</div>)}
            {loopGoal > 0 && <div className={`target target-rule ${session.loopsMade >= loopGoal ? 'done' : ''}`} aria-label={`Halka hedefi: ${session.loopsMade} / ${loopGoal}`}><Orbit size={18}/><span>{Math.min(session.loopsMade,loopGoal)} / {loopGoal}</span>{session.loopsMade >= loopGoal && <Check size={13}/>}</div>}
            {!!currentStage.sealsTarget && <div className={`target target-rule ${session.sealsOpened >= currentStage.sealsTarget ? 'done' : ''}`} aria-label={`Mühür hedefi: ${session.sealsOpened} / ${currentStage.sealsTarget}`}><LockKeyhole size={18}/><span>{Math.min(session.sealsOpened,currentStage.sealsTarget)} / {currentStage.sealsTarget}</span></div>}
            {!!currentStage.specialsTarget && <div className={`target target-rule ${session.specialsTriggered >= currentStage.specialsTarget ? 'done' : ''}`} aria-label={`Güç hedefi: ${session.specialsTriggered} / ${currentStage.specialsTarget}`}><Zap size={18}/><span>{Math.min(session.specialsTriggered,currentStage.specialsTarget)} / {currentStage.specialsTarget}</span></div>}
          </div>
          <FlowIndicator count={chainCount} affected={affected.size} loop={loop} resolving={presentation?.phase} tapMode={tapMode} cue={milestone}/>
          {lesson && !presentation && <LessonCoach lesson={lesson} path={lessonPath} count={chainCount} loop={loop} tapMode={tapMode} onSkip={() => finishLesson(lesson)}/> }
          {!lesson && session.mode === 'classic' && currentStage.lesson && <details className="level-tip"><summary><Lightbulb size={14}/>Bölüm ipucu<ChevronRight size={14}/></summary><p>{currentStage.lesson}</p></details>}
          <div className="board-wrap"><div ref={boardRef} className={`board ${loop ? 'looping' : ''} ${path.length ? `charging charge-${energy.tier}` : ''} ${presentation ? `resolving-${presentation.phase}` : ''}`} aria-busy={!!presentation} aria-label="6 satır, 6 sütun kristal tahtası"
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
              const selected = path.some(([pr, pc]) => pr === r && pc === c), hinted = hint.some(([pr, pc]) => pr === r && pc === c);
              const def = PRISM_DEFINITIONS[cell.color];
              const lessonIndex = lessonPath.findIndex(([lr,lc]) => lr === r && lc === c);
              const lessonNext = lessonIndex === (loop ? -1 : chainCount >= (lesson === 'loop' ? 4 : 3) ? 0 : chainCount);
              const fall = presentation?.phase === 'falling' ? presentation.falls[cell.id] : undefined;
              const clearing = presentation?.phase === 'clearing' && presentation.cleared.has(`${r},${c}`);
              const loopHighlight = !selected && affected.has(`${r},${c}`);
              return <button key={`${r},${c}`} data-cell-coord={`${r},${c}`} className={`gem-cell ${selected || loopHighlight ? 'selected' : ''} ${hinted ? 'hinted' : ''} ${cell.locked ? 'frozen' : ''} ${lessonIndex >= 0 && lesson ? 'lesson-stone' : ''} ${lessonIndex >= 0 && lesson && lessonNext ? 'lesson-next' : ''}`} style={{ '--gem-color': def.hex, '--gem-light': def.secondaryHex } as React.CSSProperties}
                aria-label={`${lesson && lessonIndex >= 0 ? `Alıştırma ${lessonIndex + 1}, ` : ''}${def.name}, ${def.symbol} simgesi, satır ${r + 1}, sütun ${c + 1}${cell.locked ? ', mühürlü' : ''}${cell.special !== 'none' ? cell.special === 'nova_3x3' ? ', rezonans çekirdeği' : ', ışık kanalı' : ''}${cell.multiplier > 1 ? `, ${cell.multiplier} kat puan` : ''}`} aria-pressed={selected} aria-disabled={cell.locked || gameLocked}
                onPointerDown={event => {
                  if (tapMode || event.button !== 0 || gameLocked || cell.locked || resolvingRef.current || pointerRef.current !== null) return;
                  event.preventDefault(); event.currentTarget.focus({ preventScroll: true }); clearPath(); pointerRef.current = event.pointerId; extendPath(r, c);
                }} onClick={event => { if (!gameLocked && (tapMode || event.detail === 0)) { if (event.detail === 0) setTapMode(true); extendPath(r, c); } }}>
                <div key={cell.id} className={`gem-motion ${fall ? 'falling' : ''} ${clearing ? 'clearing' : ''}`} onAnimationEnd={event => {
                  if (event.target === event.currentTarget && event.animationName === 'gem-fall' && presentation) timeline.landed(presentation.id, cell.id);
                }} style={fall ? { '--drop-x': `${fall.x * presentation!.step.x}px`, '--drop-y': `${fall.y * presentation!.step.y}px`, '--fall-duration': `${fall.duration}ms`, '--fall-delay': `${fall.delay}ms`, '--fall-opacity': fall.fresh ? 0 : 1 } as React.CSSProperties : undefined}><PrismGemArtwork gemStyle={profile.gemStyle} cell={cell} isSelected={selected} isLoopHighlighted={loopHighlight} chargeTier={selected || loopHighlight ? energy.tier : 0} previewPower={chainCount >= 4 && r === path[loop ? path.length-2 : path.length-1]?.[0] && c === path[loop ? path.length-2 : path.length-1]?.[1] ? (loop || chainCount >= 6 ? 'nova' : 'channel') : undefined}/></div>
                {lesson && lessonIndex >= 0 && <span className="lesson-step" aria-hidden="true">{lessonIndex + 1}{lesson === 'loop' && lessonIndex === 0 ? '↺' : ''}</span>}
                {selected && <span className="chain-number">{path.findIndex(([pr, pc]) => pr === r && pc === c) + 1}</span>}
              </button>;
            }))}</div>
            {burst && <GemEffects burst={burst}/>}
          </div></div>
          <div className="game-status-row"><div className="game-feedback" role="status" aria-live="polite">{presentation ? presentation.phase === 'clearing' ? 'Enerji yayılıyor…' : 'Çekirdekler yerleşiyor…' : path.length ? loop ? `${affected.size} taş dalgaya katılıyor · halka 2× puan` : chainCount < 3 ? `${chainCount} taş seçildi · en az 3 bağla` : `${affected.size} taş temizlenecek${currentPower ? ` · ${currentPower} oluşacak` : ''}` : feedback}</div>
          <button className="link-commit" disabled={gameLocked || chainCount < 3} onClick={commit}><Check size={16}/>Patlat</button></div>
          <div className="game-tools"><button className="input-mode-button" disabled={gameLocked} aria-pressed={tapMode} aria-label={tapMode ? 'Dokunarak bağla; sürükleme moduna geç' : 'Sürükleyerek bağla; dokunma moduna geç'} onClick={() => { clearPath(); setTapMode(!tapMode); }}>{tapMode ? <Hand size={20}/> : <MousePointer2 size={20}/>}<span>{tapMode ? 'Dokun' : 'Sürükle'}</span></button><button disabled={gameLocked} onClick={() => { clearPath(); setHint(findSuggestedPath(session.grid) ?? []); setFeedback('Parlayan üç çekirdeği bağla.'); }}><Lightbulb size={21}/><span>İpucu</span></button><button disabled={gameLocked || session.shufflesLeft === 0} onClick={() => { if (resolvingRef.current) return; clearPath(); updateSession(shuffleSession(session)); setHint([]); setFeedback('Çekirdekler yeniden dizildi.'); }}><Shuffle size={21}/><span>Karıştır <b>{session.shufflesLeft}</b></span></button><button className="more-tool" onClick={() => { clearPath(); setOverlay('more'); }} aria-haspopup="dialog"><MoreHorizontal size={21}/><span>Diğer</span></button></div>
          {session.mode === 'daily' && session.dailyKey !== leagueDay() && <p className="quiet-note">Önceki günün bulmacasını oynuyorsun. Ana ekrandan bugünün bulmacasını açabilirsin.</p>}
        </section>
      </div>}
    </main>
    <nav className="bottom-nav" aria-label="Ana gezinme">{tabs.map(tab => <button key={tab.id} aria-current={page === tab.id || (page === 'game' && tab.id === 'journey') ? 'page' : undefined} onClick={() => goPage(tab.id)}><tab.icon size={22}/><span>{tab.label}</span></button>)}</nav>
    {toast && <div className="toast" role="status"><span>{toast}</span><button aria-label="Bildirimi kapat" onClick={() => setToast(null)}><X size={17}/></button></div>}
    {overlay === 'story' && storyToPlay && <Dialog key="story" className="story-dialog" title={storyToPlay.title} onClose={()=>setOverlay(null)}><StoryPlayer key={storyToPlay.id} record={storyToPlay} reducedMotion={reducedMotion}/><p className="story-transcript">{storyToPlay.text}</p><button className="primary-button full" onClick={()=>setOverlay(null)}>Devam et<ArrowRight size={18}/></button></Dialog>}
    {overlay === 'more' && <Dialog title="Oyun seçenekleri" onClose={() => setOverlay(null)}>
      <div className="more-actions">
        <button onClick={() => setOverlay('restart')}><RotateCcw size={20}/><span><strong>Yeniden başla</strong><small>{session.mode === 'daily' ? 'Aynı günlük bulmacayı tekrar dene' : 'Yeni bir taş dizilimiyle dene'}</small></span><ChevronRight size={18}/></button>
        <button onClick={() => { setOverlay(null); void share(); }}><Share2 size={20}/><span><strong>Skoru paylaş</strong><small>{format(session.score)} puan</small></span><ChevronRight size={18}/></button>
        <button disabled={session.outcome !== 'playing'} onClick={() => { setLesson('link'); setOverlay(null); }}><Hand size={20}/><span><strong>Bağlamayı öğren</strong><small>Tahta üzerinde kısa alıştırma</small></span><ChevronRight size={18}/></button>
        <button disabled={session.outcome !== 'playing'} onClick={() => { if (!findLessonPath(session.grid, 'loop').length) { setToast('Bu tahtada hazır dört taşlı halka yok. Taşları bağlayarak yeni bir halka yolu aç.'); setOverlay(null); return; } setLesson('loop'); setOverlay(null); }}><Orbit size={20}/><span><strong>Halkayı öğren</strong><small>Başlangıca dön, bütün rengi uyandır</small></span><ChevronRight size={18}/></button>
        <button onClick={() => setOverlay('guide')}><Lightbulb size={20}/><span><strong>Tüm oyun kuralları</strong><small>Güçler, mühürler ve hedefler</small></span><ChevronRight size={18}/></button>
      </div>
    </Dialog>}
    {overlay === 'guide' && <Dialog title="Bağla. Halkayı kapat." onClose={() => setOverlay(null)}><p className="dialog-lead">Aynı renkteki çekirdekleri bağla ve enerjiyi büyüt. Halkayı kapatıp bütün rengi uyandır.</p><div className="guide-chain" aria-hidden="true">{[1, 2, 3].map(n => <span key={n}><PrismGemArtwork gemStyle={profile.gemStyle} cell={{ id: `guide-${n}`, color: 'coral', multiplier: 1, special: 'none', locked: false }} isSelected={true} isLoopHighlighted={false}/></span>)}<ArrowRight size={23}/><span className="guide-score">+90</span></div><ol className="guide-list"><li><strong>Aynı renkte en az 3 çekirdek bağla.</strong><p>Yatay, dikey veya çapraz sürükle. “Sürükle / Dokun” düğmesiyle bağlama modunu değiştirebilirsin. Klavyede oklarla ilerle, Enter ile seç.</p></li><li><strong>Taşlar her zaman aşağı düşer.</strong><p>Zinciri istediğin yönde çiz. Temizlenen boşluklar üstten dolar. Parlayan taşlar, hamlenden etkilenecek taşları gösterir.</p></li><li><strong>Halkayla bütün rengi temizle.</strong><p>Aynı renkten en az 4 taşı kesişmeden bağla ve başlangıç taşına dön. Tahtanın her yerindeki aynı renk açık taşlar temizlenir. Halka 2× puan ve 3× Nova kazandırır.</p></li><li><strong>Uzun zincirlerin enerjisini kullan.</strong><p>4 taş ışık kanalı; 5 taş 2× kanal; 6 ve üzeri 3× rezonans çekirdeği oluşturur. Kanal satır veya sütunu, rezonans çevresini temizler.</p></li><li><strong>Diyarın tüm hedeflerini tamamla.</strong><p>Puan ve renk hedeflerini; varsa halka, mühür veya güç hedefini bitir. Mühürlü taşları açmak için yanlarındaki taşları temizle.</p></li></ol><button className="primary-button full" onClick={() => setOverlay(null)}>Anladım, başlayalım<ArrowRight size={18}/></button></Dialog>}
    {overlay === 'restart' && <Dialog title="Yeniden başlayalım mı?" onClose={() => setOverlay(null)}><p className="dialog-lead">Bu oyunun puanı ve hamleleri sıfırlanır. Kazandığın yıldızlar ve rekorlar korunur. {session.mode === 'daily' ? 'Günlük bulmacanın taş dizilimi aynı kalır.' : 'Taşlar yeni bir dizilimle başlar.'}</p><div className="dialog-actions"><button className="secondary-button" onClick={() => setOverlay(null)}>Oyuna dön</button><button className="primary-button" onClick={restart}>Yeniden başla</button></div></Dialog>}
    {overlay === 'erase' && <Dialog title="İlerlemeni sıfırla" onClose={() => setOverlay(null)}><p className="dialog-lead">Tüm yıldızların, rekorların ve kayıtlı oyunların bu cihazdan silinecek. Bu işlem geri alınamaz.</p><div className="dialog-actions"><button className="secondary-button" onClick={() => setOverlay(null)}>Vazgeç</button><button className="danger-button" onClick={() => { clearPath(); setProfile(recordSession(defaultProfile(), createSession('classic'))); setOverlay(null); setToast('Bu cihazdaki oyun ilerlemesi sıfırlandı.'); }}>Tümünü sıfırla</button></div></Dialog>}
    {overlay === 'privacy' && <Dialog title="Gizlilik ve verilerin" onClose={() => setOverlay(null)}><div className="privacy-copy"><ShieldCheck size={34}/><p>Macera ilerlemesi, yıldızlar, rekorlar ve ayarlar cihazında tutulur. iOS uygulamasında isteğe bağlı AdMob ödüllü reklamları bulunur. Reklam sağlayıcısı reklam sunumu ve ölçümü için cihaz, ağ, etkileşim ve tanılama verilerini işleyebilir. Gizlilik seçeneklerin ilgili bölgelerde gösterilir; reddetmek oyuna erişimini engellemez.</p><p>Skorunu paylaşmayı seçersen, paylaşılacak metni ve hedef uygulamayı sen belirlersin. iOS liginde Game Center kullanılır; Apple oyuncu kimliğin ve skorların Apple hizmetine iletilir. Web skor ligine katılırsan oyuncu adın, hesap kimliğin ve doğrulanmış günlük skorların sunucuda saklanır. Sıralamada diğer oyuncular yalnızca oyuncu adını ve skorunu görür. Günlük hamle kaydın, sonucu doğrulamak için sen gönderdiğinde sunucuya iletilir; hamleler kalıcı olarak saklanmaz.</p><p>Yerel ilerlemeni Ayarlar’dan sıfırlayabilirsin. Lig ekranındaki “Sıralamadaki verilerimi sil” ile sunucudaki lig adını ve skorlarını silebilirsin. Uygulamayı kaldırmak sunucudaki lig verilerini silmez. Macera kayıtları cihazlar arasında otomatik eşitlenmez.</p><p><a href="./privacy.html" className="text-button">Tam gizlilik politikasını oku<ArrowRight size={16}/></a></p></div><button className="secondary-button full" onClick={() => setOverlay(null)}>Kapat</button></Dialog>}
    {page === 'game' && session.outcome !== 'playing' && overlay === null && !presentation && !burst && <Dialog key="result" className="result-dialog" title={session.outcome === 'won' ? 'Diyar uyandı!' : 'Bir bağlantı daha?'} onClose={() => { if (!adBusy) goPage('journey'); }}>
      {discoveryScene && <StoryPlayer key={discoveryScene.id} record={discoveryScene} reducedMotion={reducedMotion} compact/>}
      {!discoveryScene && <div className={`result-emblem ${session.outcome === 'won' ? 'won' : ''}`}>{session.outcome === 'won' ? <Trophy size={46}/> : <Diamond size={46}/>}</div>}
      {session.outcome === 'won' && <StarRating stars={starsFor(session)}/>}
      <p className="dialog-lead">{session.outcome === 'won' ? 'Tüm hedefleri tamamladın. Işık bir adım daha ilerledi.' : 'Hamleler bitti. Uzun zincirler ve renk dalgalarıyla yeniden dene.'}</p>
      {session.outcome === 'won' && session.mode === 'classic' && <div className="result-discovery"><strong>{mystery.unlocked.at(-1)?.title ?? 'İlk ışık'}</strong><p>{mystery.unlocked.at(-1)?.stage === session.stageId ? mystery.unlocked.at(-1)?.text : mystery.next ? `Yolun bir parçası onarıldı. Bölüm ${mystery.next.stage} sonunda yeni bir kayıt açılacak.` : 'Kulenin yolu açıldı. Son Uyanış için yedi yankıyı tamamla.'}</p><button className="text-button" onClick={() => goPage('collection')}>{mystery.finale ? 'Son Uyanış’ı oku' : 'Günlüğü aç'}<Sparkles size={16}/></button></div>}
      {session.outcome === 'won' && session.mode === 'daily' && <div className="result-discovery"><strong>{(profile.mysteryDays ?? profile.dailyWins).includes(session.dailyKey!) ? `Yankı ${Math.min(7, (profile.mysteryDays ?? profile.dailyWins).indexOf(session.dailyKey!) + 1)} · Günlüğüne kaydedildi` : 'Günlük bulmaca tamamlandı'}</strong><p>{(profile.mysteryDays ?? profile.dailyWins).includes(session.dailyKey!) ? ECHOES[(profile.mysteryDays ?? profile.dailyWins).indexOf(session.dailyKey!)]?.text : mystery.echoes === 7 ? 'Yedi yankı tamam. Günlük skorunu ligde geliştirebilirsin.' : 'Yeni yankı için bugünün bulmacasını kazan.'}</p><button className="text-button" onClick={() => goPage('collection')}>{mystery.finale ? 'Son Uyanış’ı oku' : 'Yankıları oku'}<Sparkles size={16}/></button></div>}
      <div className="result-score"><strong>{format(session.score)}</strong><span>PUAN</span></div>
      {rewardedAdsAvailable() && canRewardContinue(session) && <div className="reward-offer"><button className="primary-button full" disabled={adBusy || !!saveError} onClick={() => { void continueWithAd(); }}><Zap size={18}/>{adBusy ? 'Reklam hazırlanıyor…' : 'Reklam izle · +5 hamle'}</button><small>Bölüm başına bir kez. Reklamı tamamla, aynı tahtadan devam et. Bu denemede en fazla 1 yıldız kazanılır.</small></div>}
      {adNotice && <p role="status" className="league-notice">{adNotice}</p>}
      {adBusy && <p role="status">Reklam hazırlanıyor. Erken kapatırsan ödül verilmez.</p>}
      {session.mode === 'daily' ? <button disabled={adBusy} className="primary-button full" onClick={() => goPage('league')}>Skoru lige gönder<Trophy size={18}/></button> : session.outcome === 'won' && session.mode === 'classic' && session.stageId < STAGES.length ? <button disabled={adBusy} className="primary-button full" onClick={() => openGame('classic', session.stageId + 1)}>Sonraki bölüm<ArrowRight size={18}/></button> : <button disabled={adBusy} className="primary-button full" onClick={session.outcome === 'won' ? () => goPage('journey') : restart}>{session.outcome === 'won' ? 'Ana ekrana dön' : 'Tekrar dene'}<ArrowRight size={18}/></button>}
      <div className="result-secondary" inert={adBusy}>{session.mode === 'daily' && <button className="text-button" onClick={restart}>Tekrar dene</button>}<button className="text-button" onClick={() => { void share(); }}><Share2 size={17}/>Skoru paylaş</button><button className="text-button" onClick={() => goPage('journey')}>Bölümler</button></div>
    </Dialog>}
  </div>;
}
