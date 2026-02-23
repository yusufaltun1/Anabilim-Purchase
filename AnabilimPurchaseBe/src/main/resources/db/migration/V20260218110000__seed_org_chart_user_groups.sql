-- Organizasyon şemasına göre kullanıcı grupları ve bağlantıları (Serkan Bey -> İdari Yönetim -> Satınalma vb.)
-- Pozisyonlar whiteboard'da açık ve dağınık yerleşim (yatay ~200–250px, dikey ~180px boşluk)

INSERT INTO user_groups (id, name, description, position_x, position_y, created_at, updated_at) VALUES
(1, 'SERKAN BEY', 'Üst yönetim', 500, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'İDARİ YÖNETİM MÜDÜR UĞUR BEY', 'İdari Yönetim Müdürü', 500, 180, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'SATINALMA', 'Satınalma birimi', 100, 360, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'İDARİ İŞLER MÜDÜR', 'İdari İşler Müdürü', 350, 360, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'HALKLA İLİŞKİLER MÜDÜR', 'Halkla İlişkiler Müdürü', 600, 360, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 'KURUMSAL İLETİŞİM MÜDÜR', 'Kurumsal İletişim Müdürü', 850, 360, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(7, 'BİLGİ İŞLEM MÜDÜR BURAK', 'Bilgi İşlem Müdürü', 1100, 360, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(8, 'İK MÜDÜRÜ', 'İnsan Kaynakları Müdürü', 50, 540, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(9, 'İK KID.UZMANI', 'İK Kıdemli Uzman', 0, 720, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(10, 'İK UZMN.YARD. DIMCISI', 'İK Uzman Yardımcısı', 100, 720, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(11, 'SPOR KLÜBÜ KOORDİNATÖRÜ', 'Spor Klübü Koordinatörü', 150, 540, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(12, 'İLETİŞİM SORUMLUSU', 'İletişim Sorumlusu', 200, 720, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(13, 'TENİS', 'Tenis', 80, 900, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(14, 'YÜZME', 'Yüzme', 200, 900, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(15, 'BASKETBOL', 'Basketbol', 320, 900, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(16, 'VOLEYBOL', 'Voleybol', 440, 900, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(17, 'JİMNASTİK', 'Jimnastik', 560, 900, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(18, 'MUHASABE MÜDÜRÜ', 'Muhasebe Müdürü', 250, 540, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(19, 'MUHASABE MÜDÜR YARD.', 'Muhasebe Müdür Yardımcısı', 350, 720, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(20, 'KIDEMLİ ÖĞRENCİ İŞL.UZM.', 'Kıdemli Öğrenci İşleri Uzmanı', 350, 900, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(21, 'ÖĞRENCİ İŞLER UZM.', 'Öğrenci İşleri Uzmanı', 350, 1080, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(22, 'SATINALMA MÜDÜR YARD.', 'Satınalma Müdür Yardımcısı', 350, 540, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(23, 'SATINALMA UZM.YARD.', 'Satınalma Uzman Yardımcısı', 450, 720, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(24, 'DEPO SORUMLUSU', 'Depo Sorumlusu', 550, 720, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(25, 'İDARİ İŞLER MÜDÜR YARD.', 'İdari İşler Müdür Yardımcısı', 450, 540, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(26, 'İDARİ İŞLER UZM.', 'İdari İşler Uzmanı', 500, 540, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(27, 'TEKNİK MÜDÜR YARD.', 'Teknik Müdür Yardımcısı', 550, 540, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(28, 'HALKLA İLİŞKİLER MÜDÜR YARD.', 'Halkla İlişkiler Müdür Yardımcısı', 600, 540, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(29, 'HALKLA İLİŞKİLER UZM.', 'Halkla İlişkiler Uzmanı', 600, 720, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(30, 'İLETİŞİM SORUMLULARI', 'İletişim Sorumluları', 600, 900, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(31, 'GRAFİKER', 'Grafiker', 850, 540, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(32, 'SOSYAL MEDYA UZM.', 'Sosyal Medya Uzmanı', 850, 720, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(33, 'BİLGİ İŞLEM MÜDÜR YARD. YUNUS', 'Bilgi İşlem Müdür Yardımcısı', 1100, 540, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(34, 'BİLGİ İŞLEM UZM. ENES', 'Bilgi İşlem Uzmanı', 1050, 720, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(35, 'BİLGİ İŞLEM UZM.YARD.', 'Bilgi İşlem Uzman Yardımcısı', 1150, 720, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Serkan Bey -> İdari Yönetim Müdür
INSERT INTO user_group_links (source_group_id, target_group_id, created_at) VALUES (1, 2, CURRENT_TIMESTAMP);

-- İdari Yönetim Müdür -> Ana birimler
INSERT INTO user_group_links (source_group_id, target_group_id, created_at) VALUES
(2, 3, CURRENT_TIMESTAMP), (2, 4, CURRENT_TIMESTAMP), (2, 5, CURRENT_TIMESTAMP), (2, 6, CURRENT_TIMESTAMP), (2, 7, CURRENT_TIMESTAMP);

-- SATINALMA altı
INSERT INTO user_group_links (source_group_id, target_group_id, created_at) VALUES
(3, 8, CURRENT_TIMESTAMP), (3, 11, CURRENT_TIMESTAMP), (3, 18, CURRENT_TIMESTAMP), (3, 22, CURRENT_TIMESTAMP);
-- İK MÜDÜRÜ altı
INSERT INTO user_group_links (source_group_id, target_group_id, created_at) VALUES
(8, 9, CURRENT_TIMESTAMP), (8, 10, CURRENT_TIMESTAMP);
-- SPOR KLÜBÜ KOORDİNATÖRÜ altı
INSERT INTO user_group_links (source_group_id, target_group_id, created_at) VALUES
(11, 12, CURRENT_TIMESTAMP),
(12, 13, CURRENT_TIMESTAMP), (12, 14, CURRENT_TIMESTAMP), (12, 15, CURRENT_TIMESTAMP), (12, 16, CURRENT_TIMESTAMP), (12, 17, CURRENT_TIMESTAMP);
-- MUHASABE altı
INSERT INTO user_group_links (source_group_id, target_group_id, created_at) VALUES
(18, 19, CURRENT_TIMESTAMP), (19, 20, CURRENT_TIMESTAMP), (20, 21, CURRENT_TIMESTAMP);
-- SATINALMA MÜDÜR YARD. altı
INSERT INTO user_group_links (source_group_id, target_group_id, created_at) VALUES
(22, 23, CURRENT_TIMESTAMP), (22, 24, CURRENT_TIMESTAMP);

-- İDARİ İŞLER MÜDÜR altı
INSERT INTO user_group_links (source_group_id, target_group_id, created_at) VALUES
(4, 25, CURRENT_TIMESTAMP), (4, 26, CURRENT_TIMESTAMP), (4, 27, CURRENT_TIMESTAMP);

-- HALKLA İLİŞKİLER MÜDÜR altı
INSERT INTO user_group_links (source_group_id, target_group_id, created_at) VALUES
(5, 28, CURRENT_TIMESTAMP), (28, 29, CURRENT_TIMESTAMP), (29, 30, CURRENT_TIMESTAMP);

-- KURUMSAL İLETİŞİM MÜDÜR altı
INSERT INTO user_group_links (source_group_id, target_group_id, created_at) VALUES
(6, 31, CURRENT_TIMESTAMP), (31, 32, CURRENT_TIMESTAMP);

-- BİLGİ İŞLEM MÜDÜR BURAK altı
INSERT INTO user_group_links (source_group_id, target_group_id, created_at) VALUES
(7, 33, CURRENT_TIMESTAMP), (33, 34, CURRENT_TIMESTAMP), (33, 35, CURRENT_TIMESTAMP);

-- Sıra (sequence) bir sonraki ID için güncellenir
SELECT setval('user_groups_id_seq', (SELECT COALESCE(MAX(id), 1) FROM user_groups));
SELECT setval('user_group_links_id_seq', (SELECT COALESCE(MAX(id), 1) FROM user_group_links));
