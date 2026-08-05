# PersonnelCreate — Mobil Analiz (Kaynak: purchase-fe)

## Özet
Yeni okul personeli kaydı. Aktif okullardan seçim, TC/email/telefon validasyonu, opsiyonel maaş ve branş alanları.

## Route & Güvenlik
| Route | `/personnel/create` |
| Koruma | `PrivateRoute` |
| Başarı | `/personnel` |

## Form alanları
| Alan | name | Tip | Zorunlu | Varsayılan |
|------|------|-----|---------|------------|
| Okul | schoolId | select | Evet | İlk aktif okul id (yoksa 0) |
| Ad | firstName | text | Evet | '' |
| Soyad | lastName | text | Evet | '' |
| TC Kimlik No | tcNo | text maxLength=11 | Evet | '' |
| E-posta | email | email | Evet | '' |
| Telefon | phone | tel | Evet | '' |
| Görev | role | select | Evet | TEACHER (Öğretmen) |
| İstihdam Türü | employmentType | select | Evet | PERMANENT (Kadrolu) |
| Durum | status | select | Evet | ACTIVE (Aktif) |
| İşe Başlama | startDate | date | Evet | bugün (ISO date) |
| İşten Ayrılma | endDate | date | Hayır | '' |
| Maaş (TL) | salary | number min=0 step=0.01 | Hayır | 0 |
| Departman | department | text | Hayır | '' |
| Branş | branchSubject | text | Hayır | '' |
| Adres | address | textarea | Evet | '' |
| Nitelikler | qualifications | textarea | Hayır | '' |
| Notlar | notes | textarea | Hayır | '' |

**Submit temizliği:** Boş opsiyonel alanlar `undefined` yapılır (endDate, salary, department, branchSubject, qualifications, notes).

## Butonlar
Geri, İptal → `/personnel`; Kaydet → create → success → `/personnel`

## API
| Metod | HTTP | Path |
|-------|------|------|
| getActiveSchools | GET | `/api/schools/active` |
| createPersonnel | POST | `/api/school-personnel` |

Body: `CreatePersonnelRequest` (tüm form alanları)

## Validasyon
| Kural | Mesaj |
|-------|-------|
| !schoolId | Okul seçimi zorunludur |
| firstName/lastName boş | Ad/Soyad zorunludur |
| tcNo boş | TC Kimlik No zorunludur |
| tcNo !/^\d{11}$/ | TC Kimlik No 11 haneli olmalıdır |
| email boş/regex | E-posta zorunlu / geçerli |
| phone boş/regex | Telefon zorunlu / geçerli |
| address boş | Adres zorunludur |
| !startDate | İşe başlama tarihi zorunludur |

## Edge case'ler
1. Aktif okul yoksa schoolId=0 kalır → submit'te hata.
2. Okul listesi yüklenemezse toast, form yine render.
3. salary=0 submit'te undefined olur.
4. PersonnelRole/Status/EmploymentType enum değerleri Türkçe string olarak API'ye gider.

## Mobil notlar
- Okul picker (searchable)
- TC: numeric keyboard, 11 digit mask
- Tarih: native date picker
- Branş alanı öğretmen rolünde koşullu gösterim önerilir
