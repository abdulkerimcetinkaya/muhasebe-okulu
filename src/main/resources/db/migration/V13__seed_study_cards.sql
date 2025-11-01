-- V13: Seed StudyCards and CardSections with fundamental accounting topics

-- Insert StudyCards
INSERT INTO study_cards (title, description, icon, color, display_order, is_active, created_at, updated_at)
VALUES
    ('Temel Kavramlar', 'Muhasebenin temel ilkeleri ve kavramları', '📚', 'blue', 1, true, NOW(), NOW()),
    ('Hesaplar ve Kayıt Sistemi', 'Çift taraflı kayıt sistemi ve hesap planı', '📊', 'green', 2, true, NOW(), NOW()),
    ('Mali Tablolar', 'Bilanço, gelir tablosu ve diğer finansal raporlar', '📈', 'purple', 3, true, NOW(), NOW()),
    ('Tek Düzen Hesap Planı', 'Türkiye''de kullanılan standart hesap planı yapısı', '🗂️', 'orange', 4, true, NOW(), NOW());

-- Get the IDs for later use (we'll use subqueries)

-- Temel Kavramlar - Sections
INSERT INTO card_sections (study_card_id, title, display_order, content_type, content, is_active, created_at, updated_at)
SELECT id, 'Dönemsellik Kavramı', 1, 'TEXT',
'<h3>Dönemsellik Kavramı (Accounting Period Concept)</h3>
<p>Dönemsellik kavramı, işletmelerin sınırsız ömre sahip olduğu varsayımına dayanarak, faaliyetlerini belirli zaman dilimlerine (dönemlere) bölerek raporlamasını gerektiren temel bir muhasebe ilkesidir.</p>

<h4>Temel Özellikler:</h4>
<ul>
    <li><strong>Hesap Dönemi:</strong> Genellikle 12 ay (1 yıl) olmak üzere, işletmenin finansal performansının ölçüldüğü zaman aralığıdır.</li>
    <li><strong>Ara Dönemler:</strong> Aylık, üç aylık veya altı aylık dönemler şeklinde ara raporlamalar da yapılabilir.</li>
    <li><strong>Takvim Yılı vs. Mali Yıl:</strong> İşletmeler 1 Ocak-31 Aralık (takvim yılı) veya farklı bir 12 aylık dönem (mali yıl) kullanabilir.</li>
</ul>

<h4>Neden Önemlidir?</h4>
<ul>
    <li>İşletmenin belirli dönemdeki performansını ölçmeyi sağlar</li>
    <li>Dönemler arası karşılaştırma imkanı sunar</li>
    <li>Vergi hesaplama ve yasal raporlama için gereklidir</li>
    <li>Yönetimin zamanında karar almasını destekler</li>
</ul>

<h4>Örnek:</h4>
<p>ABC Şirketi 2024 yılı için mali tablolarını hazırlarken, sadece 2024 yılına ait gelir ve giderleri raporlar. 2023''e ait işlemler önceki dönem raporlarında yer almıştır.</p>',
true, NOW(), NOW()
FROM study_cards WHERE title = 'Temel Kavramlar';

INSERT INTO card_sections (study_card_id, title, display_order, content_type, content, is_active, created_at, updated_at)
SELECT id, 'Maliyet Esası', 2, 'TEXT',
'<h3>Maliyet Esası (Historical Cost Principle)</h3>
<p>Maliyet esası, varlıkların muhasebe kayıtlarına alınış tarihi itibariyle elde etmek için katlanılan maliyet üzerinden kaydedilmesi ve değerlenmesi ilkesidir.</p>

<h4>Temel İlkeler:</h4>
<ul>
    <li><strong>İlk Kayıt:</strong> Varlıklar satın alma maliyeti (tarihi maliyet) üzerinden kaydedilir</li>
    <li><strong>Objektiflik:</strong> Gerçekleşmiş işlemlere dayandığı için objektif ve doğrulanabilirdir</li>
    <li><strong>Piyasa Değeri Değil:</strong> Varlığın cari piyasa değeri yerine elde etme maliyeti kullanılır</li>
    <li><strong>Amortisman:</strong> Duran varlıklar için maliyet, ekonomik ömür boyunca dağıtılır</li>
</ul>

<h4>Maliyete Dahil Olan Unsurlar:</h4>
<ul>
    <li>Satın alma bedeli</li>
    <li>İthalat vergileri ve geri iade edilmeyen vergiler</li>
    <li>Varlığı kullanıma hazır hale getirmek için yapılan harcamalar</li>
    <li>Nakliye ve montaj giderleri</li>
</ul>

<h4>Örnek:</h4>
<p>Bir işletme 100.000 TL''ye makine satın alır. Nakliye 5.000 TL, montaj 3.000 TL tutar. Makinenin kayıtlara alınacağı maliyet: 108.000 TL (100.000 + 5.000 + 3.000). Makinenin piyasa değeri daha sonra 150.000 TL olsa bile, kayıtlarda 108.000 TL üzerinden gösterilir.</p>

<h4>Avantajlar:</h4>
<ul>
    <li>Objektif ve doğrulanabilir veriler</li>
    <li>Manipülasyon riskini azaltır</li>
    <li>Tutarlı ve karşılaştırılabilir raporlama</li>
</ul>',
true, NOW(), NOW()
FROM study_cards WHERE title = 'Temel Kavramlar';

INSERT INTO card_sections (study_card_id, title, display_order, content_type, content, is_active, created_at, updated_at)
SELECT id, 'Sosyal Sorumluluk', 3, 'TEXT',
'<h3>Sosyal Sorumluluk Kavramı (Social Responsibility)</h3>
<p>İşletmelerin sadece kar amacı gütmekle kalmayıp, topluma, çevreye ve diğer paydaşlara karşı sorumluluklarını yerine getirme yükümlülüğünü ifade eden kavramdır.</p>

<h4>Muhasebede Sosyal Sorumluluk:</h4>
<ul>
    <li><strong>Şeffaflık:</strong> Mali bilgilerin doğru ve eksiksiz raporlanması</li>
    <li><strong>Hesap Verebilirlik:</strong> Paydaşlara karşı finansal performansın açıklanması</li>
    <li><strong>Çevresel Maliyetler:</strong> Çevre koruma harcamalarının muhasebeleştirilmesi</li>
    <li><strong>Sosyal Raporlama:</strong> Sürdürülebilirlik raporları ve kurumsal sosyal sorumluluk açıklamaları</li>
</ul>

<h4>Uygulama Alanları:</h4>
<ul>
    <li>Çalışan hakları ve adil ücret politikaları</li>
    <li>Çevre koruma yatırımları</li>
    <li>Toplumsal fayda projeleri</li>
    <li>Etik ticaret ve dürüst raporlama</li>
</ul>

<h4>Örnek:</h4>
<p>XYZ Şirketi, atık yönetim sistemi için 50.000 TL harcama yapar. Bu harcama, hem çevre koruma hem de uzun vadede maliyetleri azaltma amacı taşır. Muhasebe kayıtlarında bu harcama, sosyal sorumluluk kapsamında raporlanabilir.</p>',
true, NOW(), NOW()
FROM study_cards WHERE title = 'Temel Kavramlar';

INSERT INTO card_sections (study_card_id, title, display_order, content_type, content, is_active, created_at, updated_at)
SELECT id, 'Tarafsızlık ve Belgelendirme', 4, 'TEXT',
'<h3>Tarafsızlık ve Belgelendirme İlkeleri</h3>

<h4>Tarafsızlık (Objectivity):</h4>
<p>Muhasebe kayıtlarının ve finansal raporların kişisel yargılardan, önyargılardan ve dış baskılardan bağımsız, objektif verilere dayanarak hazırlanması ilkesidir.</p>

<ul>
    <li><strong>Gerçeğe Uygunluk:</strong> Mali olaylar gerçek niteliklerine uygun şekilde kaydedilir</li>
    <li><strong>Doğrulanabilirlik:</strong> Kayıtlar bağımsız kişiler tarafından doğrulanabilir olmalıdır</li>
    <li><strong>Tutarlılık:</strong> Benzer işlemler benzer şekilde muhasebeleştirilir</li>
    <li><strong>Bağımsızlık:</strong> Muhasebe profesyonelleri bağımsız ve tarafsız hareket eder</li>
</ul>

<h4>Belgelendirme İlkesi (Documentation):</h4>
<p>Her muhasebe kaydının mutlaka bir belgeye dayanması gerektiğini ifade eden temel ilkedir. "Belgesi olmayan işlem, işlem değildir."</p>

<h4>Belge Türleri:</h4>
<ul>
    <li><strong>Dış Belgeler:</strong> Fatura, makbuz, banka dekontları, sözleşmeler</li>
    <li><strong>İç Belgeler:</strong> Fiş, dekont, senet, çek</li>
    <li><strong>Elektronik Belgeler:</strong> E-fatura, e-arşiv fatura, e-defter</li>
</ul>

<h4>Belgenin Özellikleri:</h4>
<ul>
    <li>Tarih ve sıra numarası içermeli</li>
    <li>İşlemin taraflarını açıkça belirtmeli</li>
    <li>İşlemin konusu ve tutarını göstermeli</li>
    <li>Yetkili kişiler tarafından imzalanmalı</li>
    <li>Yasal şekil şartlarına uygun olmalı</li>
</ul>

<h4>Örnek:</h4>
<p>İşletme, 10.000 TL''lik kırtasiye malzemesi alımını kaydetmek için satıcıdan aldığı faturayı kullanır. Fatura üzerinde:
<ul>
    <li>Satıcı bilgileri (ünvan, vergi no)</li>
    <li>Fatura tarihi ve numarası</li>
    <li>Malzeme cinsi ve miktarı</li>
    <li>Birim fiyat ve toplam tutar</li>
    <li>KDV oranı ve tutarı</li>
</ul>
bulunur ve bu belge muhasebe kaydının dayanağını oluşturur.</p>',
true, NOW(), NOW()
FROM study_cards WHERE title = 'Temel Kavramlar';

-- Hesaplar ve Kayıt Sistemi - Sections
INSERT INTO card_sections (study_card_id, title, display_order, content_type, content, is_active, created_at, updated_at)
SELECT id, 'Çift Taraflı Kayıt Sistemi', 1, 'TEXT',
'<h3>Çift Taraflı Kayıt Sistemi (Double-Entry Bookkeeping)</h3>
<p>Muhasebenin temel prensibi olan çift taraflı kayıt sistemi, her mali olayın en az iki hesabı (borç ve alacak) eşit tutarda etkilediği ilkesine dayanır.</p>

<h4>Temel Kural:</h4>
<p style="background: #e3f2fd; padding: 15px; border-left: 4px solid #2196f3; margin: 15px 0;">
<strong>BORÇ = ALACAK</strong><br>
Her kayıt için borç toplamı, alacak toplamına eşit olmalıdır.
</p>

<h4>Borç ve Alacak Mantığı:</h4>
<table style="width:100%; border-collapse: collapse; margin: 15px 0;">
    <tr style="background: #f5f5f5;">
        <th style="border: 1px solid #ddd; padding: 10px;">Hesap Türü</th>
        <th style="border: 1px solid #ddd; padding: 10px;">Borç (+)</th>
        <th style="border: 1px solid #ddd; padding: 10px;">Alacak (-)</th>
    </tr>
    <tr>
        <td style="border: 1px solid #ddd; padding: 8px;"><strong>Varlık Hesapları</strong></td>
        <td style="border: 1px solid #ddd; padding: 8px;">Artış</td>
        <td style="border: 1px solid #ddd; padding: 8px;">Azalış</td>
    </tr>
    <tr>
        <td style="border: 1px solid #ddd; padding: 8px;"><strong>Kaynak Hesapları</strong></td>
        <td style="border: 1px solid #ddd; padding: 8px;">Azalış</td>
        <td style="border: 1px solid #ddd; padding: 8px;">Artış</td>
    </tr>
    <tr>
        <td style="border: 1px solid #ddd; padding: 8px;"><strong>Gelir Hesapları</strong></td>
        <td style="border: 1px solid #ddd; padding: 8px;">Azalış</td>
        <td style="border: 1px solid #ddd; padding: 8px;">Artış</td>
    </tr>
    <tr>
        <td style="border: 1px solid #ddd; padding: 8px;"><strong>Gider Hesapları</strong></td>
        <td style="border: 1px solid #ddd; padding: 8px;">Artış</td>
        <td style="border: 1px solid #ddd; padding: 8px;">Azalış</td>
    </tr>
</table>

<h4>Örnek Kayıt:</h4>
<p><strong>İşlem:</strong> İşletme 50.000 TL değerinde mal satın alır ve nakit öder.</p>
<pre style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
<strong>Yevmiye Kaydı:</strong>
─────────────────────────────────────
153 TİCARİ MALLAR          50.000 TL
    100 KASA                          50.000 TL
─────────────────────────────────────
(Mal alımı nakit ödeme)
</pre>

<p><strong>Açıklama:</strong>
<ul>
    <li>153 Ticari Mallar hesabı <strong>BORÇ</strong>landı (varlık arttı)</li>
    <li>100 Kasa hesabı <strong>ALACAK</strong>landı (varlık azaldı)</li>
    <li>Borç toplamı = Alacak toplamı = 50.000 TL ✓</li>
</ul>
</p>

<h4>Avantajları:</h4>
<ul>
    <li><strong>Kontrol Mekanizması:</strong> Her kaydın dengesinin kontrolü mümkündür</li>
    <li><strong>Hata Tespiti:</strong> Borç-alacak dengesi kurulmazsa hata tespit edilebilir</li>
    <li><strong>Eksiksiz Kayıt:</strong> Her işlemin iki yönlü etkisi görülür</li>
    <li><strong>Finansal Durum:</strong> Bilanço ve gelir tablosu hazırlama imkanı</li>
</ul>',
true, NOW(), NOW()
FROM study_cards WHERE title = 'Hesaplar ve Kayıt Sistemi';

INSERT INTO card_sections (study_card_id, title, display_order, content_type, content, is_active, created_at, updated_at)
SELECT id, 'Hesap Sınıfları', 2, 'TEXT',
'<h3>Hesap Sınıfları ve Kodlama Sistemi</h3>
<p>Tek Düzen Hesap Planı''nda hesaplar, 9 ana sınıfa ayrılmıştır. Her sınıf belirli bir hesap grubunu temsil eder.</p>

<h4>9 Ana Hesap Sınıfı:</h4>

<div style="background: #e8f5e9; padding: 12px; margin: 10px 0; border-left: 4px solid #4caf50;">
<strong>1. DÖNEN VARLIKLAR</strong><br>
Bir yıl içinde nakde dönüşmesi beklenen varlıklar<br>
<em>Örnek: Kasa, Banka, Alıcılar, Stoklar</em>
</div>

<div style="background: #e3f2fd; padding: 12px; margin: 10px 0; border-left: 4px solid #2196f3;">
<strong>2. DURAN VARLIKLAR</strong><br>
Bir yıldan uzun süre işletmede kalması beklenen varlıklar<br>
<em>Örnek: Binalar, Makineler, Taşıtlar, Demirbaşlar</em>
</div>

<div style="background: #fff3e0; padding: 12px; margin: 10px 0; border-left: 4px solid #ff9800;">
<strong>3. KISA VADELİ YABANCI KAYNAKLAR</strong><br>
Bir yıl içinde ödenecek borçlar<br>
<em>Örnek: Satıcılar, Banka Kredileri, Ödenecek Vergiler</em>
</div>

<div style="background: #fce4ec; padding: 12px; margin: 10px 0; border-left: 4px solid #e91e63;">
<strong>4. UZUN VADELİ YABANCI KAYNAKLAR</strong><br>
Bir yıldan uzun vadeli borçlar<br>
<em>Örnek: Uzun Vadeli Banka Kredileri, Tahviller</em>
</div>

<div style="background: #f3e5f5; padding: 12px; margin: 10px 0; border-left: 4px solid #9c27b0;">
<strong>5. ÖZ KAYNAKLAR</strong><br>
İşletme sahiplerinin sermayesi ve birikmiş karlar<br>
<em>Örnek: Sermaye, Yedek Akçeler, Geçmiş Yıl Karları</em>
</div>

<div style="background: #e0f2f1; padding: 12px; margin: 10px 0; border-left: 4px solid #009688;">
<strong>6. GELİR HESAPLARI</strong><br>
İşletmenin elde ettiği gelirler<br>
<em>Örnek: Satış Gelirleri, Faiz Gelirleri, Kur Farkı Gelirleri</em>
</div>

<div style="background: #fff9c4; padding: 12px; margin: 10px 0; border-left: 4px solid #fbc02d;">
<strong>7. GİDER HESAPLARI</strong><br>
İşletmenin yaptığı harcamalar ve maliyetler<br>
<em>Örnek: Maaş Giderleri, Kira Giderleri, Elektrik Giderleri</em>
</div>

<div style="background: #ffe0b2; padding: 12px; margin: 10px 0; border-left: 4px solid #ff6f00;">
<strong>8. SERBEST (Kullanılmıyor)</strong><br>
Gelecekteki ihtiyaçlar için ayrılmış sınıf
</div>

<div style="background: #f5f5f5; padding: 12px; margin: 10px 0; border-left: 4px solid #9e9e9e;">
<strong>9. NAZIM HESAPLAR</strong><br>
İşletmenin sorumluluğunda olan ancak varlık veya kaynak olmayan kalemler<br>
<em>Örnek: Teminat Mektupları, Alınan Siparişler</em>
</div>

<h4>Kodlama Sistemi:</h4>
<p>Hesaplar hiyerarşik bir kodlama sistemine sahiptir:</p>
<ul>
    <li><strong>1. Seviye:</strong> Sınıf (1-9)</li>
    <li><strong>2. Seviye:</strong> Ana Hesap Grubu (10-19, 20-29...)</li>
    <li><strong>3. Seviye:</strong> Hesap Grubu (100-109, 110-119...)</li>
    <li><strong>4. Seviye:</strong> Hesap (1000-1009...)</li>
</ul>

<p><strong>Örnek:</strong> 100 Kasa hesabının yapısı:</p>
<pre style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
<strong>1</strong>   → Dönen Varlıklar (Sınıf)
<strong>10</strong>  → Hazır Değerler (Ana Grup)
<strong>100</strong> → Kasa (Hesap)
</pre>',
true, NOW(), NOW()
FROM study_cards WHERE title = 'Hesaplar ve Kayıt Sistemi';

INSERT INTO card_sections (study_card_id, title, display_order, content_type, content, is_active, created_at, updated_at)
SELECT id, 'Defter ve Kayıt Düzeni', 3, 'TEXT',
'<h3>Muhasebe Defterleri ve Kayıt Düzeni</h3>
<p>İşletmeler, mali işlemlerini belirli defterlere kaydederek takip eder. Bu defterler yasal zorunluluk olmakla birlikte, mali kontrolü de sağlar.</p>

<h4>Zorunlu Defterler:</h4>

<h5>1. Yevmiye Defteri (Journal)</h5>
<p>Mali işlemlerin kronolojik sırayla ilk kaydedildiği defterdir.</p>
<ul>
    <li><strong>Tarih sırasına göre</strong> kayıt yapılır</li>
    <li>Her kayıt bir <strong>yevmiye numarası</strong> alır</li>
    <li><strong>Borç ve alacak</strong> sütunları bulunur</li>
    <li>İşlemin <strong>açıklaması</strong> yazılır</li>
</ul>

<h5>2. Büyük Defter (General Ledger)</h5>
<p>Yevmiye defterindeki kayıtların hesap bazında sınıflandırıldığı defterdir.</p>
<ul>
    <li>Her hesap için ayrı bir <strong>hesap sayfası</strong> (T hesap) açılır</li>
    <li>Yevmiye kayıtları <strong>hesaplara nakledilir</strong></li>
    <li>Her hesabın <strong>borç ve alacak hareketleri</strong> görülür</li>
    <li>Hesap <strong>bakiyeleri</strong> hesaplanır</li>
</ul>

<h5>3. Envanter Defteri</h5>
<p>İşletmenin varlık ve kaynaklarının dönem başı ve dönem sonu değerlerinin gösterildiği defterdir.</p>

<h4>Yardımcı Defterler:</h4>
<ul>
    <li><strong>Kasa Defteri:</strong> Nakit giriş-çıkışların kaydı</li>
    <li><strong>Banka Defteri:</strong> Banka hesap hareketleri</li>
    <li><strong>Alıcılar/Satıcılar Defteri:</strong> Cari hesap hareketleri</li>
    <li><strong>Çek/Senet Defteri:</strong> Alınan ve verilen çek/senetlerin takibi</li>
</ul>

<h4>Kayıt İşlem Sırası:</h4>
<ol style="background: #f5f5f5; padding: 20px; border-radius: 5px;">
    <li><strong>Belge Düzenleme/Alma:</strong> İşlemin belgelendirilmesi (fatura, makbuz vb.)</li>
    <li><strong>Yevmiye Kaydı:</strong> Belge bilgileri yevmiye defterine kaydedilir</li>
    <li><strong>Büyük Deftere Nakil:</strong> Yevmiye kaydı ilgili hesaplara aktarılır</li>
    <li><strong>Mizanın Hazırlanması:</strong> Dönem sonunda tüm hesapların bakiyesi alınır</li>
    <li><strong>Mali Tablo Hazırlama:</strong> Mizan üzerinden bilanço ve gelir tablosu oluşturulur</li>
</ol>

<h4>Elektronik Defter (E-Defter):</h4>
<p>Günümüzde işletmeler, kağıt defter yerine elektronik ortamda defter tutabilir:</p>
<ul>
    <li>Gelir İdaresi''ne elektronik ortamda gönderilir</li>
    <li>Daha hızlı ve güvenli kayıt imkanı</li>
    <li>Saklama ve arşivleme kolaylığı</li>
    <li>Maliyet tasarrufu</li>
</ul>

<h4>Örnek Yevmiye Kaydı:</h4>
<pre style="background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto;">
<strong>Tarih: 15.03.2024    Yevmiye No: 125</strong>
─────────────────────────────────────────────────
120 ALICILAR                         106.000 TL
    600 YURTİÇİ SATIŞLAR                          100.000 TL
    391 HESAPLANAN KDV                              6.000 TL
─────────────────────────────────────────────────
(ABC Şirketi''ne yapılan satış - Fatura No: 2024/125)
</pre>',
true, NOW(), NOW()
FROM study_cards WHERE title = 'Hesaplar ve Kayıt Sistemi';

-- Mali Tablolar - Sections
INSERT INTO card_sections (study_card_id, title, display_order, content_type, content, is_active, created_at, updated_at)
SELECT id, 'Bilanço', 1, 'TEXT',
'<h3>Bilanço (Balance Sheet)</h3>
<p>Bilanço, işletmenin belirli bir tarihteki finansal durumunu gösteren, varlıkları ve kaynakları karşılıklı olarak sunan mali tablodur.</p>

<h4>Temel Denklem:</h4>
<p style="background: #e3f2fd; padding: 20px; text-align: center; border-left: 4px solid #2196f3; margin: 15px 0; font-size: 18px;">
<strong>VARLIKLAR = KAYNAKLAR</strong><br>
<span style="font-size: 14px;">(Aktif) = (Pasif = Yabancı Kaynaklar + Öz Kaynaklar)</span>
</p>

<h4>Bilanço Yapısı:</h4>

<table style="width:100%; border-collapse: collapse; margin: 15px 0;">
    <tr style="background: #4caf50; color: white;">
        <th colspan="2" style="border: 1px solid #ddd; padding: 10px;">AKTİF (Varlıklar)</th>
        <th colspan="2" style="border: 1px solid #ddd; padding: 10px;">PASİF (Kaynaklar)</th>
    </tr>
    <tr>
        <td style="border: 1px solid #ddd; padding: 8px; width: 30%;"><strong>I- DÖNEN VARLIKLAR</strong></td>
        <td style="border: 1px solid #ddd; padding: 8px; width: 20%;"></td>
        <td style="border: 1px solid #ddd; padding: 8px; width: 30%;"><strong>I- KISA VADELİ YABANCI KAYNAKLAR</strong></td>
        <td style="border: 1px solid #ddd; padding: 8px; width: 20%;"></td>
    </tr>
    <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">• Hazır Değerler</td>
        <td style="border: 1px solid #ddd; padding: 8px;">50.000</td>
        <td style="border: 1px solid #ddd; padding: 8px;">• Mali Borçlar</td>
        <td style="border: 1px solid #ddd; padding: 8px;">30.000</td>
    </tr>
    <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">• Alacaklar</td>
        <td style="border: 1px solid #ddd; padding: 8px;">120.000</td>
        <td style="border: 1px solid #ddd; padding: 8px;">• Ticari Borçlar</td>
        <td style="border: 1px solid #ddd; padding: 8px;">80.000</td>
    </tr>
    <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">• Stoklar</td>
        <td style="border: 1px solid #ddd; padding: 8px;">180.000</td>
        <td style="border: 1px solid #ddd; padding: 8px;">• Diğer Borçlar</td>
        <td style="border: 1px solid #ddd; padding: 8px;">20.000</td>
    </tr>
    <tr style="background: #e8f5e9;">
        <td style="border: 1px solid #ddd; padding: 8px;"><strong>Dönen Varlıklar Toplamı</strong></td>
        <td style="border: 1px solid #ddd; padding: 8px;"><strong>350.000</strong></td>
        <td style="border: 1px solid #ddd; padding: 8px;"><strong>KV Yabancı Kaynaklar Toplamı</strong></td>
        <td style="border: 1px solid #ddd; padding: 8px;"><strong>130.000</strong></td>
    </tr>
    <tr>
        <td style="border: 1px solid #ddd; padding: 8px;"><strong>II- DURAN VARLIKLAR</strong></td>
        <td style="border: 1px solid #ddd; padding: 8px;"></td>
        <td style="border: 1px solid #ddd; padding: 8px;"><strong>II- UZUN VADELİ YABANCI KAYNAKLAR</strong></td>
        <td style="border: 1px solid #ddd; padding: 8px;"></td>
    </tr>
    <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">• Maddi Duran Varlıklar</td>
        <td style="border: 1px solid #ddd; padding: 8px;">400.000</td>
        <td style="border: 1px solid #ddd; padding: 8px;">• Uzun Vadeli Krediler</td>
        <td style="border: 1px solid #ddd; padding: 8px;">150.000</td>
    </tr>
    <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">• Maddi Olmayan Duran Varlıklar</td>
        <td style="border: 1px solid #ddd; padding: 8px;">30.000</td>
        <td style="border: 1px solid #ddd; padding: 8px;"></td>
        <td style="border: 1px solid #ddd; padding: 8px;"></td>
    </tr>
    <tr style="background: #e8f5e9;">
        <td style="border: 1px solid #ddd; padding: 8px;"><strong>Duran Varlıklar Toplamı</strong></td>
        <td style="border: 1px solid #ddd; padding: 8px;"><strong>430.000</strong></td>
        <td style="border: 1px solid #ddd; padding: 8px;"><strong>UV Yabancı Kaynaklar Toplamı</strong></td>
        <td style="border: 1px solid #ddd; padding: 8px;"><strong>150.000</strong></td>
    </tr>
    <tr>
        <td style="border: 1px solid #ddd; padding: 8px;"></td>
        <td style="border: 1px solid #ddd; padding: 8px;"></td>
        <td style="border: 1px solid #ddd; padding: 8px;"><strong>III- ÖZ KAYNAKLAR</strong></td>
        <td style="border: 1px solid #ddd; padding: 8px;"></td>
    </tr>
    <tr>
        <td style="border: 1px solid #ddd; padding: 8px;"></td>
        <td style="border: 1px solid #ddd; padding: 8px;"></td>
        <td style="border: 1px solid #ddd; padding: 8px;">• Sermaye</td>
        <td style="border: 1px solid #ddd; padding: 8px;">400.000</td>
    </tr>
    <tr>
        <td style="border: 1px solid #ddd; padding: 8px;"></td>
        <td style="border: 1px solid #ddd; padding: 8px;"></td>
        <td style="border: 1px solid #ddd; padding: 8px;">• Geçmiş Yıl Karları</td>
        <td style="border: 1px solid #ddd; padding: 8px;">100.000</td>
    </tr>
    <tr style="background: #e8f5e9;">
        <td style="border: 1px solid #ddd; padding: 8px;"></td>
        <td style="border: 1px solid #ddd; padding: 8px;"></td>
        <td style="border: 1px solid #ddd; padding: 8px;"><strong>Öz Kaynaklar Toplamı</strong></td>
        <td style="border: 1px solid #ddd; padding: 8px;"><strong>500.000</strong></td>
    </tr>
    <tr style="background: #2196f3; color: white; font-weight: bold;">
        <td style="border: 1px solid #ddd; padding: 10px;">AKTİF TOPLAMI</td>
        <td style="border: 1px solid #ddd; padding: 10px;">780.000</td>
        <td style="border: 1px solid #ddd; padding: 10px;">PASİF TOPLAMI</td>
        <td style="border: 1px solid #ddd; padding: 10px;">780.000</td>
    </tr>
</table>

<h4>Bilanço Analizi İçin Önemli Oranlar:</h4>
<ul>
    <li><strong>Cari Oran:</strong> Dönen Varlıklar / Kısa Vadeli Borçlar (350.000 / 130.000 = 2,69)</li>
    <li><strong>Likidite Oranı:</strong> (Dönen Varlıklar - Stoklar) / Kısa Vadeli Borçlar</li>
    <li><strong>Finansal Kaldıraç:</strong> Toplam Borçlar / Öz Kaynaklar (280.000 / 500.000 = 0,56)</li>
</ul>

<h4>Bilançonun Amacı:</h4>
<ul>
    <li>İşletmenin finansal gücünü gösterir</li>
    <li>Borç ödeme kapasitesini ortaya koyar</li>
    <li>Varlık yapısını ve kaynak dağılımını sunar</li>
    <li>Yatırımcılar ve kredi verenler için önemli bilgi kaynağıdır</li>
</ul>',
true, NOW(), NOW()
FROM study_cards WHERE title = 'Mali Tablolar';

INSERT INTO card_sections (study_card_id, title, display_order, content_type, content, is_active, created_at, updated_at)
SELECT id, 'Gelir Tablosu', 2, 'TEXT',
'<h3>Gelir Tablosu (Income Statement / Profit & Loss Statement)</h3>
<p>Gelir tablosu, işletmenin belirli bir dönemdeki (genellikle 1 yıl) faaliyet sonuçlarını, yani kar veya zararını gösteren mali tablodur.</p>

<h4>Temel Denklem:</h4>
<p style="background: #e8f5e9; padding: 20px; text-align: center; border-left: 4px solid #4caf50; margin: 15px 0; font-size: 18px;">
<strong>NET KAR/ZARAR = GELİRLER - GİDERLER</strong>
</p>

<h4>Gelir Tablosu Yapısı:</h4>

<table style="width:100%; border-collapse: collapse; margin: 15px 0; font-size: 14px;">
    <tr style="background: #4caf50; color: white;">
        <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">GELİR TABLOSU KALEMLERİ</th>
        <th style="border: 1px solid #ddd; padding: 10px; text-align: right; width: 150px;">TUTAR (TL)</th>
    </tr>

    <tr style="background: #e8f5e9;">
        <td style="border: 1px solid #ddd; padding: 8px;"><strong>A- BRÜT SATIŞLAR</strong></td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">1.500.000</td>
    </tr>
    <tr>
        <td style="border: 1px solid #ddd; padding: 8px; padding-left: 30px;">Yurtiçi Satışlar</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">1.200.000</td>
    </tr>
    <tr>
        <td style="border: 1px solid #ddd; padding: 8px; padding-left: 30px;">Yurtdışı Satışlar</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">300.000</td>
    </tr>

    <tr>
        <td style="border: 1px solid #ddd; padding: 8px;"><strong>B- SATIŞ İNDİRİMLERİ (-)</strong></td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">(50.000)</td>
    </tr>
    <tr>
        <td style="border: 1px solid #ddd; padding: 8px; padding-left: 30px;">Satıştan İadeler</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">(30.000)</td>
    </tr>
    <tr>
        <td style="border: 1px solid #ddd; padding: 8px; padding-left: 30px;">Satış İskontoları</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">(20.000)</td>
    </tr>

    <tr style="background: #c8e6c9; font-weight: bold;">
        <td style="border: 1px solid #ddd; padding: 8px;"><strong>C- NET SATIŞLAR (A-B)</strong></td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">1.450.000</td>
    </tr>

    <tr>
        <td style="border: 1px solid #ddd; padding: 8px;"><strong>D- SATIŞLARIN MALİYETİ (-)</strong></td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">(900.000)</td>
    </tr>

    <tr style="background: #a5d6a7; font-weight: bold; font-size: 15px;">
        <td style="border: 1px solid #ddd; padding: 10px;"><strong>E- BRÜT KAR/ZARAR (C-D)</strong></td>
        <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">550.000</td>
    </tr>

    <tr>
        <td style="border: 1px solid #ddd; padding: 8px;"><strong>F- FAALİYET GİDERLERİ (-)</strong></td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">(280.000)</td>
    </tr>
    <tr>
        <td style="border: 1px solid #ddd; padding: 8px; padding-left: 30px;">Pazarlama Giderleri</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">(120.000)</td>
    </tr>
    <tr>
        <td style="border: 1px solid #ddd; padding: 8px; padding-left: 30px;">Genel Yönetim Giderleri</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">(160.000)</td>
    </tr>

    <tr style="background: #81c784; font-weight: bold; font-size: 15px;">
        <td style="border: 1px solid #ddd; padding: 10px;"><strong>G- FAALİYET KARI/ZARARI (E-F)</strong></td>
        <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">270.000</td>
    </tr>

    <tr>
        <td style="border: 1px solid #ddd; padding: 8px;"><strong>H- DİĞER FAALİYETLERDEN GELİR/GİDER</strong></td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">20.000</td>
    </tr>
    <tr>
        <td style="border: 1px solid #ddd; padding: 8px; padding-left: 30px;">Faiz Gelirleri</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">30.000</td>
    </tr>
    <tr>
        <td style="border: 1px solid #ddd; padding: 8px; padding-left: 30px;">Faiz Giderleri</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">(10.000)</td>
    </tr>

    <tr style="background: #66bb6a; font-weight: bold; font-size: 16px;">
        <td style="border: 1px solid #ddd; padding: 10px;"><strong>I- VERGİ ÖNCESİ KAR/ZARAR (G+H)</strong></td>
        <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">290.000</td>
    </tr>

    <tr>
        <td style="border: 1px solid #ddd; padding: 8px;"><strong>J- VERGİ KARŞILIĞI (-)</strong></td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">(58.000)</td>
    </tr>

    <tr style="background: #4caf50; color: white; font-weight: bold; font-size: 17px;">
        <td style="border: 1px solid #ddd; padding: 12px;"><strong>K- DÖNEM NET KARI/ZARARI (I-J)</strong></td>
        <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">232.000</td>
    </tr>
</table>

<h4>Önemli Karlılık Oranları:</h4>
<ul>
    <li><strong>Brüt Kar Marjı:</strong> (Brüt Kar / Net Satışlar) x 100 = (550.000 / 1.450.000) x 100 = %37,93</li>
    <li><strong>Faaliyet Kar Marjı:</strong> (Faaliyet Karı / Net Satışlar) x 100 = (270.000 / 1.450.000) x 100 = %18,62</li>
    <li><strong>Net Kar Marjı:</strong> (Net Kar / Net Satışlar) x 100 = (232.000 / 1.450.000) x 100 = %16,00</li>
</ul>

<h4>Gelir Tablosunun Kullanım Amaçları:</h4>
<ul>
    <li><strong>Karlılık Analizi:</strong> İşletmenin ne kadar kar elde ettiğini gösterir</li>
    <li><strong>Performans Ölçümü:</strong> Dönemler arası karşılaştırma yapılabilir</li>
    <li><strong>Maliyet Kontrolü:</strong> Gider kalemlerinin analizi ve kontrolü sağlanır</li>
    <li><strong>Karar Alma:</strong> Yönetim kararları için veri sağlar</li>
    <li><strong>Yatırımcı Bilgisi:</strong> Yatırımcılar ve hissedarlar için performans göstergesidir</li>
</ul>',
true, NOW(), NOW()
FROM study_cards WHERE title = 'Mali Tablolar';

INSERT INTO card_sections (study_card_id, title, display_order, content_type, content, is_active, created_at, updated_at)
SELECT id, 'Nakit Akış Tablosu', 3, 'TEXT',
'<h3>Nakit Akış Tablosu (Cash Flow Statement)</h3>
<p>Nakit akış tablosu, işletmenin belirli bir dönemdeki nakit giriş ve çıkışlarını gösteren, likidite durumunu ortaya koyan mali tablodur.</p>

<h4>Neden Önemlidir?</h4>
<p style="background: #fff3e0; padding: 15px; border-left: 4px solid #ff9800; margin: 15px 0;">
<strong>Bir işletme karlı olabilir ama nakit sıkıntısı çekebilir!</strong><br>
Gelir tablosu tahakkuk esasına göre hazırlanırken, nakit akış tablosu gerçek nakit hareketlerini gösterir.
</p>

<h4>Üç Ana Bölüm:</h4>

<h5>1. İşletme Faaliyetlerinden Nakit Akışları</h5>
<p>Ana ticari faaliyetlerden kaynaklanan nakit hareketleri</p>
<ul>
    <li>Mal ve hizmet satışlarından tahsilatlar (+)</li>
    <li>Tedarikçilere yapılan ödemeler (-)</li>
    <li>Personel maaş ödemeleri (-)</li>
    <li>Faiz ödemeleri (-)</li>
    <li>Vergi ödemeleri (-)</li>
</ul>

<h5>2. Yatırım Faaliyetlerinden Nakit Akışları</h5>
<p>Duran varlık alım-satımından kaynaklanan nakit hareketleri</p>
<ul>
    <li>Maddi duran varlık satışı (+)</li>
    <li>Maddi duran varlık alımı (-)</li>
    <li>Finansal yatırımlar alımı (-)</li>
    <li>Finansal yatırımlar satışı (+)</li>
</ul>

<h5>3. Finansman Faaliyetlerinden Nakit Akışları</h5>
<p>Sermaye ve borç hareketlerinden kaynaklanan nakit akışları</p>
<ul>
    <li>Sermaye artırımı (+)</li>
    <li>Kredi kullanımı (+)</li>
    <li>Kredi ödemesi (-)</li>
    <li>Kar payı ödemesi (-)</li>
</ul>

<h4>Nakit Akış Tablosu Örneği:</h4>

<table style="width:100%; border-collapse: collapse; margin: 15px 0;">
    <tr style="background: #2196f3; color: white;">
        <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">NAKİT AKIŞ TABLOSU</th>
        <th style="border: 1px solid #ddd; padding: 10px; text-align: right; width: 150px;">TUTAR (TL)</th>
    </tr>

    <tr style="background: #e3f2fd;">
        <td style="border: 1px solid #ddd; padding: 8px;"><strong>A. İŞLETME FAALİYETLERİ</strong></td>
        <td style="border: 1px solid #ddd; padding: 8px;"></td>
    </tr>
    <tr>
        <td style="border: 1px solid #ddd; padding: 8px; padding-left: 30px;">Satışlardan Tahsilatlar</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">1.200.000</td>
    </tr>
    <tr>
        <td style="border: 1px solid #ddd; padding: 8px; padding-left: 30px;">Tedarikçilere Ödemeler</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">(750.000)</td>
    </tr>
    <tr>
        <td style="border: 1px solid #ddd; padding: 8px; padding-left: 30px;">Personel Ödemeleri</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">(200.000)</td>
    </tr>
    <tr>
        <td style="border: 1px solid #ddd; padding: 8px; padding-left: 30px;">Faiz Ödemeleri</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">(15.000)</td>
    </tr>
    <tr>
        <td style="border: 1px solid #ddd; padding: 8px; padding-left: 30px;">Vergi Ödemeleri</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">(50.000)</td>
    </tr>
    <tr style="background: #bbdefb; font-weight: bold;">
        <td style="border: 1px solid #ddd; padding: 8px;">İşletme Faaliyetlerinden Net Nakit</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">185.000</td>
    </tr>

    <tr style="background: #e8f5e9;">
        <td style="border: 1px solid #ddd; padding: 8px;"><strong>B. YATIRIM FAALİYETLERİ</strong></td>
        <td style="border: 1px solid #ddd; padding: 8px;"></td>
    </tr>
    <tr>
        <td style="border: 1px solid #ddd; padding: 8px; padding-left: 30px;">Makine Alımı</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">(150.000)</td>
    </tr>
    <tr>
        <td style="border: 1px solid #ddd; padding: 8px; padding-left: 30px;">Eski Araç Satışı</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">50.000</td>
    </tr>
    <tr style="background: #c8e6c9; font-weight: bold;">
        <td style="border: 1px solid #ddd; padding: 8px;">Yatırım Faaliyetlerinden Net Nakit</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">(100.000)</td>
    </tr>

    <tr style="background: #fff3e0;">
        <td style="border: 1px solid #ddd; padding: 8px;"><strong>C. FİNANSMAN FAALİYETLERİ</strong></td>
        <td style="border: 1px solid #ddd; padding: 8px;"></td>
    </tr>
    <tr>
        <td style="border: 1px solid #ddd; padding: 8px; padding-left: 30px;">Banka Kredisi Kullanımı</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">100.000</td>
    </tr>
    <tr>
        <td style="border: 1px solid #ddd; padding: 8px; padding-left: 30px;">Kredi Ödemesi</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">(60.000)</td>
    </tr>
    <tr>
        <td style="border: 1px solid #ddd; padding: 8px; padding-left: 30px;">Kar Payı Ödemesi</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">(40.000)</td>
    </tr>
    <tr style="background: #ffe0b2; font-weight: bold;">
        <td style="border: 1px solid #ddd; padding: 8px;">Finansman Faaliyetlerinden Net Nakit</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">0</td>
    </tr>

    <tr style="background: #f5f5f5; font-weight: bold;">
        <td style="border: 1px solid #ddd; padding: 10px;"><strong>NAKİT NET ARTIŞI / AZALIŞI (A+B+C)</strong></td>
        <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">85.000</td>
    </tr>

    <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">Dönem Başı Nakit</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">120.000</td>
    </tr>

    <tr style="background: #4caf50; color: white; font-weight: bold; font-size: 16px;">
        <td style="border: 1px solid #ddd; padding: 12px;"><strong>DÖNEM SONU NAKİT</strong></td>
        <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">205.000</td>
    </tr>
</table>

<h4>Yorumlama:</h4>
<ul>
    <li><strong>İşletme Faaliyetleri (+):</strong> İşletme ana faaliyetlerinden nakit üretiyor ✓</li>
    <li><strong>Yatırım Faaliyetleri (-):</strong> Yatırımlara nakit harcıyor (büyüme işareti)</li>
    <li><strong>Finansman Faaliyetleri (0):</strong> Finansman dengesinde</li>
    <li><strong>Sonuç:</strong> Nakit pozisyonu güçlenmiş (+85.000 TL)</li>
</ul>

<h4>Önemli Notlar:</h4>
<ul>
    <li>Pozitif işletme faaliyetleri nakit akışı, sağlıklı işletmenin göstergesidir</li>
    <li>Negatif yatırım faaliyetleri nakit akışı, genellikle büyüme yatırımlarını gösterir</li>
    <li>Sürekli negatif işletme nakit akışı, ciddi likidite problemine işarettir</li>
</ul>',
true, NOW(), NOW()
FROM study_cards WHERE title = 'Mali Tablolar';

-- Tek Düzen Hesap Planı - Sections
INSERT INTO card_sections (study_card_id, title, display_order, content_type, content, is_active, created_at, updated_at)
SELECT id, 'Hesap Planı Yapısı', 1, 'TEXT',
'<h3>Tek Düzen Hesap Planı Yapısı</h3>
<p>Tek Düzen Hesap Planı (TDHP), Türkiye''de tüm işletmelerin kullanması gereken standart muhasebe hesap sistemidir. 1994 yılında yürürlüğe girmiştir.</p>

<h4>Neden Tek Düzen Hesap Planı?</h4>
<ul>
    <li><strong>Standartlaşma:</strong> Tüm işletmeler aynı kodlama sistemini kullanır</li>
    <li><strong>Karşılaştırılabilirlik:</strong> Farklı işletmelerin mali tabloları karşılaştırılabilir</li>
    <li><strong>Denetim Kolaylığı:</strong> Mali denetim ve vergi kontrolü kolaylaşır</li>
    <li><strong>Bilgi Teknolojileri Entegrasyonu:</strong> Yazılımlar arasında uyumluluk sağlar</li>
</ul>

<h4>9 Ana Sınıf Detayları:</h4>

<div style="background: #e8f5e9; padding: 15px; margin: 10px 0; border-left: 4px solid #4caf50;">
<h5>1. SINIF - DÖNEN VARLIKLAR</h5>
<strong>Kodlar: 10-19</strong><br>
Bir yıl içinde nakde dönüşecek veya tüketilecek varlıklar
<ul style="margin-top: 10px;">
    <li><strong>10 - Hazır Değerler:</strong> Kasa, banka, çek, senet</li>
    <li><strong>11 - Menkul Kıymetler:</strong> Hisse senetleri, tahviller</li>
    <li><strong>12 - Ticari Alacaklar:</strong> Alıcılar, alacak senetleri</li>
    <li><strong>13 - Diğer Alacaklar:</strong> Personel, ortak alacakları</li>
    <li><strong>15 - Stoklar:</strong> İlk madde, yarı mamul, mamul, ticari mal</li>
    <li><strong>17 - Yıllara Yaygın İnşaat:</strong> İnşaat sözleşmeleri</li>
    <li><strong>18 - Gelecek Aylara Ait Giderler:</strong> Peşin ödenen kiralar</li>
    <li><strong>19 - Diğer Dönen Varlıklar:</strong> KDV, devreden KDV</li>
</ul>
</div>

<div style="background: #e3f2fd; padding: 15px; margin: 10px 0; border-left: 4px solid #2196f3;">
<h5>2. SINIF - DURAN VARLIKLAR</h5>
<strong>Kodlar: 20-29</strong><br>
Bir yıldan uzun süre kullanılacak varlıklar
<ul style="margin-top: 10px;">
    <li><strong>22 - Ticari Alacaklar:</strong> Uzun vadeli alıcılar</li>
    <li><strong>23 - Diğer Alacaklar:</strong> Uzun vadeli diğer alacaklar</li>
    <li><strong>24 - Mali Duran Varlıklar:</strong> Bağlı ortaklık payları</li>
    <li><strong>25 - Maddi Duran Varlıklar:</strong> Arazi, bina, makine, taşıt, demirbaş</li>
    <li><strong>26 - Maddi Olmayan Duran Varlıklar:</strong> Haklar, şerefiye, kuruluş giderleri</li>
    <li><strong>27 - Özel Tükenmeye Tabi Varlıklar:</strong> Arama giderleri, hazırlık giderleri</li>
    <li><strong>28 - Gelecek Yıllara Ait Giderler:</strong> Uzun vadeli peşin ödemeler</li>
    <li><strong>29 - Diğer Duran Varlıklar:</strong> Gelir tahakkukları</li>
</ul>
</div>

<div style="background: #fff3e0; padding: 15px; margin: 10px 0; border-left: 4px solid #ff9800;">
<h5>3. SINIF - KISA VADELİ YABANCI KAYNAKLAR</h5>
<strong>Kodlar: 30-39</strong><br>
Bir yıl içinde ödenecek borçlar
<ul style="margin-top: 10px;">
    <li><strong>30 - Mali Borçlar:</strong> Banka kredileri, finansal kiralama</li>
    <li><strong>32 - Ticari Borçlar:</strong> Satıcılar, borç senetleri</li>
    <li><strong>33 - Diğer Borçlar:</strong> Ortaklara borçlar, personele borçlar</li>
    <li><strong>34 - Alınan Avanslar:</strong> Alıcılardan alınan sipariş avansları</li>
    <li><strong>36 - Ödenecek Vergi ve Diğer Yükümlülükler:</strong> KDV, stopaj</li>
    <li><strong>37 - Borç ve Gider Karşılıkları:</strong> Kıdem tazminatı karşılığı</li>
    <li><strong>38 - Gelecek Aylara Ait Gelirler:</strong> Peşin alınan kiralar</li>
    <li><strong>39 - Diğer Kısa Vadeli Yabancı Kaynaklar:</strong> Gider tahakkukları</li>
</ul>
</div>

<div style="background: #fce4ec; padding: 15px; margin: 10px 0; border-left: 4px solid #e91e63;">
<h5>4. SINIF - UZUN VADELİ YABANCI KAYNAKLAR</h5>
<strong>Kodlar: 40-49</strong><br>
Bir yıldan uzun vadeli borçlar
<ul style="margin-top: 10px;">
    <li><strong>40 - Mali Borçlar:</strong> Uzun vadeli banka kredileri, tahvil borçları</li>
    <li><strong>42 - Ticari Borçlar:</strong> Uzun vadeli satıcı borçları</li>
    <li><strong>43 - Diğer Borçlar:</strong> Uzun vadeli diğer borçlar</li>
    <li><strong>47 - Borç ve Gider Karşılıkları:</strong> Kıdem tazminatı karşılığı</li>
    <li><strong>48 - Gelecek Yıllara Ait Gelirler:</strong> Uzun vadeli peşin alınan gelirler</li>
    <li><strong>49 - Diğer Uzun Vadeli Yabancı Kaynaklar:</strong> Gelir tahakkukları</li>
</ul>
</div>

<div style="background: #f3e5f5; padding: 15px; margin: 10px 0; border-left: 4px solid #9c27b0;">
<h5>5. SINIF - ÖZ KAYNAKLAR</h5>
<strong>Kodlar: 50-59</strong><br>
İşletme sahiplerinin sermayesi ve birikmiş karlar
<ul style="margin-top: 10px;">
    <li><strong>50 - Sermaye:</strong> Ödenmiş sermaye</li>
    <li><strong>52 - Sermaye Yedekleri:</strong> Hisse senedi ihraç primleri</li>
    <li><strong>54 - Kar Yedekleri:</strong> Yasal yedekler, statü yedekleri</li>
    <li><strong>57 - Geçmiş Yıllar Karları:</strong> Dağıtılmamış karlar</li>
    <li><strong>58 - Geçmiş Yıllar Zararları:</strong> Devir zararlar</li>
    <li><strong>59 - Dönem Net Karı/Zararı:</strong> Cari dönem sonucu</li>
</ul>
</div>

<h4>Kodlama Mantığı Örneği:</h4>
<pre style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
<strong>100 - KASA</strong>
├─ 1   : Dönen Varlıklar (Sınıf)
├─ 10  : Hazır Değerler (Ana Grup)
└─ 100 : Kasa (Hesap)

<strong>253 - BİNALAR</strong>
├─ 2   : Duran Varlıklar (Sınıf)
├─ 25  : Maddi Duran Varlıklar (Ana Grup)
└─ 253 : Binalar (Hesap)
</pre>',
true, NOW(), NOW()
FROM study_cards WHERE title = 'Tek Düzen Hesap Planı';

INSERT INTO card_sections (study_card_id, title, display_order, content_type, content, is_active, created_at, updated_at)
SELECT id, 'Sık Kullanılan Hesaplar', 2, 'TEXT',
'<h3>Sık Kullanılan Muhasebe Hesapları</h3>
<p>Günlük muhasebe işlemlerinde en çok kullanılan hesaplar ve işlem örnekleri</p>

<h4>VARLIK HESAPLARI:</h4>

<div style="background: #e8f5e9; padding: 12px; margin: 10px 0; border-left: 4px solid #4caf50;">
<h5>100 - KASA</h5>
<p>İşletmenin kasasındaki nakit paralar</p>
<strong>Örnek Kayıt:</strong> Müşteriden 5.000 TL nakit tahsilat
<pre style="background: #f5f5f5; padding: 10px; margin-top: 5px;">
100 KASA              5.000
    120 ALICILAR              5.000
</pre>
</div>

<div style="background: #e8f5e9; padding: 12px; margin: 10px 0; border-left: 4px solid #4caf50;">
<h5>102 - BANKALAR</h5>
<p>İşletmenin banka hesaplarındaki paralar</p>
<strong>Örnek Kayıt:</strong> Bankadan 50.000 TL kredi kullanımı
<pre style="background: #f5f5f5; padding: 10px; margin-top: 5px;">
102 BANKALAR          50.000
    300 BANKA KREDİLERİ        50.000
</pre>
</div>

<div style="background: #e8f5e9; padding: 12px; margin: 10px 0; border-left: 4px solid #4caf50;">
<h5>120 - ALICILAR</h5>
<p>İşletmenin müşterilerinden olan alacaklar</p>
<strong>Örnek Kayıt:</strong> Veresiye mal satışı (KDV dahil)
<pre style="background: #f5f5f5; padding: 10px; margin-top: 5px;">
120 ALICILAR          106.000
    600 YURTİÇİ SATIŞLAR       100.000
    391 HESAPLANAN KDV           6.000
</pre>
</div>

<div style="background: #e8f5e9; padding: 12px; margin: 10px 0; border-left: 4px solid #4caf50;">
<h5>153 - TİCARİ MALLAR</h5>
<p>Satmak amacıyla alınan mallar (stok)</p>
<strong>Örnek Kayıt:</strong> 80.000 TL değerinde mal alımı
<pre style="background: #f5f5f5; padding: 10px; margin-top: 5px;">
153 TİCARİ MALLAR     80.000
191 İNDİRİLECEK KDV    4.800
    320 SATICILAR              84.800
</pre>
</div>

<div style="background: #e3f2fd; padding: 12px; margin: 10px 0; border-left: 4px solid #2196f3;">
<h5>253 - BİNALAR</h5>
<p>İşletmenin sahip olduğu bina ve yapılar</p>
<strong>Örnek Kayıt:</strong> 500.000 TL''ye bina alımı
<pre style="background: #f5f5f5; padding: 10px; margin-top: 5px;">
253 BİNALAR           500.000
    102 BANKALAR               500.000
</pre>
</div>

<div style="background: #e3f2fd; padding: 12px; margin: 10px 0; border-left: 4px solid #2196f3;">
<h5>254 - MAKİNE VE TESİSATLAR</h5>
<p>İşletmede kullanılan makineler</p>
<strong>Örnek Kayıt:</strong> 150.000 TL makine alımı
<pre style="background: #f5f5f5; padding: 10px; margin-top: 5px;">
254 MAKİNE VE TESİSATLAR  150.000
    102 BANKALAR                   150.000
</pre>
</div>

<h4>KAYNAK HESAPLARI:</h4>

<div style="background: #fff3e0; padding: 12px; margin: 10px 0; border-left: 4px solid #ff9800;">
<h5>320 - SATICILAR</h5>
<p>İşletmenin tedarikçilerine olan borçları</p>
<strong>Örnek Kayıt:</strong> Satıcıya 30.000 TL ödeme
<pre style="background: #f5f5f5; padding: 10px; margin-top: 5px;">
320 SATICILAR         30.000
    102 BANKALAR               30.000
</pre>
</div>

<div style="background: #fff3e0; padding: 12px; margin: 10px 0; border-left: 4px solid #ff9800;">
<h5>360 - ÖDENECEK VERGİ VE FONLAR</h5>
<p>Devlete ödenecek vergiler</p>
<strong>Örnek Kayıt:</strong> KDV ödemesi
<pre style="background: #f5f5f5; padding: 10px; margin-top: 5px;">
360 ÖDENECEK VERGİ VE FONLAR  10.000
    102 BANKALAR                      10.000
</pre>
</div>

<div style="background: #f3e5f5; padding: 12px; margin: 10px 0; border-left: 4px solid #9c27b0;">
<h5>500 - SERMAYE</h5>
<p>İşletme sahibinin koydugu sermaye</p>
<strong>Örnek Kayıt:</strong> 200.000 TL nakit sermaye konulması
<pre style="background: #f5f5f5; padding: 10px; margin-top: 5px;">
100 KASA              200.000
    500 SERMAYE                200.000
</pre>
</div>

<h4>GELİR HESAPLARI:</h4>

<div style="background: #e0f2f1; padding: 12px; margin: 10px 0; border-left: 4px solid #009688;">
<h5>600 - YURTİÇİ SATIŞLAR</h5>
<p>İşletmenin Türkiye içindeki satışları</p>
<strong>Örnek Kayıt:</strong> 50.000 TL peşin satış
<pre style="background: #f5f5f5; padding: 10px; margin-top: 5px;">
100 KASA               53.000
    600 YURTİÇİ SATIŞLAR       50.000
    391 HESAPLANAN KDV          3.000
</pre>
</div>

<div style="background: #e0f2f1; padding: 12px; margin: 10px 0; border-left: 4px solid #009688;">
<h5>642 - FAİZ GELİRLERİ</h5>
<p>Mevduat veya alacaklardan elde edilen faiz gelirleri</p>
<strong>Örnek Kayıt:</strong> Bankadan 2.000 TL faiz geliri
<pre style="background: #f5f5f5; padding: 10px; margin-top: 5px;">
102 BANKALAR           2.000
    642 FAİZ GELİRLERİ         2.000
</pre>
</div>

<h4>GİDER HESAPLARI:</h4>

<div style="background: #fff9c4; padding: 12px; margin: 10px 0; border-left: 4px solid #fbc02d;">
<h5>770 - GENEL YÖNETİM GİDERLERİ</h5>
<p>İşletmenin genel yönetim harcamaları</p>
<strong>Alt Hesaplar:</strong>
<ul>
    <li>770.01 - Kira Gideri</li>
    <li>770.02 - Elektrik Gideri</li>
    <li>770.03 - Su Gideri</li>
    <li>770.04 - Telefon Gideri</li>
</ul>
<strong>Örnek Kayıt:</strong> 5.000 TL kira ödemesi
<pre style="background: #f5f5f5; padding: 10px; margin-top: 5px;">
770 GENEL YÖNETİM GİDERLERİ  5.000
    102 BANKALAR                      5.000
</pre>
</div>

<div style="background: #fff9c4; padding: 12px; margin: 10px 0; border-left: 4px solid #fbc02d;">
<h5>780 - FİNANSMAN GİDERLERİ</h5>
<p>Kredi faizleri ve finansman masrafları</p>
<strong>Örnek Kayıt:</strong> 3.000 TL kredi faiz ödemesi
<pre style="background: #f5f5f5; padding: 10px; margin-top: 5px;">
780 FİNANSMAN GİDERLERİ  3.000
    102 BANKALAR                 3.000
</pre>
</div>

<h4>Özel Hesaplar:</h4>

<div style="background: #f5f5f5; padding: 12px; margin: 10px 0; border-left: 4px solid #9e9e9e;">
<h5>191 - İNDİRİLECEK KDV</h5>
<p>Alışlardan kaynaklanan KDV (gider olmaz, varlıktır)</p>
<strong>Açıklama:</strong> İşletme mal alırken ödediği KDV''yi, satışlardan tahsil ettiği KDV''den mahsup eder.
</div>

<div style="background: #f5f5f5; padding: 12px; margin: 10px 0; border-left: 4px solid #9e9e9e;">
<h5>391 - HESAPLANAN KDV</h5>
<p>Satışlardan tahsil edilen KDV (gelir olmaz, borçtur)</p>
<strong>Açıklama:</strong> İşletme bu KDV''yi devlete ödemekle yükümlüdür.
</div>',
true, NOW(), NOW()
FROM study_cards WHERE title = 'Tek Düzen Hesap Planı';

INSERT INTO card_sections (study_card_id, title, display_order, content_type, content, is_active, created_at, updated_at)
SELECT id, 'KDV Muhasebesi', 3, 'TEXT',
'<h3>KDV (Katma Değer Vergisi) Muhasebesi</h3>
<p>KDV, mal ve hizmet satışlarından alınan dolaylı bir vergidir. Türkiye''de standart oran %20, indirimli oranlar %10, %8 ve %1''dir.</p>

<h4>Temel Mantık:</h4>
<p style="background: #e3f2fd; padding: 15px; border-left: 4px solid #2196f3; margin: 15px 0;">
<strong>DEVLETE ÖDENECEK KDV = HESAPLANAN KDV - İNDİRİLECEK KDV</strong><br>
(Satışlardan alınan KDV) - (Alışlarda ödenen KDV)
</p>

<h4>İki Anahtar Hesap:</h4>

<div style="background: #e8f5e9; padding: 15px; margin: 10px 0; border-left: 4px solid #4caf50;">
<h5>191 - İNDİRİLECEK KDV (Varlık Hesabı)</h5>
<p><strong>Ne zaman kullanılır?</strong> Mal veya hizmet ALIRKEN ödediğimiz KDV</p>
<p><strong>Niteliği:</strong> Varlık hesabıdır, çünkü bu KDV''yi devletten geri alacağız (mahsup edeceğiz)</p>
<p><strong>Kayıt:</strong> BORÇ tarafına yazılır</p>
</div>

<div style="background: #fff3e0; padding: 15px; margin: 10px 0; border-left: 4px solid #ff9800;">
<h5>391 - HESAPLANAN KDV (Kaynak/Borç Hesabı)</h5>
<p><strong>Ne zaman kullanılır?</strong> Mal veya hizmet SATARKEN tahsil ettiğimiz KDV</p>
<p><strong>Niteliği:</strong> Borç hesabıdır, çünkü bu KDV''yi devlete ödememiz gerekiyor</p>
<p><strong>Kayıt:</strong> ALACAK tarafına yazılır</p>
</div>

<h4>Örnek İşlemler:</h4>

<h5>1. Mal Alımı (KDV Ödeme):</h5>
<p><strong>İşlem:</strong> 10.000 TL + %20 KDV (2.000 TL) = 12.000 TL değerinde mal alındı</p>
<pre style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
<strong>Yevmiye Kaydı:</strong>
─────────────────────────────────────
153 TİCARİ MALLAR         10.000 TL
191 İNDİRİLECEK KDV        2.000 TL
    320 SATICILAR                      12.000 TL
─────────────────────────────────────
(Mal alımı ve ödenen KDV)
</pre>

<p><strong>Açıklama:</strong>
<ul>
    <li>153 - Ticari Mallar: 10.000 TL (maliyet)</li>
    <li>191 - İndirilecek KDV: 2.000 TL (ileride mahsup edilecek)</li>
    <li>320 - Satıcılar: 12.000 TL (toplam borç)</li>
</ul>
</p>

<h5>2. Mal Satışı (KDV Tahsil Etme):</h5>
<p><strong>İşlem:</strong> 15.000 TL + %20 KDV (3.000 TL) = 18.000 TL değerinde mal satıldı</p>
<pre style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
<strong>Yevmiye Kaydı:</strong>
─────────────────────────────────────
120 ALICILAR               18.000 TL
    600 YURTİÇİ SATIŞLAR               15.000 TL
    391 HESAPLANAN KDV                  3.000 TL
─────────────────────────────────────
(Mal satışı ve tahsil edilen KDV)
</pre>

<p><strong>Açıklama:</strong>
<ul>
    <li>120 - Alıcılar: 18.000 TL (toplam alacak)</li>
    <li>600 - Yurtiçi Satışlar: 15.000 TL (satış geliri)</li>
    <li>391 - Hesaplanan KDV: 3.000 TL (devlete borç)</li>
</ul>
</p>

<h4>Dönem Sonu KDV Hesabı:</h4>

<table style="width:100%; border-collapse: collapse; margin: 15px 0;">
    <tr style="background: #2196f3; color: white;">
        <th style="border: 1px solid #ddd; padding: 10px;">KDV HESABI</th>
        <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">TUTAR</th>
    </tr>
    <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">391 Hesaplanan KDV (Satışlardan)</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">45.000 TL</td>
    </tr>
    <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">191 İndirilecek KDV (Alışlardan)</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">(30.000 TL)</td>
    </tr>
    <tr style="background: #e8f5e9; font-weight: bold;">
        <td style="border: 1px solid #ddd; padding: 10px;">DEVLETE ÖDENECEK KDV</td>
        <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">15.000 TL</td>
    </tr>
</table>

<h5>3. Dönem Sonu Mahsuplaşma Kaydı:</h5>
<pre style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
<strong>Mahsuplaşma Kaydı:</strong>
─────────────────────────────────────
391 HESAPLANAN KDV         45.000 TL
    191 İNDİRİLECEK KDV                30.000 TL
    360 ÖDENECEK VERGİ VE FONLAR       15.000 TL
─────────────────────────────────────
(Dönem sonu KDV mahsuplaşması)
</pre>

<h5>4. KDV Ödemesi:</h5>
<pre style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
<strong>Ödeme Kaydı:</strong>
─────────────────────────────────────
360 ÖDENECEK VERGİ VE FONLAR  15.000 TL
    102 BANKALAR                       15.000 TL
─────────────────────────────────────
(KDV ödemesi)
</pre>

<h4>Özel Durumlar:</h4>

<h5>İndirilecek KDV > Hesaplanan KDV (Devletten İade)</h5>
<p>Eğer alışlardaki KDV, satışlardaki KDV''den fazlaysa, fark devletten iade alınır veya sonraki döneme devredilir.</p>

<pre style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
<strong>Örnek:</strong> İndirilecek KDV: 50.000 TL, Hesaplanan KDV: 30.000 TL

<strong>Mahsuplaşma Kaydı:</strong>
─────────────────────────────────────
391 HESAPLANAN KDV            30.000 TL
190 DEVREDEN KDV              20.000 TL
    191 İNDİRİLECEK KDV                50.000 TL
─────────────────────────────────────
(20.000 TL sonraki aya devir veya iade talebi)
</pre>

<h4>KDV Beyannamesi:</h4>
<p>İşletmeler, aylık veya üç aylık dönemler halinde KDV beyannamesi vererek KDV ödemelerini yapar. Beyanname, yukarıdaki hesaplamayı resmi olarak kayıt altına alır.</p>

<h4>Önemli Notlar:</h4>
<ul>
    <li>KDV, işletme için ne gelir ne de giderdir, sadece aracılık yapılan bir vergidir</li>
    <li>191 ve 391 hesapları dönem sonunda kapatılır (bakiye kalmaz)</li>
    <li>İhracat KDV''den muaftır (%0 KDV)</li>
    <li>Bazı mal ve hizmetlerde indirimli KDV oranları uygulanır (%10, %8, %1)</li>
</ul>',
true, NOW(), NOW()
FROM study_cards WHERE title = 'Tek Düzen Hesap Planı';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ StudyCard seed data successfully created!';
    RAISE NOTICE '📚 4 StudyCards created with detailed CardSections';
    RAISE NOTICE '📖 Topics: Temel Kavramlar, Hesaplar ve Kayıt Sistemi, Mali Tablolar, Tek Düzen Hesap Planı';
END $$;
