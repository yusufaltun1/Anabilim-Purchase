-- Tedarikçi INSERT sorguları
-- CSV verilerinden oluşturulmuştur
-- Tax number zorunlu olduğu için geçici değerler kullanılmıştır (daha sonra güncellenmelidir)

-- SÜTAŞ
INSERT INTO suppliers (company_name, tax_number, email, contact_person, contact_phone, contact_email, is_active, is_preferred, created_at, updated_at)
VALUES ('SÜTAŞ SÜT ÜRÜNLERİ A.Ş.', 'TEMP-SUTAS-001', 'yuaydin@sutas.com.tr', 'YÜCEL AYDIN', '0530 780 99 52', 'yuaydin@sutas.com.tr', true, false, NOW(), NOW());

-- İÇİM
INSERT INTO suppliers (company_name, tax_number, email, contact_person, contact_phone, contact_email, is_active, is_preferred, created_at, updated_at)
VALUES ('SEHER GIDA PAZ.SAN VE TİC A.Ş', 'TEMP-ICIM-002', 'ilyas.bektas@tr.lactalis.com', 'İLYAS BEKTAŞ', '0549 725 59 70', 'ilyas.bektas@tr.lactalis.com', true, false, NOW(), NOW());

-- PINAR
INSERT INTO suppliers (company_name, tax_number, email, contact_person, contact_phone, contact_email, is_active, is_preferred, created_at, updated_at)
VALUES ('YAŞAR BİRLEŞİK PAZ.DAĞ.TURZ. VE TİC. A.Ş', 'TEMP-PINAR-003', 'yasin.guner@ybp.com.tr', 'YASİN GÜNER', '0531 888 59 90', 'yasin.guner@ybp.com.tr', true, false, NOW(), NOW());

-- KOMAGENE
INSERT INTO suppliers (company_name, tax_number, email, contact_person, contact_phone, contact_email, is_active, is_preferred, created_at, updated_at)
VALUES ('YÖRPAŞ YÖRESEL YİYECEKLER PAZ.A.Ş', 'TEMP-KOMAGENE-004', 'satis@komagene.com.tr', 'VOLKAN BEY', '0541 357 30 61', 'satis@komagene.com.tr', true, false, NOW(), NOW());

-- BEREKET
INSERT INTO suppliers (company_name, tax_number, email, contact_person, contact_phone, contact_email, is_active, is_preferred, created_at, updated_at)
VALUES ('BEREKET DÖNER SANAYİ VE TİC. A.Ş', 'TEMP-BEREKET-005', 'mustafa.karadag@bereketdoner.com.tr', 'MUSTAFA KARADAĞ', '0541 734 73 41', 'mustafa.karadag@bereketdoner.com.tr', true, false, NOW(), NOW());

-- SER-KAR
INSERT INTO suppliers (company_name, tax_number, email, contact_person, contact_phone, contact_email, is_active, is_preferred, created_at, updated_at)
VALUES ('SERKAR PAZ.LOJ.DEPOLAMA SAN VE TİC LTD ŞTİ.', 'TEMP-SERKAR-006', '', 'MUHAMMET BEY', '0506 337 37 52', NULL, true, false, NOW(), NOW());

-- IŞIK GIDA
INSERT INTO suppliers (company_name, tax_number, email, contact_person, contact_phone, contact_email, is_active, is_preferred, created_at, updated_at)
VALUES ('IŞIK GIDA İTH.MAD.ÜRETİM VE PAZ. LTD.ŞTİ', 'TEMP-ISIK-007', 'siparis@isikgida.com.tr', 'OKAN BEY', '0533 761 55 73', 'siparis@isikgida.com.tr', true, false, NOW(), NOW());

-- ANKA FRESH
INSERT INTO suppliers (company_name, tax_number, email, contact_person, contact_phone, contact_email, is_active, is_preferred, created_at, updated_at)
VALUES ('ANKA FRESH GIDA PAZ. LOJİSTİK SAN TİC A.Ş', 'TEMP-ANKA-008', 'siparis@ankafresh.com', 'HALİS YENER', '0555 827 33 35', 'siparis@ankafresh.com', true, false, NOW(), NOW());

-- STOK (ÜMRANİYE KAMPÜS)
INSERT INTO suppliers (company_name, tax_number, email, contact_person, contact_phone, contact_email, address, is_active, is_preferred, created_at, updated_at)
VALUES ('ÜMRANİYE KAMPÜS', 'TEMP-STOK-009', '', 'DEPO 1624 - 1630', NULL, NULL, 'ÜMRANİYE KAMPÜS', true, false, NOW(), NOW());

-- İKBAL
INSERT INTO suppliers (company_name, tax_number, email, contact_person, contact_phone, contact_email, is_active, is_preferred, created_at, updated_at)
VALUES ('İKBAL YUFKA', 'TEMP-IKBAL-010', '', 'NURİ BEY', '0555 242 03 99', NULL, true, false, NOW(), NOW());

-- SANPANİNO
INSERT INTO suppliers (company_name, tax_number, email, contact_person, contact_phone, contact_email, is_active, is_preferred, created_at, updated_at)
VALUES ('ENFA GIDA PAZARLAMA SAN VE TİC LTD ŞTİ.', 'TEMP-SANPANINO-011', '', 'METİN BARÇIN', '0530 384 71 85', NULL, true, false, NOW(), NOW());

-- DARDANEL
INSERT INTO suppliers (company_name, tax_number, email, contact_person, contact_phone, contact_email, is_active, is_preferred, created_at, updated_at)
VALUES ('DARDANEL DAĞITIM A.Ş', 'TEMP-DARDANEL-012', '', 'FEYYAZ VEZİR', '0539 570 98 58', NULL, true, false, NOW(), NOW());

-- DENEBİ
INSERT INTO suppliers (company_name, tax_number, email, contact_person, contact_phone, contact_email, is_active, is_preferred, created_at, updated_at)
VALUES ('DNB KURUYEMİŞ GIDA SAN VE TİC LTD ŞTİ', 'TEMP-DENEBİ-013', '', 'DURSUN BEY', '0530 469 24 49', NULL, true, false, NOW(), NOW());

-- BSY
INSERT INTO suppliers (company_name, tax_number, email, contact_person, contact_phone, contact_email, is_active, is_preferred, created_at, updated_at)
VALUES ('BSY KURUMSAL TEDARİK HİZM. A.Ş', 'TEMP-BSY-014', 'merve@bizsizeyeteriz.com', 'MERVE YAVAŞ', '0545 579 17 97', 'merve@bizsizeyeteriz.com', true, false, NOW(), NOW());

-- KUPA GIDA
INSERT INTO suppliers (company_name, tax_number, email, contact_person, contact_phone, contact_email, is_active, is_preferred, created_at, updated_at)
VALUES ('KUPA ENDÜSTRİYEL GIDA ÜRÜNLERİ SAN VE TİC A.Ş', 'TEMP-KUPA-015', 'burcu.kolay@kupagida.com', 'BURCU KOLAY', '0539 723 90 97', 'burcu.kolay@kupagida.com', true, false, NOW(), NOW());

-- EXOTIC
INSERT INTO suppliers (company_name, tax_number, email, contact_person, contact_phone, contact_email, is_active, is_preferred, created_at, updated_at)
VALUES ('ÖZKAN HAZIR GIDA LOJ.SAN VE TİC LTD ŞTİ', 'TEMP-EXOTIC-016', '', 'KÜBRA HANIM', '0533 281 54 46', NULL, true, false, NOW(), NOW());

-- ÇAYIROVA
INSERT INTO suppliers (company_name, tax_number, email, contact_person, contact_phone, contact_email, is_active, is_preferred, created_at, updated_at)
VALUES ('YOPA GIDA PAZARLAMA VE TİC LTD ŞTİ', 'TEMP-CAYIROVA-017', '', 'AHMET BEY', '0530 236 24 28', NULL, true, false, NOW(), NOW());

-- İLKİM
INSERT INTO suppliers (company_name, tax_number, email, contact_person, contact_phone, contact_email, is_active, is_preferred, created_at, updated_at)
VALUES ('İLKİM PLASTİK SERKAN ERŞEN', 'TEMP-ILKIM-018', '', 'DENİZ BEY', '0542 312 56 02', NULL, true, false, NOW(), NOW());

-- DİLEK GIDA
INSERT INTO suppliers (company_name, tax_number, email, contact_person, contact_phone, contact_email, is_active, is_preferred, created_at, updated_at)
VALUES ('DİLEK GIDA DAĞITIM LOJ. HİZM. TİC. A.Ş', 'TEMP-DILEK-019', '', 'ÖMER İLTÜZER', '0530 829 91 64', NULL, true, false, NOW(), NOW());

-- ZÜBER
INSERT INTO suppliers (company_name, tax_number, email, contact_person, contact_phone, contact_email, is_active, is_preferred, created_at, updated_at)
VALUES ('HEDEF GRUP SATIŞ DAĞITIM SAN VE TİC. A.Ş', 'TEMP-ZUBER-020', '', 'EZGİ HANIM', '0533 207 23 75', NULL, true, false, NOW(), NOW());

-- TANDIR
INSERT INTO suppliers (company_name, tax_number, email, contact_person, contact_phone, contact_email, is_active, is_preferred, created_at, updated_at)
VALUES ('ÇAMLIK EKMEK VE GIDA SAN TİC LTD ŞTİ', 'TEMP-TANDIR-021', '', 'SERKAN BEY', '0532 473 74 19', NULL, true, false, NOW(), NOW());
