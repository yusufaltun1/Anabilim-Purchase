**Route:** `/schools/edit/:id`
**Parent:** ZW-55
**Etiket:** MOBILE

**Özet**  
Mevcut okul bilgilerini güncelleme (isActive alanı formda yok).

**Route & Security**  
- Route: `/schools/edit/:id`  
- `PrivateRoute`

**Form alanları**  
Create ile aynı (isActive hariç)

**Butonlar**  
Geri → detay, İptal, Güncelle

**API:** `getSchoolById`, `updateSchool` → başarıda `/schools/:id`

---

---

## Ek kaynak analizi (explore)

## SchoolEdit

- **Route + security:** `/schools/edit/:id` · `PrivateRoute`
- **Alanlar:** Create ile aynı zorunlular (isActive yok)
- **APIs:** `GET /api/schools/{id}` · `PUT /api/schools/{id}` → başarıda detaya

---