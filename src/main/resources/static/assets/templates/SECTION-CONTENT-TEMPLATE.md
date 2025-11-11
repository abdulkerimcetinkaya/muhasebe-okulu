# Bölüm İçerik Şablonu - Word Dosyası İçin İşaretleyiciler

Bu doküman, Word dosyasında kullanacağınız özel işaretleyicileri açıklar. Bu işaretleyicilere göre oluşturduğunuz Word dosyasını sisteme yüklediğinizde, otomatik olarak doğru içerik tiplerine dönüştürülecektir.

---

## 📝 İşaretleyici Kuralları

### 1️⃣ HEADING (Başlıklar)

**Kullanım:**
```
## Ana Başlık (Başlık 2)
### Alt Başlık (Başlık 3)
#### Küçük Başlık (Başlık 4)
```

**Veya Word'de:**
- "Başlık 2" stili → HEADING (type: heading2)
- "Başlık 3" stili → HEADING (type: heading3)

**Örnek:**
```
## Temel Muhasebe Kavramları
```

---

### 2️⃣ PARAGRAPH (Paragraf)

**Kullanım:**
```
Normal metin yazın. Özel işaretleyici olmadan yazılan tüm metinler paragraf olarak algılanır.
```

**Örnek:**
```
Muhasebe, işletmelerin finansal durumlarını kaydetme, sınıflandırma ve raporlama sürecidir.
```

---

### 3️⃣ LIST (Listeler)

#### Madde İşaretli Liste (Bullet List)
**Kullanım:**
```
* Birinci madde
* İkinci madde
* Üçüncü madde
```

**Veya:**
```
- Birinci madde
- İkinci madde
```

**Örnek:**
```
* Finansal kayıtların tutulması
* İşletme performansının izlenmesi
* Stratejik kararların desteklenmesi
```

#### Numaralı Liste (Numbered List)
**Kullanım:**
```
1. Birinci adım
2. İkinci adım
3. Üçüncü adım
```

**Örnek:**
```
1. Tek Düzen Hesap Planı'nı ezberleyin
2. Her gün en az 5 muhasebe kaydı pratiği yapın
3. Borç-Alacak mantığını kavrayın
```

#### Yapılacaklar Listesi (Todo List)
**Kullanım:**
```
[ ] Tamamlanmamış görev
[x] Tamamlanmış görev
```

**Örnek:**
```
[ ] Borç: 100 KASA hesabına 50.000 TL
[ ] Alacak: 120 ALICILAR hesabına 50.000 TL
[x] Kayıt kontrolü yapıldı
```

---

### 4️⃣ TABLE (Tablo)

**Kullanım:**
```
| Başlık 1 | Başlık 2 | Başlık 3 |
|----------|----------|----------|
| Veri 1   | Veri 2   | Veri 3   |
| Veri 4   | Veri 5   | Veri 6   |
```

**Veya Word'de normal tablo oluşturun**

**Örnek:**
```
| Grup | Hesap Adı | Açıklama |
|------|-----------|----------|
| 1 | Dönen Varlıklar | Kısa vadeli varlıklar |
| 2 | Duran Varlıklar | Uzun vadeli varlıklar |
| 3 | Kısa Vadeli Yabancı Kaynaklar | 1 yıl içinde ödenecek borçlar |
```

---

### 5️⃣ CODE (Kod Bloğu)

**Kullanım:**
```
```
KOD İÇERİĞİ BURAYA
```
```

**Veya:**
```
~~~
KOD İÇERİĞİ BURAYA
~~~
```

**Örnek:**
```
```
───────────────────────────────────
100 KASA                    50.000
    120 ALICILAR                    50.000
───────────────────────────────────
Alıcılardan nakit tahsilat
```
```

---

### 6️⃣ QUOTE (Alıntı)

**Kullanım:**
```
> Alıntı metni buraya
```

**Örnek:**
```
> 💡 İpucu: Muhasebe öğrenmenin anahtarı düzenli pratiktir.
```

---

### 7️⃣ CALLOUT (Dikkat Kutusu)

**Kullanım:**
```
[!WARNING]
⚠️ DİKKAT: Bu hesap sadece nakit işlemlerde kullanılır.
```

**Veya:**
```
[!INFO]
ℹ️ BİLGİ: Bu bölümde temel kavramlar anlatılmaktadır.
```

**Veya:**
```
[!TIP]
💡 İPUCU: Her gün 30 dakika çalışarak 3 ayda uzmanlaşabilirsiniz.
```

**Seçenekler:**
- `[!WARNING]` → Uyarı (sarı)
- `[!INFO]` → Bilgi (mavi)
- `[!TIP]` → İpucu (yeşil)
- `[!ERROR]` → Hata (kırmızı)

---

### 8️⃣ DIVIDER (Ayırıcı Çizgi)

**Kullanım:**
```
---
```

**Veya:**
```
***
```

**Örnek:**
```
İlk bölüm sonu

---

İkinci bölüm başlangıcı
```

---

## 📄 Tam Örnek Word İçeriği

```markdown
## Giriş: Temel Kavramlar

Muhasebe, işletmelerin finansal durumlarını kaydetme, sınıflandırma ve raporlama sürecidir.

### Muhasebe Nedir?

Muhasebe sisteminin temel görevleri:

* Finansal kayıtların tutulması
* İşletme performansının izlenmesi
* Stratejik kararların desteklenmesi

> 💡 İpucu: Muhasebe, işletmenin dili ve karar verme mekanizmasının temelidir.

---

## Hesap Planı ve Kayıt Sistemi

Türkiye'de işletmeler Tek Düzen Hesap Planı'nı kullanır:

| Grup | Hesap Adı | Açıklama |
|------|-----------|----------|
| 1 | Dönen Varlıklar | Kısa vadeli varlıklar |
| 2 | Duran Varlıklar | Uzun vadeli varlıklar |
| 3 | Kısa Vadeli Yabancı Kaynaklar | 1 yıl içinde ödenecek borçlar |

### Örnek Hesap Kodları

```
100 KASA
101 ALINAN ÇEKLER
102 BANKALAR
120 ALICILAR
```

[!WARNING]
⚠️ DİKKAT: Hesap kodlarını doğru kullanmak kritik öneme sahiptir.

---

## Pratik: Muhasebe Kayıtları

Aşağıdaki işlemin muhasebe kaydını inceleyelim:

**İşlem:** Alıcılardan 50.000 TL nakit tahsil edilmiştir.

```
───────────────────────────────────
100 KASA                    50.000
    120 ALICILAR                    50.000
───────────────────────────────────
Alıcılardan nakit tahsilat
```

### Kayıt Adımları

1. Borç: 100 KASA hesabına 50.000 TL
2. Alacak: 120 ALICILAR hesabına 50.000 TL
3. Kayıt kontrolü yap

**Kontrol Listesi:**

[ ] Borç tarafı doğru mu?
[ ] Alacak tarafı doğru mu?
[x] Tutar eşitliği sağlandı

---

## İleriye Dönük Çalışma

> 🎯 Çalışma Planınız: Her gün düzenli pratik yaparak 3 ayda temel seviyede uzmanlaşabilirsiniz.
```

---

## 🚀 Nasıl Kullanılır?

### Adım 1: Word Dosyası Hazırlayın
1. Microsoft Word'de yeni bir doküman açın
2. Yukarıdaki işaretleyicileri kullanarak içeriğinizi yazın
3. Dosyayı kaydedin (`.docx` formatında)

### Adım 2: Sisteme Yükleyin
1. Admin Panel → Bölüm Yönetimi
2. İlgili bölümü seçin
3. "Word Dosyasından İçe Aktar" butonuna tıklayın
4. Word dosyanızı seçin
5. Sistem otomatik olarak parse edecek ve ContentItem'lara dönüştürecek

### Adım 3: Kontrol Edin
- Yüklenen içerikleri kontrol edin
- Gerekirse düzenleyin
- Yayınlayın!

---

## 💡 İpuçları

### En İyi Pratikler
- **Başlıklar**: Her bölüm `##` ile başlamalı
- **Listeler**: Madde başına tek satır kullanın
- **Tablolar**: Başlık satırı mutlaka ekleyin
- **Kod Blokları**: Muhasebe kayıtları için `───` ayırıcı kullanın
- **Callout'lar**: Emoji ekleyerek görselliği artırın

### Sık Yapılan Hatalar
❌ Başlık için `#` tek kullanmak (`#` yerine `##` kullanın)
❌ Liste maddelerinde boşluk bırakmamak
❌ Tablo satırlarında sütun sayısını değiştirmek
❌ Kod bloğunda ``` işaretini kapatmayı unutmak

### Performans İpuçları
- Çok büyük Word dosyaları yerine 10-15 sayfalık bölümler halinde yükleyin
- Görseller için ayrı bir sistem kullanın (Word'den görsel yüklemesi şimdilik desteklenmiyor)
- Karmaşık formatlamalar yerine sade işaretleyicileri tercih edin

---

## 🔧 Teknik Detaylar

### Desteklenen İşaretleyiciler
- ✅ Markdown başlıklar (`##`, `###`)
- ✅ Markdown listeler (`*`, `-`, `1.`, `[ ]`)
- ✅ Markdown tablolar (`|`)
- ✅ Markdown kod blokları (` ``` `)
- ✅ Markdown alıntılar (`>`)
- ✅ Markdown ayırıcılar (`---`)
- ✅ GitHub Flavored Markdown callouts (`[!WARNING]`)
- ✅ Word stilleri (Başlık 2, Başlık 3)
- ✅ Word tabloları

### Desteklenmeyen Özellikler
- ❌ Görseller (yakında eklenecek)
- ❌ Renkli metinler (HTML formatına dönüştürülür)
- ❌ Özel fontlar (varsayılan font kullanılır)
- ❌ Sayfa düzeni (içerik olarak alınır)

---

**Hazırlayan**: MuhasebeOkulu Platform
**Versiyon**: 1.0
**Tarih**: 2025-11-10
