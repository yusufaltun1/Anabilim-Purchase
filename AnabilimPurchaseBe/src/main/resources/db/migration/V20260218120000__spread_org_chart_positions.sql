-- Whiteboard'ta grupların daha açık ve dağınık görünmesi için pozisyonları güncelle
-- Yatay ~250px, dikey ~180px boşluk

UPDATE user_groups SET position_x = 500,  position_y = 0     WHERE id = 1;   -- SERKAN BEY
UPDATE user_groups SET position_x = 500,  position_y = 180  WHERE id = 2;   -- İDARİ YÖNETİM MÜDÜR UĞUR BEY

-- Ana birimler (2. satır)
UPDATE user_groups SET position_x = 100,  position_y = 360  WHERE id = 3;   -- SATINALMA
UPDATE user_groups SET position_x = 350,  position_y = 360  WHERE id = 4;   -- İDARİ İŞLER MÜDÜR
UPDATE user_groups SET position_x = 600,  position_y = 360  WHERE id = 5;   -- HALKLA İLİŞKİLER MÜDÜR
UPDATE user_groups SET position_x = 850,  position_y = 360  WHERE id = 6;   -- KURUMSAL İLETİŞİM MÜDÜR
UPDATE user_groups SET position_x = 1100, position_y = 360  WHERE id = 7;   -- BİLGİ İŞLEM MÜDÜR BURAK

-- SATINALMA altı (3. satır)
UPDATE user_groups SET position_x = 50,   position_y = 540  WHERE id = 8;   -- İK MÜDÜRÜ
UPDATE user_groups SET position_x = 150, position_y = 540  WHERE id = 11;  -- SPOR KLÜBÜ KOORDİNATÖRÜ
UPDATE user_groups SET position_x = 250, position_y = 540  WHERE id = 18;  -- MUHASABE MÜDÜRÜ
UPDATE user_groups SET position_x = 350, position_y = 540  WHERE id = 22;  -- SATINALMA MÜDÜR YARD.

-- İDARİ İŞLER altı (3. satır, kendi kolonu)
UPDATE user_groups SET position_x = 450, position_y = 540  WHERE id = 25;  -- İDARİ İŞLER MÜDÜR YARD.
UPDATE user_groups SET position_x = 500, position_y = 540  WHERE id = 26;  -- İDARİ İŞLER UZM.
UPDATE user_groups SET position_x = 550, position_y = 540  WHERE id = 27;  -- TEKNİK MÜDÜR YARD.

-- HALKLA İLİŞKİLER altı
UPDATE user_groups SET position_x = 600,  position_y = 540  WHERE id = 28;  -- HALKLA İLİŞKİLER MÜDÜR YARD.

-- KURUMSAL İLETİŞİM altı
UPDATE user_groups SET position_x = 850,  position_y = 540  WHERE id = 31;  -- GRAFİKER

-- BİLGİ İŞLEM altı
UPDATE user_groups SET position_x = 1100, position_y = 540  WHERE id = 33;  -- BİLGİ İŞLEM MÜDÜR YARD. YUNUS

-- 4. satır
UPDATE user_groups SET position_x = 0,    position_y = 720  WHERE id = 9;   -- İK KID.UZMANI
UPDATE user_groups SET position_x = 100,  position_y = 720  WHERE id = 10;  -- İK UZMN.YARD. DIMCISI
UPDATE user_groups SET position_x = 200,  position_y = 720  WHERE id = 12;  -- İLETİŞİM SORUMLUSU
UPDATE user_groups SET position_x = 350,  position_y = 720  WHERE id = 19;  -- MUHASABE MÜDÜR YARD.
UPDATE user_groups SET position_x = 450,  position_y = 720  WHERE id = 23;  -- SATINALMA UZM.YARD.
UPDATE user_groups SET position_x = 550,  position_y = 720  WHERE id = 24;  -- DEPO SORUMLUSU
UPDATE user_groups SET position_x = 600,  position_y = 720  WHERE id = 29;  -- HALKLA İLİŞKİLER UZM.
UPDATE user_groups SET position_x = 850,  position_y = 720  WHERE id = 32;  -- SOSYAL MEDYA UZM.
UPDATE user_groups SET position_x = 1050, position_y = 720  WHERE id = 34;  -- BİLGİ İŞLEM UZM. ENES
UPDATE user_groups SET position_x = 1150, position_y = 720  WHERE id = 35;  -- BİLGİ İŞLEM UZM.YARD.

-- 5. satır (spor dalları, öğrenci işleri vb.)
UPDATE user_groups SET position_x = 80,   position_y = 900  WHERE id = 13;  -- TENİS
UPDATE user_groups SET position_x = 200,  position_y = 900  WHERE id = 14;  -- YÜZME
UPDATE user_groups SET position_x = 320,  position_y = 900  WHERE id = 15;  -- BASKETBOL
UPDATE user_groups SET position_x = 440,  position_y = 900  WHERE id = 16;  -- VOLEYBOL
UPDATE user_groups SET position_x = 560,  position_y = 900  WHERE id = 17;  -- JİMNASTİK
UPDATE user_groups SET position_x = 350,  position_y = 900  WHERE id = 20;  -- KIDEMLİ ÖĞRENCİ İŞL.UZM.
UPDATE user_groups SET position_x = 600,  position_y = 900  WHERE id = 30;  -- İLETİŞİM SORUMLULARI

-- 6. satır
UPDATE user_groups SET position_x = 350,  position_y = 1080 WHERE id = 21;  -- ÖĞRENCİ İŞLER UZM.
