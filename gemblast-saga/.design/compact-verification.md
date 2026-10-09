# Tahta öncelikli kompakt atölye — 1.2.1

8 Ekim 2026. Kullanıcı açık temayı beğendi; daha özgün görünüm, kompakt içerik
ve daha büyük bir oyun tahtası istedi. Site kimliği, audience, oyun kuralları,
kayıt formatı ve sprite varlıkları korunur.

## Uygulanan değişiklik

- Tahta genişliği yükseklikten çıkarılan 440/374px değerine bağlı değildir.
  Uygulama sütununun genişliği, 6px yan padding ve 486px üst sınır kullanılır.
  Taşları küçültmemek için kısa ekranlarda belge dikey kayabilir.
- Tahta/grid padding, gap ve SVG insets her boyutta tek değer kümesine
  getirildi: 6px / 4px / 3px ve 11px. Bağlantı miter köşeleri ve hücre zemini
  < bağlantı < taş < efekt sıralaması korunur.
- Puan ve hamle tek kısa şeritte; hedefler 34px. Bölüm açıklaması doğal
  details/summary ile isteğe bağlı açılır. Başlık kaybolmaz; görev hedefleri
  daima görünür. Etki/güç göstergesi üstte devam eder.
- Araçlar beşli tek sırada: sürükleme/dokunma, ipucu, karıştırma, yeniden,
  paylaşma. Patlat düğmesi daima aynı satırda; üç taş tamamlanana dek devre
  dışı. Klavyeyle taş seçtikten sonra Tab ile bu düğmeye erişilebilir; sırf
  dokunma modu kapalı diye gizlenmez. Var olan yeniden başlama onayı sürer.
- Ana hero yan yana metin/sprite kompozisyonudur; birincil eylem hemen altında.
  Günlük ve serbest girişler yan yana; yolculuk panelinde tekrarlanan büyük
  sayı/açıklama kaldırıldı. Harita, koleksiyon ve ayar boşlukları azaltıldı.
- Yüzeyler açık krem/mint; kesik köşe ritmi taş yuvaları ve gezinmeye taşınır.
  Ek bağımlılık, görsel dosya, animasyon veya görüntü katmanı yoktur.

## Kaynak hesabı; cihaz ölçümü değildir

375px uygulama sütununda sınırlar/padding sonrası tahta yaklaşık 361px olur.
Önceki 375×667 örneğinde yüksekliğe bağlı sınır 293px idi. Yeni hücre yaklaşık
54,3px, eski yaklaşık 45,2px. 320px sütunda yeni hücre yaklaşık 45,2px. Bunlar
CSS kutu modelinden çıkarımdır; canlı Safari ekranı veya target-size ölçümü
olarak sunulmaz. Safe-area ve uzun açıklama board genişliğini değiştirmez;
dikey belge boyunu artırabilir.

## Doğrulama

TypeScript ve 44 otomatik test ilk uygulama geçişinde başarılı. Son Patlat
görünürlüğü düzeltmesinden sonra paketleme akışında testler ve üretim derlemesi
tekrar çalıştırılır. Mevcut testler gerçek timeline constructor açılışı,
animasyon olayları/fallback, çoklu hamleler, azaltılmış hareket, aşağı dolum,
halka, mühür, güç, ilerleme ve başlangıç tahtalarını kapsar. Oyunun hesaplama
motoru değiştirilmedi. Native iOS dosyaları yayın kaynağıyla eşitlenir.

Bu ortamda control-browser yok. Tarayıcı önizlemesi, 200% zoom, gerçek dokunma,
klavye/focus akışı, Safari/WKWebView, VoiceOver, cihaz görüntüsü ve FPS testi
yapılmadı. CSS ve erişilebilir kontrol semantiği kaynak üzerinden incelendi;
bu, cihaz doğrulamasının yerine geçmez. Eski ekran görüntüleri yeni görünümü
temsil etmez.
