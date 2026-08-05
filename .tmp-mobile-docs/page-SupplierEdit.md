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