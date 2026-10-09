export type GameMode = 'classic' | 'daily' | 'zen';
export type FlowDirection = 'up' | 'right' | 'down' | 'left';
export const FLOW_DIRECTIONS: FlowDirection[] = ['up', 'right', 'down', 'left'];
export const FLOW_LABELS: Record<FlowDirection, string> = { up: 'Yukarı', right: 'Sağa', down: 'Aşağı', left: 'Sola' };

export type PrismColor = 'coral' | 'cobalt' | 'amber' | 'violet' | 'emerald';

export type PrismShape = 'crescent' | 'trilobe' | 'seed' | 'hexagon' | 'triangle';

export type SpecialPower = 'none' | 'pulse_row' | 'pulse_col' | 'nova_3x3';

export interface PrismDefinition {
  id: PrismColor;
  name: string;
  symbol: string;
  artwork: string;
  shape: PrismShape;
  bgClass: string;
  selectedBgClass: string;
  ringClass: string;
  dotColor: string;
  secondaryHex: string;
  hex: string;
  lightHex: string;
  emoji: string;
}

export interface CellData {
  id: string;
  color: PrismColor;
  multiplier: 1 | 2 | 3; // 2x or 3x Prism Core
  special: SpecialPower; // Line Laser ('pulse_row' | 'pulse_col') or 3x3 Nova ('nova_3x3')
  locked: boolean; // Frosted Crystal tile that unlocks when an adjacent path clears
  isNew?: boolean;
}

export interface BurstEffect {
  id: string;
  row: number;
  col: number;
  hex: string;
  pointsText?: string;
  isLoopBurst?: boolean;
}

export interface TargetQuota {
  color: PrismColor;
  target: number;
}

export interface StageConfig {
  id: number;
  title: string;
  moves: number;
  targetScore: number;
  quotas: TargetQuota[];
  lockedCoords: [number, number][];
  isDaily?: boolean;
  seed?: number;
  loopsTarget?: number;
  sealsTarget?: number;
  specialsTarget?: number;
  requireLoop?: boolean;
  lesson?: string;
}

export const PRISM_COLORS: PrismColor[] = ['coral', 'cobalt', 'amber', 'violet', 'emerald'];

/**
 * Five colors paired with distinct silhouettes; shape provides a second visual cue.
 */
export const PRISM_DEFINITIONS: Record<PrismColor, PrismDefinition> = {
  coral: {
    id: 'coral',
    name: 'Köz',
    symbol: 'Alev',
    artwork: '/cores/motif-coral.webp',
    shape: 'triangle',
    bgClass: 'bg-gradient-to-b from-[#FFF5F6] to-[#FFE4E8] text-[#E11D48] border-[#FDA4AF]',
    selectedBgClass: 'bg-gradient-to-b from-[#F43F5E] to-[#BE123C] text-white border-[#9F1239]',
    ringClass: 'ring-[#FB7185]/45',
    dotColor: '#E11D48',
    secondaryHex: '#FB7185',
    hex: '#E11D48',
    lightHex: '#FFE4E6',
    emoji: '🟥'
  },
  cobalt: {
    id: 'cobalt',
    name: 'Gelgit',
    symbol: 'Damla',
    artwork: '/cores/motif-cobalt.webp',
    shape: 'crescent',
    bgClass: 'bg-gradient-to-b from-[#F4F8FF] to-[#DBEAFE] text-[#2563EB] border-[#93C5FD]',
    selectedBgClass: 'bg-gradient-to-b from-[#3B82F6] to-[#1D4ED8] text-white border-[#1E40AF]',
    ringClass: 'ring-[#60A5FA]/45',
    dotColor: '#2563EB',
    secondaryHex: '#60A5FA',
    hex: '#2563EB',
    lightHex: '#DBEAFE',
    emoji: '🟦'
  },
  amber: {
    id: 'amber',
    name: 'Güneş',
    symbol: 'Yıldız',
    artwork: '/cores/motif-amber.webp',
    shape: 'trilobe',
    bgClass: 'bg-gradient-to-b from-[#FFFDF5] to-[#FEF3C7] text-[#D97706] border-[#FCD34D]',
    selectedBgClass: 'bg-gradient-to-b from-[#F59E0B] to-[#B45309] text-white border-[#92400E]',
    ringClass: 'ring-[#FBBF24]/45',
    dotColor: '#D97706',
    secondaryHex: '#FBBF24',
    hex: '#F59E0B',
    lightHex: '#FEF3C7',
    emoji: '🟨'
  },
  violet: {
    id: 'violet',
    name: 'Eter',
    symbol: 'Kristal',
    artwork: '/cores/motif-violet.webp',
    shape: 'hexagon',
    bgClass: 'bg-gradient-to-b from-[#F9F7FF] to-[#EDE9FE] text-[#7C3AED] border-[#C4B5FD]',
    selectedBgClass: 'bg-gradient-to-b from-[#8B5CF6] to-[#5B21B6] text-white border-[#4C1D95]',
    ringClass: 'ring-[#A78BFA]/45',
    dotColor: '#7C3AED',
    secondaryHex: '#A78BFA',
    hex: '#7C3AED',
    lightHex: '#EDE9FE',
    emoji: '🟪'
  },
  emerald: {
    id: 'emerald',
    name: 'Yaşam',
    symbol: 'Yaprak',
    artwork: '/cores/motif-emerald.webp',
    shape: 'seed',
    bgClass: 'bg-gradient-to-b from-[#F2FDF9] to-[#D1FAE5] text-[#059669] border-[#6EE7B7]',
    selectedBgClass: 'bg-gradient-to-b from-[#10B981] to-[#047857] text-white border-[#065F46]',
    ringClass: 'ring-[#34D399]/45',
    dotColor: '#059669',
    secondaryHex: '#34D399',
    hex: '#10B981',
    lightHex: '#D1FAE5',
    emoji: '🟩'
  }
};

export const CHAPTERS = ['Köz Vadisi', 'Gelgit Uçurumu', 'Eter Zirvesi'];

// Ten authored encounter patterns introduce one decision at a time.
const ENCOUNTERS: Omit<StageConfig, 'id'>[] = [
  { title: 'İlk Bağlantı', moves: 8, targetScore: 180, quotas: [{color:'coral',target:3},{color:'cobalt',target:3}], lockedCoords: [], seed:73, lesson:'Aynı renkte üç taşı bağla. Yatay, dikey veya çapraz.' },
  { title: 'Işık Çizgisi', moves: 10, targetScore: 240, quotas: [{color:'coral',target:4},{color:'amber',target:4}], lockedCoords: [], seed:83, lesson:'Dört taş bağla: bir satır veya sütun gücü oluştur.' },
  { title: 'Suyun Hafızası', moves: 10, targetScore: 240, quotas: [{color:'cobalt',target:4},{color:'emerald',target:4}], lockedCoords: [], seed:97, lesson:'Çizdiğin yön serbest. Taşlar her zaman aşağı düşer.' },
  { title: 'Renk Dalgası', moves: 12, targetScore: 480, quotas: [{color:'violet',target:8}], lockedCoords: [], seed:103, requireLoop:true, lesson:'Başlangıca dön: tahtadaki bütün açık mor taşlar temizlensin.' },
  { title: 'Nova Uyanıyor', moves: 14, targetScore: 360, quotas: [{color:'emerald',target:6},{color:'amber',target:6}], lockedCoords: [], seed:113, lesson:'Altı taşlık zincirle 3× Nova oluştur. Yeniden bağlayıp patlat.' },
  { title: 'Mühürlü Geçit', moves: 18, targetScore: 450, quotas: [{color:'coral',target:10}], lockedCoords:[[3,2],[3,3]], sealsTarget:2, seed:137, lesson:'Mühürlerin yanındaki taşları temizle; iki mührü aç.' },
  { title: 'Zincir Tepkisi', moves: 20, targetScore: 650, quotas: [{color:'cobalt',target:12},{color:'amber',target:8}], lockedCoords:[], specialsTarget:1, seed:151, lesson:'Bir güç taşı oluştur. Aynı renk zincire ekleyerek etkinleştir.' },
  { title: 'İkiz Işık', moves: 22, targetScore: 850, quotas: [{color:'coral',target:14},{color:'emerald',target:14}], lockedCoords:[[2,1],[3,4]], seed:163, lesson:'İki rengi de topla. Uzun zincirlerle hamlelerinden tasarruf et.' },
  { title: 'Halka Ustası', moves: 24, targetScore: 1100, quotas: [{color:'violet',target:18}], lockedCoords:[], loopsTarget:2, seed:179, lesson:'İki halka kapat. Aynı rengin uzak taşları da dalgaya katılır.' },
  { title: 'Diyarın Kalbi', moves: 26, targetScore: 1500, quotas: [{color:'coral',target:12},{color:'cobalt',target:12},{color:'amber',target:8}], lockedCoords:[[1,2],[1,3],[4,2],[4,3]], requireLoop:true, seed:191, lesson:'Halka, güç ve mühürleri birlikte kullan. İlk diyarı uyandır.' },
];
const NEXT_NAMES = [
  ['Kıyıya Vuran Işık','Derin Kanallar','Yeşil Kıyı','Gelgit Halkası','Dalgaların Gücü','Buzlu Geçit','Yankılanan Kanal','İki Akıntı','Çifte Gelgit','Uçurumun Kalbi'],
  ['Göğün Kıvılcımı','Eter Yolu','Yaşamın Yankısı','Göksel Halka','Yıldız Çekirdeği','Zirve Mühürleri','Yıldırım Zinciri','İkiz Zirve','Halka Ustaları','Son Uyanış'],
];
// Keep the original targets for already-started saves. New attempts use the new curve.
export const LEGACY_STAGES: StageConfig[] = Array.from({length:30}, (_,index) => {
  const chapter = Math.floor(index / 10), position = index % 10, base = ENCOUNTERS[position];
  const { seed, ...encounter } = base;
  return { ...encounter, id:index+1, title:chapter ? NEXT_NAMES[chapter-1][position] : base.title,
    moves:base.moves + chapter*5, targetScore:base.targetScore + chapter*350,
    quotas:base.quotas.map(q=>({...q,target:q.target+chapter*6})),
    lockedCoords:base.lockedCoords.map(([r,c])=>[r,c]), ...(chapter ? {} : {seed}) };
});

const CAMPAIGN_MOVES = [
  [8,10,10,12,14,12,13,14,15,14],
  [14,14,15,15,16,15,16,16,17,16],
  [16,16,17,17,18,17,19,19,20,22],
];
export const STAGES: StageConfig[] = LEGACY_STAGES.map((legacy,index) => {
  if(index<5) return {...legacy};
  const chapter=Math.floor(index/10), position=index%10;
  const quotaBoost=chapter===0 ? 4 : chapter===1 ? 14 : 26;
  const base=ENCOUNTERS[position];
  const extraSeals: [number,number][] = chapter===0 ? [] : chapter===1 ? [[1,1],[4,4]] : [[1,1],[1,4],[4,1],[4,4]];
  const lockedCoords=[...base.lockedCoords.map(([r,c]):[number,number]=>[r,c]), ...extraSeals].sort(([ar,ac],[br,bc])=>ar-br||ac-bc);
  const boss=position===9;
  return {...legacy,moves:CAMPAIGN_MOVES[chapter][position],
    targetScore: chapter===0 ? [0,0,0,0,0,900,1500,2200,2800,5000][position] :
      (chapter===1 ? 3200 : 6500) + position*(chapter===1 ? 350 : 550),
    quotas:[...base.quotas.map(q=>({...q,target:q.target+quotaBoost+(boss?chapter*3+4:0)})),
      ...(chapter>0 && base.quotas.length===1 ? [{color:PRISM_COLORS[(PRISM_COLORS.indexOf(base.quotas[0].color)+2)%PRISM_COLORS.length],target:chapter===1?16:24}] : [])],
    lockedCoords,
    ...(chapter>0 ? {sealsTarget:lockedCoords.length, specialsTarget:chapter+(boss?1:0)} : {}),
    ...(chapter===0 && boss ? {sealsTarget:lockedCoords.length,specialsTarget:2} : {}),
    ...(boss ? {loopsTarget:chapter+1} : base.loopsTarget ? {loopsTarget:base.loopsTarget+chapter} : {}),
    lesson: chapter===0 ? base.lesson : boss ? 'Halka, güç ve mühür hedeflerini birlikte tamamla. Hamlelerini planla.' : 'Uzun zincirlerle güç oluştur. Hedef renkleri ve mühürleri birlikte düşün.',
  };
});

export function localDateKey(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function getDailyStageConfig(now = new Date()): StageConfig {
  const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  let seed = 0;
  for (let i = 0; i < dateKey.length; i++) {
    seed = (seed * 31 + dateKey.charCodeAt(i)) % 1000000;
  }
  const dayIndex = Math.floor((Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - Date.UTC(2026, 0, 1)) / 86400000) + 1;

  const c1 = PRISM_COLORS[seed % PRISM_COLORS.length];
  const c2 = PRISM_COLORS[(seed + 2) % PRISM_COLORS.length];
  const c3 = PRISM_COLORS[(seed + 4) % PRISM_COLORS.length];

  return {
    id: 777,
    title: `Günlük Uyanış #${dayIndex}`,
    moves: 24,
    targetScore: 1100,
    quotas: [
      { color: c1, target: 14 },
      { color: c2, target: 14 },
      { color: c3, target: 12 }
    ],
    lockedCoords: [
      [1, 1], [1, 4], [2, 2], [3, 3], [4, 1], [4, 4]
    ],
    isDaily: true,
    seed: seed + 42
  };
}
