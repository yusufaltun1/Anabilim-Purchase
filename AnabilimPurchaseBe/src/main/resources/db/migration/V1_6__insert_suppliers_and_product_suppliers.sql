-- Tedarikçiler
INSERT INTO suppliers (
    company_name, 
    tax_number, 
    tax_office, 
    address, 
    phone, 
    email, 
    website,
    contact_person, 
    contact_phone,
    contact_email,
    bank_account,
    iban,
    is_active,
    is_preferred,
    created_at, 
    updated_at
) VALUES
-- Kırtasiye Tedarikçileri
('Ofis Market A.Ş.', '1234567890', 'Kadıköy', 'İstanbul, Kadıköy', '0216-555-0001', 'info@ofismarket.com', 'www.ofismarket.com', 'Ahmet Yılmaz', '0532-555-0001', 'ahmet.yilmaz@ofismarket.com', 'TR Garanti 1234', 'TR330006100519786457841326', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Okul Dünyası Ltd.', '2345678901', 'Üsküdar', 'İstanbul, Üsküdar', '0216-555-0002', 'info@okuldunya.com', 'www.okuldunya.com', 'Ayşe Demir', '0533-555-0002', 'ayse.demir@okuldunya.com', 'TR İş Bank 5678', 'TR330006100519786457841327', true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Teknoloji Tedarikçileri
('TeknoPlus Bilişim', '3456789012', 'Şişli', 'İstanbul, Şişli', '0212-555-0003', 'info@teknoplus.com', 'www.teknoplus.com', 'Mehmet Kaya', '0534-555-0003', 'mehmet.kaya@teknoplus.com', 'TR Yapı Kredi 9012', 'TR330006100519786457841328', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Dijital Dünya A.Ş.', '4567890123', 'Beşiktaş', 'İstanbul, Beşiktaş', '0212-555-0004', 'info@dijitaldunya.com', 'www.dijitaldunya.com', 'Zeynep Ak', '0535-555-0004', 'zeynep.ak@dijitaldunya.com', 'TR Akbank 3456', 'TR330006100519786457841329', true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Laboratuvar Tedarikçileri
('Lab Ekipman Ltd.', '5678901234', 'Maltepe', 'İstanbul, Maltepe', '0216-555-0005', 'info@labekipman.com', 'www.labekipman.com', 'Ali Can', '0536-555-0005', 'ali.can@labekipman.com', 'TR Ziraat 7890', 'TR330006100519786457841330', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Bilim Araç Gereç A.Ş.', '6789012345', 'Ümraniye', 'İstanbul, Ümraniye', '0216-555-0006', 'info@bilimarac.com', 'www.bilimarac.com', 'Fatma Şahin', '0537-555-0006', 'fatma.sahin@bilimarac.com', 'TR Halk 1234', 'TR330006100519786457841331', true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Spor Ekipmanları Tedarikçileri
('Spor Dünyası Ltd.', '7890123456', 'Bakırköy', 'İstanbul, Bakırköy', '0212-555-0007', 'info@spordunya.com', 'www.spordunya.com', 'Can Yıldız', '0538-555-0007', 'can.yildiz@spordunya.com', 'TR Finansbank 5678', 'TR330006100519786457841332', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Aktif Spor A.Ş.', '8901234567', 'Beylikdüzü', 'İstanbul, Beylikdüzü', '0212-555-0008', 'info@aktifsport.com', 'www.aktifsport.com', 'Selin Öz', '0539-555-0008', 'selin.oz@aktifsport.com', 'TR TEB 9012', 'TR330006100519786457841333', true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Mutfak ve Yemekhane Tedarikçileri
('Endüstriyel Mutfak Ltd.', '9012345678', 'Kartal', 'İstanbul, Kartal', '0216-555-0009', 'info@endustriyelmutfak.com', 'www.endustriyelmutfak.com', 'Murat Demir', '0540-555-0009', 'murat.demir@endustriyelmutfak.com', 'TR Garanti 3456', 'TR330006100519786457841334', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Mutfak Pro A.Ş.', '0123456789', 'Pendik', 'İstanbul, Pendik', '0216-555-0010', 'info@mutfakpro.com', 'www.mutfakpro.com', 'Aylin Çelik', '0541-555-0010', 'aylin.celik@mutfakpro.com', 'TR İş Bank 7890', 'TR330006100519786457841335', true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Güvenlik Sistemleri Tedarikçileri
('Güvenlik Sistemleri A.Ş.', '1234509876', 'Ataşehir', 'İstanbul, Ataşehir', '0216-555-0011', 'info@guvenliksistem.com', 'www.guvenliksistem.com', 'Kemal Yılmaz', '0542-555-0011', 'kemal.yilmaz@guvenliksistem.com', 'TR Yapı Kredi 1234', 'TR330006100519786457841336', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Pro Güvenlik Ltd.', '2345609876', 'Kadıköy', 'İstanbul, Kadıköy', '0216-555-0012', 'info@proguvenlik.com', 'www.proguvenlik.com', 'Deniz Arslan', '0543-555-0012', 'deniz.arslan@proguvenlik.com', 'TR Akbank 5678', 'TR330006100519786457841337', true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Sağlık Malzemeleri Tedarikçileri
('Medikal Market A.Ş.', '3456709876', 'Üsküdar', 'İstanbul, Üsküdar', '0216-555-0013', 'info@medikalmarket.com', 'www.medikalmarket.com', 'Hakan Öztürk', '0544-555-0013', 'hakan.ozturk@medikalmarket.com', 'TR Ziraat 9012', 'TR330006100519786457841338', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Sağlık Ekipmanları Ltd.', '4567809876', 'Şişli', 'İstanbul, Şişli', '0212-555-0014', 'info@saglikekipman.com', 'www.saglikekipman.com', 'Elif Yıldırım', '0545-555-0014', 'elif.yildirim@saglikekipman.com', 'TR Halk 3456', 'TR330006100519786457841339', true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Sanat Malzemeleri Tedarikçileri
('Sanat Dünyası A.Ş.', '5678909876', 'Beşiktaş', 'İstanbul, Beşiktaş', '0212-555-0015', 'info@sanatdunyasi.com', 'www.sanatdunyasi.com', 'Canan Aydın', '0546-555-0015', 'canan.aydin@sanatdunyasi.com', 'TR Finansbank 7890', 'TR330006100519786457841340', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Artı Sanat Ltd.', '6789009876', 'Bakırköy', 'İstanbul, Bakırköy', '0212-555-0016', 'info@artisanat.com', 'www.artisanat.com', 'Burak Koç', '0547-555-0016', 'burak.koc@artisanat.com', 'TR TEB 1234', 'TR330006100519786457841341', true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Ürün-Tedarikçi İlişkileri
-- Kırtasiye Ürünleri İlişkileri
INSERT INTO product_suppliers (product_id, supplier_id)
SELECT p.id, s.id
FROM products p, suppliers s
WHERE p.product_code LIKE 'KRT%'
AND s.company_name IN ('Ofis Market A.Ş.', 'Okul Dünyası Ltd.');

-- Teknoloji Ürünleri İlişkileri
INSERT INTO product_suppliers (product_id, supplier_id)
SELECT p.id, s.id
FROM products p, suppliers s
WHERE p.product_code LIKE 'TEK%'
AND s.company_name IN ('TeknoPlus Bilişim', 'Dijital Dünya A.Ş.');

-- Laboratuvar Ürünleri İlişkileri
INSERT INTO product_suppliers (product_id, supplier_id)
SELECT p.id, s.id
FROM products p, suppliers s
WHERE p.product_code LIKE 'LAB%'
AND s.company_name IN ('Lab Ekipman Ltd.', 'Bilim Araç Gereç A.Ş.');

-- Spor Ürünleri İlişkileri
INSERT INTO product_suppliers (product_id, supplier_id)
SELECT p.id, s.id
FROM products p, suppliers s
WHERE p.product_code LIKE 'SPR%'
AND s.company_name IN ('Spor Dünyası Ltd.', 'Aktif Spor A.Ş.');

-- Mutfak Ürünleri İlişkileri
INSERT INTO product_suppliers (product_id, supplier_id)
SELECT p.id, s.id
FROM products p, suppliers s
WHERE p.product_code LIKE 'MTF%'
AND s.company_name IN ('Endüstriyel Mutfak Ltd.', 'Mutfak Pro A.Ş.');

-- Güvenlik Ürünleri İlişkileri
INSERT INTO product_suppliers (product_id, supplier_id)
SELECT p.id, s.id
FROM products p, suppliers s
WHERE p.product_code LIKE 'GUV%'
AND s.company_name IN ('Güvenlik Sistemleri A.Ş.', 'Pro Güvenlik Ltd.');

-- Sağlık Ürünleri İlişkileri
INSERT INTO product_suppliers (product_id, supplier_id)
SELECT p.id, s.id
FROM products p, suppliers s
WHERE p.product_code LIKE 'SAG%'
AND s.company_name IN ('Medikal Market A.Ş.', 'Sağlık Ekipmanları Ltd.');

-- Sanat Ürünleri İlişkileri
INSERT INTO product_suppliers (product_id, supplier_id)
SELECT p.id, s.id
FROM products p, suppliers s
WHERE p.product_code LIKE 'SNT%'
AND s.company_name IN ('Sanat Dünyası A.Ş.', 'Artı Sanat Ltd.');

-- Tedarikçi-Kategori İlişkileri
INSERT INTO supplier_categories (supplier_id, category_id)
SELECT s.id, c.id
FROM suppliers s, categories c
WHERE 
    (s.company_name IN ('Ofis Market A.Ş.', 'Okul Dünyası Ltd.') AND c.id IN (7, 17, 18, 19)) OR -- Kırtasiye ve alt kategorileri
    (s.company_name IN ('TeknoPlus Bilişim', 'Dijital Dünya A.Ş.') AND c.id IN (10, 20, 21, 22)) OR -- Teknoloji ve alt kategorileri
    (s.company_name IN ('Lab Ekipman Ltd.', 'Bilim Araç Gereç A.Ş.') AND c.id = 11) OR -- Laboratuvar
    (s.company_name IN ('Spor Dünyası Ltd.', 'Aktif Spor A.Ş.') AND c.id = 12) OR -- Spor
    (s.company_name IN ('Endüstriyel Mutfak Ltd.', 'Mutfak Pro A.Ş.') AND c.id = 13) OR -- Mutfak
    (s.company_name IN ('Güvenlik Sistemleri A.Ş.', 'Pro Güvenlik Ltd.') AND c.id = 14) OR -- Güvenlik
    (s.company_name IN ('Medikal Market A.Ş.', 'Sağlık Ekipmanları Ltd.') AND c.id = 15) OR -- Sağlık
    (s.company_name IN ('Sanat Dünyası A.Ş.', 'Artı Sanat Ltd.') AND c.id = 16); -- Sanat 