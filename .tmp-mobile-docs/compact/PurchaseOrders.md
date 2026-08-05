**Route:** `/purchase-orders`
**Parent:** ZW-55
**Etiket:** MOBILE

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

---

## Ek kaynak analizi (explore)

## PurchaseOrders

- **Route + security:** `/purchase-orders` · `PrivateRoute` (capability route yok)
- **Tip:** Tablo listesi
- **Amaç:** Siparişleri durum filtresiyle yönetme; SHIPPED için stok girişi
- **Kolonlar:** Sipariş Kodu · Ürün (ad+kod) · Tedarikçi · Miktar · Birim Fiyat · Toplam · Durum · Teslim Tarihi · İşlemler
- **Filtreler:** Durum select: ALL, PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED, REJECTED (DRAFT filtrede yok)
- **Aksiyonlar:** Detay · Stoğa Kaydet (yalnız SHIPPED)
- **Modal — StockEntryModal:** Depo seçimi*; alınan miktar*; notes; FIXED/SEMI_FIXED için seri no* + görsel; CONSUMABLE tek IN hareketi
  - APIs: warehouse stocks/movements/items · SHIPPED ise `PUT .../status?status=DELIVERED`
- **APIs:** `GET /api/v1/purchase-orders` · `GET /api/v1/purchase-orders/status/{status}`
- **Edge:** response tek obje ise array’e sarılır

---