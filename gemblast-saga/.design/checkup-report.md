# Gemblast Saga — Akış ve taş okunabilirliği

## Kapsam ve yöntem

8 Ekim 2026. Kullanıcının yana kayma ve taşların birbirine benzemesi hakkındaki geri bildirimi; mevcut kaynak ve paket içindeki `screenshots/core-game.png` üzerinden incelendi. Sites `get_site` yanıtı yayındaki sürümün 1 olduğunu doğruladı. Canlı tarayıcı etkileşimi ve cihaz testi yapılmadı. Ürün dosyalarında değişiklik yapılmadı.

## Değerlendirme

Zincir çizme, kapalı halka ve özel güçler kullanılabilir bir oyun temeli sunuyor. Öncelik, yön değiştiren yerçekimini sadeleştirmek ve beş taşı renk dışında dış hatlarıyla da belirginleştirmek.

## Korunacaklar

- Aynı türden en az üç komşu taşı bağlama; çapraz komşuluk.
- Kesişmeyen kapalı halkayla çevreyi ve içerideki açık taşları temizleme.
- Uzun zincirlerin özel güç oluşturması, mühürler, ilerleme kaydı ve mevcut diyar kimliği.

## Sınırlı puanlama

| Boyut | Puan | Dayanak |
| --- | --- | --- |
| Hamle sonucunun anlaşılabilirliği | 2/4 | Dolum yönü zincirin başlangıç ve bitişine bağlı; kullanıcı bu davranışı beğenmiyor. |
| Taşların görsel ayrışması | 2/4 | Ekran görüntüsünde renkler ayrışıyor; kırmızı, mor ve yeşil taşların siluetleri ve ışıklı merkezleri benzer. |
| Bölüm çeşitliliği | 2/4 | İlk beş öğretici karşılaşmadan sonra hedefler, hamleler ve engeller tekrarlanan şablonlardan türetiliyor. |

## Bulgular

| ID | Önem | Alan | Konum / kanıt | Mevcut davranış | Önerilen düzeltme | Kullanıcı etkisi |
| --- | --- | --- | --- | --- | --- | --- |
| GB-01 | MEDIUM | Akış | `src/utils/boardEngine.ts:68`, `src/utils/boardEngine.ts:109`, `src/utils/session.ts:56`; kullanıcı geri bildirimi | Zincirin yönü dört yönlü sıkıştırmayı belirler. Bu bir hata değil, değişmesi istenen tasarım kararıdır. | Ana oyunda aşağı doğru sabit dolum; yön hedeflerini ve öğretici metinlerini yeni kurala göre düzenle. | Hamle sonrasında tahta daha öngörülebilir olur. |
| GB-02 | MEDIUM | Taşlar | `src/components/PrismGemArtwork.tsx:9–14`, `screenshots/core-game.png`; kullanıcı geri bildirimi | Tüm taşlara ortak dört parçalı ışıklı çekirdek işlemesi uygulanıyor; özellikle kırmızı, mor ve yeşil dış hatlar birbirine yakın. | Köz üçgen; Gelgit damla; Güneş yuvarlak ışınlı disk; Eter uzun altıgen; Yaşam yaprak. Işığı seçili taşlarda yoğunlaştır. | Taşları tararken renk yanında şekil de ipucu verir. |
| GB-03 | MEDIUM | Bölüm yapısı | `src/types/game.ts:214–238` | İlk beş bölümden sonra sayısal hedefler ve engel şablonları üzerinden 30 bölüm üretiliyor. | Önce yeni kurala uygun 10 karşılaşmayı tek tek tasarla; hedef toplama, mühür açma ve halka görevlerini sırayla tanıt. | Zorluk artışı daha kontrollü olur; eğlence ve denge oyun testi gerektirir. |

## Öncelik

**Şimdi:** sabit aşağı dolum, beş farklı taş silueti, ilk beş öğreticinin ve yön hedeflerinin birlikte güncellenmesi. Yalnızca animasyonu değiştirmek yeterli değildir; eski yön hedefleri kazanmayı engelleyebilir.

**Sonra:** zincir seçimi → temizleme → aşağı dolum → puan sıralamasını netleştirme; aynı hücrede kalacak güç taşlarının yerini önceden gösterme; güç simgelerini yatay çizgi, dikey çizgi ve nova halkasıyla ayırma.

**Daha sonra:** 10 bölümün gerçek cihazda dengelenmesi, ardından kalan bölümlerin genişletilmesi. Yeni kurallarla oynanmış skorların eski sürüm skorlarıyla karşılaştırılabilirliği ayrıca kararlaştırılmalı.

## Doğrulama açıkları

- Sabit dolum değişikliği uygulanınca mühürlerin ayırdığı dikey bölmeler, özel güç üretimi, tahtanın oynanabilir kalması ve devam eden kayıtlar test edilmeli.
- 320–430 CSS px genişlikte siluetler ve azaltılmış hareket yolu gerçek görüntü üzerinden kontrol edilmeli.
- Gerçek iPhone, uzun oturum, bölüm zorluğu ve App Store gönderimi bu incelemede doğrulanmadı.

## Karar

İncelenen tasarım kapsamı: **Needs changes**. Çalışma zamanı veya mağaza uygunluğu onayı değildir.
