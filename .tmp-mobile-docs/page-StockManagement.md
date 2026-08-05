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