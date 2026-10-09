## Güncel yön — Yaşayan ilerleme haritası, web 1.8.0

9 Ekim 2026: Kullanıcı Candy Crush benzeri mekânsal ilerleme haritası istedi,
metin ağırlıklı ilerlemeyi yüzeysel buldu; Keşfet sekmesinin gereğini sorguladı.
Keşfet ve Macera birleştirildi: açılış ve oyun sonrası dönüş Macera haritası.
Üç diyar, kıvrımlı yol üzerindeki 30 büyük durak, yıldız/kilit/hikâye işaretleri,
mevcut konuma ve diyara kaydırma, bölüm hedefleri önizlemesi. Günlük ve Serbest
üstte; Lig/Koleksiyon/Ayarlar ayrı sekmelerde kalır. Köz fenerleri, Gelgit suyu,
Eter takımyıldızı gerçek sıralı zaferlere göre canlanır; geçitler 10/20/30’da açılır.
Hikâyeler mevcut kilit denetimini, final 30 zafer + 7 yankı koşulunu kullanır.
Aktif eski kampanya denemesinin önizlemesi kendi hedeflerini gösterir.
Resimsiz vektör arazi, kalıcı ışık; boşta sürekli animasyon/timer yok. Mevcut
kayıtlar, gem setleri, tahta ölçüsü, aşağı yerçekimi, keskin arka çizgi korunur.
Eski raporlardaki açık tema, yerçekimi ve öğretim bulguları güncel durumu
anlatmıyor; mevcut kullanıcı yönü ve çözülmüş kod davranışı öncelikli.
Yalnızca web güncellenecek; native sync/build/sürüm veya iOS ZIP yapılmayacak.

# Gemblast Saga — Güncel ürün ve tasarım kararı

## Güncel yön — Rezonans mabedi, 1.7.0
9 Ekim 2026: Kullanıcı ferah/soft arayüz tercihinden vazgeçti; ürünün tamamen
oyun teması taşımasını istedi. Petrol taş yüzeyler, altın çerçeveler, renkli
enerji taşları ve diyar kimlikleriyle fantastik bir mabet yönü. Köz altın,
Gelgit turkuaz, Eter ametist. Ana ekran diyar/bölüm/mabet/oyna kompozisyonudur.
Aşağıdaki açık ferah yönler tarihsel kararlardır; bu bölüm onları geçersiz kılar.
Büyük tahta, keskin arka çizgi, aşağı dolum, renk halkası, taş seçenekleri,
öykü/yankı ve kayıtlar sürer. Arka plana raster resim ve yeni sürekli döngü
eklenmez. Hikâye SVG sahneleri de taş/ışık diliyle eşleşir.
Kullanıcı: Önce oyunu bitir, yalnızca ben istediğimde iOS paketini hazırla.
Bu tur web kaynağı ve web yayını; Capacitor sync, native sürüm/yapı değişimi
ve ZIP/iOS teslimi yapılmaz. Eski iOS kaynak paketi 1.6.1 olarak kalır.


## Güncel düzeltme — Önceki gövdeler, ayrı merkezler, 1.4.2

8 Ekim 2026: Kullanıcı soft elementlere geçme isteğini geri çekti; önceki
kalpli taşların görünümünü koruyup ortak kalp motifini değiştirmeyi istedi.
Referanslar `public/cores/airy-{color}.webp`: üç loblu kırmızı, mavi damla,
ışınlı altın güneş, çapraz yeşil yaprak, uzun mor altıgen. Yalnızca merkezdeki
kalp alev / damla / yıldız / yaprak / kristal ile değiştirilir. Soft şekiller ve
1.4.1'in yoğun fasetli yeni gövdeleri bu seçimi temsil etmez.

Yeni ürün yolları `public/cores/motif-{color}.webp`; 512px şeffaf WebP.
Referans ve üretim promptları `branding/motif-core-art-prompts.json` içinde.
Oyun kuralları, tahta, mevcut parıltılı açık tema, lig ve ilerleme korunur.
Koleksiyon ve erişilebilir adlardaki simgeler bu merkezlerle eşleşir.
Görsel doğrulama varlık temasına dayalıdır; gerçek telefon testi yapılmadı.

## Güncel taş yönü — Beş ayrı simge, 1.4.1

8 Ekim 2026: Kullanıcı beş taşın merkezindeki ortak kalp motifini sorguladı.
Tek karede gösterilen alev / damla / yıldız / yaprak / kristal tasarımını
onayladı. Onaylanan görselden beş ayrı şeffaf sprite built-in imagegen ile
çıkarılır; doygun ve parlak kristal görünümü, farklı dış hatlar korunur.
Yeni dağıtım yolları `public/cores/element-{color}.webp`, 512px alpha WebP.
Promptlar `branding/element-core-art-prompts.json` içinde saklanır.

Köz / Gelgit / Güneş / Eter / Yaşam adları ve renk kimlikleri korunur;
koleksiyon ve tahta erişilebilir adları yeni simgeleri belirtir. Seçim
parıltısı merkezi beyazlatmak yerine çevrede hafif bir hale olarak gösterilir;
azaltılmış hareket tercihi korunur. Boşta yeni sürekli hareket eklenmez.
Oyunun kuralları, skor hesabı, günlük seed, lig, kayıt ve tahta ölçüsü aynı kalır.

Şeffaf kenarlar ve simgeler 44px / 120px varlık temasında incelenir.
Gerçek iPhone ve desteklenen tarayıcı görsel testi bu ortamda yapılamadı.
Önceki kalpli varlıklar tarihi geri dönüş içindir; ürün yeni yolları kullanır.

## Güncel yön — Oynayarak öğren, zincir hissi, 1.3.0

8 Ekim 2026: Kullanıcı mevcut sürümde kasma/donma olmadığını doğruladı;
2, 3 ve 5 numaralı önerileri uygulamayı istedi. Açık resimsiz soft parıltılı
arayüz, büyük tahta ve keskin arka bağlantı korunur. Kaynakta ilk bölümlerin
sabit öğretim seed ve dizilimleri bulundu. Yeniden / bitmiş bölümü tekrar
oynama artık yeni taş dizilimi verir; günlük bulmaca aynı gün sabit kalır.
Devam et kayıtlı tahtayı aynen açar. İlk öğretim başlangıçları korunur.

İlk girişte modal yerine tahta üzerinde numaralı üç taş; bölüm 4'te halkayı
kapatma alıştırması gösterilir. Atla ve Diğer menüsünden yeniden öğrenme vardır.
Zincirde 4 / 5 / 6 / 9 taş ve halka kısa, farklı ses ve kenar ışığıyla
vurgulanır; eşik geri gidip yeniden geçilince aynı seçimde ses tekrarlanmaz.
İpucu ve Karıştır ana araç sırasında; Yeniden / Paylaş ikincil Diğer menüsünde.

Kullanıcının akıcılık gözlemi önceki sürüme aittir. Bu değişikliğin cihazdaki
ses/görsel/dokunma doğrulaması açık; mevcut timeline süreleri değiştirilmedi.
Doğrulama kaydı `.design/experience-verification.md`.

## Güncel yön — Resimsiz yumuşak parıltı, 1.2.3

8 Ekim 2026: Kullanıcı arka planda resim istemedi; zemin ve butonlarda soft
parıltı istedi. Önceki vadi yönü terk edildi. Ana ekran ve harita dahil bütün
arka plan resmi referansları ve yayınlanan sahne varlığı kaldırılır. Açık krem
zemin üzerindeki statik mint ve inci ışık geçişleri, yumuşak kenar ışığı ve
buton gölgeleri yeni yüzey dilidir. Ana eylemler açık mint / koyu yeşil yazıyla
ayrılır. Sert alt basamak gölgeleri kullanılmaz.

Büyük tahta, kompakt yerleşim, canlı ve farklı şekilli çekirdekler, keskin
çizginin taşların arkasında olması, kayıt ve oynanış korunur. Yeni sürekli
animasyon veya görsel varlık eklenmez. Ayrıntılar `.design/soft-glow-verification.md`.

## Güncel yön — Aydınlık fantastik vadi, 1.2.2

8 Ekim 2026: Kullanıcı kompakt açık temayı hâlâ düz/basit buldu; önceki
mesajında pil tüketimini sordu. Tema, güneşli fildişi teraslar, altın oyuklu
kemerler, yeşil adalar ve uzak şelaleler içeren bir dünya görseliyle zenginleşir.
Tahta, girintili taş yuvaları ve hacimli diyar çerçevesiyle bu dünyaya yerleşir.
Menü yüzeyleri ve eylemler ışık/gölge, iç kenar ve malzeme hissi taşır.

Üç diyarın tahta kenarı/tray tonları altın-mint, turkuaz ve açık ametist olarak
ayrılır. Büyük tahta ve kompakt düzen, kayıt, çekirdek görselleri ve kurallar
korunur. Arka plan tek statik WebP; yeni animasyon döngüsü yok. Ana ekran
taşlarının boşta sürekli yüzmesi durur; Nova halkası yalnızca seçili taşta döner.
Pil/FPS kazancı ölçülmüş değildir.

Üretim varlığı ve prompt: `branding/sunlit-valley-art.json`. Doğrulama sınırları:
`.design/valley-verification.md`.

## Güncel yön — Tahta öncelikli kompakt atölye, 1.2.1

8 Ekim 2026: Kullanıcı açık görünümü ve taşları beğendi; daha farklı bir tema,
kompakt/pratik içerik ve tema içinde daha büyük bir tahta istedi. Açık çekirdek
kimliği korunur; biçim dili kesik köşeli taş yuvaları, ince baskı noktaları ve
mint bir çerçeveyle belirginleşir. Yeni görsel varlık veya oyun kuralı eklenmez.

Tahtanın yüksekliğe bağlı genişlik sınırı kaldırılır; 6px yan boşlukla sütun
genişliğini kullanır. Çok kısa ekranda taş küçültmek yerine dikey kaydırma
vardır. Puan/hamle yatay, hedefler kısa; bölüm ipucu açılır kapanır. Bağlama
modu, ipucu, karıştırma, yeniden ve paylaşma beşli araç sırasında bulunur.
Patlat düğmesi sabit durum satırındadır; sürükleme, dokunma ve klavye yolları
korunur. Zincir seçerken düğme belirmesine bağlı yerleşim sıçraması önlenir.

Ana ekranın büyük dikey hero alanı metin/taş kompozisyonu yan yana olacak
şekilde kısalır. Günlük/serbest modlar yan yana kısa giriş; ilerleme tek kompakt
panel. Harita, koleksiyon ve ayar aralıkları aynı dilde sıkıştırılır. Mevcut
tasarım raporunun yerçekimi/halka bulguları eski kurala aittir; güncel aşağı
dolum ve aynı renk halka dalgası değiştirilmez.

Doğrulama ve sınırlar: `.design/compact-verification.md`.

## Güncel yön — Ferah çekirdekler, 1.2.0

8 Ekim 2026: Kullanıcı taş tasarımı, dokunma hissi ve zincir gücü geri bildirimini birlikte geliştirmeyi kabul etti; koyu arayüzü sevmediğini ve daha ferah bir görünüm istediğini belirtti. Açık krem, mint ve beyaz porselen yüzeyler bütün sayfalara uygulanır. Doygun renkli, içinden enerji akan beş çekirdek; üçgen, damla, güneş, uzun altıgen ve yaprak siluetleriyle ayrılır. Klasik elmas kesimli taş konsepti yerine çekirdek kimliği sürer.

Seçilen taş büyür, iç ışığı hareketlenir. Zincir uzadıkça ışık ve tahta kenarı güçlenir; son bağlantı taşı üretilecek kanal/Nova işaretini, üst satır etkilenecek taş sayısını gösterir. Güç eşikleri 4/5/6 taş ve halka olarak mevcut motorla uyumludur. Keskin bağlantı köşeleri ve çizginin taşların arkasında olması korunur. Yeni şarjlı taş oyun kuralı eklenmez; oynanış ve kayıt formatı değişmez.

Bir WebP/hücre, seçili taşlarda sınırlı ışık katmanı; giriş ve düşüş zamanlaması değişmez. iOS açılış yüzeyi ve durum çubuğu da açık temaya eşitlenir. Ayrıntılı varlık yolları ve üretim promptları `branding/airy-core-art-prompts.json`; doğrulama kapsamı `.design/airy-verification.md`.


## Keskin bağlantılar ve taş araştırması — 1.1.3

8 Ekim 2026: Kullanıcı çizgi dönüşlerinin keskin olmasını ve çizginin taşların
arkasında kalmasını istedi. Bağlantı tüm enerji seviyelerinde düz segmentlerle
ve miter birleşimleriyle çizilir. Hücre zemini, bağlantı, taş gövdesi ve patlama
katmanları bu sıradadır. Akış tanecikleri ve güç eşikleri korunur.

Yeni taş araştırması: parlak ve doygun renkli, büyük yüzeyli kristaller; mercan
üçgen, mavi damla, altın sekizgen, mor elmas, yeşil altıgen. Bu yön resimli
konsept olarak sunulur; mevcut WebP taşları bu bağlantı revizyonunda korunur.
Eski rapordaki yerçekimi ve halka önerileri güncel kurallarla zaten çözülmüştür;
taşların siluetlerinin benzemesi hakkındaki bulgu araştırmaya temel olur.

Tarayıcı/iPhone görsel doğrulaması bu ortamda yapılamadı.

## Güncel yön — Önceki görünüm, güncel kurallar

8 Ekim 2026: Kullanıcı Harmony görünümünü beğenmedi, önceki görünümü daha iyi buldu. Çekirdek WebP taşları, eski ana ekran, kompakt oyun arayüzü, numaralı bölüm haritası ve koleksiyon geri getirildi. Harmony CSS katmanı kaldırıldı. Sabit aşağı dolum, tüm tahtadaki aynı rengi temizleyen halka, canlı etki önizlemesi, yeni görevler ve kayıt sistemi korundu. İlerleme ve aktif oyunlar sıfırlanmaz. Yeni görsel tasarım denemeleri için bu eski görünüm temel alınır.

## Güncel hareket — Energy 1.1.1

Kullanıcı çoklu patlamada düşüşün takıldığını bildirdi; uzun zincirde daha zengin çizgi ve efekt istedi. Görsel değişikliklere ve gerekirse taş yenilemeye açık olduğunu ekledi, resimli önizleme istedi. Mevcut WebP çekirdek kimliği bu revizyonda korunur. Tek sprite, temizleme → düşüş → yeni hamle sırası, gerçek hücre aralıkları ve sınırlı parçacık sayısı kullanılır. Bağlantı eğri enerji şeridi, örgü kolları, hareketli ışık tanecikleri ve güç eşiklerinde geri bildirim taşır. Halka/Nova dalgası kuvveti ifade eder. Önizleme görseli bir konsepttir; canlı ekran görüntüsü değildir.

Detay ve test kapsamı: `.design/energy-motion-verification.md`.

## Tarihsel yön — Harmony 1.1, 8 Ekim 2026

Kullanıcı; dört yönlü akışı kaldırmayı, başlangıç taşına dönünce tüm tahtadaki aynı renk açık taşları temizleyen eski halka kuralını geri getirmeyi, beş taşı farklı biçimlerle ayırmayı ve arayüzü daha dinamik yapmayı onayladı. Aşağıdaki Çekirdek kararı tarihsel kayıttır; oynanış konusunda bu bölüm önceliklidir.

Sabit aşağı dolum. Köz üçgen, Gelgit damla, Güneş ışınlı disk, Eter uzun altıgen, Yaşam yaprak. SVG facet katmanları aynı görsel dili korurken dış hatları belirginleştirir. Seçim sırasında aynı renkler öne çıkar; tüm etkilenecek taşlar ve zincirden üretilecek güç önizlenir. Halka farklı renkleri kendiliğinden temizlemez; mevcut özel güçler zincirleme tetiklenebilir.

İlk 10 karşılaşma için ayrı hedef, hamle, engel ve görev tanımları bulunur. İlk beş kısa öğretici; altıncı mühür, yedinci özel güç, dokuzuncu çift halka, onuncu birleşik görevdir. 30 bölüm ve eski yıldız ilerlemesi korunur. Gerçek oyuncu zorluk testi ayrıca gerekir.

Ana ekranda sıradaki karşılaşmaya doğrudan geçiş, işaretçiye hafif tepki veren beş taş kompozisyonu, isimli bölüm durakları ve dokunarak taşları inceleyen koleksiyon bulunur. Oyun içi hareket seçme, temizleme, aşağı düşüş ve sonuç geri bildirimine bağlanır. Azaltılmış hareket yolu korunur; mobil sürüklemeye alternatif dokunma ve klavye girişi devam eder.

GB-01 ve GB-02 uygulandı. GB-03 için ilk 10 karşılaşma düzenlendi; bölüm zorluğu cihaz/oyuncu testiyle kesinleştirilmeli. Tamamlanan bölümler ve ayarlar yeni kayıt anahtarına alınır; önceki kayıt silinmez. Eski aktif oyunlar yeni kurallarla yeniden başlar. Geri dönüş commit ve yayın sürümü `.design/rollback-before-harmony-2026-10-08.md` içindedir.

Kullanıcı, önerilen ÇEKİRDEK yönünü ve oyunun buna göre tasarlanmasını onayladı. Bu işleme özel, önceki sürüme dönebilmek için doğrulanmış dosya yedeği alındı. Yeni sürümün ilerlemesi ayrı depolama anahtarında tutulur.

Oyun kimliği: taş kabukları arasında ışıldayan bir kalp, zincirle taşınan enerji ve uyandırılan diyarlar. Ana cümle: “Enerjiyi çiz. Dünyayı uyandır.” Ana ekran, harita, koleksiyon, yardım, sonuç ekranı, ses, ikon ve açılış ekranı aynı temayı kullanır.

Beş çekirdek: Köz / Gelgit / Güneş / Eter / Yaşam. Şeffaf bitmap sprite’lar built-in imagegen ile referansın ÇEKİRDEK satırından üretildi. Üretim promptları branding/core-art-prompts.json içinde. Dağıtım varlıkları 512px WebP, alpha korunarak optimize edildi. Şekiller raster görsellerin gerçek dış hatlarından gelir; renk görme erişilebilirliği sertifikası iddia edilmez.

Temel mekanik: başlangıçtan son taşa baskın yön, dört yönden hangisine sıkıştırma yapılacağını belirler. Eşit çapraz yönlerde son kenar tercih edilir; halka son akışı korur. Zincir sırasında yön önizlenir. Kapalı, kesişmeyen halka çevresini ve içindeki her renkten açık taşı temizler. Uzaktaki aynı renkten taşlar kalır. Mühürler sabit bariyer; komşu temizlenince açılır. Özel güçler ve çarpanlar korunur.

İlk beş bölüm kısa, deterministik öğretici karşılaşmalardır: bağlama, sol akış, yukarı akış, rezonans halkası, uzun zincir ve sağ akış. Kalan bölümler, günlük uyanış ve serbest akış oynanabilir olarak devam eder. Harita ve ana ekran yalnızca kazanılmış ilerlemeyi gösterir.

Görsel temeller: obsidyen #0b171f; koyu taş yüzey #132832; yükseltilmiş yüzey #1c3541; sınır #304b59; sıcak metin #f4f3e8; yardımcı metin #b0c4cd; ana eylem #f0ce91; akış #95e8d6. Sistem fontu; internetten font veya varlık çağrısı yok. Tipografi: 8–11px küçük etiket, 12–15px arayüz, 17–22px bölüm/dialog, 30–34px ana başlık.

Telefon esas alınır: 500px maksimum sütun; oyun sırasında üst marka ve alt gezinme gizli. Tahta ortada, araçlar altta. Safe-area kenarları korunur. Taş dokunma hedefleri en az yaklaşık 44px; çok kısa ekranlarda hücreler küçültülmek yerine içerik kayar.

Hareket oyunun anlamını taşır: kabuk seçimde kalbe yaklaşır, bağlantı boyunca notalar yükselir, taşlar seçilen yönde taşınır, rezonans alanı parlar. Animasyonlar sonuç hesaplamasını etkilemez. Ayar veya işletim sistemi hareket azaltma tercihi tüm animasyonları durdurur; puan/metin geri bildirimi kalır.

Teknoloji: React 19, TypeScript, Vite 8, Tailwind 4, Lucide, Capacitor 8; iOS SPM, minimum iOS/iPadOS16. Yerel projede yeni çalışma bağımlılığı eklenmedi. Bu kombinasyonun tüm rakiplerden benzersiz olduğu iddia edilmez; önerinin odağı görsel ve oynanış kimliğini birlikte değiştirmektir.


## 1.5.0 App Store / rewarded ads
Preserve the approved light motif gems and image-free soft glow theme. Optional AdMob classic-lost continue: +5 moves once, earned callback only, persisted immediately, one-star cap; no daily advantage. Native Game Center replaces external private-web login. Web league unchanged. Test IDs/configuration only until owner completes real IDs/contact/Game Center/Apple signing; never claim Xcode or device QA passed on Linux.

## 1.5.1 Difficulty
User wants greater challenge and a useful rewarded continue. First five tutorials retained; new classic attempts use campaignVersion=2, lower move budgets, higher quotas/score, combined powers/seals/loops. Legacy in-progress saves retain prior targets. No ad-status-based RNG/goal changes; daily competition unchanged. Fixed-seed heuristic probe and unassisted route witnesses measure balance, not human win rates.

## 1.6.0 Kule gizemi ve kalıcı keşif
Kullanıcı ilerlemenin merak uyandırmasını ve günlük geri dönüş sebebi olmasını istedi.
Üç diyarın ışık yolu: sıralı 30 bölüm, 10 kalıcı hikâye kaydı. Yedi farklı günün
bugünkü günlük bulmaca zaferi, yedi yankıyı sırayla açar; aynı gün tekrar veya
geçmiş gün pratik skoru yankı kazandırmaz. Kaçırılan gün ilerleme silmez; eski
günlük zaferler aktarılır, ilk yedi yankı ayrı mysteryDays alanında kalıcıdır.
30 bölüm + 7 yankı Son Uyanış metnini açar. Gerçek oyuncu retention ölçümü yok.
Motif varsayılan; önceden hazırlanmış element sprite seti bölüm 6 sonunda
yalnızca kozmetik seçenek. Kalpli tarihsel setler ürüne eklenmedi. Arka plan
resimsiz, soft parıltılı; boşta sürekli animasyon yok.

## 1.6.1 İkonik kartlar / sahneli hikâye
Kullanıcı buton/kartlarda belirgin kimlik ve dinamizm, animasyonlu hikâye
istedi. Mevcut açık resimsiz tema ve büyük tahta korunur. Macera rota rozeti,
günlük yankı diski, Zen akış rozeti, lig kalkanı ve kule mührü; dokunmada kısa
basılma, yalnızca hover destekli cihazda yükselme. Mühürlü günlük kartları.
Hikâye kayıtları 8 vektör sahne türünden oluşur; 3 adımda son kareye yerleşir.
Keşif sonucu otomatik küçük sahne; ana kart / koleksiyondan modal tekrar.
Durdur, devam ve kapat hemen kullanılabilir; metin animasyon boyunca görünür.
Azaltılmış hareket statik son kare; görünmezken zamanlayıcı iptali. Yeni
sürekli döngü, raster arka plan veya bağımlılık yok. GR-01/02/04 ve GB-01/02
eski raporlarda çözülmüş; bu tur mevcut kuralları yeniden değiştirmez.
