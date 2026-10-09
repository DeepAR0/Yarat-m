# Harmony revizyonu öncesi geri dönüş

Tarih: 8 Ekim 2026.
Sites proje kimliği: `appgprj_6ac71833016c8191ae3a4eaf310a59e2`.
Önceki yayımlanmış sürüm: 1.
Kaynak geri dönüş noktası: `6b9cd5afc4a162f668ade17adafceadc0459fbe3`.

Bu commit; Çekirdek görsellerini, dört yönlü akışı, halka içi alan temizliğini, kaynakları ve paketlenmiş iOS dosyalarını içerir. Git geçmişinde ve Sites sürüm geçmişinde korunur. Önceki `gemblast-saga.core-profile.v1` cihaz kaydı değiştirilmez. Yeni sürüm ayrı kayıt anahtarıyla çalışır; ilk açılışta tamamlanmış bölümler ve ayarlar aktarılır, eski kurallarla yarım kalan oyunlar aktarılmaz.

Geri dönüş istenirse bu kaynak commitinden ayrı checkout açılıp aynı Sites projesine yeni bir sürüm olarak paketlenmeli. Yeni sürümün cihaz kayıt anahtarı silinmemeli. Yalnızca Sites yayını geri alınırsa ayrı iOS proje çıktısı da ayrıca eşitlenmelidir.
