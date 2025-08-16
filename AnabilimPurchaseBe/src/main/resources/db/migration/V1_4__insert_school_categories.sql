-- Ana Kategoriler
INSERT INTO categories (name, description, code, created_at, updated_at, is_active) VALUES
('Kırtasiye Malzemeleri', 'Okul için gerekli temel kırtasiye malzemeleri', 'KIRTASIYE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true),
('Temizlik Malzemeleri', 'Okul temizliği için gerekli malzemeler', 'TEMIZLIK', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true),
('Mobilya ve Demirbaş', 'Sınıf ve ofis mobilyaları, demirbaş eşyalar', 'MOBILYA', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true),
('Teknolojik Ekipmanlar', 'Bilgisayar, projeksiyon vb. teknolojik cihazlar', 'TEKNOLOJI', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true),
('Laboratuvar Malzemeleri', 'Fen ve kimya laboratuvarı için gerekli malzemeler', 'LABORATUVAR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true),
('Spor Ekipmanları', 'Beden eğitimi ve spor faaliyetleri için malzemeler', 'SPOR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true),
('Mutfak ve Yemekhane', 'Yemekhane ekipmanları ve mutfak malzemeleri', 'MUTFAK', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true),
('Güvenlik Ekipmanları', 'Okul güvenliği için gerekli ekipmanlar', 'GUVENLIK', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true),
('Sağlık Malzemeleri', 'İlk yardım ve revir malzemeleri', 'SAGLIK', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true),
('Sanat Malzemeleri', 'Resim, müzik ve diğer sanat dalları için malzemeler', 'SANAT', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true);

-- Alt Kategoriler - Kırtasiye
INSERT INTO categories (name, description, code, parent_id, created_at, updated_at, is_active)
SELECT 'Yazı Gereçleri', 'Kalem, silgi, kalemtıraş vb.', 'KIRTASIYE_YAZI', id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories WHERE name = 'Kırtasiye Malzemeleri';

INSERT INTO categories (name, description, code, parent_id, created_at, updated_at, is_active)
SELECT 'Kağıt Ürünleri', 'Defter, fotokopi kağıdı, karton vb.', 'KIRTASIYE_KAGIT', id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories WHERE name = 'Kırtasiye Malzemeleri';

INSERT INTO categories (name, description, code, parent_id, created_at, updated_at, is_active)
SELECT 'Dosyalama Malzemeleri', 'Klasör, dosya, sunum dosyaları', 'KIRTASIYE_DOSYA', id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories WHERE name = 'Kırtasiye Malzemeleri';

-- Alt Kategoriler - Teknolojik Ekipmanlar
INSERT INTO categories (name, description, code, parent_id, created_at, updated_at, is_active)
SELECT 'Bilgisayar Ekipmanları', 'Bilgisayar ve çevre birimleri', 'TEKNOLOJI_PC', id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories WHERE name = 'Teknolojik Ekipmanlar';

INSERT INTO categories (name, description, code, parent_id, created_at, updated_at, is_active)
SELECT 'Projeksiyon Sistemleri', 'Projeksiyon cihazı ve aksesuarları', 'TEKNOLOJI_PROJ', id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories WHERE name = 'Teknolojik Ekipmanlar';

INSERT INTO categories (name, description, code, parent_id, created_at, updated_at, is_active)
SELECT 'Yazıcı ve Tarayıcılar', 'Yazıcı, tarayıcı ve sarf malzemeleri', 'TEKNOLOJI_PRINT', id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories WHERE name = 'Teknolojik Ekipmanlar';

-- Alt Kategoriler - Laboratuvar Malzemeleri
INSERT INTO categories (name, description, code, parent_id, created_at, updated_at, is_active)
SELECT 'Kimya Lab Malzemeleri', 'Kimya deneyleri için malzemeler', 'LAB_KIMYA', id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories WHERE name = 'Laboratuvar Malzemeleri';

INSERT INTO categories (name, description, code, parent_id, created_at, updated_at, is_active)
SELECT 'Fizik Lab Malzemeleri', 'Fizik deneyleri için malzemeler', 'LAB_FIZIK', id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories WHERE name = 'Laboratuvar Malzemeleri';

-- Alt Kategoriler - Spor Ekipmanları
INSERT INTO categories (name, description, code, parent_id, created_at, updated_at, is_active)
SELECT 'Top Çeşitleri', 'Çeşitli spor dalları için toplar', 'SPOR_TOP', id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories WHERE name = 'Spor Ekipmanları';

INSERT INTO categories (name, description, code, parent_id, created_at, updated_at, is_active)
SELECT 'Jimnastik Malzemeleri', 'Jimnastik ve egzersiz malzemeleri', 'SPOR_JIM', id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories WHERE name = 'Spor Ekipmanları';

-- Alt Kategoriler - Mutfak ve Yemekhane
INSERT INTO categories (name, description, code, parent_id, created_at, updated_at, is_active)
SELECT 'Mutfak Ekipmanları', 'Yemek hazırlama ekipmanları', 'MUTFAK_EKIP', id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories WHERE name = 'Mutfak ve Yemekhane';

INSERT INTO categories (name, description, code, parent_id, created_at, updated_at, is_active)
SELECT 'Servis Malzemeleri', 'Yemek servis malzemeleri', 'MUTFAK_SERVIS', id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories WHERE name = 'Mutfak ve Yemekhane';

-- Alt Kategoriler - Güvenlik Ekipmanları
INSERT INTO categories (name, description, code, parent_id, created_at, updated_at, is_active)
SELECT 'Kamera Sistemleri', 'Güvenlik kamera sistemleri', 'GUVENLIK_KAMERA', id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories WHERE name = 'Güvenlik Ekipmanları';

INSERT INTO categories (name, description, code, parent_id, created_at, updated_at, is_active)
SELECT 'Yangın Güvenliği', 'Yangın güvenlik ekipmanları', 'GUVENLIK_YANGIN', id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories WHERE name = 'Güvenlik Ekipmanları';

-- Alt Kategoriler - Sağlık Malzemeleri
INSERT INTO categories (name, description, code, parent_id, created_at, updated_at, is_active)
SELECT 'İlk Yardım', 'İlk yardım malzemeleri', 'SAGLIK_ILK_YARDIM', id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories WHERE name = 'Sağlık Malzemeleri';

INSERT INTO categories (name, description, code, parent_id, created_at, updated_at, is_active)
SELECT 'Tıbbi Cihazlar', 'Temel tıbbi ölçüm cihazları', 'SAGLIK_CIHAZ', id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories WHERE name = 'Sağlık Malzemeleri';

-- Alt Kategoriler - Sanat Malzemeleri
INSERT INTO categories (name, description, code, parent_id, created_at, updated_at, is_active)
SELECT 'Resim Malzemeleri', 'Resim ve boyama malzemeleri', 'SANAT_RESIM', id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories WHERE name = 'Sanat Malzemeleri';

INSERT INTO categories (name, description, code, parent_id, created_at, updated_at, is_active)
SELECT 'Müzik Aletleri', 'Müzik dersi enstrümanları', 'SANAT_MUZIK', id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM categories WHERE name = 'Sanat Malzemeleri'; 