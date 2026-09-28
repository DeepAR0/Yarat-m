# Terraryum

Mobilde yatay oynanan, gerçekçi bir kapalı terraryum simülasyonu. Cam bir kavanozda bitkiler, toprak canlıları ve su döngüsüyle kendi kendine yaşayan bir ekosistem kurarsın.

## Çalıştırma

Oyun tek bir dosyadır (`index.html`), kurulum gerektirmez.

- Bilgisayarda: `terraryum/index.html` dosyasını tarayıcıda aç.
- Telefonda: depo kökünde `python3 -m http.server 8000` çalıştır, telefondan `http://<bilgisayarın-ip-adresi>:8000/terraryum/` adresine gir.
- Ana ekrana eklenirse (`manifest.webmanifest`) tam ekran ve yatay açılır. Android'de başlarken tam ekrana geçip ekranı yatay kilitler.

Kayıt tarayıcının yerel deposunda tutulur. Uygulama kapalıyken zaman 1× hızda akmaya devam eder (en çok 3 oyun günü).

## Nasıl oynanır

| Araç | Ne yapar |
| --- | --- |
| İncele | Bitkiye, toprağa ya da cama dokununca ölçümleri ve sorunları gösterir. Kapağa ve lambaya dokunarak aç/kapat. |
| Dik | Fide seç, toprağa sürükleyip bırak. |
| Püskürt | Basılı tut: havayı ve camı ıslatır. |
| Sula | Dokun: 20 ml. Basılı tut: sürekli sular. Fazlası drenaj katmanına iner. |
| Cam sil | Buğuyu siler; bez camdaki suyu kavanozdan çıkarır. |
| Buda | Sararan yaprakları keser, ölü bitkiyi söker, yaprak döküntüsünü toplar. |
| Canlılar | Kollembol (küfü yer) ve tespih böceği (döküntüyü besine çevirir) ekler. |

Müdahale eden araçlar kapağı kendiliğinden açar. Hedef, kapağı kapatıp ekosistemi günlerce kendi başına dengede tutmaktır. Görevler yeni bitki türlerinin kilidini açar.

## Simülasyon

- **Su döngüsü:** Toprak ve bitkiler buharlaştırır; nem, camın sıcaklığına göre hesaplanan yoğuşma eşiğini (Magnus formülü) geçince su camda buğu ve damla olur, süzülüp toprağa döner. Cam ısıyı gecikmeli aldığı için sabahları buğu artar.
- **Işık ve ısı:** Güneş eğrisi, kavanozun yeri (oda içi, pencere, doğrudan güneş) ve bitki lambası. Kapalı kavanoz güneşte sera gibi ısınır.
- **Gazlar:** Gündüz fotosentez CO₂'yi düşürür, gece solunum yükseltir. Kapak kapalıyken düşük CO₂ büyümeyi yavaşlatır.
- **Bitkiler:** Her türün nem, toprak nemi, ışık ve sıcaklık aralığı vardır. Susuz kalan bitki sarkar, ıslak toprakta kök çürür, düşük nemde yaprak uçları kurur, az ışıkta boy atıp solar.
- **Toprak canlıları:** Döküntü ayrışıp besine döner; nem yüksek ve döküntü fazlaysa küf yayılır, kollemboller küfü yer.

## Geliştirme

Adresin sonuna `#debug` eklenirse simülasyon tarayıcı konsolundan `window.__terra` ile sürülebilir (ör. `__terra.step(__terra.S, 60)`).
