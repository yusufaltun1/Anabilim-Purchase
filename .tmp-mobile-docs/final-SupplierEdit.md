# SupplierEdit — Mobil Analiz (Kaynak: purchase-fe)

## Özet
Mevcut tedarikçi düzenleme. Vergi numarası **düzenlenemez** (formda yok). Aktif/tercih edilen checkbox ve kategori multi-select.

## Route & Güvenlik
| Route | `/suppliers/edit/:id` |
| Koruma | `PrivateRoute` |

## Form alanları
Create ile aynı **except:**
- **taxNumber alanı YOK** (UpdateSupplierRequest'te yok)
- **isActive** checkbox — "Aktif"
- **isPreferred** checkbox — "Tercih Edilen Tedarikçi"
- Mevcut kategoriler: `supplier.categories.map(cat => cat.id)` → categoryIds

| Alan | Zorunlu |
|------|---------|
| name, taxOffice, address, phone, email | Evet |
| contactPerson, contactPhone, contactEmail, bankAccount | Evet |
| website, iban | Hayır |
| isActive, isPreferred | checkbox |
| categoryIds | multi-select |

## Yükleme
`Promise.all([loadSupplier(), loadCategories()])` — tam sayfa "Yükleniyor..." loading state.

## Butonlar
Geri, İptal → `/suppliers`; Kaydet → update → `/suppliers`

## API
| Metod | Path |
|-------|------|
| getSupplierById | GET `/api/suppliers/{id}` |
| getActiveCategories | GET `/api/categories/active` |
| updateSupplier | PUT `/api/suppliers/{id}` |

Body map: active←isActive, preferred←isPreferred, categoryIds, iban normalize

## Validasyon
**SupplierCreate'deki validateForm YOK** — sadece HTML required. IBAN/telefon client validate edit'te çalışmaz.

## Edge case'ler
1. id yoksa submit erken return.
2. Edit'te vergi no değiştirilemez.
3. Create'teki IBAN/telefon regex edit'te uygulanmıyor — tutarsızlık.
4. Loading state form submit sırasında da true → tüm sayfa loading.

## Mobil notlar
Create ile aynı; Aktif toggle prominent
