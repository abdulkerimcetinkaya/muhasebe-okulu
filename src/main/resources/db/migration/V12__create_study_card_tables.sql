-- V12: Create StudyCard and CardSection tables for learning cards module

-- Create study_cards table
CREATE TABLE IF NOT EXISTS study_cards (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    color VARCHAR(50),
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create card_sections table
CREATE TABLE IF NOT EXISTS card_sections (
    id BIGSERIAL PRIMARY KEY,
    study_card_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    content_type VARCHAR(20) NOT NULL DEFAULT 'TEXT',
    content TEXT,
    related_problem_id BIGINT,
    related_quiz_id BIGINT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_card_sections_study_card FOREIGN KEY (study_card_id)
        REFERENCES study_cards(id) ON DELETE CASCADE,
    CONSTRAINT fk_card_sections_problem FOREIGN KEY (related_problem_id)
        REFERENCES problems(id) ON DELETE SET NULL,
    CONSTRAINT fk_card_sections_quiz FOREIGN KEY (related_quiz_id)
        REFERENCES quizzes(id) ON DELETE SET NULL,
    CONSTRAINT chk_content_type CHECK (content_type IN ('TEXT', 'PROBLEM', 'QUIZ'))
);

-- Create indexes for performance
CREATE INDEX idx_study_cards_active_order ON study_cards(is_active, display_order);
CREATE INDEX idx_card_sections_study_card ON card_sections(study_card_id);
CREATE INDEX idx_card_sections_active_order ON card_sections(is_active, display_order);
CREATE INDEX idx_card_sections_problem ON card_sections(related_problem_id);
CREATE INDEX idx_card_sections_quiz ON card_sections(related_quiz_id);

-- Insert sample study cards
INSERT INTO study_cards (title, description, icon, color, display_order, is_active) VALUES
('Temel Muhasebe Kavramları', 'Muhasebe sisteminin temel yapı taşlarını ve prensiplerini öğrenin', 'book-open', 'blue', 1, true),
('Hesap Planı ve Sınıflandırma', 'Tekdüzen hesap planını ve hesap sınıflandırmasını anlayın', 'list', 'green', 2, true),
('Yevmiye ve Defter Kayıtları', 'Muhasebe kayıtlarını doğru şekilde yapmayı öğrenin', 'edit', 'purple', 3, true),
('Ticari İşlemler', 'Alış, satış ve diğer ticari işlemlerin muhasebeleştirilmesi', 'shopping-cart', 'orange', 4, true),
('Mali Tablolar', 'Bilanço, gelir tablosu ve nakit akış tablolarını anlayın', 'bar-chart', 'red', 5, true);

-- Insert sample sections for first study card (Temel Muhasebe Kavramları)
INSERT INTO card_sections (study_card_id, title, display_order, content_type, content, is_active) VALUES
(1, 'Muhasebe Nedir?', 1, 'TEXT', '<h2>Muhasebe Nedir?</h2><p>Muhasebe, işletmelerin ekonomik faaliyetlerini kaydetme, sınıflandırma, özetleme ve raporlama bilimidir.</p><h3>Muhasebenin Temel Fonksiyonları:</h3><ul><li><strong>Kaydetme:</strong> İşlemlerin belgelere dayanarak kaydedilmesi</li><li><strong>Sınıflandırma:</strong> İşlemlerin hesaplara göre gruplandırılması</li><li><strong>Özetleme:</strong> Verilerin anlamlı raporlara dönüştürülmesi</li><li><strong>Raporlama:</strong> Mali tabloların hazırlanması ve sunulması</li></ul>', true),
(1, 'Muhasebe Denkliği', 2, 'TEXT', '<h2>Temel Muhasebe Denklemi</h2><p class="text-xl font-bold text-center my-4">VARLIKLAR = KAYNAKLAR</p><p class="text-lg text-center my-4">VARLIKLAR = YABANCI KAYNAKLAR + ÖZKAYNAK</p><h3>Varlıklar (Aktifler)</h3><p>İşletmenin sahip olduğu ekonomik değerler:</p><ul><li>Kasa, Banka</li><li>Alacaklar</li><li>Stoklar</li><li>Demirbaşlar</li></ul><h3>Kaynaklar (Pasifler)</h3><p>Varlıkların nereden sağlandığını gösteren hesaplar:</p><ul><li><strong>Yabancı Kaynaklar:</strong> Borçlar</li><li><strong>Özkaynak:</strong> İşletme sahibinin işletmeye koyduğu sermaye ve karlar</li></ul>', true),
(1, 'Borç ve Alacak Kavramı', 3, 'TEXT', '<h2>Borç ve Alacak</h2><p>Muhasebenin temel mantığı borç-alacak sistemine dayanır.</p><h3>Borç (Sol Taraf)</h3><ul><li>Varlıklardaki artışlar</li><li>Giderlerdeki artışlar</li><li>Kaynaklardaki azalışlar</li></ul><h3>Alacak (Sağ Taraf)</h3><ul><li>Varlıklardaki azalışlar</li><li>Gelirlerdeki artışlar</li><li>Kaynaklardaki artışlar</li></ul><div class="bg-blue-50 p-4 rounded-lg mt-4"><strong>Önemli:</strong> Her muhasebe kaydında toplam borç = toplam alacak olmalıdır!</div>', true);

-- Insert a practice problem link for the first study card
-- This will be updated after problems are available in the system
-- INSERT INTO card_sections (study_card_id, title, display_order, content_type, related_problem_id, is_active) VALUES
-- (1, 'Pratik Yapın: Temel İşlemler', 4, 'PROBLEM', 1, true);

COMMENT ON TABLE study_cards IS 'Learning cards (topics) for student study module';
COMMENT ON TABLE card_sections IS 'Subsections within study cards with dynamic content (text, problem, or quiz links)';
COMMENT ON COLUMN card_sections.content_type IS 'Type of content: TEXT (plain text), PROBLEM (link to problem), QUIZ (link to quiz)';
COMMENT ON COLUMN card_sections.related_problem_id IS 'Foreign key to problems table when content_type=PROBLEM';
COMMENT ON COLUMN card_sections.related_quiz_id IS 'Foreign key to quizzes table when content_type=QUIZ';
