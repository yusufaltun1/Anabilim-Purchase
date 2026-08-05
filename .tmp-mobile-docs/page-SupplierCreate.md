**Özet**  
Yeni tedarikçi kaydı; client-side validasyon ve kategori multi-select.

**Route & Security**  
- Route: `/suppliers/create`  
- `PrivateRoute`

**Tip**  
Oluşturma formu

**Form alanları**  
| Alan | Zorunlu | Validasyon |
|------|---------|------------|
| name | Evet | |
| taxNumber | Evet | 10 hane, pattern |
| taxOffice | Evet | |
| address | textarea | Evet |
| phone | Evet | tel |
| email | Evet | email |
| website | Hayır | url |
| contactPerson | Evet | |
| contactPhone | Evet | 10-11 hane |
| contactEmail | Evet | email |
| bankAccount | Evet | |
| iban | Hayır | TR 26 hane regex |
| isPreferred | checkbox | default false |
| isActive | — | default true (form state) |
| categoryIds | multi-select | aktif kategoriler |

**Butonlar**  
Geri, İptal, Kaydet

**API'ler**  
- `categoryService.getActiveCategories()`  
- `supplierService.createSupplier()`

**Mobil notlar**  
- react-select multi mobilde tam genişlik

---