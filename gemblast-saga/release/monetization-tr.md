# Ödüllü reklam kurulumu — 1.5.1

## Ürün davranışı

Oyuncu macera denemesini kaybedince “Reklam izle · +5 hamle” seçebilir. Ödül, SDK'nın kazanım olayı veya kazanım sonucuyla bir kez verilir; kapanma olayı ödül değildir. Reklam erken kapanırsa ve reklam bulunmazsa ücretsiz yeniden deneme korunur. Deneme başına bir ödül; reklamlı zafer en fazla bir yıldız. Günlük ligde ve serbest modda reklam ödülü yoktur. Önceden açılmış bölüm/yıldız rekoru düşürülmez.

Bu, cihaz içi bir ödüldür. Para, satılabilir öğe veya sunucu ekonomisi yoktur; ödül için sunucu doğrulaması eklenmemiştir. Sunucuya bağlı ödül ekonomisi ileride eklenirse AdMob SSV ile imzalı geri çağrıları doğrula. Uygulamayı reklamı tamamladıktan hemen önce zorla kapatan oyuncu ödülü kaybedebilir; SDK kazanım bildirimi geldiğinde kayıt hemen yazılır, uygulama kapalıyken ödül talep edilmez.

## AdMob hesabında yapılacaklar

1. iOS uygulamasını oluştur; gerçek mağaza/bundle kimliğiyle eşleştir.
2. Rewarded reklam birimi oluştur. Ödül adı `hamle`, miktarı `5` olsun. Normal interstitial birimi kullanma.
3. `release/config.json`: `admob.iosAppId` içinde `~`, `iosRewardedId` içinde `/` bulunan gerçek kimlikleri gir. Gelir sürümünde `testMode=false` yap. Geliştirme ve ilk gerçek cihaz kontrolünde örnek kimlikleri/test modunu kullan; kendi canlı reklamına tıklama.
4. Privacy & messaging içinde uygulanabilir GDPR/ABD eyalet mesajlarını ve yayınlanmış gerçek gizlilik URL'sini kur. Bu sürüm kişiselleştirilmemiş reklam isteği (`npa=true`) kullanır, kendi ATT çağrısını yapmaz; UMP IDFA mesajı açma. Kişiselleştirme/IDFA stratejisi değişirse ATT ve etiketleri tekrar değerlendir.
5. Çocuklara yönelik özel kategori kullanılmıyor. Genel içerik filtresi `General` uygulanır. Hedef kitleyi AdMob ve App Store'da gerçek yayın kararınla eşleştir; bu filtre yaş değerlendirmesinin yerine geçmez.
6. Mağazadaki geliştirici web sitesi alan adına uygun app-ads.txt kur. Doğru yayıncı satırını kendi AdMob panelinden al; test Google yayıncı kimliğini kullanma. AdMob'un doğrulama, ödeme, vergi ve uygulama inceleme süreçlerini tamamla.
7. `npm run ios:sync`. Xcode'da SDK paketlerini çöz. Eklenti paketindeki Google SDK sürümü kilitlidir; ayrıca başka Google SDK ekleme.

## Gizlilik ve pil

UMP izin durumu reklam istenmeden önce kontrol edilir; izin alınamadığında reklam yüklenmez. Gerekli gizlilik seçenekleri Ayarlar'da açılır. Oyun, ödülü izin verme koşuluna bağlamaz. SDK ilk kez izinli reklam isteğinde başlatılır; otomatik reklam, sürekli banner yenileme, arka plan reklam yükleme veya reklam analitiğini kendi sunucumuza gönderme yoktur. Video izleme sırasında ağ ve enerji tüketimi artabilir; gerçek pil ölçümü fiziksel cihazda yapılmalıdır.

## Gerçek cihaz kabul testi

- Örnek reklam başarıyla bitince aynı tahta +5 hamle ve bir kez ödül.
- Erken kapatma, yükleme yokluğu, uçak modu, SDK hatası: sıfır ödül, tekrar deneme kullanılabilir.
- Peş peşe dokunma: tek gösterim ve tek ödül. Sonraki kayıpta aynı denemede ikinci teklif yok.
- Ödül sonrası uygulamayı kapat/aç: hamleler ve `rewardedContinueUsed` korunur.
- Ses kapalıyken reklam SDK'sına sessiz uygulama tercihi aktarılır. Sağlayıcının video ses/düğme davranışını kontrol et.
- EEA/UK/İsviçre test coğrafyasında UMP kabul/red ve ayarlardan değişiklik. İnternet kesilince oyun kullanılabilir.
- Reklamdan dönünce tahta, sürükleme, kayıt, yönelim ve ses tekrar çalışır.
- Günlük oyun hiçbir reklamlı hamle kabul etmez.

Kaynaklar: [Google ödüllü reklam](https://developers.google.com/admob/ios/rewarded), [test reklamları](https://developers.google.com/admob/ios/test-ads), [UMP](https://developers.google.com/admob/ios/privacy), [SDK veri açıklaması](https://developers.google.com/admob/ios/privacy/data-disclosure).
