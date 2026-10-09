# Gemblast Saga 2.0.0 — web geliştirme

React/TypeScript bağlantı bulmacası. Aynı renkteki komşu taşları bağla, başlangıca dönüp halka kapatarak bütün rengi temizle, uzun zincirlerle güç taşları oluştur. Yerçekimi aşağı doğrudur.

## 2.0 — Tam oyun sürümü

**İçerik**
- 60 bölüm, 6 diyar: Köz Vadisi, Gelgit Uçurumu, Eter Zirvesi (1. perde) ve Sis Ormanı, Kristal Mağaralar, Gök Adaları (2. perde).
- Yeni engel: **kristal kabuklu mühür**. İki darbe ister; bir hamlede her mühüre en fazla bir darbe.
- Hikâye iki perde, 20 kayıt: 1. perde kulede Mira'yı kurtarır (30 durak + 7 günlük yankı), 2. perde "İlk bekçi" sırrını çözer (bölüm 60).
- Üçüncü taş görünümü "Sis incileri" (bölüm 40).

**Geri getiren sistemler** (`src/utils/meta.ts`)
- **Kristal (✦)**: yalnızca oyunda kazanılan para birimi. İlk zafer, yeni yıldız, günlük bulmaca, görevler, sandıklar ve başarımlar verir. Gerçek para ile satın alma yoktur.
- **Güçlendiriciler**: Çekiç (tek taş), Prizma (bir rengin tamamı), +3 Hamle. Hamle harcamazlar, deterministiktir. Günlük bulmacada kapalıdır, böylece lig skorları doğrulanabilir kalır.
- **7 günlük giriş takvimi**: üst üste gelen günlerde artan ödüller, 7. gün haftalık hazine sandığı.
- **Günlük 3 görev**: her gün tarihe göre seçilir. Üçü de bitince görev sandığı verilir.
- **Sandıklar**: her 12 yıldızda yıldız sandığı, her diyar bitince diyar hazinesi. Açılış animasyonu ve sesi var.
- **14 ödüllü başarım**.
- **Alev serisi**: üst üste zaferler yeni denemeye 1-3 hazır güç taşı koyar. Yarıda bırakmak seriyi sıfırlar. Kaybettikten sonra devam edilirse seri geri gelir.
- **"Az kaldı" ekranı**: kayıpta eksik hedefler listelenir, +3 Hamle ile devam etme seçeneği sunulur.
- **Bölüm giriş kartı**, sıralı yıldız patlaması, ödül/sandık sesleri, Ödüller sekmesinde bekleyen ödül rozeti.
- **Akıllı ipucu**: hedeflere göre en değerli hamleyi adım numaralarıyla gösterir.

**Kod**
- `App.tsx` sayfa ve bileşenlere bölündü: `pages/`, `GameHud`, `GameDialogs`, `ResultDialog`, `GameToolbar` (BoosterBar.tsx), `ChestDialog`. Ekranlar sade: oyunda tek durum satırı ve tek araç sırası; kullanılmayan ~25 KB CSS temizlendi.
- 107 test. `npm run balance:probe` 55 öğretici dışı bölümün tamamı için bot tanığı üretir (`tests/fixtures/campaign-witnesses.json`).
- Eski kayıtlar başlangıç cüzdanıyla (100 ✦ + birer güçlendirici) açılır. Hak edilmiş yıldız/diyar sandıkları açılışta verilir.

## Güncel çalışma sırası
9 Ekim 2026: Web sürümü 2.0.0. iOS native projesindeki `MARKETING_VERSION` hâlâ 1.6.1; `npm run ios:sync`
(configure-ios.mjs) bunu package.json'daki 2.0.0 ile eşitler. Native paket kullanıcı istediğinde hazırlanır.

## Çalıştırma ve kontroller

Node.js 24: `npm ci`, `npm test`, `npm run typecheck`, `npm run build`.

iOS için Mac ve Xcode gerekir: `npm ci`, `npm run ios:sync`, `npm run ios:open`. iOS 16+ hedeflenir. Uygulama `dist/client` dosyalarını gömülü kullanır; uzak siteyi uygulama içine açmaz. Swift Package Manager bağımlılıklarını Xcode çözer.

## Ödüllü reklam

AdMob 8.2.0 eklentisi, Google Mobile Ads ve UMP ile iOS ödüllü reklam akışı eklenmiştir. Macerada hamleleri biten denemeye oyuncunun seçimiyle bir kez +5 hamle verir; reklam tamamlanmazsa ödül yoktur. Ödüllü denemede en fazla bir yıldız alınır. Günlük ve serbest modda ödül yoktur. Banner, otomatik geçiş reklamı, ödeme veya ayrı analitik SDK'sı bulunmaz.

**Mevcut yapılandırma test reklamlarıdır; gelir üretmez ve mağaza gönderimine hazır değildir.** `release/config.json` içindeki gerçek iOS App ID, rewarded ad unit ID, `testMode`, iletişim/HTTPS adresleri ve Game Center ayarları tamamlanmalıdır. Kimlikler şifre değildir. Gizli hesap anahtarlarını projeye yazma.

`npm run ios:preflight` kodu derler, native kaynakları eşitler ve gönderim yapılandırmasını denetler. Eksik gerçek kimlikler veya iletişim bilgileri varsa özellikle başarısız olur. Geçmesi, Apple onayı veya gerçek iOS testi anlamına gelmez.

## Yayın paketi

[APP_STORE_HAZIRLIK.md](APP_STORE_HAZIRLIK.md): Mac, imzalama, hesap ayarları ve gerçek cihaz kontrolü.
[release/monetization-tr.md](release/monetization-tr.md): reklam ağı ve gizlilik ayarları.
[release/store-copy-tr.md](release/store-copy-tr.md): mağaza metinleri.
[release/review-notes-en.md](release/review-notes-en.md): App Review açıklaması.
[release/privacy-disclosure-tr.md](release/privacy-disclosure-tr.md): gizlilik ve yaş anketi için veri matrisi.

`public/privacy.html` ve `public/support.html`, `scripts/generate-policy.mjs` ile gerçek yapılandırmadan üretilir. Site şu anda özel olduğundan bu adresler otomatik olarak herkese açık mağaza URL'si sayılmaz.

## Doğrulama sınırı

Linux ortamında TypeScript, oyun mantığı, skor doğrulama, reklam ödül akışının taklit SDK testleri ve üretim web derlemesi denetlenebilir. Swift/GameKit/AdMob'un Xcode derlemesi, imzalama, gerçek reklam/UMP/ATT davranışı, iPhone/iPad/VoiceOver ve TestFlight testi Mac ve Apple hesabı gerektirir. Bunlar bu ortamda tamamlanmış olarak beyan edilmez.

## Bölüm dengesi 1.5.1
İlk beş öğretici korunur. Altıncı bölümden sonra hamleler azalır; ileride renk, mühür, halka ve etkinleştirilmiş güç hedefleri birlikte tamamlanır. Başlamış eski denemeler eski hedeflerini korur; yeniden denemeler yeni dengeyi kullanır. `npm run balance:probe` sabit seedlerde sezgisel botla reklamsız ve +5 hamleli sonuçları karşılaştırır. `tests/fixtures/campaign-witnesses.json` her öğretici dışı bölüm için reklamsız gerçek kazanan hamle yolunu saklar. Bu yollar, bütün rastgele tahtaların garantili kazanılabilirliği veya insan kazanma oranı anlamına gelmez. Günlük lig dengesi değiştirilmemiştir.

## Kule gizemi 1.6.0
30 bölümle üç diyarın ışık yolu onarılır; 10 kalıcı hikâye kaydı açılır.
Bugünkü günlük bulmacada ilk zafer, toplam yedi yankıdan birini kazandırır.
Aynı gün tekrar ve geçmiş gün pratikleri yeni yankı vermez. Gün atlamak
kayıp yaratmaz. Önceki günlük zaferler aktarılır. 30 bölüm + yedi yankı
Son Uyanış metnini açar. Koleksiyondan günlük ve final yeniden okunabilir.
Motif varsayılan; ikinci element seti bölüm 6 sonunda yalnızca görünüm
tercihi olarak açılır ve kaydedilir. Ayrıntı: release/progression-tr.md.

## İkonik arayüz ve hikâye sahneleri 1.6.1
Macera, günlük uyanış, Zen ve lig; farklı çekirdek rozetleriyle ayrılır.
Butonlar dokunma ve hover destekli cihazlarda kısa tepki verir. Yeni hikâye
kaydı kazanıldığında sonuç ekranında kısa vektör sahne oynar; ana kart ve
günlükten yeniden izlenebilir. 8 sahne türü, 3.65 saniyelik üç adımlı gösterim;
son kare sabit kalır. Durdur/yeniden oynat ve hemen devam et kontrolleri var.
Hareket azaltma, statik son kareyi ve tam metni gösterir. Sahne kapandığında
ve uygulama görünmez olduğunda zamanlayıcılar iptal edilir. Ses/video/uzak
varlık veya yeni çalışma bağımlılığı eklenmedi.

## Rezonans mabedi 1.7.0
Soft/ferah görünüm isteği geri çekildi. Ana ekran WorldHub: diyar adı, bölüm
rozeti, gerçek karşılaşma başlığı, çekirdek mabedi ve ana oyun eylemi.
Köz altın, Gelgit turkuaz, Eter ametist çerçeve tonu; taş yüzeyli HUD ve
tahta, mühürlü günlük, kozmetik envanter ve lig aynı dünyaya bağlıdır.
Tahta boyutu, hücre/çizgi katmanları, düşüş fiziği, hedefler ve kayıtlar
değişmedi. Dünya/sahne statik vektör ve CSS; yeni video/görsel çağrısı yok.
