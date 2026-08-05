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