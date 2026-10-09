# Gemblast Saga 1.2.3 — İyileştirme incelemesi

## Kapsam ve yöntem

8 Ekim 2026. Kaynak incelemesi; commit d24e5b4, App, FlowIndicator,
chainEnergy, GemEffects, bölüm tanımları, paylaşım ve güncel soft-glow CSS.
Kullanıcının açık, resimsiz, soft parıltılı arayüz; büyük tahta; belirgin
çekirdekler; keskin çizgi ve taşların arkasında çizim tercihleri korunur.
Bu tur ürün dosyaları değiştirilmedi ve yayın yapılmadı.

Öncelik, ilk oyun deneyimi ve hamlenin sonucunu anlamaktır. Yeni görsel tema
yerine öğretim, modla uyumlu geri bildirim, bölüm çeşitliliği ve sonuç paylaşımı
üzerinde çalışmak daha somut bir sonraki adımdır; etki oyun testiyle ölçülmelidir.

## Korunacaklar

- Resimsiz açık zemin ve sabit soft parıltı.
- Tahta genişliği, farklı taş siluetleri ve renkleri.
- Sabit aşağı dolum, aynı renk dalgası ve keskin enerji çizgisi.
- Mevcut güç önizlemesi, sınırlı parçacık bütçesi, azaltılmış hareket yolu.

Eski checkup GB-01 / GB-02 güncel davranışı anlatmıyor: sabit aşağı dolum ve
farklı sprite siluetleri uygulanmış. GB-03'teki ilk beş bölümden sonra tamamen
şablon varsayımı da eskimiş; şimdi ilk on karşılaşma yazılmıştır. Güncel tekrar
11–30 arasındaki aynı on karşılaşmanın artırılmış hedeflerle kullanılmasıdır.

## Sınırlı puanlama

| Boyut | Puan | Kaynak dayanağı |
| --- | --- | --- |
| İstekle uyum | 3/4 | soft-glow CSS ve sahne varlığının kaldırılması; görsel cihaz kontrolü yok. |
| Öğretim / geri bildirim | 2/4 | İlk girişte beş kural birlikte; üç taş yönergesi dokunma modunu dikkate almıyor. |
| Bölüm çeşitliliği | 2/4 | On karşılaşma üç diyarda hedef artışlarıyla tekrar ediyor. |
| Paylaşılabilir sonuç | 2/4 | Paylaşım metinle sınırlı; tekrar oynama bağlantısı yok. |

Görsel okunabilirlik, performans hissi, dokunma ve erişilebilirliğe çalışma
zamanı puanı verilmedi. Kaynak incelemesi bu özellikleri doğrulamaz.

## Bulgular

| ID | Önem | Alan | Konum / kanıt | Mevcut davranış | Önerilen düzeltme | Etki |
| --- | --- | --- | --- | --- | --- | --- |
| GR-01 | MEDIUM | Yönerge | src/components/FlowIndicator.tsx:4–7; src/App.tsx:323,362 | Üç taş seçildiğinde iki giriş modunda da “Bırak, patlat” yazıyor; bileşen giriş modunu almıyor. | Dokunma modunda “Patlat'a dokun”, sürüklemede “Bırak, patlat”; güç ve etkilenen taş sayısını tek tutarlı durum alanında grupla. | Yapılması gereken eylem doğru anlaşılır. |
| GR-02 | MEDIUM | İlk deneyim | src/App.tsx:207–208,369 | İlk girişte bir modal içinde beş kural gösteriliyor; örnek zincir statik. | İlk hamlede üç taşı, dördüncü bölümde halka kapatmayı tahta üzerinde adım adım göster. Atla ve yeniden gör seçenekleriyle normal oyuna dön. | Kurallar okuma yerine uygulamayla öğrenilir. |
| GR-03 | MEDIUM | Bölümler | src/types/game.ts:140–164 | 11–30, aynı karşılaşma hedef ve hamle artışlarıyla üretiliyor; mühür konumları tekrar. | Önce 11–20'ye elle düzenlenmiş mühür yerleri ve farklı halka/güç kombinasyonları; başarısızlık ve kalan hamle ölçümüyle dengele. | Yeni diyar yeni bir karar sunar. |
| GR-04 | LOW | Ana ekran bağlamı | src/App.tsx:268–269 | Devam bölüm numarası kayıtlı oturumdan, diyar adı ise unlocked üzerinden alınır. Önceki diyara dönülmüş oturumda farklı diyar adı çıkabilir. | Başlık ve diyarı aynı devam edilecek stageId üzerinden türet. | Devam ekranı tutarlı olur. |
| GR-05 | LOW | Paylaşım | src/App.tsx:219–225; src/utils/native.ts:28–40 | Skor metni paylaşılır; oyun bağlantısı veya görsel kart yok. | Sonuçtan taş kimliğini taşıyan kompakt görsel skor kartı ve açılabilir oyun bağlantısı oluştur. Aynı günlük seed ile arkadaş denemesi ikinci aşama. | Paylaşım oyuna ulaşılabilir bir davet olur; viral sonuç garantisi değildir. |

## Öncelik

Şimdi: GR-01, ilk etkileşimli öğretim ve gerçek telefonda çoklu patlama kontrolü.
Sonra: GR-03 bölüm düzenlemesi; GR-04 küçük tutarlılık düzeltmesi.
Daha sonra: GR-05 paylaşım kartı ve günlük aynı bulmaca meydan okuması.

İsteğe bağlı görsel tercih: oyun araçlarında İpucu / Karıştır öne çıkarılabilir;
Yeniden / Paylaş ikincil menüye alınabilir. Mevcut beşli sıranın hatalı veya
ulaşılamaz olduğu kaynakla kanıtlanmadı. Tahta küçültülmeden cihazda denenmeli.
Uzun zincirler için mevcut tier efektlerine kısa, ayrı başarı vurgusu
verilebilir; yeni kural eklemek veya boşta sürekli efekt çalıştırmak gerekmez.

## Doğrulama açıkları

- Bu tur kaynak incelendi; ürün değişmediğinden testler tekrar çalıştırılmadı.
  Aynı commit önceki yayında 44 test ve üretim derlemesini geçti.
- Control-browser mevcut değil. Yeni temanın görüntüsü, 320–430px reflow,
  200% zoom, dokunma, klavye ve VoiceOver denenmedi.
- Kullanıcının daha önce belirttiği çoklu patlama takılması güncel sürümde
  yeniden gözlenmedi. Mevcut timeline testleri gerçek iPhone kare sürelerinin
  kanıtı değildir. Seri halkalar ve arka plana gidip dönme ile cihazda ölçülmeli.
- İlk on bölümün zorluk dengesi ve oyuna geri dönme oranları bilinmiyor.
- Soft parıltı ve animasyonların pil / ısı etkisi ölçülmedi.

## İncelenip önerilmeyenler

Yeni arka plan resimleri kullanıcının son tercihine aykırı. Daha çok sürekli
parçacık veya tüm taşları boşta hareketlendirmek için bir ihtiyaç yok. Önceki
raporun dört yönlü yerçekimi önerisini yeniden uygulamak güncel tercihi bozar.

## Karar

Kaynakla sınırlı inceleme: **Needs changes**. GR-01–03 öncelikli; görsel ve
performans sonucu gerçek cihaz doğrulamasına bağlıdır.
