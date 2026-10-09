# Açılışta siyah ekran — 1.1.2

8 Ekim 2026: Kullanıcı yayınlanan oyunun siyah ekranda kaldığını bildirdi.

## Kök neden

`MoveTimeline` kurucusundaki `constructor(private schedule: Schedule = schedule)`
varsayılan değeri, dışarıdaki zamanlayıcı yerine henüz başlatılmamış kendi
parametresine erişiyordu. `App` ilk çizimde `new MoveTimeline()` çağırdığı için
`ReferenceError` oluşuyor, yükleme ekranı bile çizilemiyordu.

Önceki zamanlayıcı testleri bir test saati veriyordu; bu yüzden varsayılan
kurucu yolunu çalıştırmıyorlardı. Yeni iki test düzeltmeden önce aynı
`ReferenceError` ile başarısız oldu.

## Düzeltme ve doğrulama

- Dış zamanlayıcı `defaultSchedule` olarak yeniden adlandırıldı.
- Gerçek `App` ilk çizimi, varsayılan kurucuyla yükleme ekranını üretir.
- Test saati verilmeden çalışan hareket, gerçek zamanlayıcıyla temizleme,
  düşüş ve tamamlama evrelerini bitirir.
- TypeScript denetimi ve 44 test geçti; üretim derlemesi tamamlandı.
- iOS paket varlıkları güncellendi. iOS sürüm yapılandırması ve kontrolü,
  sürüm değerini artık `package.json` üzerinden alır.
- Üretim hata günlüklerinde sunucu hatası yoktu; hata istemci açılışındaydı.

Bu ortamda tarayıcı ve iPhone üzerinde çalışma doğrulaması yapılamadı.
