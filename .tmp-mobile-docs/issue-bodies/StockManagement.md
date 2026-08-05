**Route:** `/stock-management`
**Parent:** ZW-55
**Etiket:** MOBILE

**Özet**  
Ürün bazlı konsolide stok listesi; sayfalama (20/sayfa).

**Route & Security**  
- Route: `/stock-management`  
- `PrivateRoute`

**Tip**  
Sayfalı tablo

**Tablo kolonları**  
Ürün (name, code, description), Kategori, Toplam Stok (+ unit), Depo Sayısı, Durum rozeti, Son Hareket, Detay

**Durum rozetleri**  
Pasif (active=false), Düşük Stok (hasLowStock), Normal

**Sayfalama**  
currentPage, totalElements, first/last, sayfa numaraları

**Buton**  
- **Detay** → `/stock-management/:id`

**API:** `GET` product stocks list (page, size=20)

**Mobil notlar**  
- Tablo overflow-x-auto

---

---

## Ek kaynak analizi (explore)

## StockManagement

- **Route:** `/stock-management` — PrivateRoute; nav `QUOTE_COLLECT`
- **Tip:** list
- **Tablo:** Ürün(ad+kod+açıklama) | Kategori | Toplam Stok | Depo Sayısı | Durum (Pasif/Düşük/Normal) | Son Hareket | Detay
- **Pagination:** server-side page=0, size=20
- **APIs:** `GET /api/warehouse-stocks/products?page=&size=`

---