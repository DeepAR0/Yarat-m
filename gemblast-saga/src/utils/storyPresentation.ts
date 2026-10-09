import { ECHOES, ENDING, mysteryProgress, STORY } from './mystery';
import type { Profile, Session } from './session';

export type SceneKind = 'signal' | 'trail' | 'gate' | 'memory' | 'tide' | 'constellation' | 'ring' | 'finale';
export type StoryRecord = { id: string; title: string; text: string; scene: SceneKind; cues: readonly [string, string, string] };
const storyScenes: {scene:SceneKind; cues:StoryRecord['cues']}[] = [
  {scene:'signal',cues:['Diyarlar sustu.','Kulede bir ışık belirdi.','İçeride biri mi var?']},
  {scene:'trail',cues:['Külün altında bir iz…','İzler kuleye gidiyor.','Ama geri dönmüyor.']},
  {scene:'gate',cues:['Mühre dokundun.','Kapıdan sıcak bir ışık sızdı.','Diyar hâlâ yaşıyor.']},
  {scene:'memory',cues:['Köz yeniden parlıyor.','Duvar eski bir kayıt gösterdi.','Işığı söndürmek bir seçimmiş.']},
  {scene:'tide',cues:['Suyun sesi geri geldi.','Altı yuva suyun altında belirdi.','Bir taş mı eksik?']},
  {scene:'constellation',cues:['Beş çekirdek parladı.','Altıncı yuva boş.','Bir taş değil, bir el…']},
  {scene:'signal',cues:['Gelgit yeniden akıyor.','Kule sinyalini değiştirdi.','“Birlikte.”']},
  {scene:'memory',cues:['Son mühür çözüldü.','Kayıt bir isim gösterdi.','Mira.']},
  {scene:'ring',cues:['Üç diyarın yolu birleşti.','Işık bir halka çizdi.','Eksik olan yalnızca ritim.']},
  {scene:'gate',cues:['Kuleye giden yol açıldı.','Kapının ardında biri var.','Yedi yankı onu özgür bırakabilir.']},
  {scene:'signal',cues:['Sisin ortasında bir ışık.','Mira onu yakmadı.','Kim yaktı?']},
  {scene:'trail',cues:['Kabuklarda işaretler…','Senin çizdiğin gibi.','Biri buradan geçmiş.']},
  {scene:'memory',cues:['Kabuk çatladı.','Altında bir sayfa.','“Döngü yine başladı.”']},
  {scene:'trail',cues:['Sis çekildi.','Aynı ayak izleri.','Ama buradan başlıyorlar.']},
  {scene:'tide',cues:['Mağara her sesi geri verir.','Bir ses farklı.','“Bu sefer unutma.”']},
  {scene:'constellation',cues:['Kristal duvarda yansıman.','Senden önce kıpırdadı.','Gökyüzünü gösteriyor.']},
  {scene:'memory',cues:['Mağaranın kalbi atıyor.','Mira’dan önce bir bekçi vardı.','Hafızasını vermiş.']},
  {scene:'signal',cues:['Rüzgâr adlar fısıldıyor.','Listenin sonu boş.','Bir ad silinmiş.']},
  {scene:'ring',cues:['Yarım kalmış bir halka.','Senin taşından başlıyor.','“Buraya daha önce geldin.”']},
  {scene:'finale',cues:['Halka tamamlandı.','Hatırladın.','Döngü kırıldı.']},
];
export const PROLOGUE: StoryRecord = {id:'prologue',title:'Kulenin çağrısı',text:'Diyarlar karanlığa gömüldü. Ama kapalı kulenin tepesinde bir ışık yanıyor. Çekirdekleri bağlayarak yolu onar ve sinyalin kaynağını keşfet.',scene:'signal',cues:['Bütün diyarlar sustu.','Kule hâlâ parlıyor.','Sinyalin kaynağını bul.']};
export const FINALE: StoryRecord = {id:'finale',title:'Son Uyanış',text:ENDING,scene:'finale',cues:['Yedi yankı aynı ritimde.','Işık üç diyarda dolaşıyor.','Kulenin kapısı açıldı.']};
export function storyRecord(profile: Profile, stage: number): StoryRecord | undefined {
  const i=STORY.findIndex(s=>s.stage===stage);
  if(i<0 || stage>mysteryProgress(profile).restored)return;
  return {id:`story-${stage}`,title:STORY[i].title,text:STORY[i].text,...storyScenes[i]};
}
export function echoRecord(profile: Profile, index: number): StoryRecord | undefined {
  if(index<0 || index>=mysteryProgress(profile).echoes || index>=ECHOES.length)return;
  return {id:`echo-${index}`,title:ECHOES[index].title,text:ECHOES[index].text,scene:index>=4?'ring':'signal',cues:['Kuleyi dinliyorsun.',`${index+1}. yankı bağlantıya katıldı.`,ECHOES[index].title]};
}
export function latestRecord(profile:Profile):StoryRecord {
  const p=mysteryProgress(profile);
  return p.finale?FINALE:storyRecord(profile,p.unlocked.at(-1)?.stage??0)??PROLOGUE;
}
export function resultRecord(profile:Profile,session:Session):StoryRecord|undefined {
  if(session.outcome!=='won')return;
  if(session.mode==='classic')return storyRecord(profile,session.stageId);
  if(session.mode==='daily')return echoRecord(profile,(profile.mysteryDays??profile.dailyWins).indexOf(session.dailyKey!));
}
