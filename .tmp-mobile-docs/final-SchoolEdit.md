# SchoolEdit — Mobil Analiz (Kaynak: purchase-fe)

## Özet
Mevcut okul kaydını düzenleme formu. URL'deki `:id` ile okul yüklenir; Create ile aynı alanlar (isActive hariç, kod otomatik üretilmez).

## Route & Güvenlik
| Alan | Değer |
|------|-------|
| Route | `/schools/edit/:id` |
| Bileşen | `SchoolEdit` |
| Koruma | `PrivateRoute` |
| Param | `id` (number) |
| Başarı yönlendirme | `/schools/{id}` |
| Yükleme hatası | toast + `/schools` |

## Form alanları
Create ile aynı (SchoolCreate referans), **farklar:**
- Kod otomatik üretilmez; mevcut değer korunur
- `UpdateSchoolRequest` — **isActive alanı yok** (durum değiştirilemez)
- initialLoading spinner tam sayfa

| Alan | name | Zorunlu |
|------|------|---------|
| Okul Adı | name | Evet |
| Okul Kodu | code | Evet |
| Adres | address | Evet |
| Telefon | phone | Evet |
| E-posta | email | Evet |
| Müdür Adı | principalName | Evet |
| Okul Türü | schoolType | Evet |
| Şehir | city | Evet |
| İlçe | district | Evet |
| Öğrenci Kapasitesi | studentCapacity | Evet (min 1) |

## Butonlar
| Buton | Hedef |
|-------|-------|
| Geri | `/schools/{id}` |
| İptal | `/schools/{id}` |
| Güncelle | submit → update → `/schools/{id}` |
| Güncelleniyor... | loading |

## API
| Metod | HTTP | Path |
|-------|------|------|
| getSchoolById | GET | `/api/schools/{id}` |
| updateSchool | PUT | `/api/schools/{id}` |

Body: `UpdateSchoolRequest` (name, code, address, phone, email, principalName, district, city, schoolType, studentCapacity)

## Validasyon
SchoolCreate ile identik client-side kurallar.

## Edge case'ler
1. Geçersiz/id bulunamayan okul → hata toast + liste sayfasına redirect.
2. Aktif/pasif durumu bu ekrandan değiştirilemez.
3. Sunucu hata mesajı: `err.response?.data?.message` veya genel mesaj.

## Mobil notlar
Create ile aynı UX önerileri; başlık "Okul Düzenle".
