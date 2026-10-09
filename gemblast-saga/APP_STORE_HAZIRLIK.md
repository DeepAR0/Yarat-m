# Gemblast Saga 1.6.1 — App Store teslimi

8 Ekim 2026. Kaynak hazırlığıdır; imzalı IPA veya App Store onayı değildir.

## Tamamlanan uygulama işleri

- 30 bölüm, günlük bulmaca, serbest mod, koleksiyon, kayıt, paylaşım ve mobil kontroller.
- Önceki canlı taş biçimleri, farklı merkez sembolleri, soft ışıklı ferah tema korunur.
- Macera tekrarlarında yeni tahta; günlükte aynı günlük seed; aşağı düşüş; kapalı halkada aynı renk temizliği.
- iOS Capacitor/SPM projesi, RGB 1024 ikon, açılış ekranı, UserDefaults gizlilik gerekçesi.
- İsteğe bağlı AdMob +5 hamle, bir kez ödül, reklamlı denemede bir yıldız sınırı; günlük lige reklam avantajı yok.
- Native Game Center köprüsü ve günlük/haftalık gönderim UI'si; tarayıcıda ChatGPT girişi açılmaz. Web skor doğrulama ligi korunur.
- Ekran hata kurtarma, reklam hata/iptal mesajları, yapılandırma kontrolü, gerçek ekran görüntüsü yakalama yardımcıları.

## Önce gerçek yayın bilgilerini gir

`release/config.json`: yayıncı adı, gerçek destek e-postası, herkese açık HTTPS destek/gizlilik adresleri, kendi AdMob iOS App ID/rewarded ID'si. Test sürümü örnek Google kimlikleriyle gelir üretmez. Testleri bitirdikten sonra `admob.testMode=false` yap.

`capacitor.config.ts` ve Xcode target bundle ID'sini sahip olduğun benzersiz kimlikle eşleştir; `com.gemblastsaga.game` kullanılabilirliği doğrulanmış değildir. Xcode'da Team seç. `release/config.json` içindeki `buildNumber` her yeni App Store yüklemesinde artırılır; `configure-ios.mjs` version/build değerlerini eşitler.

Site halen özel erişimlidir. Paketlenmiş `privacy.html` ve `support.html` uygulama içinde açılır; App Store metadata URL'si için gerçek kontakt içeren, giriş istemeyen HTTPS sayfaları ayrıca yayımlanmalıdır. Gizli Site adresini mağazaya destek URL'si diye yazma. İletişim bilgilerini hayali değerlerle doldurma.

## Game Center kurulumu

1. Apple Developer App ID'de Game Center capability aç; Xcode Team/provisioning profiliyle eşleştir.
2. App Store Connect → Game Center'da `gemblast.daily.v1` ve `gemblast.weekly.v1` kimlikleriyle iki **recurring leaderboard** oluştur; farklı ID seçersen `release/config.json` değerlerini değiştir.
3. Her iki tabloyu Integer, yüksek puan daha iyi, Best Score, aralık 0–10000000 olarak kur. Türkçe adları “Günlük Uyanış” ve “Haftalık Lig” olsun.
4. Günlük tablonun başlangıcını Türkiye 00:00'a (bir önceki UTC gününde 21:00), süre/tekrarını 24 saate ayarla. Haftalık tabloyu pazartesi Türkiye 00:00 (pazar UTC 21:00), süre/tekrar 7 gün olarak ayarla. Aktif occurrence'i ve yeni gün/hafta geçişini gerçek hesapla doğrula.
5. `gameCenter.enabled=true` ve `npm run ios:sync`; entitlement üretilir. App Store Connect'te tabloları uygulama sürümünün incelemesine ekle.
6. İki ayrı Apple oyuncusuyla aynı tabloda gerçek sıralama testini yap. Cihazdaki günlük en iyi skorlar haftalık toplanır; hesap değiştirildiğinde/cihaz değiştirildiğinde yerel ilerleme birleştirilmez. Günlük gönderim yalnızca bugünkü tamamlanan bulmaca içindir.

Game Center native skorları istemciden gönderir; Apple oyuncu kimliğini yönetir. Web ligindeki sunucu replay doğrulaması native Game Center için uygulanmaz. Para ödüllü veya yüksek riskli yarışmalar için bu yapı yeterli anti-cheat sayılmaz.

## Mac'te derleme

Apple'ın 28 Nisan 2026'dan itibaren asgari gönderim koşulu Xcode 26+ ve iOS/iPadOS 26 SDK+; hedeflenen cihaz minimumu iOS 16'dır. Güncel gerekliliği gönderim günü tekrar doğrula.

```sh
npm ci
npm run ios:sync
node scripts/check-release.mjs
node scripts/check-appstore.mjs
npm run ios:open
```

Xcode'da SPM çözümlemesini tamamla. Target → Signing & Capabilities: kendi Team, doğru bundle ID, Game Center. Önce iPhone/iPad simulator ve gerçek cihaz Debug çalıştır; ardından generic iOS device ile Product → Archive. Organizer → Validate App → Distribute App → App Store Connect. Linux'ta Swift/iOS derlemesi ve imzalama çalıştırılmadı.

## TestFlight kabul kontrolü

- İlk/tekrar açılış, uçak modu, bozuk kayıt, yetersiz depolama, uygulamanın zorla kapatılması.
- 30 bölüm insanlarla zorluk dengesi; son hamlede kazanma; kilit, halka, özel zincir; çoklu patlatma ve düşüş.
- iPhone küçük/büyük ekran, iPad portre/yatay ve çoklu görev; safe area, menüler, reklam/lig ekranları.
- Ses/sessiz mod, arka plan, ekran kilidi, telefon/ses kesintisi, haptik, paylaşım iptali.
- VoiceOver, dokunarak bağlama, odak sırası, metin büyütme, hareket azaltma.
- Ödüllü reklam/onay kabul testleri: `release/monetization-tr.md`.
- Game Center giriş iptali, ağ kesilmesi, puan gönderimi, iki oyuncu ve gün/hafta değişimi.
- Fiziksel cihazda en az 30 dakikalık performans, ısınma ve pil ölçümü. Otomatik oyun testleri bu ölçümün yerine geçmez.

## Metadata ve görseller

`release/store-copy-tr.md` ve `release/review-notes-en.md` kullanılabilir; gerçek iletişim, telif, ülkeler/fiyat ve uygulama adı rezervasyonu hesabında tamamlanır. Yaş anketine gerçek içerik ve reklam varlığını yaz; Kids kategorisi otomatik seçilmez. AdMob eklenen arşivde “Data Not Collected” seçme; `release/privacy-disclosure-tr.md` ve Xcode birleşik SDK privacy report ile beyanı doğrula.

Gerçek iOS Simulator veya cihaz ekranlarını al: ana ekran, tahta, macera haritası, günlük, koleksiyon/lig. AI mockup kullanma. Simulator açıkken:

```sh
bash scripts/capture-ios-screenshot.sh release/screenshots/iphone-board.png
python3 scripts/check-screenshots.py release/screenshots/*.png
```

Apple'ın güncel zorunlu iPhone ve iPad boyutlarını seç; iPad desteklendiğinden iPad görselleri de gerekir. Piksel boyutu kontrolü gerçek içerik doğrulamasının yerine geçmez.

## Şu anda açık kalan yayın engelleri

Gerçek reklam kimlikleri ve AdMob hesap/mesaj onayları, yayıncı/destek bilgileri ve halka açık URL'ler, Game Center hesap yapılandırması, Mac/Xcode derlemesi-imzalama, gerçek cihaz/TestFlight, gerçek mağaza ekran görüntüleri. Bu işler yapılmadan “eksiksiz gönderime hazır” denemez. Kod, web üretim build'i ve taklit SDK ödül testleri bu sınırı aşmaz.

Kaynaklar: [App Review](https://developer.apple.com/app-store/review/guidelines/), [güncel SDK gereklilikleri](https://developer.apple.com/news/upcoming-requirements/), [build yükleme](https://developer.apple.com/help/app-store-connect/manage-builds/upload-builds/), [screenshot boyutları](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications), [Game Center](https://developer.apple.com/documentation/gamekit/encourage-progress-and-competition-with-leaderboards).
