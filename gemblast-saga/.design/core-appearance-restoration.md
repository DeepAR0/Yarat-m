# Önceki görünümün geri getirilmesi — 8 Ekim 2026

Kullanıcı önceki görünümü tercih etti. Görsel kaynak: `6b9cd5afc4a162f668ade17adafceadc0459fbe3`. Önceki Harmony yayını: `appgprj_6ac71833016c8191ae3a4eaf310a59e2~appgver_5aee343c29708191a4af8dcf4609c714`; kaynak commit: `76510abf5b34f819f1b6a572ee5ba459b8f74639`.

Geri getirilenler: WebP çekirdek sprite bileşeni, eski ana ekran kompozisyonu, numaralı harita, koleksiyon kartları ve özgün CSS. Küçük akış göstergesi aşağı dolumu ve halka etkisini gösterir. Yeni görünümün CSS katmanı kaldırıldı.

Korunanlar: her zaman aşağı dolum, tüm aynı renk açık taşları temizleyen halka, özel güçler, etki önizlemesi, 30 bölümün güncel hedefleri, kayıt anahtarı ve etkin oyunlar. Oyun motoru, oturum ve depolama dosyaları bu işlemde değiştirilmedi.

Doğrulama: TypeScript kontrolü ve 32 oyun testi geçti. WebP dosyaları yerel varlıklarda bulunuyor. Sites derlemesi ve iOS web varlığı eşitlemesi yayın paketleme adımında çalıştırılır.

Bu ortamda desteklenen control-browser becerisi bulunmadığı için tarayıcı QA yapılmadı. Gerçek iPhone, Xcode ve VoiceOver testi yapılmadı.
