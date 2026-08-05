**Route:** `/roles/create`
**Parent:** ZW-55
**Etiket:** MOBILE

## Özet
Yeni rol oluşturma formu; temel bilgiler, rol ayarları, özet işlem yetkileri ve tam permission kataloğu checkbox'ları içerir. Oluşturma sonrası seçili permission'lar tek tek role atanır.

## Route & Security
- **Route:** `/roles/create`
- **Koruma:** `PrivateRoute`
- **Nav:** Sistem menüsü → Roller → Yeni Rol; `SYSTEM_MANAGE` capability gerekir (nav için)

## Sayfa Tipi
Oluşturma formu (çok bölümlü)

## Amaç
Yeni rol tanımlamak, aktif/sistem rolü bayraklarını ayarlamak ve permission setini atamak.

## Form Alanları

### Temel Bilgiler
| Alan | id | Tip | Zorunlu | Validasyon | Varsayılan |
|------|-----|-----|---------|------------|------------|
| Rol Adı | `name` | text | Evet | `trim` boş olamaz; regex `^[A-Z_]+$`; submit'te `toUpperCase()` | `''` |
| Görünen Ad | `displayName` | text | Evet | `trim` boş olamaz | `''` |
| Açıklama | `description` | textarea (3 satır) | Evet | `trim` boş olamaz | `''` |

HTML `required` attribute tüm zorunlu alanlarda mevcut.

### Rol Ayarları
| Alan | id | Tip | Varsayılan | Not |
|------|-----|-----|------------|-----|
| Rol Aktif | `isActive` | checkbox | `true` | Pasif roller kullanıcıya atanamaz |
| Sistem Rolü | `isSystemRole` | checkbox | `false` | Oluşturulunca silinemez |

### İşlem Yetkileri (özet) — `OPERATION_LABELS`
Her biri checkbox; `mergeSelectionForOperation` ile permission setini günceller:

| key | Label | Eşlenen permission'lar |
|-----|-------|------------------------|
| REQUEST_CREATE | Talep Açma | REQUEST_CREATE |
| REQUEST_EDIT | Talep Düzenleme | REQUEST_UPDATE |
| REQUEST_VIEW | Talep Görüntüleme | REQUEST_READ |
| REQUEST_APPROVE | Onay | APPROVAL_APPROVE, APPROVAL_REJECT, APPROVAL_RETURN |
| QUOTE_COLLECT | Teklif Toplama | INVENTORY_READ |
| ORDER_CREATE | Sipariş Oluşturma | INVENTORY_UPDATE |
| REQUEST_CLOSE | Talep Kapatma | REQUEST_DELETE |
| SYSTEM_MANAGE | Sistem Yönetimi | WORKFLOW_CREATE, WORKFLOW_READ, WORKFLOW_UPDATE, WORKFLOW_DELETE |
| INVENTORY_VIEW | Envanter Görüntüleme | INVENTORY_READ |
| INVENTORY_MANAGE | Envanter Yönetimi | INVENTORY_UPDATE |

### Tüm Permission'lar
- Katalog: `permissionService.getAllPermissions()` — yalnızca `isActive !== false`
- `resource` bazında gruplu checkbox listesi
- Her satır: `displayName \|\| name` + mono `name`
- **Varsayılan seçim:** `REQUEST_CREATE` ve `REQUEST_VIEW` otomatik işaretli

## Tablo Sütunları
Yok

## Filtreler
Yok

## Butonlar
| Buton | Durum | Aksiyon |
|-------|-------|---------|
| **İptal** | Her zaman | Değişiklik varsa `window.confirm` → `/roles` |
| **Oluştur** | Header + form submit | `validateForm` → create + permission atama → `/roles` + success message |
| Disabled | `loading \|\| permCatalogLoading` | — |

Buton metinleri: `İzinler yükleniyor...` / `Oluşturuluyor...` / `Oluştur`

## Modallar
Yok. **İptal onayı:** `window.confirm('Değişiklikleriniz kaydedilmeyecek...')`

## API'ler

### `role.service`
| Metod | Endpoint | Kullanım |
|-------|----------|----------|
| `createRole(data)` | `POST /api/roles` | Rol oluştur |
| `getRoleByName(name)` | `GET /api/roles/name/{name}` | Oluşturulan rolün id'si |
| `addPermissionToRole(roleId, permissionName)` | `POST /api/roles/{id}/permissions?permissionName=` | Her seçili permission |

### `permission.service`
| Metod | Endpoint | Kullanım |
|-------|----------|----------|
| `getAllPermissions()` | `GET /api/permissions` | Katalog yükleme |

## Navigasyon
- **Giriş:** RoleList → Yeni Rol
- **Başarı:** `/roles` + `state: { message: 'Rol başarıyla oluşturuldu!' }`
- **İptal:** `/roles`

## Edge Case'ler
- Permission atama hataları `console.warn` ile yutulur; kullanıcıya gösterilmez
- Katalog yüklenemezse checkbox'lar boş kalır; Oluştur butonu `permCatalogLoading` ile disabled
- `isSystemRole: true` seçilirse rol silinemez (liste sayfasında)
- Rol adı submit'te uppercase'e çevrilir; regex buna göre kontrol edilir
- İptal kontrolü permission değişikliklerini kapsamaz (yalnızca name/displayName/description)

## Mobil Notlar
- Form çok uzun (3 bölüm + onlarca checkbox) — mobilde accordion/stepper önerilir
- Header İptal/Oluştur yan yana; küçük ekranda alt sticky action bar düşünülmeli
- Permission grid `md:grid-cols-2` — mobilde tek sütun, uzun scroll
- Özet işlem kutuları hızlı toggle için uygun; detay listesi ayrı ekrana taşınabilir
- Checkbox + label dokunma alanı genişletilmeli

---