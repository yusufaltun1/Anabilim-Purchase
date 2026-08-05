# SchoolCreate — Mobil Analiz (Kaynak: purchase-fe)

## Özet
Yeni okul oluşturma formu. Okul adından otomatik kod üretimi, zorunlu iletişim/konum alanları ve client-side validasyon içerir.

## Route & Güvenlik
| Alan | Değer |
|------|-------|
| Route | `/schools/create` |
| Bileşen | `SchoolCreate` |
| Koruma | `PrivateRoute` |
| Başarı yönlendirme | `/schools` |
| İptal/Geri | `/schools` |

## Form alanları
| Alan | name | Tip | Zorunlu | Varsayılan | Not |
|------|------|-----|---------|------------|-----|
| Okul Adı | name | text | Evet | '' | Değişince code otomatik üretilir |
| Okul Kodu | code | text (uppercase) | Evet | '' | max ~20 char, `generateCode(name)` |
| Adres | address | textarea (3 satır) | Evet | '' | |
| Telefon | phone | tel | Evet | '' | |
| E-posta | email | email | Evet | '' | |
| Müdür Adı | principalName | text | Evet | '' | |
| Okul Türü | schoolType | select | Evet | ILKOKUL (PRIMARY_SCHOOL) | 8 seçenek, Türkçe label |
| Şehir | city | text | Evet | '' | |
| İlçe | district | text | Evet | '' | |
| Öğrenci Kapasitesi | studentCapacity | number min=1 | Evet | 100 | |
| isActive | — | — | — | true (state'te) | **UI'da gösterilmez**, API'ye gönderilir |

**generateCode:** Büyük harf, Türkçe karakter korunur, alfanumerik olmayan → `_`, tekrarlayan `_` birleştir, baş/son `_` sil, max 20 karakter.

## Butonlar
| Buton | Davranış |
|-------|----------|
| Geri | `/schools`, loading'de disabled |
| İptal | `/schools` |
| Kaydet | submit → create → success toast → `/schools` |
| Kaydediliyor... | loading spinner |

## API
| Metod | HTTP | Path | Body (`CreateSchoolRequest`) |
|-------|------|------|------------------------------|
| createSchool | POST | `/api/schools` | name, code, address, phone, email, principalName, district, city, schoolType, studentCapacity, isActive? |

## Validasyon (client)
| Kural | Mesaj |
|-------|-------|
| name boş | Okul adı zorunludur |
| code boş | Okul kodu zorunludur |
| address boş | Adres zorunludur |
| phone boş | Telefon zorunludur |
| email boş | E-posta zorunludur |
| principalName boş | Müdür adı zorunludur |
| city boş | Şehir zorunludur |
| district boş | İlçe zorunludur |
| studentCapacity <= 0 | Öğrenci kapasitesi 0'dan büyük olmalıdır |
| email regex | Geçerli bir e-posta adresi giriniz |
| phone regex `^[+]?[0-9\s-()]+$` | Geçerli bir telefon numarası giriniz |

Sunucu hatası: `err.response?.data?.message || error || message`

## Edge case'ler
1. Kod manuel düzenlenebilir; ad değişince kod yeniden üretilir (manuel düzenleme ezilir).
2. `isActive` formda görünmez; her zaman `true` gönderilir (CreateSchoolRequest default).
3. HTML `required` attribute tüm zorunlu alanlarda mevcut.
4. Loading sırasında form `opacity-50`.

## Mobil notlar
- 2 kolonlu grid → tek kolon stack
- Okul türü picker (wheel/bottom sheet)
- Telefon/e-posta için uygun klavye tipleri
- Kapasite numeric stepper
