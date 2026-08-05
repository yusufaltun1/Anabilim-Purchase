**Route:** `/workflows/edit/:id`
**Parent:** ZW-55
**Etiket:** MOBILE

## Özet
Mevcut workflow düzenleme; temel bilgiler + `isActive` + dinamik adımlar. **Create'ten farklı:** rol listesi API'den değil sabit diziden gelir; adım adı alanı UI'da yok.

## Route & Security
- **Route:** `/workflows/edit/:id`
- **Koruma:** `PrivateRoute`
- **Nav:** Sistem → İş Akışları → Düzenle; `SYSTEM_MANAGE`

## Sayfa Tipi
Düzenleme formu

## Amaç
Workflow meta verilerini, aktiflik durumunu ve onay adımlarını güncellemek.

## Form Alanları

### Temel Bilgiler
RoleCreate benzeri alanlar + ek:

| Alan | id | Tip | Validasyon |
|------|-----|-----|------------|
| Workflow Adı | `name` | text | Zorunlu |
| Kategori | `category` | select | Zorunlu (6 sabit kategori) |
| Açıklama | `description` | textarea | Zorunlu |
| Minimum Tutar | `minAmount` | number | `>= 0` |
| Maksimum Tutar | `maxAmount` | number | `> minAmount` |
| Workflow Aktif | `isActive` | checkbox | — |

### Her Adım
| Alan | UI'da | Validasyon |
|------|-------|------------|
| `roleName` | select | Zorunlu |
| `approvalType` | select | APPROVE/REJECT/COMMENT |
| `isRequired` | checkbox | — |
| `stepName` | **YOK** | Validate'de kontrol edilmez |
| `stepOrder` | Otomatik (Adım N başlığı) | Taşı/sil ile güncellenir |
| `approverType` | State | Yeni adımda `'USER'`; mevcut adımlarda API'den gelen değer korunur |

**Sabit rol seçenekleri (API değil):** MANAGER, PURCHASE_MANAGER, SYSTEM_ADMIN, FINANCE_MANAGER, DEPARTMENT_HEAD, GENERAL_MANAGER

## Tablo Sütunları
Yok

## Filtreler
Yok

## Butonlar
Create ile aynı set (İptal, Kaydet, Adım Ekle, ↑↓, Sil) + hata ekranında "← Workflow listesine dön"

## Modallar
İptal confirm; silme adım içi (confirm yok)

## API'ler (`workflow.service`)
| Metod | Endpoint |
|-------|----------|
| `getWorkflowById(id)` | `GET /api/approval-workflows/{id}` |
| `updateWorkflow(id, data)` | `PUT /api/approval-workflows/{id}` |

## Navigasyon
- Başarı: `/workflows` + `'Workflow başarıyla güncellendi!'`

## Edge Case'ler
- **Create vs Edit tutarsızlığı:** Create API'den aktif roller; Edit sabit 6 rol — API'deki diğer roller select'te görünmez
- **stepName UI eksik:** Mevcut stepName korunur; yeni adımda boş string gönderilebilir
- Yeni adım `approverType: 'USER'`, Create'te `'ROLE'`
- İptal değişiklik kontrolü `JSON.stringify(steps)` ile tüm adım objelerini karşılaştırır
- Validate adım adını kontrol etmez (Create kontrol eder)

## Mobil Notlar
- WorkflowCreate ile aynı layout sorunları
- isActive checkbox mobilde net görünür
- Sabit rol listesi kısa — mobil picker uygun

---