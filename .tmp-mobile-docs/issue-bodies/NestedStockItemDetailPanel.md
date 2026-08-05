## Nested: StockItemDetailPanel (3 tab)

Portal modal. Header: seri/etiket, durum, depo/zimmet.

### Tab Zimmet
- Aktif zimmet varsa: Formu indir, İmzalı yükle (.xlsx), İade et, İptal (`canManage`)
- Yok + `canAssign` + `canManage`: `StockItemAssignmentForm`
- Aksi: “depoda ve Hazır olmalı”

### Tab Stok hareketi (`canManage`)
- Depoda (`warehouseId` + IN_STOCK) → OUT; değilse IN + depo select *
- Giriş/çıkış lokasyonu * (3 seviye)
- Açıklama opsiyonel
- quantity=1, referenceType=MANUAL
- API: `createStockMovementWithAutoStock` → `POST /api/warehouse-stocks/movements`

### Tab Geçmiş
- Zimmet geçmişi: Tarih | Durum | Atanan | Fotoğraf | Belgeler | Not
- Stok hareketleri: Tarih | Tip | Lokasyon | Referans | Not
- APIs: `GET /api/v1/stock-items/:id/movements`, `GET /api/v1/assignments/.../stockItem`

### Edge
- Açılışta tab=zimmet reset
- İade: `AssignmentReturnModal`

---

---

## Nested: StockItemAssignmentForm

| Alan | Required |
|---|---|
| Zimmet tipi | |
| Kullanıcı / Konum | * |
| Okul | opsiyonel |
| Konum detayı | opsiyonel |
| Beklenen iade | opsiyonel |
| Fotoğraf | opsiyonel |
| Not | opsiyonel |

API: `POST /api/v1/assignments` + photo + form download

---

---

## Nested: AssignmentReturnModal

| Alan | Required |
|---|---|
| İade deposu | * (tek depo auto-select) |
| İade formu indir (aksiyon) | önerilen |
| Ürün fotoğrafı | * (kamera veya jpeg/png) |
| İmzalı iade formu .xlsx | * (max 20MB) |
| İade notu | opsiyonel |

API: `GET .../return/form/download`, `POST .../:id/return` (multipart: photo, document, warehouseId, notes)

---
