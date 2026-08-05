**Route:** `/schools/create`
**Parent:** ZW-55
**Etiket:** MOBILE

**Özet**  
Yeni okul kaydı; okul adından otomatik kod üretimi.

**Route & Security**  
- Route: `/schools/create`  
- `PrivateRoute`

**Form alanları**  
| Alan | Zorunlu | Not |
|------|---------|-----|
| name | Evet | kod otomatik üretilir |
| code | Evet | uppercase, max 20 char slug |
| address | textarea | Evet |
| phone | Evet | phone regex |
| email | Evet | email regex |
| principalName | Evet | |
| schoolType | select | SchoolType enum |
| city | Evet | |
| district | Evet | |
| studentCapacity | number min 1 | default 100 |
| isActive | — | default true (payload) |

**Butonlar**  
Geri, İptal, Kaydet

**API:** `schoolService.createSchool` → `/schools`

---

---

## Ek kaynak analizi (explore)

## SchoolCreate

- **Route + security:** `/schools/create` · `PrivateRoute`
- **Alanlar (*):** name* (kodu otomatik üretir), code*, address*, phone* (regex), email*, principalName*, schoolType*, city*, district*, studentCapacity* (>0); isActive default true (UI’da yok)
- **APIs:** `POST /api/schools`

---