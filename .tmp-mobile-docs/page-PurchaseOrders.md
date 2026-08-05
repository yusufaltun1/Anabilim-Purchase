**Özet**  
Satın alma siparişlerinin tablo listesi; durum filtresi ve SHIPPED siparişlerde stok girişi.

**Route & Security**  
- Route: `/purchase-orders`  
- `PrivateRoute` (ek capability yok)

**Tip**  
Tablo listesi + modal

**Amaç**  
Siparişleri duruma göre izlemek, detaya gitmek, sevk edilmiş siparişleri stoğa kaydetmek.

**Filtre**  
| Değer | API |
|-------|-----|
| ALL | `GET /api/v1/purchase-orders` |
| PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED, REJECTED | `GET /api/v1/purchase-orders/status/:status` |

**Tablo kolonları**  
Sipariş Kodu, Ürün (ad+kod), Tedarikçi, Miktar, Birim Fiyat, Toplam Fiyat, Durum, Teslim Tarihi, İşlemler

**Sipariş durumları**  
DRAFT/Taslak, PENDING/Beklemede, CONFIRMED/Onaylandı, SHIPPED/Sevk Edildi, DELIVERED/Teslim Edildi, CANCELLED/İptal, REJECTED/Reddedildi

**Butonlar**  
- **Detay** → `/purchase-orders/:id`  
- **Stoğa Kaydet** (status=SHIPPED) → `StockEntryModal`

**Mobil notlar**  
- Tablo `overflow-x-auto` yatay kaydırma

---