# Harmony 1.1 — doğrulama, 8 Ekim 2026

## Yapılan değişiklikler

- Ana oyunun dolum yönü aşağı sabitlendi; yön görevleri kaldırıldı.
- Başlangıca dönen kesişmesiz halka tüm tahtadaki aynı renk açık taşları toplar. Farklı renkler ancak tetiklenen özel güçlerden etkilenir.
- Taşlar beş ayrı SVG siluetine dönüştürüldü. Aynı bileşen tahta, ana ekran, hedefler, yardım ve koleksiyonda kullanılır.
- Seçim önizlemesi, oyun çözümüyle aynı saf temizleme hesabını kullanır. Uzaktaki halka taşları ve zincirleme özel güçler önceden vurgulanır; güç göstergesi zincir uzunluğuyla güncellenir.
- İlk 10 karşılaşma için ayrı görev tanımları; mühür açma ve özel güç etkinleştirme sayacı. 30 bölüm korunur.
- Ana ekranda sıradaki durak, isimli bölüm haritası, seçilebilir taş koleksiyonu, hedef tamamlanma ve zafer animasyonları.
- Yeni kayıt anahtarı eski tamamlanmış ilerlemeyi aktarır; eski aktif oyunları kullanmaz. Eski kayıt değişmez.

## Çalıştırılan kontroller

- `npm test`: 32 oyun/kayıt testi geçti. 30 bölüm için 100'er başlangıç tohumu, toplam 3.000 başlangıç tahtasının oynanabilirliği kontrol edildi.
- Testler; sabit aşağı dolum, uzak aynı renk taşların temizlenmesi, diğer iç renklerin korunması, mühürler, özel güç zincirleri, önizleme/hamle eşitliği, kazanma hedefleri, eski ilerlemenin aktarımı ve ilk beş öğreticinin kısa çözümünü kapsar.
- `npm run typecheck`: başarılı.
- Sites `build-site.mjs`: üretim web derlemesi başarılı.
- `npx cap sync ios`: paketlenmiş web dosyaları ve altı yerel eklenti eşitlendi.
- `node scripts/configure-ios.mjs`: sürüm 1.1.0, ikon/açılış/gizlilik kaynakları uygulandı.
- `node scripts/check-release.mjs`: kaynak yapılandırması geçti.
- React sunucu çizimiyle beş SVG silueti dışa alınıp Sharp ile PNG'ye çevrildi; dış hat, facet, gradient ve clip katmanları görsel olarak incelendi. Bu, uygulama ekranı veya tarayıcı testi değildir.
- `git diff --check`: başarılı.

## Açık doğrulamalar

Managed Linux'ta `control-browser` becerisi bulunmadığından önizleme sunucusu veya tarayıcı kurulumu başlatılmadı. Canlı tarayıcı, sürükleme/dokunma, dar ekran yeniden akış, 200% zoom, odak, gerçek azaltılmış hareket ve ekran okuyucu kontrolleri yapılmadı. Gerçek iPhone/WKWebView, Xcode imzalama/derleme ve TestFlight bu ortamda çalıştırılmadı. Bölüm zorluğu ve uzun oturum eğlencesi otomatik kurallar testinden çıkarılamaz; oyuncu testi gerekir.

Geri dönüş kaydı: `.design/rollback-before-harmony-2026-10-08.md`. Kaynak doğrulaması, cihaz veya mağaza uygunluğu onayı değildir.
