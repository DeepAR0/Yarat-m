# Aydınlık fantastik vadi — 1.2.2

8 Ekim 2026. Kullanıcının düz/basit tema geri bildirimi ve önceki pil tüketimi
sorusu doğrultusunda, kompakt düzeni büyütmeden statik sahne ve yüzey derinliği
eklendi. Sites kimliği/audience, oyun motoru, kayıt formatı ve büyük tahta
geometrisi korunur. Son rapordaki eski halka/yerçekimi kuralları bu işte
yeniden uygulanmaz; mevcut aynı renk dalgası ve aşağı dolum geçerlidir.

## Görsel uygulama

`public/worlds/sunlit-valley.webp`: built-in imagegen ile üretilmiş ışıklı vadi.
900×1350 WebP, 220.100 bayt. Orijinal resim görsel olarak incelendi; açık merkez,
kenarlarda kemer/bitkiler, uzak ve yakın planlar ve metinsiz kompozisyon uygun.
Prompt ve dosya yolu `branding/sunlit-valley-art.json` içindedir. Görsel bir
arka plan varlığıdır; gerçek oyun ekran görüntüsü değildir.

`src/valley.css`: dünya arka planı, teras malzemesi hissi, üç diyar için değişken
rim/tray paletleri, girintili hücreler, statik çerçeve detayları, ışık alan
eylem/menü yüzeyleri. Diyar veri niteliği aktif macera bölümü veya açılmış
bölümden türetilir; günlük/zen görünümü açılmış diyar paletini kullanır.

Board genişliği/padding/gap/SVG insets aynı kalır. Kenar detayları pointer-events
none; hücreleri izole eden transform/filter/z-index eklenmez. Çizgi miter
köşelidir ve taşların arkasındaki mevcut enerji katmanında kalır. Metin
yüzeyleri yüksek opaklıktadır; vadi, taş taramasının altında opak tepside
gizlenir. Seçili/hedef/tamamlanmış işaretler metin ve simgelerle sürer.

## Kaynak yükü

Bir sahne resmi farklı yüzeyler için aynı URL ile kullanılır. Sürekli arka plan
hareketi, video, canvas render loop, parçacık veya parallax eklenmez. Hero
taşlarının boşta hareketi kapatıldı; Nova halka animasyonu yalnızca charged
taşta çalışır. Mevcut seçim ve kısa patlama efektleri korunur; azaltılmış
hareket kuralları yeni seçicilerde de geçerlidir. Bu tercihler pil veya FPS
ölçümü değildir; tüketim için gerçek telefon oturumu gerekir.

## Doğrulama ve sınırlar

İlk TypeScript kontrolü başarılı. Paketleme akışında mevcut 44 test, üretim
derlemesi, native iOS eşitlemesi ve yayın kaynak kontrolü çalıştırılır. Yeni
tema ile oyun hesaplama davranışı değiştirilmedi. Referanslı sahne varlığı
yerel projeye alındı; yalnızca scratch görüntüsüne bağımlı değildir.

Control-browser bu managed ortamda yok. Yeni UI tarayıcı görüntüsü, 200% zoom,
gerçek sürükleme/klavye, VoiceOver, fiziksel Safari/WKWebView, Xcode, pil, ısı ve
FPS ölçümü yapılmadı. Kaynak değerlendirmesi cihaz doğrulamasının yerine
geçmez. Eski screenshots dosyaları güncel temanın ekran görüntüleri değildir.
