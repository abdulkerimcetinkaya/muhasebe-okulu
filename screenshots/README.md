# 📸 Ekran Görüntüleri Kılavuzu

Bu klasör README.md dosyasında kullanılacak ekran görüntülerini içerir.

## 📋 Gerekli Ekran Görüntüleri

Aşağıdaki ekran görüntülerini çekip bu klasöre ekleyin:

### 1. homepage.png
**Sayfa**: `http://localhost:8080/index.html`
- **Boyut**: 1920x1080 (Full HD)
- **İçerik**: Ana sayfa - Hero section, özellikler ve grafik görünür olmalı
- **Tarayıcı**: Chrome (tam ekran, devtools kapalı)
- **Önerilen**: Giriş yapmadan çekin

### 2. dashboard.png
**Sayfa**: `http://localhost:8080/dashboard.html`
- **Boyut**: 1920x1080
- **İçerik**: Kullanıcı dashboard'u - İstatistikler, grafikler ve aktivite kartları
- **Kullanıcı**: Normal kullanıcı (USER role)
- **Önerilen**: En az 3-4 problem çözülmüş olsun ki grafikler dolu görünsün

### 3. problem-solving.png
**Sayfa**: `http://localhost:8080/problem-detail.html?id=1`
- **Boyut**: 1920x1080
- **İçerik**: Problem çözme arayüzü - Problem açıklaması ve yevmiye kayıt formu
- **Durum**: Form yarı dolu (örnek kayıt girilmiş)
- **Önerilen**: "Hesap Planı" dropdown'u açık olabilir

### 4. quiz.png
**Sayfa**: `http://localhost:8080/quiz-detail.html?id=1`
- **Boyut**: 1920x1080
- **İçerik**: Quiz çözme ekranı - Sorular ve seçenekler görünür
- **Durum**: Birkaç soru yanıtlanmış olabilir
- **Önerilen**: Timer ve ilerleme çubuğu görünsün

### 5. study-cards.png
**Sayfa**: `http://localhost:8080/study.html`
- **Boyut**: 1920x1080
- **İçerik**: Çalışma kartları listesi - Kategoriler ve kartlar
- **Önerilen**: Grid layout'ta en az 6-8 kart görünsün

### 6. profile.png
**Sayfa**: `http://localhost:8080/profile.html`
- **Boyut**: 1920x1080
- **İçerik**: Kullanıcı profili - Profil bilgileri ve istatistikler
- **Tab**: "Profil Bilgileri" sekmesi açık
- **Önerilen**: Form dolu olsun (Ad, soyad, email, meslek)

### 7. admin-panel.png
**Sayfa**: `http://localhost:8080/admin.html`
- **Boyut**: 1920x1080
- **İçerik**: Admin panel - Kullanıcı veya problem yönetimi tablosu
- **Kullanıcı**: Admin hesabı
- **Önerilen**: Tabloda birkaç satır veri olsun
- **⚠️ GÜVENLİK**: Gerçek kullanıcı bilgileri, email adresleri veya hassas veriler görünmesin

### 8. admin-dashboard.png
**Sayfa**: `http://localhost:8080/admin-dashboard.html`
- **Boyut**: 1920x1080
- **İçerik**: Admin dashboard - Sistem geneli istatistikler ve grafikler
- **Kullanıcı**: Admin hesabı
- **Önerilen**: Tüm grafikler ve KPI kartları görünsün
- **⚠️ GÜVENLİK**: API endpoint'leri, sistem detayları veya hassas metrikler bulanıklaştırılabilir

## 🎨 Ekran Görüntüsü Çekme Önerileri

### Tarayıcı Ayarları
1. **Chrome** veya **Firefox** kullanın
2. **Full screen** (F11) modunda çekin
3. **DevTools** kapalı olsun
4. **Zoom**: %100
5. **Ekran çözünürlüğü**: 1920x1080 minimum

### Görsel Kalite
- ✅ UI elementleri net görünsün
- ✅ Yazılar okunabilir olsun
- ✅ Responsive design (mobil görünüm gerekmez)
- ✅ Lucide ikonları yüklenmiş olsun
- ✅ Tailwind CSS stilleri uygulanmış olsun

### İçerik Önerileri
- ✅ **Demo veri kullanın** (gerçek kişisel bilgi yok)
- ✅ Türkçe içerik
- ✅ Grafikler dolu görünsün (birkaç veri noktası)
- ✅ Boş tablolar yerine örnek verilerle dolu tablolar

### 🔒 Güvenlik Kontrolleri
- ❌ **Gerçek email adresleri gösterme**
- ❌ **Gerçek telefon numaraları gösterme**
- ❌ **API token'ları veya JWT gösterme**
- ❌ **Veritabanı şifreleri gösterme**
- ❌ **Sistem path'leri gösterme** (C:\Users\..., /home/...)
- ✅ **Mock/dummy data kullan**: test@example.com, +90 5XX XXX XXXX
- ✅ **Admin panelinde hassas alanları blur'la**

### Çekim Araçları

#### Windows
- **Snipping Tool** (Windows + Shift + S)
- **ShareX** (ücretsiz, otomatik yükleme)
- **Greenshot** (ücretsiz, açık kaynak)

#### macOS
- **Command + Shift + 4** (alan seçerek)
- **Command + Shift + 3** (tam ekran)
- **Cleanshot X** (ücretli, profesyonel)

#### Linux
- **GNOME Screenshot**
- **Flameshot** (ücretsiz)
- **Spectacle** (KDE)

#### Tarayıcı Uzantıları
- **Fireshot** - Tam sayfa screenshot
- **Awesome Screenshot** - Düzenleme imkanı
- **Nimbus Screenshot** - Video kayıt da yapabilir

## 📐 Dosya Adlandırma

Screenshot'ları tam olarak bu isimlerle kaydedin:

```
screenshots/
├── homepage.png
├── dashboard.png
├── problem-solving.png
├── quiz.png
├── study-cards.png
├── profile.png
├── admin-panel.png
└── admin-dashboard.png
```

## 🔧 Görüntü Optimizasyonu (İsteğe Bağlı)

Screenshot'ları optimize etmek için:

### Online Araçlar
- [TinyPNG](https://tinypng.com/) - PNG compression
- [Squoosh](https://squoosh.app/) - Google's image compressor
- [Compressor.io](https://compressor.io/) - Multi-format

### Komut Satırı
```bash
# ImageMagick ile resize ve optimize
convert input.png -resize 1920x1080 -quality 85 output.png

# Batch optimize (tüm PNG'ler)
for file in *.png; do
  convert "$file" -quality 85 "optimized-$file"
done
```

### Hedef
- **Dosya boyutu**: 200-500 KB per image
- **Format**: PNG (lossless) veya JPG (lossy, yüksek kalite)
- **Boyut**: 1920x1080 veya 1280x720

## ✅ Checklist

Screenshot çekmeden önce:

- [ ] Uygulama `http://localhost:8080` adresinde çalışıyor
- [ ] Veritabanında demo veriler var
- [ ] En az bir normal kullanıcı (USER) hesabı var
- [ ] En az bir admin (ADMIN) hesabı var
- [ ] Birkaç problem çözülmüş (istatistikler için)
- [ ] Birkaç quiz yapılmış
- [ ] Tarayıcı zoom %100
- [ ] DevTools kapalı
- [ ] Lucide ikonları yüklü

Screenshot'ları çektikten sonra:

- [ ] Tüm 8 dosya mevcut
- [ ] Dosya isimleri doğru
- [ ] Görüntüler net ve okunabilir
- [ ] Dosya boyutları makul (< 1MB)
- [ ] README.md'de görüntüler doğru referans edilmiş

## 🚀 Git'e Ekleme

Screenshot'ları çektikten sonra:

```bash
# Dosyaları stage'e ekle
git add screenshots/*.png

# Commit
git commit -m "docs: Add project screenshots for README"

# Push
git push origin master
```

---

**Not**: Bu screenshot'lar projenizin görsel dokümantasyonudur. Kaliteli ve açıklayıcı görüntüler kullanıcıların projeyi anlamasını kolaylaştırır.
