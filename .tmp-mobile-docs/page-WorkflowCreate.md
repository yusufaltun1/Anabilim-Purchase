## Özet
Yeni onay süreci oluşturma; temel bilgiler + dinamik çok adımlı onay zinciri. Aktif roller API'den yüklenir.

## Route & Security
- **Route:** `/workflows/create`
- **Koruma:** `PrivateRoute`
- **Nav:** Sistem → İş Akışları → Yeni Workflow; `SYSTEM_MANAGE`

## Sayfa Tipi
Oluşturma formu (dinamik adım listesi)

## Amaç
Kategori ve tutar aralığına bağlı çok adımlı onay workflow'u tanımlamak.

## Form Alanları

### Temel Bilgiler
| Alan | id | Tip | Zorunlu | Validasyon |
|------|-----|-----|---------|------------|
| Workflow Adı | `name` | text | Evet | `trim` boş olamaz |
| Kategori | `category` | select | Evet | Boş olamaz |
| Açıklama | `description` | textarea | Evet | `trim` boş olamaz |
| Minimum Tutar (₺) | `minAmount` | number | Evet | `parseFloat >= 0`, `step 0.01`, `min 0` |
| Maksimum Tutar (₺) | `maxAmount` | number | Evet | `parseFloat > minAmount` |

**Kategori seçenekleri:** IT_EQUIPMENT, OFFICE_SUPPLIES, MARKETING_MATERIALS, TRAINING_SERVICES, CONSULTING_SERVICES, OTHER (UI'da `_` → boşluk)

### Her Onay Adımı (`steps[]`) — varsayılan 1 adım
| Alan | Tip | Zorunlu | Validasyon | Varsayılan |
|------|-----|---------|------------|------------|
| `stepOrder` | number (otomatik) | — | Sil/taşı sonrası yeniden numaralanır | 1, 2, … |
| `stepName` | text | Evet | `trim` boş olamaz | `''` |
| `roleName` | select | Evet | Boş olamaz; seçenekler `roleService.getActiveRoles()` | `''` |
| `approverType` | hidden state | — | Sabit `'ROLE'` | `'ROLE'` |
| `approvalType` | select | Hayır | APPROVE / REJECT / COMMENT | `'APPROVE'` |
| `isRequired` | checkbox | Hayır | — | `true` |

**Onay tipi etiketleri:** Onayla, Reddet, Yorum Yap

## Tablo Sütunları
Yok

## Filtreler
Yok

## Butonlar
| Buton | Aksiyon |
|-------|---------|
| **İptal** | Değişiklik varsa confirm → `/workflows` |
| **Oluştur** | Submit |
| **Adım Ekle** | Yeni step (stepOrder = length+1) |
| **↑ / ↓** | Adım sırası değiştir (2+ adım) |
| **🗑** | Adım sil (min 1 adım kalmalı) |

## Modallar
İptal: `window.confirm`

## API'ler

### `workflow.service`
| Metod | Endpoint |
|-------|----------|
| `createWorkflow(data)` | `POST /api/approval-workflows` |

### `role.service`
| Metod | Endpoint |
|-------|----------|
| `getActiveRoles()` | `GET /api/roles/active` |

## Navigasyon
- Başarı: `/workflows` + `'Workflow başarıyla oluşturuldu!'`

## Edge Case'ler
- Rol listesi yüklenemezse select boş; hata banner'ı
- Son adım silinemez (`steps.length > 1` şartı)
- `isActive` create payload'da gönderilmez (backend varsayılanı)
- `approverType` UI'da değiştirilemez
- İptal kontrolü: name, description veya herhangi step'te roleName

## Mobil Notlar
- Adım kartları iç içe grid — mobilde tek sütun
- Yukarı/aşağı/sil ikonları küçük (p-1) — touch target artırılmalı
- Rol select loading skeleton gösterir
- Tutar alanları number keyboard uyumlu

---