**Route:** `/purchase-orders/:id`
**Parent:** ZW-55
**Etiket:** MOBILE

**Özet**  
Tek siparişin tüm bilgileri ve durum güncelleme aksiyonları.

**Route & Security**  
- Route: `/purchase-orders/:id`  
- `PrivateRoute`

**Tip**  
Detay + durum aksiyonları + modal

**Amaç**  
Sipariş bilgilerini görüntülemek, yaşam döngüsünü ilerletmek, stok girişi yapmak.

**Detay alanları (dl grid)**  
Ürün adı/kodu/açıklama/kategori, tedarikçi (companyName, contactPerson, phone, email), supplierReference, quantity, unitPrice, totalPrice, deliveryWarehouse (name, code, address, managerName), expectedDeliveryDate, actualDeliveryDate, createdAt, updatedAt, notes

**Durum güncelleme butonları**  
| Mevcut durum | Butonlar → Yeni durum |
|--------------|----------------------|
| PENDING | Onayla→CONFIRMED, Reddet→REJECTED, İptal Et→CANCELLED |
| CONFIRMED | Sevk Et→SHIPPED, İptal Et→CANCELLED |
| Diğer | Stoğa Kaydet (modal) |

API: `PUT /api/v1/purchase-orders/:id/status?status=&comment=`

**StockEntryModal alanları:** depo seçimi, teslim alınan miktar, seri no (demirbaş), resim, notlar

**Edge case'ler**  
- PENDING/CONFIRMED dışında “Stoğa Kaydet” gösterilir (SHIPPED dahil mantık karışık olabilir)  
- Geri → `/purchase-orders`

**Mobil notlar**  
- Detay grid `sm:grid-cols-2`; mobilde tek sütun

---

---

## Ek kaynak analizi (explore)

## PurchaseOrderDetail

- **Route + security:** `/purchase-orders/:id` · `PrivateRoute`
- **Tip:** Detay + durum aksiyonları
- **Amaç:** Sipariş bilgisi ve status geçişleri
- **Görüntü:** ürün/tedarikçi/depo/fiyat/tarih/notes alanları (form yok)
- **Durum kuralları:**
  - PENDING → Onayla (CONFIRMED) | Reddet (REJECTED) | İptal (CANCELLED)
  - CONFIRMED → Sevk Et (SHIPPED) | İptal
  - PENDING/CONFIRMED dışı → “Stoğa Kaydet” butonu (SHIPPED kısıtı listede var, detayda yok)
- **APIs:** `GET /api/v1/purchase-orders/{id}` · `PUT /api/v1/purchase-orders/{id}/status?status=&comment=`
- **Edge:** Stoğa Kaydet SHIPPED olmayan siparişte de görünür (PENDING/CONFIRMED değilse)

---