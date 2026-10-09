# Oynayarak öğren ve zincir hissi — 1.3.0

8 Ekim 2026. Kullanıcı 1.2.3'te akıcılığı kontrol etti, kasma/donma olmadığını
bildirdi. Bu sürümde mevcut MoveTimeline, düşüş geometrisi ve input kilidi
süreleri değiştirilmedi. Yeni efektler oynanışın bitmesini bekleten olaylara
bağlanmaz. Önceki kullanıcının cihaz gözlemi yeni sürüm testi değildir.

## Uygulama

- Tekrar: ilk macera başlangıçları öğretim seed/dizilimini korur. Yeniden veya
  bitmiş bölümü haritadan tekrar açmak yeni seed, farklı taş renk/special
  dizilimi verir. Günlük bulmaca kendi tarihini ve seed'ini korur; ertesi gün
  ana giriş bugünün bulmacasını açar. Devam et mevcut session'ı değiştirmez.
  Yeni deneme puan/hamle/shuffle bütçesini sıfırlar; yıldız ve rekorları silmez.
  Halka hedefli yeni denemeye rastgele açık bir 2×2 hedef renk halkası eklenir.
- Öğretim: ilk girişte üç numaralı taşla bağlama; bölüm 4'te 4 taş ve başlangıca
  dönüş. Öneri gerçek tahtadan salt okunur, sınırlı aramayla bulunur. Oyuncu
  farklı geçerli zincirle de öğrenebilir. Link geçerli hamlede, halka ise
  kapalı halka hamlesinde tamamlanır. Atla ve yeniden öğrenme vardır.
  Güncel öğretim simgeleri aynı board/grid stacking düzenini kullanır.
- Ses / ışık: 4, 5, 6, 9 ve halka için kısa ayrışan charge sesleri ve tahta
  kenar ışığı. Tek seçimde geri dönüp aynı eşiği geçmek yeniden ses çıkarmaz.
  Güç yazısı mevcut FlowIndicator içinde; ek toast tahtayı örtmez. Halka
  patlaması çizilen keskin yolu kısa SVG iziyle vurgular. Nova geniş dalgası,
  normal kısa parçacıklar, bir sprite/hücre ve <=72 shard sınırı korunur.
  Boşta yeni efekt yok. Ses ayarı ve azaltılmış hareket kuralları geçerlidir.
- Kontroller: 4 geniş araç — Dokun/Sürükle, İpucu, Karıştır, Diğer. Yeniden,
  Paylaş, alıştırmalar ve tam kurallar Diğer içindeki native modalde.
  Patlat sabit durum satırında. Dokunma modunda Patlat'a dokun yönergesi;
  keyboard / programmatic click dokunma moduna geçer. Native dialog Escape,
  focus containment ve eski odağı geri verme davranışı korunur.
- Devam ana ekranının bölüm numarası ve diyar adı aynı oturuma bağlandı.

## Doğrulama

TypeScript kontrolü ve git diff --check başarılı. Mevcut 44 teste 7 davranış
testi eklendi; toplam 51 test başarılı. Testler 30 bölüm × 20 seed tekrar
başlangıcını, mühür yerlerini / hedefleri, her halka hedefinde geçerli halkayı,
oynanabilir tahtayı, sıfır-turn tekrarın da farklı olmasını, günlük sabitliğini,
gün değişimini, kayıt sonrası gelecek RNG'yi, salt okunur öğretim aramasını,
dokunma/sürükleme yönergelerini ve açık zincirin halka gibi gösterilmemesini
kapsar. Mevcut 1000 çoklu hamle timer ve reduced-motion timeline testleri sürer.

Paketleme üretim TypeScript/Vite derlemesi, iOS kaynak senkronizasyonu ve native
yayın kaynak kontrolünü içerir. UI / effect değişiklikleri motor hedeflerini,
hamle hesabını ve kayıt ruleset'ini değiştirmez. Opsiyonel loopTutorialSeen
eski kayıtlarda yoksa görülmemiş sayılır; eski ilerleme korunur.

## Sınırlar

Managed ortamda control-browser yok; yeni tema / öğretim / menü / ses browser
ve fiziksel iPhone üzerinden gözlenmedi. 320px, zoom, gerçek dokunma, VoiceOver,
ses algısı, ısı ve FPS doğrulaması açık. Xcode archive/signing testi yapılmadı.
