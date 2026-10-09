# Çoklu patlama ve zincir enerjisi — 1.1.1

8 Ekim 2026. Önceki yayın kaynağı: `4ea51fffb5cc348c79512632c22e892970509397`. Önceki Sites sürümü: `appgprj_6ac71833016c8191ae3a4eaf310a59e2~appgver_4ad370147f708191871e4c46c3a55565`.

## Kaynakta görülen nedenler

Her taş dört kopya WebP ve clip-path ile çiziliyordu; patlama hayaleti de aynı dört görüntüyü çoğaltıyordu. Altı parçacık her temizlenen taş için sınırsız olarak çoğalıyordu. Yeni grid patlamayla aynı anda yerleştiriliyor, tüm yeni taşlar yalnızca iki hücrelik aynı giriş ofsetini kullanıyor ve 560 ms sonra animasyon olayı beklenmeden kilit kaldırılıyordu. Bu noktalar cihaz takılması için olası etkenlerdir; iPhone FPS veya profiler kaydı alınmadı.

## Uygulanan

- Mevcut taş sanatı tek görüntü ve memo ile çizilir; 36 taşın temel görüntü katmanı 144 yerine 36 olur. Patlama görseli sprite kopyalamaz.
- En fazla 72 kırıntı; aynı satır/sütun güç çizgisi bir kez çizilir, büyük güç zincirleri sekiz ana güç efektiyle sınırlandırılır. Puan/temizleme hesabı sınırlanmaz.
- MoveTimeline: temizleme → düşüş → yerleşme. Tüm hareket eden taşların animationend olayları tamamlanınca hamle açılır; en uzun düşüş +120 ms emniyet zamanlayıcısı eksik olay durumunu kapatır.
- Yeni taşlar açık sütun bölmelerinin üstünde ayrı giriş yuvalarından gelir; mühürler hareket etmez. Hücre aralığı commit başında ölçülür. Hücre adımı başına 110% tahmini kaldırıldı.
- Mantıksal oturum anında tamamlanır; animasyon geçici bir sunumdur. Arka plan, gezinme ve modal kesintisinde sunum tamamlanır. Yeniden başlatma eski zamanlayıcıları iptal eder.
- Hareket sırasında otomatik kayıt ertelenir, arka plana geçiş yine anında kayıt ister. Kayıt anahtarı ve kurallar değişmez.
- Kavisli enerji şeridi, çift örgü, en fazla üç akan ışık taneciği, baş yıldızı ve kavşak halkaları. Uzunluk arttıkça kalınlık ve ışık yoğunluğu artar; 4/6/9 taş ve halka ses/görsel eşiklere sahiptir. Nova ve halka tek merkez dalgası kullanır.
- İşletim sistemi veya oyun ayarındaki azaltılmış hareket, CSS olaylarına gerek olmadan hemen yerleşir. Statik yol, puan ve metin geri bildirimi korunur.

## Çalıştırılan kontroller

`npm test`: 42/42 geçti. Yeni kontroller temizleme/düşüş sırasını, eksik ve yinelenen animasyon olaylarını, eski hamleden kalan olayları, arka plan kesintisini, azaltılmış hareketi, 1.000 ardışık sunumda zamanlayıcı temizliğini, ayrı yeni taş girişlerini, mühür bölmelerini ve parçacık/görüntü bütçesini doğrular. Mevcut 30 bölüm, halka, özel güç ve kayıt testleri de geçti.

`npm run typecheck` ve `git diff --check` geçti. SVG bileşeni statik olarak çizilerek bağlantı şekilleri kontrol edildi; bu çizimde raster taş resimleri görünmediği için yalnızca yol geometrisi görsel olarak incelendi. Kullanıcı için built-in imagegen ile iki ekranlı tasarım konsepti üretildi; bu görüntü uygulama ekranı veya hareket testi değildir.

Sites paketleme adımı web derlemesini, Capacitor iOS varlık eşitlemesini ve mevcut release kontrolünü çalıştırır.

## Yapılmayan

Managed Linux ortamında control-browser becerisi yok; tarayıcı dev sunucusu başlatılmadı. Gerçek iPhone/Xcode, FPS profilleme, VoiceOver ve hareketin ekranda oynatılması test edilmedi. Kaynak ve zamanlama testleri fiziksel cihazdaki akıcılığın ölçümü değildir.
