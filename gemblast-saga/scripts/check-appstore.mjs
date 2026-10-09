import {readFile} from 'node:fs/promises';
const config=JSON.parse(await readFile(new URL('../release/config.json',import.meta.url),'utf8'));
const problems=[];
if (!config.publisherName.trim()) problems.push('Yayıncı adı eksik.');
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.supportEmail)) problems.push('Gerçek destek e-postası eksik.');
for(const key of ['supportURL','privacyURL']) {
  try {if(new URL(config[key]).protocol!=='https:') throw Error();} catch {problems.push(`${key}: herkese açık gerçek HTTPS adresi gerekli.`);}
}
if(config.admob.enabled) {
  if(config.admob.testMode) problems.push('AdMob testMode açık; test reklamı gelir üretmez.');
  if(!/^ca-app-pub-\d{16}\/\d{10}$/.test(config.admob.iosRewardedId)) problems.push('Ödüllü reklam birimi ID geçersiz.');
  if([config.admob.iosAppId,config.admob.iosRewardedId].some(id=>id.includes('3940256099942544'))) problems.push('Google örnek kimliklerini kendi iOS AdMob kimliklerinle değiştir.');
}
if(!config.gameCenter.enabled) problems.push('Game Center yapılandırılmadı; App Store Connect liderlik tablolarını kur ve enabled=true yap.');
console.log('App Store gönderim yapılandırması:');
if(problems.length) {for(const problem of problems) console.error(`- ${problem}`);process.exitCode=1;}
else console.log('Yerel yapılandırma kontrolü geçti. URL erişimini oturumsuz tarayıcıda doğrula; Xcode arşivi, SDK gizlilik raporu, Game Center ve gerçek cihaz reklam testleri ayrıca zorunludur.');
