**Özet**  
Yeni depo oluşturma formu; client validasyon + bildirim.

**Route & Security**  
- Route: `/warehouses/create`  
- `PrivateRoute`

**Form alanları**  
| Alan | Zorunlu | Validasyon |
|------|---------|------------|
| name | Evet | trim |
| code | Evet | trim |
| address | textarea | Evet |
| phone | Evet | 10-11 rakam |
| email | Evet | email regex |
| managerName | Evet | trim |

**Butonlar**  
Test Bildirim (dev), Geri, Depo Oluştur

**API:** `POST` createWarehouse → başarıda 1 sn sonra `/warehouses`

**Edge case'ler**  
- “Test Bildirim” butonu production’da gereksiz kalabilir

---