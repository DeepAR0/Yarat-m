# Bölüm dengesi — 1.5.1

İlk beş öğretici değişmedi. 6–10. bölümlerde hamle bütçesi 12–15; 11–20 arasında 14–17; son diyarda 16–22. Her diyarın son bölümü puan, renk, halka, mühür ve etkinleştirilmiş güç hedeflerini birleştirir. Son diyarın hedefleri 6500–11450 puana yükselir; puan tek başına bölüm kazandırmaz.

Mevcut eski denemeler eski hedefleriyle devam eder. Yeni bölüm veya yeniden başlatma `campaignVersion=2` kullanır. Yıldızlar ve açılmış bölümler silinmez. Günlük bulmaca ve web skor replay kuralları değişmez.

Reklam ödülü hâlâ +5 hamle ve deneme başına bir kezdir. Reklam tercihi, reklam izleme geçmişi veya ödeme durumu seed/taş dağılımını ya da hedefleri değiştirmez. Reklam izlemeyen oyuncu ücretsiz tekrar deneyebilir. Oyun içine reklam için gizli zorlaştırma veya kaybetmeyi garantileyen tahta eklenmemiştir.

## Ölçüm

`npm run balance:probe` 25 öğretici dışı bölüm için 16 sabit başlangıç seedini sınayan, sınırlı yol aramalı sezgisel bir bottur. Kaybedilen denemede aynı oyun +5 hamleyle devam ettirilerek ödülün etkisi ayrıca ölçülür. `release/balance-probe.json` ham sonuçları içerir. Bunlar insan kazanma oranları, bütün rastgele başlangıçların çözülebilirlik garantisi veya reklam dönüşüm tahmini değildir.

Her öğretici dışı bölüm için en az bir reklamsız kazanan başlangıç ve gerçek hamle yolu bulundu; `tests/fixtures/campaign-witnesses.json` saklar ve testler oyunun gerçek motoruyla yeniden oynatır. Öğreticilerin mevcut kısa yolları da test edilir. Gerçek kullanıcı/TestFlight testinde kaç denemede geçildiği, hangi hedeflerde takılındığı ve reklamsız ilerleme ölçülerek gerekirse yeniden dengelenmelidir.
