# PersonnelList — Mobil Analiz (Kaynak: purchase-fe)

## Özet
Okul personeli listesi; metin arama, okul/rol/durum/istihdam türü filtreleri, sayfalama ve CRUD kısayolları.

## Route & Güvenlik
| Route | `/personnel` |
| Koruma | `PrivateRoute` |
| Capability | Yok |

## Filtreler
| Filtre | UI | Davranış | API |
|--------|-----|----------|-----|
| Metin arama | input + Ara / Enter | page=0, loadPersonnel | `searchPersonnel` veya diğer |
| Okul | select (aktif okullar) | **Sadece state günceller, loadPersonnel çağrılmaz** | `getPersonnelBySchool` (loadPersonnel içinde selectedSchool varsa) |
| Rol | select | Client-side tam liste, totalPages=1 | `GET /api/school-personnel/role/{role}` |
| Durum | select | Aynı | `GET /api/school-personnel/status/{status}` |
| İstihdam türü | select | Aynı | `GET /api/school-personnel/employment-type/{type}` |
| Filtreleri Temizle | link | Tüm filtre sıfır + loadPersonnel | — |

**Okul dropdown:** `schoolService.getActiveSchools()` — `{id, name}`

**loadPersonnel öncelik:**
1. searchQuery dolu → `searchPersonnel`
2. selectedSchool dolu → `getPersonnelBySchool(schoolId, params)`
3. aksi → `getAllPersonnel`

## Liste satır alanları
| Alan | Görünüm |
|------|---------|
| firstName + lastName | Başlık |
| role • employmentType | Alt satır |
| status | Renkli rozet (`getStatusBadgeColor`) |
| schoolName | 🏫 (yoksa "Okul bilgisi yok") |
| email | 📧 |
| phone | 📞 |
| branchSubject | 📚 (varsa) |

## Durum rozet renkleri
| Status | Renk |
|--------|------|
| Aktif | yeşil |
| Pasif | gri |
| İzinli | sarı |
| Uzaklaştırılmış | kırmızı |
| Emekli | mavi |

## Butonlar
| Buton | Aksiyon |
|-------|---------|
| Yeni Personel | `/personnel/create` |
| Detay | `/personnel/{id}` |
| Düzenle | `/personnel/edit/{id}` — **Route App.tsx'te tanımlı DEĞİL** |
| Sil | confirm → deletePersonnel |

## Sayfalama
- size=10, sort=firstName,asc
- Rol/durum/istihdam filtresi → client-side, totalPages=1

## API (`school-personnel.service.ts`)
| Metod | Path |
|-------|------|
| getAllPersonnel | GET `/api/school-personnel?page&size&sort` |
| searchPersonnel | GET `/api/school-personnel/search?query&page&size` |
| getPersonnelBySchool | GET `/api/school-personnel/school/{schoolId}?page&size&sort` |
| getPersonnelByRole | GET `/api/school-personnel/role/{role}` |
| getPersonnelByStatus | GET `/api/school-personnel/status/{status}` |
| getPersonnelByEmploymentType | GET `/api/school-personnel/employment-type/{type}` |
| deletePersonnel | DELETE `/api/school-personnel/{id}` |

## Enum değerleri
**PersonnelRole:** Müdür, Müdür Yardımcısı, Öğretmen, Rehber Öğretmen, Sekreter, Muhasebeci, Güvenlik, Temizlik, Teknik Personel, Hemşire, Kütüphaneci, BT Destek, Diğer

**PersonnelStatus:** Aktif, Pasif, İzinli, Uzaklaştırılmış, Emekli

**EmploymentType:** Kadrolu, Sözleşmeli, Vekil, Ücretli, Gönüllü

## Edge case'ler
1. **Okul filtresi bug:** `handleFilterBySchool` loadPersonnel çağırmıyor; sayfa yenilenene kadar filtre uygulanmaz.
2. **Düzenle route eksik:** `/personnel/edit/:id` App.tsx'te yok → 404/redirect.
3. Rol/durum/istihdam filtreleri arama/okul filtresi ile birleşmez.
4. Filtreler birbirini sıfırlamaz.

## Mobil notlar
- 6 kolonlu filtre grid → accordion filtre paneli
- TC gibi hassas alan listede gösterilmez
- Swipe actions: Detay, Sil
