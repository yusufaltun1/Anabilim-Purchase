**Route:** `/transfers/:id`
**Parent:** ZW-55
**Etiket:** MOBILE

**Özet**  
Transfer detayı, durum geçiş butonları, kalem bazlı miktar/görsel güncelleme.

**Route & Security**  
- Route: `/transfers/:id`  
- `PrivateRoute`

**Detay alanları**  
transferCode, status, sourceWarehouseId, targetWarehouseId, transferDate, createdAt, notes

**Durum geçiş butonları**  
| Mevcut | Aksiyon → Yeni |
|--------|----------------|
| PENDING | Onayla→APPROVED, Reddet→REJECTED |
| APPROVED | Hazırlamaya Başla→PREPARING |
| PREPARING | Sevkiyata Başla→IN_TRANSIT |
| IN_TRANSIT | Teslim Edildi→DELIVERED |

**Kalem görüntüleme**  
productId, requestedQuantity, transferredQuantity (PREPARING/IN_TRANSIT’te düzenlenebilir), serialNumbers, conditionNotes, transfer/receive görselleri (base64 grid), notes

**PENDING + onay öncesi görsel yükleme**  
- Transfer görselleri (zorunlu etiket)  
- Teslim görselleri (opsiyonel)  
Onayda `updateTransferItemImages` batch

**Miktar güncelleme inline**  
number input + Güncelle/İptal → `updateTransferItem(transferredQuantity)`

**API'ler**  
- `GET /api/asset-transfers/:id`  
- `PUT .../status?status&reason`  
- `PUT .../items/:itemId`  
- `PUT .../items/:itemId/images`

**Edge case'ler**  
- Ürün/depo adları yerine ID  
- Bildirimler TODO  
- Geri ok → `/transfers`

**Mobil notlar**  
- Görsel grid 2-3 kolon  
- Durum butonları `flex-wrap`

[REDACTED]

---

## Ek kaynak analizi (explore)

## TransferDetail

- **Route + security:** `/transfers/:id` · `PrivateRoute`
- **Tip:** Detay + status workflow
- **Görüntü:** kod, status, depolar (ID), tarihler, notes, kalemler (productId, miktarlar, seri, condition, görseller)
- **Status geçişleri:**
  - PENDING → Onayla / Reddet (+ onayda local transfer/receive images upload)
  - APPROVED → Hazırlamaya Başla (PREPARING)
  - PREPARING → Sevkiyata Başla (IN_TRANSIT)
  - IN_TRANSIT → Teslim Edildi (DELIVERED)
- **Inline miktar güncelle:** PREPARING | IN_TRANSIT → `transferredQuantity` (0…requested)
- **PENDING görseller:** Transfer görselleri “zorunlu” etiketi ama onayda zorunluluk enforce edilmiyor
- **APIs:** `GET /api/asset-transfers/{id}` · `PUT .../status` · `PUT .../items/{itemId}` · `PUT .../items/{itemId}/images`
- **Edge:** Ürün adı yok, sadece `Ürün {productId}`

---