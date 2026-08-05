**Route:** `/users/edit/:id`
**Parent:** ZW-55
**Etiket:** MOBILE

## Özet
Mevcut kullanıcı düzenleme formu. UserCreate alanlarına ek olarak zimmet formu bilgileri (okul, çalışma lokasyonu hiyerarşisi), güncelleme sonrası aktif zimmetler bölümü (`AssignmentManageSection`) içerir. Route param: `:id`.

## Route & Security
| Özellik | Değer |
|---------|-------|
| Path | `/users/edit/:id` |
| Koruma | `PrivateRoute` |
| Param | `id` (string → parseInt) |
| Menü | UserList → Düzenle |

## Sayfa tipi
**Edit form + alt bölüm (read-only/aksiyon tablo: zimmetler)**

## Amaç / özellikler
- Kullanıcı bilgilerini güncelleme
- Zimmet Excel formu için ek alanlar (okul, lokasyon, departman, unvan)
- Microsoft 365'ten gelmeyen alanları manuel doldurma
- Aktif zimmetleri görüntüleme ve zimmet işlemleri (indir/yükle/iade/iptal)
- Kendi kendini yönetici olarak seçme engeli (manager listesinden çıkarılır)

## Form alanları

### email, firstName, lastName, phone
UserCreate ile aynı; **prefill** API'den gelir.

### manager (Combobox)
UserCreate ile aynı yapı; **prefill** `user.manager`; liste **mevcut kullanıcı hariç** aktif kullanıcılar.

### schoolId (Zimmet — Şirket / Okul)
| Özellik | Değer |
|---------|-------|
| name | `schoolId` |
| Tip | select |
| Label | Şirket / Okul |
| Required | **Hayır** (HTML required yok) |
| Options | `schools` — `schoolService.getActiveSchools()`; boş option "Seçin" |
| Value | `formData.schoolId ?? ''` |
| onChange | number veya null |
| Submit flag | `schoolTouched: true` (her submit'te) |

### Çalışma lokasyonu (LocationHierarchyPickers)
Üç seviyeli hiyerarşi; UserEdit'te `showLeaf={true}`.

| Seviye | State | Label | API |
|--------|-------|-------|-----|
| Root | `locationRootId` | Üst konum | `inventoryService.getParentLocations()` → GET `/api/inventory/locations/parents` |
| Middle | `locationMiddleId` | Alt konum | GET `/api/inventory/locations/children?parentId={rootId}` |
| Leaf | `locationLeafId` | Detay konum | GET `/api/inventory/locations/children?parentId={middleId}` |

| Özellik | Değer |
|---------|-------|
| Required | Hayır |
| Disabled koşulları | Middle: `!rootId`; Leaf: `!middleId` |
| Cascade | Root değişince middle+leaf null; middle değişince leaf null |
| Prefill | `resolveProductLocationLevels(locations, workLocationParentId, workLocationChildId)` |
| Submit payload | `resolveUserWorkLocationPayload` → `workLocationParentId`, `workLocationChildId` + `workLocationHierarchyTouched: true` |
| Component | `SearchableOptionSelect` (arama destekli) |
| allowClear | Evet (her seviye) |

**Not:** `locationService.getAllLocations()` mount'ta çağrılır (GET `/api/locations`) — prefill için; picker'lar inventory API kullanır.

### department (Zimmet bölümünde)
| Ad | `department` |
| Label | Departman |
| Required | Evet |
| Prefill | `normalizePlaceholder` — `"unknown"` → `''` |

### position
| Label | Görevi / Unvanı |
| Required | Evet |
| Prefill | normalizePlaceholder |

### roles
UserCreate ile aynı; prefill `user.roles`.

**UpdateUserRequest submit body (ek alanlar):**
- `workLocationParentId`, `workLocationChildId`
- `schoolTouched: true`
- `workLocationHierarchyTouched: true`

## Tablo kolonları

### AssignmentManageSection — "Aktif Zimmetler"
Props: `title="Aktif Zimmetler"`, `showProductColumn={true}`, `showAssigneeColumn={false}`

| Kolon | İçerik |
|-------|--------|
| Ürün | Link → `/products/${productId}`; productName + serialNumber |
| Tarih | `formatDate(assignmentDate)` |
| Oluşturan | `createdByUserName` veya `—` |
| Durum | ACTIVE→Aktif, RETURNED→İade edildi, LOST→Kayıp, DAMAGED→Hasarlı, EXPIRED→Süresi doldu |
| Fotoğraf | `AssignmentFormPhotoThumb` — tıklanınca lightbox |
| Belgeler | `AssignmentDocumentLinks` — koşullu indirme linkleri |
| İşlemler | Duruma göre aksiyon butonları (aşağıda) |

## Filtreler / arama
- Yönetici Combobox araması
- LocationHierarchyPickers içinde SearchableOptionSelect araması

## Butonlar & aksiyonlar

### Form
| Buton | Aksiyon |
|-------|---------|
| İptal | `/users` |
| Kaydet | `userService.updateUser(id, payload)` → `/users` + success message |

### Zimmet satır işlemleri (status=ACTIVE)
| Buton | Koşul | API |
|-------|-------|-----|
| Zimmet formu indir | ACTIVE | GET `/api/v1/assignments/{id}/form/download` |
| Fotoğraf yükle / değiştir | ACTIVE | POST `/api/v1/assignments/{id}/form/photo` |
| İmzalı zimmet yükle | ACTIVE | POST `/api/v1/assignments/{id}/form/signed` (.xlsx) |
| İade formu indir | `canBeReturned` | GET `.../return/form/download` |
| İade et | `canBeReturned` | Modal açar |
| Zimmeti iptal et | `canBeCancelled` (ACTIVE && !hasSignedForm) | DELETE `/api/v1/assignments/{id}` |

### Belgeler kolonu (koşullu)
| Link | Koşul | API |
|------|-------|-----|
| İmzalı zimmet indir | hasSignedForm | GET `.../form/signed` |
| İade belgesi indir | hasReturnDocument | GET `.../return/document` |
| İade fotoğrafı indir | hasReturnPhoto | GET `.../return/photo` |

## Modallar

### AssignmentReturnModal ("Zimmet iadesi")
Tetikleyici: "İade et" butonu.

| Alan | Tip | Required | Validation / Options |
|------|-----|----------|---------------------|
| İade deposu | select | Evet | `warehouseService.getActiveWarehouses()`; tek depo varsa auto-select |
| Ürün fotoğrafı | file / kamera | Evet | jpeg/png; CameraCaptureModal destekli |
| İmzalı iade formu | file | Evet | `.xlsx` only |
| İade notu | textarea | Hayır | Opsiyonel |
| İade formunu indir | button | — | Pre-step download |

Submit → `assignmentService.returnAssignment(id, { photo, document, warehouseId, notes? })`  
POST `/api/v1/assignments/{id}/return` (multipart FormData)

**Diğer overlay:** Fotoğraf lightbox (fullscreen img, tıkla kapat).

**Gizli file inputlar (AssignmentManageSection):**
- signed form: accept `.xlsx`
- form photo: accept `image/jpeg,image/png,.jpg,.jpeg,.png`

## API'ler

**Mount:**

| Servis method | HTTP |
|---------------|------|
| `userService.getUserById(id)` | GET `/api/users/${id}` |
| `roleService.getActiveRoles()` | GET `/api/roles/active` |
| `userService.getActiveUsers()` | GET `/api/users/active` |
| `schoolService.getActiveSchools()` | GET `/api/schools/active` |
| `locationService.getAllLocations()` | GET `/api/locations` |
| `assignmentService.getActiveAssignmentsByUserId(userId)` | GET `/api/v1/assignments/user/${userId}/active` |

**Submit:**

| Servis method | HTTP |
|---------------|------|
| `userService.updateUser(id, body)` | PUT `/api/users/${id}` |

## Navigasyon
| Kaynak | Hedef |
|--------|-------|
| İptal | `/users` |
| Başarılı güncelleme | `/users` + `{ message: 'Kullanıcı başarıyla güncellendi!' }` |
| Zimmet ürün linki | `/products/:productId` |

## Edge cases / koşullu UI
- **Initial loading:** `loading && !formData.email` → tam sayfa spinner (Navigation görünür)
- **Load error:** "Kullanıcı bilgileri yüklenirken hata oluştu"
- **school/locations catch:** boş array fallback, sayfa çökmez
- **normalizePlaceholder:** API `"unknown"` departman/pozisyon → boş string
- **Manager self-exclusion:** düzenlenen kullanıcı manager listesinde yok
- **Submit loading:** form Kaydet disabled; aynı `loading` state initial load ile paylaşılır
- **Assignments load fail:** boş liste, console error
- **Zimmet boş:** "Kayıtlı zimmet bulunamadı."
- **İptal zimmet confirm:** native confirm dialog
- **canCancelAssignment:** `canBeCancelled ?? (ACTIVE && !hasSignedForm)`
- Debug: `console.log` formData (useEffect) — production'da kaldırılabilir

## Mobil notlar
- UserCreate mobil notları geçerli (multi-select, combobox, keyboard)
- **LocationHierarchyPickers:** 3 cascade picker mobilde step wizard veya tek ekranda stacked searchable selects
- **AssignmentManageSection:** geniş tablo mobilde uyumsuz — accordion/card per assignment önerilir
- **Dosya işlemleri:** `expo-document-picker`, `expo-image-picker`, `expo-camera` (Return modal zaten kamera destekli web'de)
- **Excel indirme/yükleme:** mobilde Share API / Files app entegrasyonu; `.xlsx` upload validation
- **Blob download:** web `triggerBlobDownload` mobilde çalışmaz — `expo-file-system` + sharing
- **Return modal:** warehouse select, photo capture, document upload — tam ekran modal + safe area
- **Lightbox:** React Native Image modal
- **schoolTouched / workLocationHierarchyTouched:** backend'e explicit touch flag — mobil form reset'te dikkat
- UserEdit, UserCreate'ten daha karmaşık — mobilde iki sekme önerilir: "Profil" / "Zimmet bilgileri" / "Aktif zimmetler"

[REDACTED]