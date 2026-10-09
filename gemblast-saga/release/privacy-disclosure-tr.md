# Gizlilik beyanı ve yaş anketi — 1.5.1

AdMob eklenmiştir. Önceki “Data Not Collected” taslağı artık geçerli değildir. Xcode arşivinden birleşik Privacy Report çıkar; gerçek Google SDK, UMP ve varsa ileride eklenen mediation sağlayıcılarını kapsa. Aşağıdaki tablo beyan hazırlığı içindir; hesabındaki son yapılandırmanın doğrulanması gerekir.

| Hizmet | Veri / amaç | Beyan hazırlığı |
| --- | --- | --- |
| Yerel oyun kaydı | Oturum, skor, ayarlar; cihaz içi işlev | Geliştiriciye gönderilmez; yerel kayıt dışına taşınmayan veriyi sunucu toplaması gibi yazma. |
| AdMob | IP/ yaklaşık konum; reklam sunumu ve ölçümü | Coarse Location ve SDK açıklamasındaki amaçları kontrol et. |
| AdMob | Cihaz veya uygulama kimlikleri | Identifiers / Device ID; reklam ve analitik amaçları, kullanıcıyla ilişkilendirme ve tracking kapsamını gerçek SDK/ayarlarla doğrula. |
| AdMob | Gösterilen reklam, tıklama/video etkileşimleri | Usage Data / Advertising Data ve Product Interaction; gerçek ölçüm amaçları. |
| AdMob | Hata, performans ve enerji ölçümleri | Diagnostics / Crash ve Performance Data; SDK'nın reklam/analitik kullanımını da kapsa. |
| UMP | Kullanıcının gizlilik tercihleri | Sağlayıcı beyanı ve gerçek izin akışıyla değerlendir. |
| Game Center | Apple oyuncu kimliği ve gönderilen skor | Apple Game Center veri uygulamasını ve uygulamanın gönderdiği oyun verisini App Store anketinin güncel tanımlarına göre değerlendir. |
| Web ligi | Hesap kimliği, oyuncu adı, günlük skorlar | Native uygulama bu backend'e bağlanmaz. Web için ayrı politika bölümü ve silme akışı vardır. |

Kişiselleştirilmemiş reklam (`npa=true`) veya ATT izni istememek, SDK'nın hiç veri toplamadığı anlamına gelmez. Nihai tracking/linked-to-user seçimlerini sadece “npa” değerine bakarak kapatma. Uygulama kendi reklam verilerini ayrı bir analitik sunucusuna iletmez.

## Yaş anketinde mevcut içerik

Reklam var; kullanıcı sohbeti veya serbest kullanıcı içerik yüklemesi yok; kumar, para ödülü, loot box, dijital satın alma ve şiddet/uygunsuz içerik yok. Görsel patlama taş temizleme efektidir. Game Center görünen Apple oyuncu adları kullanılır. Reklam içerik filtresi General; bu filtre Apple yaş derecesini tek başına belirlemez. Güncel App Store Connect sorularına gerçek reklam sunumuyla cevap ver; Kids kategorisi veya kesin 4+ uygunluğu iddia edilmez.

Politika ve destekte gerçek yayıncı/contact bilgilerinin olması, HTTPS adreslerinin girişsiz açılması ve uygulama içinde politikanın bulunması gerekir. Kaynak: [Google SDK veri açıklaması](https://developers.google.com/admob/ios/privacy/data-disclosure), [Apple privacy yönetimi](https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy), [yaş değerleri](https://developer.apple.com/help/app-store-connect/reference/app-information/age-ratings-values-and-definitions/).
