# SchoolDetail — Mobil Analiz (Kaynak: purchase-fe)

## Özet
Tek okulun salt okunur detay görünümü; bilgi tablosu, durum rozeti ve hızlı işlemler (düzenle, ara, e-posta).

## Route & Güvenlik
| Alan | Değer |
|------|-------|
| Route | `/schools/:id` |
| Bileşen | `SchoolDetail` |
| Koruma | `PrivateRoute` |

## Detay alanları (dl grid)
| Etiket | Alan | Format |
|--------|------|--------|
| Okul Adı | name | düz metin |
| Okul Kodu | code | |
| Okul Türü | schoolType | Türkçe map (PRIMARY_SCHOOL→İlkokul vb.) |
| Müdür | principalName | |
| Şehir | city | |
| İlçe | district | |
| Adres | address | |
| Telefon | phone | `tel:` link |
| E-posta | email | `mailto:` link |
| Öğrenci Kapasitesi | studentCapacity | `toLocaleString('tr-TR')` + " öğrenci" |
| Durum | isActive | Aktif/Pasif rozeti |
| Oluşturulma Tarihi | createdAt | tr-TR long date (varsa) |
| Son Güncelleme | updatedAt | tr-TR long date (varsa) |

## Butonlar
| Konum | Buton | Aksiyon |
|-------|-------|---------|
| Header | Geri | `/schools` |
| Header | Düzenle | `/schools/edit/{id}` |
| Header | Sil | confirm → deleteSchool → `/schools` |
| Hızlı İşlemler | Okul Bilgilerini Düzenle | `/schools/edit/{id}` |
| Hızlı İşlemler | Okulu Ara | `window.open(tel:...)` |
| Hızlı İşlemler | E-posta Gönder | `window.open(mailto:...)` |

## API
| Metod | HTTP | Path |
|-------|------|------|
| getSchoolById | GET | `/api/schools/{id}` |
| deleteSchool | DELETE | `/api/schools/{id}` |

## Validasyon
Yok (salt okunur + silme confirm).

## Edge case'ler
1. Yükleme hatası → toast + `/schools` redirect.
2. `school === null` → "Okul bulunamadı" mesajı.
3. Okul türü map: Detail'de İngilizce enum → Türkçe; List'te ham değer — tutarsızlık.
4. createdAt/updatedAt opsiyonel render.

## Mobil notlar
- Definition list → section cards
- Telefon/e-posta için native Linking API
- Silme ActionSheet + confirm
- Hızlı işlemler 3'lü grid → yatay scroll veya liste
