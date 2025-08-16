-- Ürünler - Yazı Gereçleri
INSERT INTO products (name, product_code, description, category_id, unit_of_measure, min_quantity, max_quantity, current_stock, estimated_unit_price, currency, created_at, updated_at, is_active)
SELECT 'Kurşun Kalem', 'KRT-KLM-001', 'HB kurşun kalem', c.id, 'ADET', 100, 1000, 0, 5.50, 'TRY', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories c WHERE c.name = 'Yazı Gereçleri';

INSERT INTO products (name, product_code, description, category_id, unit_of_measure, min_quantity, max_quantity, current_stock, estimated_unit_price, currency, created_at, updated_at, is_active)
SELECT 'Tükenmez Kalem', 'KRT-KLM-002', 'Mavi tükenmez kalem', c.id, 'ADET', 100, 1000, 0, 7.50, 'TRY', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories c WHERE c.name = 'Yazı Gereçleri';

INSERT INTO products (name, product_code, description, category_id, unit_of_measure, min_quantity, max_quantity, current_stock, estimated_unit_price, currency, created_at, updated_at, is_active)
SELECT 'Tahta Kalemi', 'KRT-KLM-003', 'Siyah tahta kalemi', c.id, 'ADET', 50, 500, 0, 12.00, 'TRY', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories c WHERE c.name = 'Yazı Gereçleri';

INSERT INTO products (name, product_code, description, category_id, unit_of_measure, min_quantity, max_quantity, current_stock, estimated_unit_price, currency, created_at, updated_at, is_active)
SELECT 'Silgi', 'KRT-SLG-001', 'Beyaz silgi', c.id, 'ADET', 100, 1000, 0, 3.50, 'TRY', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories c WHERE c.name = 'Yazı Gereçleri';

-- Ürünler - Kağıt Ürünleri
INSERT INTO products (name, product_code, description, category_id, unit_of_measure, min_quantity, max_quantity, current_stock, estimated_unit_price, currency, created_at, updated_at, is_active)
SELECT 'A4 Kağıt', 'KRT-KGT-001', '80gr A4 fotokopi kağıdı', c.id, 'PAKET', 50, 200, 0, 150.00, 'TRY', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories c WHERE c.name = 'Kağıt Ürünleri';

INSERT INTO products (name, product_code, description, category_id, unit_of_measure, min_quantity, max_quantity, current_stock, estimated_unit_price, currency, created_at, updated_at, is_active)
SELECT 'Kareli Defter', 'KRT-DFT-001', '60 yaprak kareli defter', c.id, 'ADET', 100, 1000, 0, 25.00, 'TRY', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories c WHERE c.name = 'Kağıt Ürünleri';

INSERT INTO products (name, product_code, description, category_id, unit_of_measure, min_quantity, max_quantity, current_stock, estimated_unit_price, currency, created_at, updated_at, is_active)
SELECT 'Çizgili Defter', 'KRT-DFT-002', '80 yaprak çizgili defter', c.id, 'ADET', 100, 1000, 0, 30.00, 'TRY', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories c WHERE c.name = 'Kağıt Ürünleri';

-- Ürünler - Dosyalama Malzemeleri
INSERT INTO products (name, description, category_id, unit_of_measure, price, created_at, updated_at, is_active)
SELECT 'Plastik Klasör', 'A4 plastik klasör', c.id, 'ADET', 45.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories c WHERE c.name = 'Dosyalama Malzemeleri';

INSERT INTO products (name, description, category_id, unit_of_measure, price, created_at, updated_at, is_active)
SELECT 'Sunum Dosyası', '40 yaprak sunum dosyası', c.id, 'ADET', 35.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories c WHERE c.name = 'Dosyalama Malzemeleri';

-- Ürünler - Bilgisayar Ekipmanları
INSERT INTO products (name, product_code, description, category_id, unit_of_measure, min_quantity, max_quantity, current_stock, estimated_unit_price, currency, created_at, updated_at, is_active)
SELECT 'Masaüstü Bilgisayar', 'TEK-BIL-001', 'i5 işlemci, 8GB RAM, 256GB SSD', c.id, 'ADET', 5, 20, 0, 15000.00, 'TRY', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories c WHERE c.name = 'Bilgisayar Ekipmanları';

INSERT INTO products (name, product_code, description, category_id, unit_of_measure, min_quantity, max_quantity, current_stock, estimated_unit_price, currency, created_at, updated_at, is_active)
SELECT 'Dizüstü Bilgisayar', 'TEK-BIL-002', 'i7 işlemci, 16GB RAM, 512GB SSD', c.id, 'ADET', 5, 20, 0, 25000.00, 'TRY', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories c WHERE c.name = 'Bilgisayar Ekipmanları';

INSERT INTO products (name, description, category_id, unit_of_measure, price, created_at, updated_at, is_active)
SELECT 'Klavye', 'USB Türkçe Q klavye', c.id, 'ADET', 350.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories c WHERE c.name = 'Bilgisayar Ekipmanları';

INSERT INTO products (name, description, category_id, unit_of_measure, price, created_at, updated_at, is_active)
SELECT 'Mouse', 'USB optik mouse', c.id, 'ADET', 200.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories c WHERE c.name = 'Bilgisayar Ekipmanları';

-- Ürünler - Projeksiyon Sistemleri
INSERT INTO products (name, description, category_id, unit_of_measure, price, created_at, updated_at, is_active)
SELECT 'Projeksiyon Cihazı', '4000 lümen projeksiyon cihazı', c.id, 'ADET', 12000.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories c WHERE c.name = 'Projeksiyon Sistemleri';

INSERT INTO products (name, description, category_id, unit_of_measure, price, created_at, updated_at, is_active)
SELECT 'Projeksiyon Perdesi', '200x200cm motorlu projeksiyon perdesi', c.id, 'ADET', 3500.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories c WHERE c.name = 'Projeksiyon Sistemleri';

-- Ürünler - Yazıcı ve Tarayıcılar
INSERT INTO products (name, description, category_id, unit_of_measure, price, created_at, updated_at, is_active)
SELECT 'Lazer Yazıcı', 'Siyah beyaz lazer yazıcı', c.id, 'ADET', 4500.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories c WHERE c.name = 'Yazıcı ve Tarayıcılar';

INSERT INTO products (name, description, category_id, unit_of_measure, price, created_at, updated_at, is_active)
SELECT 'Tarayıcı', 'A4 döküman tarayıcı', c.id, 'ADET', 2800.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories c WHERE c.name = 'Yazıcı ve Tarayıcılar';

-- Ürünler - Kimya Lab Malzemeleri
INSERT INTO products (name, description, category_id, unit_of_measure, price, created_at, updated_at, is_active)
SELECT 'Deney Tüpü', '15ml cam deney tüpü', c.id, 'ADET', 15.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories c WHERE c.name = 'Kimya Lab Malzemeleri';

INSERT INTO products (name, description, category_id, unit_of_measure, price, created_at, updated_at, is_active)
SELECT 'Beher', '250ml cam beher', c.id, 'ADET', 45.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories c WHERE c.name = 'Kimya Lab Malzemeleri';

INSERT INTO products (name, description, category_id, unit_of_measure, price, created_at, updated_at, is_active)
SELECT 'Erlen', '500ml cam erlen', c.id, 'ADET', 65.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories c WHERE c.name = 'Kimya Lab Malzemeleri';

-- Ürünler - Fizik Lab Malzemeleri
INSERT INTO products (name, description, category_id, unit_of_measure, price, created_at, updated_at, is_active)
SELECT 'Dinamometre', '5N dinamometre', c.id, 'ADET', 120.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories c WHERE c.name = 'Fizik Lab Malzemeleri';

INSERT INTO products (name, description, category_id, unit_of_measure, price, created_at, updated_at, is_active)
SELECT 'Termometre', '-10/110°C cam termometre', c.id, 'ADET', 85.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories c WHERE c.name = 'Fizik Lab Malzemeleri';

-- Ürünler - Top Çeşitleri
INSERT INTO products (name, description, category_id, unit_of_measure, price, created_at, updated_at, is_active)
SELECT 'Basketbol Topu', 'Size 7 basketbol topu', c.id, 'ADET', 450.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories c WHERE c.name = 'Top Çeşitleri';

INSERT INTO products (name, description, category_id, unit_of_measure, price, created_at, updated_at, is_active)
SELECT 'Voleybol Topu', 'Resmi maç voleybol topu', c.id, 'ADET', 400.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories c WHERE c.name = 'Top Çeşitleri';

INSERT INTO products (name, description, category_id, unit_of_measure, price, created_at, updated_at, is_active)
SELECT 'Futbol Topu', 'Size 5 futbol topu', c.id, 'ADET', 350.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories c WHERE c.name = 'Top Çeşitleri';

-- Ürünler - Jimnastik Malzemeleri
INSERT INTO products (name, description, category_id, unit_of_measure, price, created_at, updated_at, is_active)
SELECT 'Jimnastik Minderi', '2x1m jimnastik minderi', c.id, 'ADET', 850.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories c WHERE c.name = 'Jimnastik Malzemeleri';

INSERT INTO products (name, description, category_id, unit_of_measure, price, created_at, updated_at, is_active)
SELECT 'Atlama İpi', '2.5m atlama ipi', c.id, 'ADET', 75.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories c WHERE c.name = 'Jimnastik Malzemeleri';

-- Ürünler - Mutfak Ekipmanları
INSERT INTO products (name, description, category_id, unit_of_measure, price, created_at, updated_at, is_active)
SELECT 'Endüstriyel Fırın', '4 katlı endüstriyel fırın', c.id, 'ADET', 85000.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories c WHERE c.name = 'Mutfak Ekipmanları';

INSERT INTO products (name, description, category_id, unit_of_measure, price, created_at, updated_at, is_active)
SELECT 'Endüstriyel Bulaşık Makinesi', '1000 tabak/saat kapasiteli', c.id, 'ADET', 65000.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories c WHERE c.name = 'Mutfak Ekipmanları';

-- Ürünler - Servis Malzemeleri
INSERT INTO products (name, description, category_id, unit_of_measure, price, created_at, updated_at, is_active)
SELECT 'Yemek Tabağı', 'Porselen yemek tabağı', c.id, 'ADET', 45.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories c WHERE c.name = 'Servis Malzemeleri';

INSERT INTO products (name, description, category_id, unit_of_measure, price, created_at, updated_at, is_active)
SELECT 'Çatal Takımı', 'Paslanmaz çelik çatal', c.id, 'ADET', 25.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories c WHERE c.name = 'Servis Malzemeleri';

-- Ürünler - Kamera Sistemleri
INSERT INTO products (name, description, category_id, unit_of_measure, price, created_at, updated_at, is_active)
SELECT 'IP Kamera', '4MP IP güvenlik kamerası', c.id, 'ADET', 2500.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories c WHERE c.name = 'Kamera Sistemleri';

INSERT INTO products (name, description, category_id, unit_of_measure, price, created_at, updated_at, is_active)
SELECT 'NVR Kayıt Cihazı', '16 kanal NVR kayıt cihazı', c.id, 'ADET', 8500.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories c WHERE c.name = 'Kamera Sistemleri';

-- Ürünler - Yangın Güvenliği
INSERT INTO products (name, description, category_id, unit_of_measure, price, created_at, updated_at, is_active)
SELECT 'Yangın Söndürücü', '6kg ABC kuru kimyevi tozlu yangın söndürücü', c.id, 'ADET', 450.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories c WHERE c.name = 'Yangın Güvenliği';

INSERT INTO products (name, description, category_id, unit_of_measure, price, created_at, updated_at, is_active)
SELECT 'Duman Dedektörü', 'Optik duman dedektörü', c.id, 'ADET', 350.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories c WHERE c.name = 'Yangın Güvenliği';

-- Ürünler - İlk Yardım
INSERT INTO products (name, description, category_id, unit_of_measure, price, created_at, updated_at, is_active)
SELECT 'İlk Yardım Çantası', 'Temel ilk yardım malzemeleri içeren set', c.id, 'SET', 750.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories c WHERE c.name = 'İlk Yardım';

INSERT INTO products (name, description, category_id, unit_of_measure, price, created_at, updated_at, is_active)
SELECT 'Sargı Bezi', '10cm x 3m sargı bezi', c.id, 'ADET', 25.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories c WHERE c.name = 'İlk Yardım';

-- Ürünler - Tıbbi Cihazlar
INSERT INTO products (name, description, category_id, unit_of_measure, price, created_at, updated_at, is_active)
SELECT 'Tansiyon Aleti', 'Dijital tansiyon ölçüm cihazı', c.id, 'ADET', 850.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories c WHERE c.name = 'Tıbbi Cihazlar';

INSERT INTO products (name, description, category_id, unit_of_measure, price, created_at, updated_at, is_active)
SELECT 'Ateş Ölçer', 'Dijital ateş ölçer', c.id, 'ADET', 250.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories c WHERE c.name = 'Tıbbi Cihazlar';

-- Ürünler - Resim Malzemeleri
INSERT INTO products (name, description, category_id, unit_of_measure, price, created_at, updated_at, is_active)
SELECT 'Resim Defteri', 'A3 35x50 resim defteri', c.id, 'ADET', 65.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories c WHERE c.name = 'Resim Malzemeleri';

INSERT INTO products (name, description, category_id, unit_of_measure, price, created_at, updated_at, is_active)
SELECT 'Kuru Boya Seti', '24 renk kuru boya seti', c.id, 'SET', 120.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories c WHERE c.name = 'Resim Malzemeleri';

INSERT INTO products (name, description, category_id, unit_of_measure, price, created_at, updated_at, is_active)
SELECT 'Sulu Boya', '12 renk sulu boya', c.id, 'SET', 85.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories c WHERE c.name = 'Resim Malzemeleri';

-- Ürünler - Müzik Aletleri
INSERT INTO products (name, product_code, description, category_id, unit_of_measure, min_quantity, max_quantity, current_stock, estimated_unit_price, currency, created_at, updated_at, is_active)
SELECT 'Melodika', 'SNT-MZK-001', '37 tuşlu melodika', c.id, 'ADET', 10, 50, 0, 450.00, 'TRY', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories c WHERE c.name = 'Müzik Aletleri';

INSERT INTO products (name, product_code, description, category_id, unit_of_measure, min_quantity, max_quantity, current_stock, estimated_unit_price, currency, created_at, updated_at, is_active)
SELECT 'Blok Flüt', 'SNT-MZK-002', 'Soprano blok flüt', c.id, 'ADET', 20, 100, 0, 85.00, 'TRY', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories c WHERE c.name = 'Müzik Aletleri'; 