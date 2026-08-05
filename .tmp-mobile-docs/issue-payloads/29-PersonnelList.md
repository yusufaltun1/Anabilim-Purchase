**Route:** `/personnel`
**Parent:** ZW-55
**Etiket:** MOBILE

**Özet**  
Okul personeli listesi; çoklu filtre ve sayfalama.

**Route & Security**  
- Route: `/personnel`  
- `PrivateRoute`

**Filtreler**  
| Filtre | API |
|--------|-----|
| searchQuery | searchPersonnel |
| selectedSchool | getPersonnelBySchool |
| selectedRole | getPersonnelByRole |
| selectedStatus | getPersonnelByStatus |
| selectedEmploymentType | getPersonnelByEmploymentType |

**Rol enum (PersonnelRole):** Müdür, Müdür Yardımcısı, Öğretmen, Rehber Öğretmen, Sekreter, Muhasebeci, Güvenlik, Temizlik, Teknik Personel, Hemşire, Kütüphaneci, BT Destek, Diğer

**Durum enum:** Aktif, Pasif, İzinli, Uzaklaştırılmış, Emekli

**İstihdam türü:** Kadrolu, Sözleşmeli, Vekil, Ücretli, Gönüllü

**Liste satır alanları**  
firstName lastName, role, employmentType, status rozeti, schoolName, email, phone, branchSubject

**Butonlar**  
Yeni Personel, Detay, Düzenle, Sil

**Edge case'ler**  
- **Düzenle** `/personnel/edit/:id`’ye gider ama `App.tsx`’te bu route tanımlı değil → 404/redirect  
- Rol/durum/istihdam filtresi sonrası client pagination

---

---

## Ek kaynak analizi (explore)

## PersonnelList

- **Route + security:** `/personnel` · `PrivateRoute`
- **Tip:** Liste + pagination
- **Satır:** ad soyad, role, employmentType, status badge, schoolName, email, phone, branchSubject
- **Filtreler:** Arama · Okul · Rol · Durum · İstihdam türü
- **Aksiyonlar:** Yeni · Detay · Düzenle · Sil
- **APIs:** `GET /api/school-personnel` · `/search` · `/school/{id}` · `/role/...` · `/status/...` · `/employment-type/...` · `DELETE` · schools/active
- **Edge kritik:** Düzenle → `/personnel/edit/:id` ama **App.tsx’te bu route yok** → catch-all ile `/` → login

---