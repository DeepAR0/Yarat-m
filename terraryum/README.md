# Terraryum

Mobilde yatay oynanan, gerçekçi bir biyoaktif teraryum simülasyonu. Önden iki kapılı, üstü telli dikdörtgen bir cam teraryumda ok kurbağaları, toprak canlıları ve bitkilerle kendini temizleyen küçük bir yağmur ormanı kurarsın.

## Çalıştırma

Oyun tek bir dosyadır (`index.html`), kurulum gerektirmez.

- Bilgisayarda: `terraryum/index.html` dosyasını tarayıcıda aç.
- Telefonda: depo kökünde `python3 -m http.server 8000` çalıştır, telefondan `http://<bilgisayarın-ip-adresi>:8000/terraryum/` adresine gir.
- Ana ekrana eklenirse (`manifest.webmanifest`) tam ekran ve yatay açılır. Android'de başlarken tam ekrana geçip ekranı yatay kilitler.

Kayıt tarayıcının yerel deposunda tutulur. Uygulama kapalıyken zaman 1× hızda akmaya devam eder (en çok 3 oyun günü).

## Canlılar

| Canlı | Rolü |
| --- | --- |
| Ok kurbağası (mavi, sarı bantlı, yeşil benekli) | Gündüz aktif. Meyve sineği ve kollembol avlar, kurumaya çok duyarlıdır. Koşullar iyiyse bromelyaya yumurta bırakır; 14 günde yavru çıkar. |
| Taçlı geko | Gece aktif. Cırcır böceği ve meyve püresi yer. Sürekli ıslak havayı sevmez, acıkınca küçük kurbağaları avlar. |
| Kollembol | Küfü yer; kurbağaların doğal besinidir. Bir kısmı toprakta saklandığı için tükenmez. |
| Tespih böceği, kırkayak | Yaprak döküntüsünü ve dışkıyı parçalar. |
| Toprak solucanı | Toprağı havalandırır, kök çürümesini azaltır, döküntüyü besine çevirir. Ön camdan toprağın içinde görünür. |
| Salyangoz | Camdaki yosunu yer; yosun bitince bitkileri kemirir. |
| Meyve sineği, cırcır böceği | Yem. Yenmeyen cırcır böcekleri bitkileri kemirir. |

## Nasıl oynanır

| Araç | Ne yapar |
| --- | --- |
| İncele | Hayvana, bitkiye, toprağa ya da cama dokununca durumu gösterir. Kilide dokununca kapılar, LED'e dokununca ışık değişir. |
| Hayvanlar | Kurbağa, geko ve temizlik ekibi ekler. |
| Besle | Meyve sineği, cırcır böceği ya da meyve püresi verir. |
| Püskürt | Basılı tut: tel kapaktan havayı, camı ve yaprakları ıslatır. |
| Sula | Dokun: 50 ml. Basılı tut: sürekli sular. |
| Dik | Fide seç, toprağa sürükleyip bırak. |
| Temizle | Ölü hayvanı ve bitkiyi çıkarır, budar, döküntüyü ve bozuk yemi toplar, fazla cırcır böceği ve salyangozu yakalar. |
| Cam sil | Mıknatıslı silici: buğuyu ve yosunu temizler. |

Yan panelden havalandırma (tel kapağın ne kadarının camla örtüldüğü), otomatik yağmurlama ve teraryumun odadaki yeri seçilir. Görevler yeni bitki türlerinin kilidini açar.

## Simülasyon

- **Su döngüsü:** Toprak ve bitkiler buharlaştırır; nem, ön camın sıcaklığına göre hesaplanan yoğuşma eşiğini (Magnus formülü) geçince camda buğu ve damla olur. Tel kapak ve ön havalandırma şeridi nemi dışarı atar.
- **İklim:** Güneş eğrisi, teraryumun yeri ve LED aydınlatma ışığı ve ısıyı belirler. Gece otomatik modda mavi ay ışığı yanar.
- **Besin zinciri:** Hayvanlar acıkır ve avlanır; açlık, nem, sıcaklık, hijyen ve stres (kalabalık, avcı, saklanacak bitki azlığı, sık kapı açılması) sağlıklarını belirler.
- **Ayrışma:** Dışkı, yaprak döküntüsü ve ölü canlılar toprak canlılarınca parçalanıp bitkilere besin olur. Döküntü birikirse küf ve hastalık riski artar.
- **Bitkiler:** Her türün nem, toprak nemi, ışık ve sıcaklık aralığı vardır. Susuz kalan bitki sarkar, ıslak toprakta kök çürür, düşük nemde yaprak uçları kurur.

## Geliştirme

Adresin sonuna `#debug` eklenirse simülasyon tarayıcı konsolundan `window.__terra` ile sürülebilir (ör. `__terra.step(__terra.S, 60)`).
