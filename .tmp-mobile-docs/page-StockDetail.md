**Özet**  
Tek ürünün depo bazlı stok dağılımı ve son hareketler.

**Route & Security**  
- Route: `/stock-management/:id`  
- `PrivateRoute`

**Ürün bilgi alanları**  
name, code, description, category, unit, toplam stok rozeti

**Depo stokları tablosu**  
Depo (ad+kod), Mevcut Stok, Min/Max Stok, Durum (Düşük/Normal), Son Hareket

**Son hareketler tablosu**  
Depo, Hareket Tipi (IN/OUT/TRANSFER/ADJUSTMENT), Miktar, Referans tipi + id, Notlar, Tarih

**Referans tipleri (Türkçe)**  
PURCHASE_ORDER, SALES_ORDER, TRANSFER, ADJUSTMENT, MANUAL, ASSIGNMENT

**Buton**  
- **Geri** → `/stock-management`

---