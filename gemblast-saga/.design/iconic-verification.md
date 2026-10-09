# 1.6.1 — İkonik kartlar ve kısa hikâye sahneleri

## Yapılanlar
Açık resimsiz soft tema, büyük tahta, mevcut taşlar ve oyun kuralları korunur.
Macera rota, günlük yankı, Zen akış, lig kalkanı ve kule mührü rozetleri.
Butonlar basılma; mouse hover yükselme; günlük kayıtları mühür görünümü.
Sekiz kodla çizilmiş SVG sahne türü; 350/1850/3650ms fazları, son kare kalıcı.
Hikâye sonucu kısa otomatik sahne; ana kart/günlükten isteğe bağlı modal.
Durdur, tekrar oynat, hemen devam et; tam metin erişilebilir.
Azaltılmış hareket statik ve zamanlayıcısız. Unmount/gizlenme iptali.
Dialog useId ile benzersiz başlık ilişkisi; mevcut showModal ve odak dönüşü.

## Kontroller
79 test geçti; TypeScript kontrolü geçti. Dört yeni kontrol: iptalden sonra
geç callback hiçbir fazı değiştiremez; azaltılmış hareket zamanlayıcısız;
kilitli hikâye açılamaz; sekiz sahne/eşlik eden metin kaynak kontrolü.
Ana değişen metin/zemin çiftlerinin hesaplanan kontrastı: primary
#215849/#c2e4d7 6.01:1, sahne düğmesi #2c634e/#e4f3e9 6.09:1,
metin #355848/#edf7ef 7.25:1, yankı simgesi #855921/#f1dfb8 4.64:1.
Bunlar kaynak renginden hesaplanır; render erişilebilirlik sertifikası değildir.
Ana mobil kontroller >=44px; akış metinleri sabit yüksekliğe sıkıştırılmadı.
Hareket için transform/opacity ve kısa stroke reveal; sürekli döngü yok.
Eski raporların çözülen aşağı dolum/siluet/yönerge bulguları yeniden uygulanmadı.

## Açık doğrulama
Control-browser bu oturumda mevcut değil; Sites managed Linux kuralıyla
tarayıcı sunucusu veya farklı kontrol yolu başlatılmadı. 320/390px reflow,
200% zoom, dialog Escape/Tab/odak, gerçek iPhone Safari SVG transform-box
ve VoiceOver davranışı denenmedi. Xcode, fiziksel cihaz, pil ve retention
ölçümleri yok. Statik kontrol ve testler bu açıklıkları kapatmış sayılmaz.
