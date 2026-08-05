# SchoolList — Mobil Analiz (Kaynak: purchase-fe)

## Özet
Okul listesi sayfası; arama, şehir/ilçe/tür filtreleri, sunucu tarafı sayfalama ve CRUD kısayolları sunar. Liste kart satırlarında okul adı, kod, tür, aktiflik, konum, müdür ve kapasite gösterilir.

## Route & Güvenlik
| Alan | Değer |
|------|-------|
| Route | `/schools` |
| Bileşen | `SchoolList` (`src/pages/SchoolList.tsx`) |
| Koruma | `PrivateRoute` — giriş yapmış kullanıcı gerekir |
| Capability | Yok (ek yetki kontrolü yok) |
| Navigasyon hedefleri | `/schools/create`, `/schools/:id`, `/schools/edit/:id` |

## Filtreler
| Filtre | UI elemanı | Davranış | API |
|--------|-----------|----------|-----|
| Metin arama | `searchQuery` + **Ara** butonu / Enter | Sayfa 0'a reset, `loadSchools()` | `searchSchools` veya `getAllSchools` |
| Şehir | `<select>` Tüm Şehirler | Client-side tam liste, pagination=1 sayfa | `GET /api/schools/city/{city}` |
| İlçe | `<select>` Tüm İlçeler | Aynı | `GET /api/schools/district/{district}` |
| Okul türü | `<select>` Tüm Türler | Aynı | `GET /api/schools/type/{schoolType}` |
| Filtreleri Temizle | Link (aktif filtre varsa) | Tüm filtre state sıfır + `loadSchools()` | — |

**Şehir/ilçe dropdown kaynağı:** `getActiveSchools()` — mount'ta bir kez yüklenir.

**Okul türü enum (`SchoolType`):** ILKOKUL→PRIMARY_SCHOOL, ORTAOKUL→MIDDLE_SCHOOL, LISE→HIGH_SCHOOL, ANAOKULU→KINDERGARTEN, UNIVERSITE→UNIVERSITY, MESLEK_LISESI→VOCATIONAL_HIGH_SCHOOL, ANADOLU_LISESI→ANATOLIAN_HIGH_SCHOOL, FEN_LISESI→SCIENCE_HIGH_SCHOOL

## Liste satır alanları
| Alan | Kaynak | Görünüm |
|------|--------|---------|
| name | `school.name` | Başlık (indigo) |
| code | `school.code` | Alt satır |
| schoolType | `school.schoolType` | Ham enum/string |
| isActive | `school.isActive` | Rozet: Aktif (yeşil) / Pasif (kırmızı) |
| city, district | `school.city`, `school.district` | 📍 |
| principalName | `school.principalName` | 👨‍💼 |
| studentCapacity | `school.studentCapacity` | 👥 Kapasite |

## Butonlar & Aksiyonlar
| Buton | Aksiyon |
|-------|---------|
| Yeni Okul | `navigate('/schools/create')` |
| Detay | `navigate('/schools/${id}')` |
| Düzenle | `navigate('/schools/edit/${id}')` |
| Sil | `window.confirm` → `deleteSchool(id)` → bildirim + liste yenile |

## Sayfalama
- Varsayılan: `size=10`, `sort=name,asc`
- Sayfa değişimi: `pagination.number` state → `useEffect` ile `loadSchools`
- UI: mobil Önceki/Sonraki; masaüstü max 5 sayfa butonu + aralık metni
- **Şehir/ilçe/tür filtresi sonrası:** `totalPages=1`, client-side liste (sunucu sayfalama devre dışı)

## API'ler (`school.service.ts`)
| Metod | HTTP | Path | Query/Body |
|-------|------|------|------------|
| getAllSchools | GET | `/api/schools` | page, size, sort |
| searchSchools | GET | `/api/schools/search` | query, page, size |
| getSchoolsByCity | GET | `/api/schools/city/{city}` | — |
| getSchoolsByDistrict | GET | `/api/schools/district/{district}` | — |
| getSchoolsByType | GET | `/api/schools/type/{schoolType}` | — |
| deleteSchool | DELETE | `/api/schools/{id}` | — |
| getActiveSchools | GET | `/api/schools/active` | Filtre dropdown |

Auth: `axiosInstance` (Bearer token).

## Validasyon
Sayfa düzeyinde form validasyonu yok; silme için native `confirm` dialog.

## Edge case'ler
1. **Filtre birleşimi:** Arama aktifken şehir/ilçe/tür ayrı endpoint çağırır; birbirini sıfırlamaz — kombine filtre yok.
2. **Client-side filtre pagination:** Şehir/ilçe/tür sonrası sayfalama tek sayfa; büyük sonuç setlerinde performans riski.
3. **clearFilters:** Arama + dropdown filtreleri sıfırlar ama önceki client-side filtre state'i tam temizlenmeden `getAllSchools` çağrılır.
4. **SchoolType gösterimi:** Listede ham API değeri (PRIMARY_SCHOOL vb.) gösterilir; Detail sayfasında Türkçe map var, listede yok.
5. **Hata:** Yükleme/silme hataları `showNotification` ile toast; liste boş kalabilir.

## Mobil uygulama notları
- Filtre paneli 5 kolonlu grid → mobilde dikey stack
- Kart listesi + swipe-to-action veya FAB ile Yeni Okul önerilir
- Silme onayı native Alert
- Sayfalama: infinite scroll veya cursor-based API tercih edilebilir
