-- Kategori sistemi için gerekli tablolar ve ilişkiler

-- 1. Categories tablosunu oluştur
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 2. Problems tablosuna category_id ekle
ALTER TABLE problems ADD COLUMN IF NOT EXISTS category_id BIGINT;

-- 3. Foreign key constraint ekle
ALTER TABLE problems
    ADD CONSTRAINT fk_problem_category
    FOREIGN KEY (category_id)
    REFERENCES categories(id)
    ON DELETE SET NULL;

-- 4. Category display_order için index
CREATE INDEX IF NOT EXISTS idx_category_display_order ON categories(display_order);

-- 5. Problem category_id için index
CREATE INDEX IF NOT EXISTS idx_problem_category_id ON problems(category_id);

-- 6. Varsayılan kategorileri ekle
INSERT INTO categories (name, description, display_order) VALUES
('Genel', 'Genel muhasebe problemleri', 0),
('KDV İşlemleri', 'Katma Değer Vergisi hesaplamaları ve işlemleri', 1),
('Fatura İşlemleri', 'Alış-satış fatura kayıtları', 2),
('Maaş ve Bordro', 'Personel maaş ve bordro işlemleri', 3),
('Banka İşlemleri', 'Banka hesap hareketleri', 4),
('Kasa İşlemleri', 'Nakit giriş-çıkış işlemleri', 5),
('Çek ve Senet', 'Çek ve senet takibi', 6),
('Amortisman', 'Amortisman hesaplamaları', 7),
('Stok İşlemleri', 'Stok giriş-çıkış ve değerleme', 8),
('Dönem Sonu İşlemleri', 'Kapanış ve geçiş kayıtları', 9)
ON CONFLICT (name) DO NOTHING;

-- 7. Yorumlar
COMMENT ON TABLE categories IS 'Problem kategorileri';
COMMENT ON COLUMN categories.display_order IS 'Kategori gösterim sırası (küçükten büyüğe)';
COMMENT ON COLUMN problems.category_id IS 'Problemin ait olduğu kategori';
