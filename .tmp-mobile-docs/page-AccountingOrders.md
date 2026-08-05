**Özet**  
Muhasebe odaklı sipariş listesi: özet kartlar, finansal tablo, genel toplam footer.

**Route & Security**  
- Route: `/accounting`  
- `PrivateRoute` + `CapabilityRoute(ACCOUNTING_VIEW)`  
- Roller: MUHASEBE, BILGI_ISLEM_DEPARTMANI, SYSTEM_ADMIN veya `ACCOUNTING_READ` izni

**Tip**  
Rapor listesi (salt okunur, detay linki yok)

**Amaç**  
Siparişlerin finansal özetini ve durum bazlı tutarları görmek.

**Özet kartlar**  
- Toplam Sipariş (count)  
- Teslim Edilen (DELIVERED count)  
- Toplam Tutar (sum totalPrice, ilk siparişin currency’si)

**Filtre**  
PurchaseOrders ile aynı durum select (ALL + 6 durum)

**Tablo kolonları**  
Sipariş No, Ürün, Tedarikçi, Miktar (sağ), Birim Fiyat, Toplam, Durum, Beklenen Teslimat, Gerçek Teslimat

**Footer**  
Genel Toplam (tr-TR format, 2 ondalık)

**API'ler**  
- `purchaseOrderService.getAllOrders()`  
- `purchaseOrderService.getOrdersByStatus(status)`

**Edge case'ler**  
- Farklı para birimli siparişlerde toplam tek currency ile gösterilir  
- Satıra tıklama/detay navigasyonu yok

**Mobil notlar**  
- Özet kartlar `grid-cols-1 sm:grid-cols-3`  
- Tablo yatay kaydırma

---