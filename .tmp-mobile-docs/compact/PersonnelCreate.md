**Route:** `/personnel/create`
**Parent:** ZW-55
**Etiket:** MOBILE

**Özet**  
Yeni okul personeli kaydı.

**Route & Security**  
- Route: `/personnel/create`  
- `PrivateRoute`

**Form alanları**  
| Alan | Zorunlu |
|------|---------|
| schoolId | Evet (select, aktif okullar) |
| firstName, lastName | Evet |
| tcNo | Evet (11 hane) |
| email, phone | Evet |
| address | textarea Evet |
| role | select PersonnelRole |
| employmentType | select EmploymentType |
| status | select PersonnelStatus |
| startDate | date Evet |
| endDate | date Hayır |
| salary | number Hayır |
| department | Hayır |
| branchSubject | Hayır |
| qualifications | textarea Hayır |
| notes | textarea Hayır |

**Butonlar**  
Geri, İptal, Kaydet

**API:** `schoolPersonnelService.createPersonnel`

---

---

## Ek kaynak analizi (explore)

## PersonnelCreate

- **Route + security:** `/personnel/create` · `PrivateRoute`
- **Alanlar:**
  | Alan | Zorunlu | Validasyon |
  |---|---|---|
  | schoolId | Evet | >0 |
  | firstName, lastName | Evet | — |
  | tcNo | Evet | 11 digit |
  | email | Evet | email regex |
  | phone | Evet | phone regex |
  | address | Evet | — |
  | role, employmentType, status | Evet | enum select |
  | startDate | Evet | date |
  | endDate, salary, department, branchSubject, qualifications, notes | Hayır | boşlar undefined gönderilir |
- **APIs:** `POST /api/school-personnel` · `GET /api/schools/active`
- **Default:** ilk aktif okul seçilir

---