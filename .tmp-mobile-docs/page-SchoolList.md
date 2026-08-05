**Özet**  
Okul listesi; arama, şehir/ilçe/tür filtreleri, sayfalama, CRUD kısayolları.

**Route & Security**  
- Route: `/schools`  
- `PrivateRoute`

**Filtreler**  
| Filtre | Davranış |
|--------|----------|
| searchQuery + Ara | `searchSchools` veya Enter |
| selectedCity | `getSchoolsByCity` (client-side liste, pagination reset) |
| selectedDistrict | `getSchoolsByDistrict` |
| selectedSchoolType | `getSchoolsByType` (ILKOKUL, ORTAOKUL, LISE, ANAOKULU, UNIVERSITE, MESLEK_LISESI, ANADOLU_LISESI, FEN_LISESI) |
| Filtreleri Temizle | tüm filtre sıfır + reload |

**Liste satır alanları**  
name, code, schoolType, isActive rozeti, city/district, principalName, studentCapacity

**Butonlar**  
Yeni Okul, Detay, Düzenle, Sil (confirm)

**Sayfalama**  
size=10, sayfa navigasyonu (max 5 sayfa butonu)

**API'ler**  
- `getAllSchools`, `searchSchools`, `getSchoolsByCity/District/Type`, `deleteSchool`  
- `getActiveSchools` (filtre dropdown kaynağı)

**Edge case'ler**  
- Şehir/ilçe/tür filtresi sonrası pagination client-side (totalPages=1)

---