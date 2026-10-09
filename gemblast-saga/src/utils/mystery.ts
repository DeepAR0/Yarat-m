import { STAGES, PrismColor, PRISM_DEFINITIONS } from '../types/game';
import type { Profile } from './session';

export const STORY = [
  { stage: 1, title: 'Sönmeyen işaret', text: 'Diyarların ışığı yıllar önce söndü. Ama kilitli kulenin tepesinde bu gece bir taş parladı. Biri içeriden yardım mı istiyor?', tease: 'Külün altında bir iz var. Kim bıraktı?' },
  { stage: 3, title: 'Küldeki ayak izleri', text: 'İzler kuleye gidiyor, geri dönmüyor. Yanlarındaki küçük defterin ilk sayfası yırtılmış: “Işığı söndüren…” Cümlenin devamı nerede?', tease: 'Defterdeki çizim, vadinin altındaki kapıyla aynı.' },
  { stage: 6, title: 'Kapının öteki yanı', text: 'Kapıdan karanlık değil, sıcak bir rüzgâr geliyor. Duvarın içindeki çekirdek bir kalp gibi atıyor. Diyar ölü değil; uyuyor.', tease: 'Kapıyı açan işaret neden bütün taşlarda var?' },
  { stage: 10, title: 'Bekçinin seçimi', text: 'Vadinin ışığı geri döndü. Bir kayıt belirdi: “Çekirdek çatladı. Işığı kapatmazsak üç diyar da parçalanacak.” Kuledeki kişi bir düşman olmayabilir.', tease: 'Gelgit’in altında saklanan kayıt, çatlağın nedenini anlatıyor.' },
  { stage: 13, title: 'Suyun tuttuğu ses', text: 'Su, eski bir sesi geri getirdi: “Bir taş eksik.” Beş çekirdek var. Peki kayıtta neden altı yuva görünüyor?', tease: 'Altıncı taşın izi, suyun akmadığı yere gidiyor.' },
  { stage: 16, title: 'Boş yuvanın sırrı', text: 'Altıncı yuva bir taş için yapılmamış. Orada birinin elini koyacağı bir oyuk var. Sistemi bir bekçi ayakta tutuyormuş.', tease: 'Bekçi hâlâ oradaysa neden kapıyı açamıyor?' },
  { stage: 20, title: 'Kulenin cevabı', text: 'Gelgit yeniden akıyor. Sinyal ilk kez bir sözcüğe dönüştü: “Birlikte.” Bekçi ışığı tek başına tutarken kulenin kapıları mühürlenmiş.', tease: 'Zirvedeki son mühür, bekçinin adını saklıyor.' },
  { stage: 23, title: 'Unutulan isim', text: 'Mühürden bir ad çıktı: Mira. Kaydında şu yazıyor: “Beni kurtarmak için ışığı yeniden tek bir çekirdeğe yüklemeyin.” Başka bir yol bulmalısın.', tease: 'Üç diyarın çizgilerini üst üste koyunca ne oluşacak?' },
  { stage: 26, title: 'Yeni bir bağlantı', text: 'Üç harita birleşince kapalı bir halka oluştu. Işık bir elde tutulmak zorunda değil; diyarlar arasında dolaşabilir. Ama kulenin ritmi hâlâ eksik.', tease: 'Günlük yankılar, eksik ritmin yedi notasını taşıyor.' },
  { stage: 30, title: 'Son kapı', text: 'Üç diyar uyandı, kuleye giden yol açıldı. Mira kapının ardında. Yedi yankının ritmi tamamlandığında ışığı diyarlar arasında dolaştırabilir, onu serbest bırakabilirsin.', tease: 'Son Uyanış için yedi yankıyı tamamla.' },
] as const;
export const ECHOES = [
  { title: 'İlk vuruş', text: 'Sinyal düzenli aralıklarla geliyor. Bir tehlike alarmından çok, birinin tuttuğu ritme benziyor.' },
  { title: 'Cevap', text: 'Taşları bağladığında sinyal kısa süreliğine güçlendi. Kule yaptıklarını duyuyor.' },
  { title: 'Beş ses', text: 'Her çekirdeğin sesi ayrı. Tek başına hiçbiri kapıyı açacak kadar güçlü değil.' },
  { title: 'Sessiz aralık', text: 'Ritmin bir yerinde boşluk var. Bu bir hata değil: ışığın geçeceği aralık.' },
  { title: 'Dönüş', text: 'Son nota ilkine bağlanıyor. Ritmin bitişi yok; bir halka çiziyor.' },
  { title: 'Paylaşılan ışık', text: 'Yankılar aynı anda çalınca yük bölünüyor. Hiçbir çekirdeğin tek başına yanması gerekmiyor.' },
  { title: 'Yedinci yankı', text: 'Son nota kulenin içinden geldi. Bekçi de bağlantıya katılıyor. Yol açıldığında onu eve götürebilirsin.' },
] as const;
export const ENDING = 'Yedi yankıyı halkaya bağladın. Işık üç diyarda dolaşmaya başladı; kulenin kapısı açıldı. Mira dışarı çıktı ve elindeki son ışığı gökyüzüne bıraktı. Diyarları kurtaran tek bir güçlü taş değil, kurduğun bağlantılardı. Kule artık bir hapishane değil, her gün yeni bir yankıyı dinleyebileceğin bir fener.';
export function mysteryProgress(profile: Profile) {
  const frontier = STAGES.find(s => !profile.stages[s.id]?.stars)?.id ?? STAGES.length + 1;
  const restored = frontier - 1;
  const unlocked = STORY.filter(s => s.stage <= restored);
  const next = STORY.find(s => s.stage > restored);
  const echoes = Math.min(7, new Set(profile.mysteryDays ?? profile.dailyWins).size);
  return { restored, unlocked, next, echoes, finale: restored === STAGES.length && echoes === 7 };
}
export type GemStyle = 'motif' | 'element';
export const GEM_STYLES: {id: GemStyle; title: string; stage: number; description: string}[] = [
  { id: 'motif', title: 'Işık çekirdekleri', stage: 0, description: 'Yumuşak gövde, beş ayrı simge.' },
  { id: 'element', title: 'Kristal yankılar', stage: 6, description: 'Daha keskin fasetler, aynı beş simge.' },
];
export const gemArtwork = (color: PrismColor, style: GemStyle = 'motif') => style === 'element' ? `/cores/element-${color}.webp` : PRISM_DEFINITIONS[color].artwork;
export const styleAvailable = (profile: Profile, style: GemStyle) => mysteryProgress(profile).restored >= (GEM_STYLES.find(s => s.id === style)?.stage ?? Infinity);
