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