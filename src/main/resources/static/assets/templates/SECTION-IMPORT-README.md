# Toplu Bölüm İçe Aktarma Kılavuzu

## Genel Bakış

Bu şablonlar, çalışma kartlarına (Study Cards) toplu olarak bölüm (section) ve içerik (content) eklemek için kullanılır.

## Şablon Dosyaları

### 1. `bulk-section-import-template.json`
Gelişmiş block-based editor içerikleri ile tam özellikli örnek.

**İçerik Tipleri:**
- `HEADING` - Başlıklar (heading1, heading2, heading3)
- `PARAGRAPH` - Paragraflar
- `LIST` - Listeler (bulletList, numberedList, todoList)
- `QUOTE` - Alıntılar
- `CODE` - Kod blokları
- `TABLE` - Tablolar
- `DIVIDER` - Ayraçlar

### 2. `bulk-section-import-simple-template.json`
Basit metin içerikleri ile minimal örnek.

## JSON Yapısı

```json
{
  "studyCardId": 4,           // Bölümlerin ekleneceği kart ID'si
  "sections": [
    {
      "title": "Bölüm Başlığı",
      "displayOrder": 1,       // Sıra numarası
      "active": true,          // Aktif mi?
      "contentItems": [        // İçerik blokları
        {
          "contentType": "PARAGRAPH",
          "displayOrder": 0,
          "active": true,
          "textContent": "Basit metin (opsiyonel)",
          "blockData": {       // Block editor verisi
            "id": "block-1",
            "type": "paragraph",
            "content": "HTML içerik",
            "properties": {}
          }
        }
      ]
    }
  ]
}
```

## İçerik Tipleri Detayları

### HEADING - Başlık
```json
{
  "contentType": "HEADING",
  "blockData": {
    "type": "heading1",  // heading1, heading2, heading3
    "content": "Başlık Metni"
  }
}
```

### PARAGRAPH - Paragraf
```json
{
  "contentType": "PARAGRAPH",
  "blockData": {
    "type": "paragraph",
    "content": "Normal veya <strong>HTML</strong> formatında metin"
  }
}
```

### LIST - Liste
```json
{
  "contentType": "LIST",
  "blockData": {
    "type": "bulletList",  // bulletList, numberedList, todoList
    "content": "<li>İlk madde</li><li>İkinci madde</li>"
  }
}
```

### QUOTE - Alıntı
```json
{
  "contentType": "QUOTE",
  "blockData": {
    "type": "quote",
    "content": "Alıntı metni..."
  }
}
```

### CODE - Kod Bloğu
```json
{
  "contentType": "CODE",
  "blockData": {
    "type": "code",
    "content": "function example() {\n  return 'kod';\n}",
    "properties": {
      "language": "javascript"  // plaintext, javascript, python, etc.
    }
  }
}
```

### TABLE - Tablo
```json
{
  "contentType": "TABLE",
  "blockData": {
    "type": "table",
    "content": "<table><tr><td>A</td><td>B</td></tr></table>",
    "properties": {
      "rows": 2,
      "cols": 2
    }
  }
}
```

### DIVIDER - Ayraç
```json
{
  "contentType": "DIVIDER",
  "blockData": {
    "type": "divider",
    "content": ""
  }
}
```

## Kullanım Adımları

### 1. Kart ID'sini Bulun
- Admin Panel → Öğrenme Kartları → Kart Yönetimi
- İçerik eklemek istediğiniz kartın ID'sini not edin

### 2. Şablonu Düzenleyin
- `bulk-section-import-template.json` dosyasını kopyalayın
- `studyCardId` değerini değiştirin
- Bölümleri ve içerikleri düzenleyin

### 3. İçe Aktarın
- Admin Panel → Öğrenme Kartları → Bölüm Yönetimi
- "Toplu İçe Aktar" butonuna tıklayın (yakında eklenecek)
- JSON dosyasını seçin veya yapıştırın
- "İçe Aktar" butonuna tıklayın

## İpuçları

### 1. Display Order (Sıralama)
- Bölümler için: 1, 2, 3, 4...
- İçerikler için: 0, 1, 2, 3...
- Her bölüm kendi içinde 0'dan başlar

### 2. HTML İçerik
- `<strong>` - Kalın
- `<em>` - İtalik
- `<u>` - Altı çizili
- `<br>` - Satır atlama
- HTML etiketleri içerikte kullanılabilir

### 3. Block ID'leri
- Her block için benzersiz bir ID kullanın
- Önerilen format: `block-1`, `block-2`, `block-abc123`

### 4. TODO List
```json
{
  "type": "todoList",
  "content": "<li data-checked='false'>Yapılacak</li><li data-checked='true'>Tamamlandı</li>"
}
```

### 5. Code Block Dilleri
Desteklenen diller:
- `plaintext` - Düz metin
- `javascript` - JavaScript
- `python` - Python
- `java` - Java
- `html` - HTML
- `css` - CSS
- `sql` - SQL

## Örnek: Tam Bölüm

```json
{
  "title": "Muhasebe Kayıtları",
  "displayOrder": 1,
  "active": true,
  "contentItems": [
    {
      "contentType": "HEADING",
      "displayOrder": 0,
      "active": true,
      "blockData": {
        "id": "h1",
        "type": "heading1",
        "content": "Temel Kayıtlar"
      }
    },
    {
      "contentType": "PARAGRAPH",
      "displayOrder": 1,
      "active": true,
      "blockData": {
        "id": "p1",
        "type": "paragraph",
        "content": "Muhasebe kayıtları <strong>borç</strong> ve <strong>alacak</strong> mantığıyla yapılır."
      }
    },
    {
      "contentType": "CODE",
      "displayOrder": 2,
      "active": true,
      "blockData": {
        "id": "code1",
        "type": "code",
        "content": "100 KASA        10.000\n    120 ALICILAR        10.000",
        "properties": {
          "language": "plaintext"
        }
      }
    }
  ]
}
```

## Hata Giderme

### "Invalid contentType" Hatası
- ContentType değerlerini kontrol edin: TEXT, HEADING, PARAGRAPH, LIST, QUOTE, CODE, TABLE, DIVIDER

### "studyCardId not found" Hatası
- Kart ID'sinin doğru olduğundan emin olun
- Kartın aktif olduğunu kontrol edin

### "Invalid JSON" Hatası
- JSON syntax'ını kontrol edin (virgüller, köşeli/süslü parantezler)
- Online JSON validator kullanın

## API Endpoint

**Endpoint:** `POST /api/admin/study-cards/sections/bulk`

**Request Body:**
```json
{
  "studyCardId": 4,
  "sections": [...]
}
```

**Response:**
```json
{
  "totalSections": 4,
  "successCount": 4,
  "failureCount": 0,
  "errors": []
}
```

## Notlar

- Maksimum 50 bölüm tek seferde eklenebilir
- Her bölüm maksimum 100 içerik bloğu içerebilir
- Büyük içerikler için parçalara ayırın
- Problem ve Quiz içerikleri için relatedProblemId/relatedQuizId kullanın
