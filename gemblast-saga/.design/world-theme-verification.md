# 1.7.0 — Rezonans mabedi

## Kullanıcı kararı
Ferah/soft yön bırakıldı; ürün fantastik oyun dünyasına çevrildi. Önce web
oyunu bitirilecek; kullanıcı istediğinde iOS paketi hazırlanacak. Bu tur
iOS dosyaları, native sürüm, build number, sync ve Library ZIP değişmedi.

## Değişiklik
Ana ekran WorldHub: diyar adı, bölüm rozeti, aktif karşılaşma, seçili taş
görünümünü kullanan vektör mabet, keşif hedefi ve oyun eylemi.
Petrol taş yüzey, altın kabartmalı çerçeve, Köz/Gelgit/Eter tonları.
Tahta/HUD, harita, günlük, envanter, ayarlar, lig ve dialoglar aynı tema.
Öykü SVG taş/kapı/zemin renkleri tema değişkenlerinden gelir.
Raster arka plan ve yeni sürekli animasyon yok. Tahta geometrisi, aşağı
dolum, arkadaki keskin yol, hedefler ve kayıt formatı değişmedi.
Eski raporların ferah tema kısıtı güncel kullanıcı kararıyla geçersiz.
Sabit aşağı dolum, siluet, giriş modu yönergesi ve öğretim bulguları önceki
sürümlerde çözülmüş; bu tur yeniden uygulanmadı.

## Gerçek kontroller
79 test geçti. WorldHub SSR: 1/11/21/30. bölüm durumları, doğru diyar/
karşılaşma, kayıtlı devam etiketi ve seçili sprite seti kontrol edildi.
Web build içindeki TypeScript kontrolü zorunlu.
Kaynak çiftlerinden kontrast: #fff2d8/#203d49=10.38:1;
#bed1d0/#294b55=5.92:1; #362c21/#e6b65f=7.29:1;
#c2d6d4/#294c55=6.14:1. Render/a11y sertifikası değil.
Eski açık hover, oyun metrikleri, lig input/thead, ikon ve yardım
satırlarına daha özgül oyun teması stilleri uygulandı.
Hareket azaltma ve kontrol etiketleri korunur.

## Açık kontroller
Control-browser bu ortamda yok; managed Sites kuralıyla farklı tarayıcı
yolu veya preview sunucusu açılmadı. Gerçek Safari/iPhone renk, taş
okunabilirliği, dokunma, SVG hareketi, 320px/200% reflow, VoiceOver ve
pil ölçümü yapılmadı. Bunlar kullanıcı testiyle doğrulanmalı.
