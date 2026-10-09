# Doğrulama kaydı — 7 Ekim 2026

## Çalıştırılan kontroller

- TypeScript strict kontrolü başarılı.
- Web üretim derlemesi başarılı. Ana JavaScript paketi yaklaşık 291 kB / 92 kB gzip.
- 20 otomatik oyun/kayıt testi başarılı. 30 bölüm için 100'er başlangıç tohumu, toplam 3.000 başlangıç tahtasının oynanabilirliği kontrol edildi.
- Günlük RNG devamı, geçersiz yollar, halkalar, güç zincirleri, sabit buz, hedef/puan kazanma koşulu, son hamle önceliği, Zen, rekorlar, yıldızlar, kayıt doğrulama ve karıştırma bütçesi test edildi.
- iOS proje ekleme ve web dosyalarını iOS'a eşitleme başarılı; altı yerel eklenti Swift Package Manager dosyasına eklendi.
- PrivacyInfo.xcprivacy Xcode Resources bölümünde tek kez kayıtlı. Plist ve açılış ekranı XML dosyaları ayrıştırılabiliyor.
- 1024 × 1024 ikon RGB ve opak; yayın ayarlarında uzak server.url yok.
- `npm audit --omit=dev` raporunda 0 bilinen güvenlik açığı. Bu, kontrol tarihindeki kayıtlı üretim bağımlılıklarıyla sınırlıdır.

## Tarayıcı kontrolleri

Codex'in Chromium tabanlı yerel tarayıcısı; Windows. Geliştirme ve üretim önizlemeleri açıldı.

- 320, 390, 768 ve 1440 piksel genişliklerde oyun yerleşimi gözlemlendi. Belge genişliği viewport'un kullanılabilir genişliğini aşmıyor.
- 320 piksel testte scrollbar sonrası kullanılabilir genişlik 305 px; taş hedefleri 44.5 × 44.5 px.
- Sürükleyerek üç taş temizleme: puan +90, bir hamle harcanması doğrulandı.
- Klavyede Enter ile üç taş seçme ve zinciri bitirme doğrulandı.
- Dokunarak bağlama modunda ilk bölüm tamamlandı: 1.320 puan, 7 hamle, 3 yıldız; ikinci bölüm açıldı ve oynanabildi.
- Sayfa yeniden açıldıktan sonra 90 puan/17 hamle ve tahta korundu.
- Ana ekran, günlük bulmaca, koleksiyon, bölüm haritası ve ayarlar açıldı.
- Hareket ayarı değiştirildi; gizlilik penceresi Escape ile kapatıldı.
- Üretim önizlemesinde tarayıcı console hata/uyarı kaydı görülmedi.
- Mobil ana ekran, mobil oyun ve geniş ekran oyun PNG'leri `screenshots/` içinde saklandı. Bunlar App Store cihaz ekran görüntüsü değildir.

## Çalıştırılmayan kontroller

- Mac/Xcode derlemesi, Swift derleme/bağlama, iOS simulator, fiziksel iPhone/iPad ve TestFlight.
- Yerel Preferences, Taptic Engine, iOS paylaşım sayfası ve native uygulama yaşam döngüsü cihaz üzerinde.
- VoiceOver, gerçek Safari/WKWebView, işletim sistemi metin boyutu, gerçek 200% zoom ve iPad çoklu görev.
- 30 bölümün insanlar tarafından zorluk, pil kullanımı ve uzun oturum performans ölçümleri.
- Apple imzalama/provisioning, App Store ad rezervasyonu, politika/destek sayfalarının yayına alınması ve inceleme gönderimi.

Gözlemlenen kontroller, kapsamlı erişilebilirlik sertifikası veya Apple onayı olarak yorumlanmamalıdır.

## Mobil tasarım revizyonu — 8 Ekim 2026

Kullanıcının daha canlı taşlar/efektler ve mobil görünüm isteği uygulandı. Bu bölüm son sürümün doğrulamasıdır; yukarıdaki ilk sürüm kaydı tarihsel kanıttır.

- Özgün beş SVG kristal yeniden çizildi; ana ekran, tahta ve koleksiyon aynı sprite bileşenini kullanır.
- Tahta seçimi, ışıklı zincir, parçacık, düşme ve özel güç katmanları kaynak dosyalarında uygulanır. Animasyonlar oyun sonuçlarını değiştirmez.
- Windows/Chromium önizlemesinde 320×740, 375×667, 390×844 ve 430×932 boyutları kontrol edildi. Oyun ekranında yatay taşma yok. 375×667 ekranda belge yüksekliği 667 px; araçların altı 659 px, taş hedefi 49 px. 320 genişlikte taş hedefi yaklaşık 48 px.
- 1440×900 boyutta uygulama 500 px mobil sütun olarak ortalanır; yatay taşma yok. Oyun sırasında üst marka ve alt gezinme gizlenir.
- Klavyeyle altı taş seçilip zincir bitirildi: +180 puan, bir hamle ve 3× Nova. O anda 36 renkli parçacık ve yedi düşen taş katmanı DOM'da gözlendi; düşme animasyonu `gem-fall` olarak çalışıyordu.
- Gerçek sürükleme ile üç taş temizlendi: +90 puan ve bir hamle.
- Hareket azaltma açıkken hero/düşme animasyonları `none`, parçacıklar gizli. Üç taşlık hamle yine +90 puan ve bir hamleyle tamamlandı. Canlı hareket ayarı test sonunda geri açıldı.
- Yeniden yüklemede 990 puan/9 hamle, hedefler ve Nova korundu. Koleksiyon ve bölüm haritası dar ekranda açıldı; yatay taşma görülmedi.
- TypeScript + web derlemesi, 20 oyun/kayıt testi, iOS dosya eşitlemesi ve yayın kaynak kontrolü başarılı. Konsol hata/uyarı kaydı yok.
- Son mobil ana ekran/oyun görüntüleri `screenshots/mobile-home.png` ve `screenshots/mobile-game.png`; seçili zincir `screenshots/mobile-chain-v2.png`. Görseller tarayıcı önizlemesidir.

Bu revizyonda gerçek iPhone/WKWebView, VoiceOver, işletim sistemi büyütülmüş metin ve 200% tarayıcı zoom testi yapılmadı. Xcode derlemesi/imzalama/TestFlight kontrolleri Mac ve geliştirici hesabında devam eder. Lazer/Nova efekt kodları var; bu revizyonun tarayıcı oturumunda Nova oluşturma test edildi, güç taşını tekrar zincire alarak lazer/Nova dalgası tetikleme ayrıca gözlemlenmedi. Pil ve uzun oturum performansı cihaz üzerinde ölçülmedi.


## Çekirdek denemesi — 8 Ekim 2026

Bu bölüm son tasarım ve oynanış denemesinin kontrolüdür. Kullanıcının son yönlendirmesi: önce yapı değerlendirilecek; yayın adımları sonraya bırakılacak.

- Beş çekirdek sprite'ı, dört yönlü akış, alan rezonansı, yeni diyar adları ve ilk beş öğretici bölüm uygulandı.
- TypeScript ve üretim web derlemesi başarılı. 29 oyun/kayıt testi geçti; yeni testler dört yönlü sıkıştırma, sabit mühür bariyerleri, ters zincir, alanın içindeki farklı renkler, uzaktaki aynı rengin korunması, kesişen halka reddi, akış kayıt devamı, yön/halka kazanma koşulları ve ilk beş kısa çözümü kapsar.
- Ayrı 4174 önizlemesi ile kullanıcı önizlemesinin ilerlemesi korunarak test yapıldı. İlk üç bölüm klavye zincirleriyle kazanıldı: 180/240/240 puan. Sağ, sol ve yukarı yön önizlemeleri, hedef tamamlanması, birer hamle harcama ve yönlü taş gelişleri görüldü.
- Sağ akış sırasında DOM'da 18 parçacık ve dört hareketli taş katmanı görüldü; core-arrive yatay negatif başlangıç konumuyla çalışıyordu. Yukarı akışta --drop-y:220% ile alttan gelen taş gözlendi.
- Rezonans bölümünde sekiz Eter ve içerideki Güneş parladı; uzaktaki Eter parlamadı. Dokuz taşlık halka/alan hamlesi 540 puan kazandırdı ve halka hedefini tamamladı.
- 320×740: hücre 46.33px; 375×667: 45.16px; 390×844: 53.83px; 430×932: 60.5px. Bu boyutlarda belge viewport genişliğini ve yüksekliğini aşmadı; araçlar alt kenardan 10px içerideydi. Son görünüm 390×844 bırakıldı.
- İlk bölüm yıldızları ve ikinci bölüm oturumu yeniden yüklemede korundu. Ayrı core kayıt anahtarı, önceki sürüm anahtarını kullanmaz.
- Yerel dağıtım dosyaları mevcut kaynakla eşitlendi; ikon/launch teması güncellendi. Kaynak yapılandırma kontrolü geçti. Bu, Xcode veya fiziksel cihaz testi değildir.
- Son görseller: screenshots/core-home.png, core-game.png, core-chain.png ve core-resonance.png. Bunlar Chromium tarayıcı önizlemesi; App Store cihaz görüntüsü değildir.
- Bu revizyonun geri dönüş yedeği ve ayrı kopyada geri alma kanıtı, projenin yanındaki rollback-before-core-2026-10-08 klasöründedir.

Bu denemede VoiceOver, gerçek Safari/WKWebView, iOS metin büyütme, 200% zoom, gerçek cihaz pil/performance ve native eklenti davranışları kontrol edilmedi. Hareket azaltma CSS kapsamı korunmuştur; bu son Çekirdek oturumunda ayar ayrıca yeniden test edilmedi. Xcode, imzalama, TestFlight ve mağaza gönderimi yapılmadı.

