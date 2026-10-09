# Resimsiz yumuşak parıltı — 1.2.3

8 Ekim 2026. Kullanıcının son tercihi doğrultusunda resimli vadi teması
kaldırıldı. `src/soft-glow.css` son tema katmanıdır; eski `src/valley.css`
ve yayınlanan `public/worlds/sunlit-valley.webp` kaldırıldı. Ana zemin, hero
ve üç harita diyârı yalnızca CSS renk geçişlerinden oluşur. Taş sprite'ları
korunur. Branding içindeki eski prompt ve önceki raporlar geçmiş karardır.

Açık krem zemin, statik geniş mint / inci ışık geçişleri; yüzeylerde ince
beyaz iç kenar ve düşük opaklıklı yumuşak gölge. Ana eylemler açık mint ve
koyu yeşil yazılıdır. Devre dışı, hover, aktif ve focus-visible durumları
ayrıdır. Tehlikeli eylem açık pembe ve koyu kırmızı yazıyla ayrılır.

Tahta genişliği, hücre padding/gap, SVG insets ve çizgi/taş katmanları
korunur. Hücre/grid'e transform, filter veya yeni stacking context eklenmez.
Diyarlar mint, açık turkuaz ve inci leylak çerçeve tonlarıyla ayrılır.
Kurallar, kayıt ve etkileşimler değişmez. Yeni sürekli animasyon yok;
boşta hero hareketi ve seçilmemiş Nova dönüşü kapalı kalır.

Kaynak doğrulaması: runtime CSS içinde resim URL referansı kalmaz. Üretim
paketlemesi mevcut 44 testi, TypeScript/Vite derlemesini, Capacitor iOS
senkronizasyonunu, native kaynak yapılandırmasını ve yayın kontrolünü içerir.

Control-browser bu ortamda bulunmadığı için tarayıcı görsel doğrulaması
ve fiziksel iPhone testi yapılmadı. Pil / FPS tüketimi ölçülmedi.
