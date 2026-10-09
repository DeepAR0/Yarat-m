# Ferah çekirdekler — 1.2.0, 8 Ekim 2026

Kullanıcı açık arayüz istedi; taş, dokunma ve zincir geri bildirimi önerisini kabul etti. Ana ekran, oyun, harita, koleksiyon, ayarlar, yardım/sonuç pencereleri ve geri bildirimler krem/mint/beyaz palete geçirildi. Kayıt anahtarı, kurallar, ilerleme ve aşağı düşüş zamanlaması değişmedi.

## Varlıklar ve uygulama

Built-in imagegen ile ayrı üretilen beş saydam çekirdek, gerçek siluet ve doygun renk taşıyor. Promptlar `branding/airy-core-art-prompts.json` içinde. Teslim varlıkları:

- `public/cores/airy-coral.webp` — üçgen Köz, 61.862 bayt
- `public/cores/airy-cobalt.webp` — damla Gelgit, 60.918 bayt
- `public/cores/airy-amber.webp` — güneş Güneş, 60.964 bayt
- `public/cores/airy-violet.webp` — uzun altıgen Eter, 49.504 bayt
- `public/cores/airy-emerald.webp` — yaprak Yaşam, 70.748 bayt

512×512 WebP, alpha korunur; toplam 303.996 bayt. Kaynak görseller incelendi; alfa kanalının varlığı ve köşe saydamlığı kontrol edildi. Bir taş bir sprite kullanır. Hareketli kalp katmanı yalnızca seçili/etkilenecek taşlarda bulunur. Seçili olmayan taşlar güç seviyesi değişiminde yeniden çizilmez. Kalp döngüleri azaltılmış hareket tercihinde durur. Keskin M/L/Z bağlantılar ve taşın arkasındaki z-index katmanı korunur. Son zincir taşında kanal/Nova önizlemesi gösterilir; beş taşın rastgele kanal yönü önceden kesinmiş gibi gösterilmez.

## Kontroller

44 otomatik test başarılı: başlangıç ekranının production timeline ile oluşturulması, gerçek varsayılan timer, tekrarlanan çoklu hamlelerin kilit bırakmaması, animasyon olayı gelmezse sonlandırma, azaltılmış hareket, mühürler, aynı renk halka dalgası, güç eşikleri, kayıt ve 3.000 başlangıç tahtası dahil. Eski sprite yolunu doğrulayan test yeni teslim varlığına güncellendi. Kaynak renk kontrast hesapları: ana metin/krem 10,54:1; yardımcı metin/krem 4,86:1; beyaz ana eylem/yeşil 5,35:1; koyu altın/beyaz 5,28:1; seçili gezinme 5,04:1; etki sayısı 5,06:1. Bu hesaplar genel erişilebilirlik sertifikası değildir.

Üretim derlemesi, iOS varlık eşitlemesi ve kaynak yayın kontrolü paketleme sırasında çalıştırılır. Native açık arayüz, koyu durum çubuğu metni ve saydam Köz açılış görseli aynı yöndedir. App icon değiştirilmez.

## Açık doğrulama sınırı

Bu managed ortamda control-browser yok; tarayıcı önizleme sunucusu, alternatif tarayıcı otomasyonu veya yeni cihaz ekran görüntüsü kullanılmadı. Gerçek telefon/Safari/WKWebView görsel yerleşimi, FPS, VoiceOver, büyütülmüş metin, Xcode derlemesi ve fiziksel iPhone testi yapılmadı. Eski `screenshots/` dosyaları önceki görünümlere ait tarihsel kayıtlardır. Otomatik zamanlama testleri cihaz akıcılığı ölçümü değildir.
