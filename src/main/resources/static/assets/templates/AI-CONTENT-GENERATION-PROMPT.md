# Muhasebe Öğrenme Kartı Bölüm İçeriği Oluşturma - AI Prompt Şablonu

Bu doküman, yapay zeka araçlarına (ChatGPT, Claude, vb.) vereceğiniz prompt şablonunu içerir. AI, bu talimatlara göre öğrenme kartı bölümleri için JSON formatında içerik üretecektir.

---

## 📚 Bölüm Bilgileri

Aşağıdaki bilgileri doldurun ve AI'a verin:

```
- **Bölüm Adı**: [BÖLÜM ADI BURAYA]
- **Konu**: [KONU BURAYA - örn: "Dönen Varlıklar", "Amortisman Hesaplamaları"]
- **Seviye**: [Başlangıç/Orta/İleri]
- **Hedef**: [Öğrenim hedefi - örn: "Öğrenci kasa hesabı kullanımını öğrenir"]
```

---

## 🎨 Kullanılabilir İçerik Tipleri

Sistemimiz aşağıdaki içerik tiplerini destekler:

### 1️⃣ HEADING (Başlıklar)

**Kullanım**: Ana başlık için `heading1`, alt başlıklar için `heading2`, küçük başlıklar için `heading3`

```json
{
  "contentType": "HEADING",
  "displayOrder": 0,
  "active": true,
  "blockData": {
    "id": "block-1",
    "type": "heading1",
    "content": "Başlık Metni",
    "properties": {}
  }
}
```

**Type seçenekleri**: `heading1`, `heading2`, `heading3`

---

### 2️⃣ PARAGRAPH (Paragraf)

**Kullanım**: Açıklama metinleri, kavram tanımları

```json
{
  "contentType": "PARAGRAPH",
  "displayOrder": 1,
  "active": true,
  "blockData": {
    "id": "block-2",
    "type": "paragraph",
    "content": "Metin içeriği. <strong>Kalın</strong>, <em>italik</em>, <u>altı çizili</u> kullanabilirsin.",
    "properties": {}
  }
}
```

**HTML Desteklenen Etiketler**: `<strong>`, `<em>`, `<u>`, `<br>`, `<a>`

---

### 3️⃣ LIST (Listeler)

**Kullanım**:
- `bulletList`: Madde işaretli listeler
- `numberedList`: Numaralı listeler
- `todoList`: Kontrol listesi

```json
{
  "contentType": "LIST",
  "displayOrder": 2,
  "active": true,
  "blockData": {
    "id": "block-3",
    "type": "bulletList",
    "content": "<li>Birinci madde</li><li>İkinci madde</li><li>Üçüncü madde</li>",
    "properties": {}
  }
}
```

**TodoList özel kullanımı**:
```json
{
  "type": "todoList",
  "content": "<li data-checked='false'>Tamamlanmamış</li><li data-checked='true'>Tamamlanmış</li>"
}
```

**Type seçenekleri**: `bulletList`, `numberedList`, `todoList`

---

### 4️⃣ TABLE (Tablolar)

**Kullanım**: Hesap planları, karşılaştırma tabloları, özet tablolar

```json
{
  "contentType": "TABLE",
  "displayOrder": 3,
  "active": true,
  "blockData": {
    "id": "block-4",
    "type": "table",
    "content": "<table><tr><td>Başlık 1</td><td>Başlık 2</td></tr><tr><td>Veri 1</td><td>Veri 2</td></tr></table>",
    "properties": {
      "rows": 2,
      "cols": 2
    }
  }
}
```

**Önemli**: `properties` içinde `rows` ve `cols` sayılarını belirtin.

---

### 5️⃣ CODE (Kod Blokları)

**Kullanım**: Muhasebe kayıtları, hesap örnekleri, kodlar

```json
{
  "contentType": "CODE",
  "displayOrder": 4,
  "active": true,
  "blockData": {
    "id": "block-5",
    "type": "code",
    "content": "100 KASA                    50.000\n    120 ALICILAR                    50.000\n───────────────────────────────────\nNakit tahsilat",
    "properties": {
      "language": "plaintext"
    }
  }
}
```

**Language seçenekleri**: `plaintext`, `javascript`, `python`, `java`, vb.

---

### 6️⃣ QUOTE (Alıntılar)

**Kullanım**: Önemli notlar, ipuçları, hatırlatmalar

```json
{
  "contentType": "QUOTE",
  "displayOrder": 5,
  "active": true,
  "blockData": {
    "id": "block-6",
    "type": "quote",
    "content": "💡 <strong>İpucu:</strong> Muhasebe öğrenmenin anahtarı düzenli pratiktir.",
    "properties": {}
  }
}
```

**Emoji kullanımı önerilir**: 💡 (ipucu), ⚠️ (uyarı), ✅ (başarı), 🎯 (hedef)

---

### 7️⃣ CALLOUT (Dikkat Kutuları)

**Kullanım**: Uyarılar, önemli bilgiler, hatalar

```json
{
  "contentType": "CALLOUT",
  "displayOrder": 6,
  "active": true,
  "blockData": {
    "id": "block-7",
    "type": "callout",
    "content": "⚠️ DİKKAT: Bu hesap sadece nakit işlemlerde kullanılır.",
    "properties": {
      "style": "warning"
    }
  }
}
```

**Style seçenekleri**: `warning`, `info`, `success`, `error`

---

### 8️⃣ DIVIDER (Ayırıcı Çizgi)

**Kullanım**: Bölüm ayırıcı, görsel düzenleme

```json
{
  "contentType": "DIVIDER",
  "displayOrder": 7,
  "active": true,
  "blockData": {
    "id": "block-8",
    "type": "divider",
    "content": "",
    "properties": {}
  }
}
```

---

## 📝 İçerik Oluşturma Kuralları

### 1. Bölüm Yapısı
- Her bölüm bir ana başlık (HEADING, heading2) ile başlamalı
- Giriş paragrafı ile konuya giriş yap
- İçeriği mantıklı sırayla düzenle: **Kavram → Açıklama → Örnek → Uygulama**

### 2. Didaktik Sıralama
- **Teori → Örnek → Pratik → Özet** şeklinde ilerle
- Karmaşık konuları adım adım açıkla
- Her 3-4 paragrafa bir görsel element ekle (tablo, liste, quote)

### 3. Görsellik
- Monoton metin bloklarından kaçın
- Liste, tablo, kod bloğu, quote ile içeriği zenginleştir
- Önemli noktalar için CALLOUT kullan
- Bölümler arası geçişlerde DIVIDER kullan

### 4. Muhasebe Kayıtları
- Tüm muhasebe kayıtları **CODE** bloğunda olmalı
- Borç-Alacak hizalaması düzgün olmalı
- Her kaydın altına açıklama ekle
- Ayırıcı çizgi kullan: `───────────────────────────────────`

### 5. Eğitimsel Öğeler
- **İpuçları** için QUOTE kullan (💡 emojisi ile başlat)
- **Uyarılar** için CALLOUT kullan (⚠️ emojisi ile başlat)
- **Adım adım talimatlar** için numberedList kullan
- **Kontrol listesi** için todoList kullan

### 6. JSON Kuralları
- Her `block-X` id'si **benzersiz** olmalı (block-1, block-2, block-3, ...)
- `displayOrder` **sıralı artmalı** (0, 1, 2, 3, ...)
- HTML içeriklerinde özel karakterler escape edilmeli
- Tablo content'i `<table>` etiketi ile sarmalanmalı
- String içinde yeni satır için `\n` kullan

---

## 🎯 Çıktı Formatı

AI'dan aşağıdaki gibi tam bir JSON yanıtı isteyin:

```json
{
  "studyCardId": [ID],
  "sections": [
    {
      "title": "[BÖLÜM ADI]",
      "displayOrder": 1,
      "active": true,
      "contentItems": [
        {
          "contentType": "HEADING",
          "displayOrder": 0,
          "active": true,
          "blockData": {
            "id": "block-1",
            "type": "heading2",
            "content": "Bölüm Başlığı",
            "properties": {}
          }
        },
        {
          "contentType": "PARAGRAPH",
          "displayOrder": 1,
          "active": true,
          "blockData": {
            "id": "block-2",
            "type": "paragraph",
            "content": "Giriş paragrafı...",
            "properties": {}
          }
        }
        // Diğer içerik blokları...
      ]
    }
  ]
}
```

---

## ✅ Örnek İçerik Akışı

İyi bir bölüm şu sırayla ilerler:

1. **Giriş** (HEADING + PARAGRAPH)
2. **Temel Kavramlar** (PARAGRAPH + LIST)
3. **Görsel Açıklama** (TABLE veya CODE)
4. **Önemli Not** (QUOTE veya CALLOUT)
5. **Divider**
6. **Pratik Örnek** (HEADING + PARAGRAPH + CODE)
7. **Adımlar** (numberedList veya todoList)
8. **Özet** (QUOTE)

---

## 🚀 AI'a Verilecek Tam Prompt

```markdown
Sen bir muhasebe eğitim içeriği uzmanısın. Aşağıdaki kurallara göre bir öğrenme kartı bölümü için JSON formatında içerik üreteceksin.

## 📚 Bölüm Bilgileri
- **Bölüm Adı**: [BURAYA KONU YAZIN]
- **Konu**: [DETAYLI KONU AÇIKLAMASI]
- **Seviye**: [Başlangıç/Orta/İleri]
- **Hedef**: [Öğrenim hedefi]

## 🎨 Kullanabileceğin İçerik Tipleri

[Yukarıdaki tüm içerik tiplerini buraya kopyala]

## 📝 Kurallar

[Yukarıdaki kuralları buraya kopyala]

## ✅ Görev

Yukarıdaki formata göre "[BÖLÜM ADI]" konusunda:
- Detaylı ve eğitici
- Görsel açıdan zengin
- Adım adım ilerleyen
- Örneklerle desteklenmiş
- JSON formatında valid ve import edilmeye hazır

bir bölüm içeriği üret.

**ÖNEMLİ**: Sadece JSON formatında yanıt ver, başka açıklama ekleme.
```

---

## 💡 Kullanım Örnekleri

### Örnek 1: Temel Konu

```
## 📚 Bölüm Bilgileri
- **Bölüm Adı**: "Kasa Hesabı ve Nakit İşlemler"
- **Konu**: Dönen Varlıklar - 100 Kasa Hesabı
- **Seviye**: Başlangıç
- **Hedef**: Öğrenci kasa hesabının kullanımını, borç-alacak kaydını ve nakit işlem örneklerini öğrenir
```

### Örnek 2: İleri Konu

```
## 📚 Bölüm Bilgileri
- **Bölüm Adı**: "Amortisman Yöntemleri ve Hesaplamaları"
- **Konu**: Duran Varlıklar - Amortisman İşlemleri
- **Seviye**: İleri
- **Hedef**: Öğrenci normal, azalan bakiyeler ve hızlandırılmış amortisman yöntemlerini öğrenir ve uygular
```

### Örnek 3: Pratik Odaklı

```
## 📚 Bölüm Bilgileri
- **Bölüm Adı**: "Günlük İşlem Kayıtları - Pratik Uygulamalar"
- **Konu**: Günlük Kayıt Teknikleri
- **Seviye**: Orta
- **Hedef**: Öğrenci gerçek işletme senaryolarında günlük kayıt yapmayı pratik eder
```

---

## 🔍 Doğrulama Kontrol Listesi

Üretilen JSON'u kullanmadan önce kontrol edin:

- [ ] JSON geçerli mi? (JSON validator kullanın)
- [ ] Tüm `block-X` id'leri benzersiz mi?
- [ ] `displayOrder` değerleri sıralı mı?
- [ ] Her bölüm bir HEADING ile başlıyor mu?
- [ ] En az 5-6 farklı içerik tipi kullanılmış mı?
- [ ] Muhasebe kayıtları CODE bloğunda mı?
- [ ] QUOTE veya CALLOUT ile ipucu var mı?
- [ ] Tablo varsa `properties` içinde rows/cols belirtilmiş mi?
- [ ] HTML etiketleri doğru kapatılmış mı?
- [ ] Türkçe karakterler düzgün görünüyor mu?

---

## 📁 Dosya Konumu

Bu prompt şablonunu kullanarak üretilen JSON dosyalarını şu endpoint'e POST edin:

```
POST /api/admin/study-cards/{cardId}/sections/bulk
Content-Type: application/json

[ÜRETILEN JSON]
```

---

**Hazırlayan**: MuhasebeOkulu AI Content Generation System
**Versiyon**: 1.0
**Tarih**: 2025-11-10
