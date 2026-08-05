## Nested: ProductForm (create/edit)

### Genel bilgiler
| Alan | Required | Disabled/ReadOnly | Not |
|---|---|---|---|
| Ürün adı | * | | |
| Ürün kodu (SKU) | * | edit: readOnly | upper; demirbaş etiketi = kod |
| Kategori | * | searchable | tip+stok default’ları çeker; tedarikçi listesini kategoriden filtreler |
| Ürün tipi | | readOnly | kategoriden |
| Aktif ürün | | | **sadece edit** checkbox |

### Stok ve fiyat
Açıklama (textarea), Tahmini birim fiyat (currency kategori’den)

### Demirbaş bilgileri (her zaman görünür; zorunluluk `assetFieldsRequired`)
`assetFieldsRequired = mode===create && isAssetProductType(FIXED_ASSET|SEMI_FIXED_ASSET|IT_HARDWARE)`

| Alan | Required (asset create) | Koşullu görünürlük / kural |
|---|---|---|
| Şirket | hayır | |
| Depo | hayır | create: boş = doğrudan zimmet; depo seçilince assignment+konum sıfırlanır |
| Demirbaş etiketi | * | readOnly = kod |
| Seri no | * | |
| Marka/model | * | searchable + Yeni + düzenle kalem |
| Durum (assetCondition) | hayır (öneri: Hazır) | zimmetliyken **locked** (mustReturnFirst / ASSIGNED / IN_USE) |
| IP | | `selectedModel.enableIp` |
| MAC | | `selectedModel.enableMac` |
| Notlar | | |
| Konum (3 seviye) | * | `showDefaultLocationPickers`: edit **veya** create+asset+depo yok |
| ProductCreateAssignmentSection | user/location * | `showCreateAssignment`: create+asset+depo yok |

### Opsiyonel
Demirbaş adı (domainName), BYOD checkbox

### Sipariş bilgileri
Sipariş no, satın alma tarihi, garanti bitiş, tedarikçi (+Yeni modal), satın alma ücreti (TRY)

### Görseller
Multi file (jpg/webp/png/gif/svg, max 8MB), Kameradan çek, thumbnail sil

### Submit validation
- Ad + kategori + kod zorunlu
- Asset create: kod, seri, model, konum root (+ assignment user/location)
- Create assignment sonrası: `stockItemId` yoksa hata; foto+form download best-effort
- Edit: `active` + serial (trim varsa)

### Modallar
CreateDeviceModelModal, EditDeviceModelModal, CreateSupplierModal, CameraCaptureModal; prompt ile yeni condition/location

### APIs
- Masters: categories, device-models, asset-conditions, schools, warehouses, locations, users (create)
- `POST/PUT /api/products`, `POST /api/v1/assignments`, form photo/download
- `POST /api/inventory/asset-conditions`, `POST /api/inventory/locations`
- Supplier by category / create

### Edge
- Kategori stok ayarları bilgi satırı (unit/min/max/currency)
- fieldErrors backend map (`PRODUCT_FIELD_LABELS`)
- Create: depo seçiliyse zimmet section gizlenir; konum kullanıcı work location’dan da türetilebilir

---

**Capability:** `INVENTORY_MANAGE`
