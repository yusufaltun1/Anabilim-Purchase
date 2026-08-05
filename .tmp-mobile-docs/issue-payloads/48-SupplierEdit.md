**Route:** `/suppliers/edit/:id`
**Parent:** ZW-55
**Etiket:** MOBILE

**Özet**  
Mevcut tedarikçi güncelleme (vergi no düzenlenemez).

**Route & Security**  
- Route: `/suppliers/edit/:id`  
- `PrivateRoute`

**Tip**  
Düzenleme formu

**Form alanları**  
Create ile aynı (taxNumber yok) + **isActive** checkbox + **isPreferred**

**API'ler**  
- `getSupplierById(id)`  
- `updateSupplier(id, formData)`

**Edge case'ler**  
- Loading state tam sayfa “Yükleniyor...”

---

---

## Ek kaynak analizi (explore)

## SupplierEdit

- **Route + security:** `/suppliers/edit/:id` · `PrivateRoute`
- **Tip:** Form
- **Alanlar:** Create ile aynı ama **taxNumber yok** (değiştirilemez); ek: `isActive` checkbox
- **Validasyon:** Create’teki özel JS validasyonları yok (HTML required)
- **APIs:** `GET /api/suppliers/{id}` · `PUT /api/suppliers/{id}`

---