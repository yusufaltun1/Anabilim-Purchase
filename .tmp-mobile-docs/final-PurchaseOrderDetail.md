# PurchaseOrderDetail — Mobil Analiz (Kaynak: purchase-fe)

## Özet
Tek satın alma siparişi detayı, durum geçiş butonları ve stok girişi modal.

## Route & Güvenlik
| Route | `/purchase-orders/:id` |
| Koruma | `PrivateRoute` |

## Detay alanları (Sipariş Bilgileri)
| Etiket | Alan | Fallback |
|--------|------|----------|
| Ürün Adı | supplierQuote.product.name | Ürün Bilgisi Yok |
| Ürün Kodu | product.code | Kod Yok |
| Ürün Açıklaması | product.description | Açıklama Yok |
| Kategori | product.category.name | Kategori Yok |
| Tedarikçi | supplier.companyName | |
| İletişim Kişisi | supplier.contactPerson | |
| Tedarikçi Telefon | supplier.contactPhone | |
| Tedarikçi E-posta | supplier.contactEmail | |
| Tedarikçi Referansı | supplierQuote.supplierReference | |
| Miktar | quantity | |
| Birim Fiyat | unitPrice + currency | |
| Toplam Fiyat | totalPrice + currency | |
| Teslimat Deposu | deliveryWarehouse.name | |
| Depo Kodu | deliveryWarehouse.code | |
| Depo Adresi | deliveryWarehouse.address | |
| Depo Sorumlusu | deliveryWarehouse.managerName | |
| Beklenen Teslimat | expectedDeliveryDate | formatDate |
| Gerçekleşen Teslimat | actualDeliveryDate | varsa |
| Oluşturulma | createdAt | |
| Son Güncelleme | updatedAt | |
| Notlar | notes | varsa |

## Durum güncelleme butonları
| Mevcut durum | Butonlar | Yeni durum |
|--------------|----------|------------|
| PENDING | Onayla, Reddet, İptal Et | CONFIRMED, REJECTED, CANCELLED |
| CONFIRMED | Sevk Et, İptal Et | SHIPPED, CANCELLED |
| PENDING veya CONFIRMED değilse | Stoğa Kaydet (modal) | — |

**Not:** SHIPPED için listede Stoğa Kaydet varken Detail'de `else` dalında Stoğa Kaydet gösterilir (PENDING/CONFIRMED dışı tüm durumlar).

## StockEntryModal
PurchaseOrders ile aynı component. SHIPPED iken submit → DELIVERED + comment "Stok girişi tamamlandı"

## Butonlar
| Buton | Aksiyon |
|-------|---------|
| Geri | `/purchase-orders` |
| Onayla/Reddet/Sevk/İptal/Stoğa Kaydet | handleStatusUpdate veya modal |

## API
| Metod | HTTP | Path |
|-------|------|------|
| getOrderById | GET | `/api/v1/purchase-orders/{id}` |
| updateOrderStatus | PUT | `/api/v1/purchase-orders/{id}/status?status&comment` |

Stok: POST `/api/warehouse-stocks/movements`, POST `/api/v1/stock-items`

## Validasyon
Modal içi: depo seçimi, miktar > 0, demirbaş seri no zorunlu (StockEntryModal).

## Edge case'ler
1. **Stoğa Kaydet görünürlük:** DELIVERED/CANCELLED durumda da buton görünebilir (else dalı) — muhtemel UX bug.
2. DRAFT sipariş UI akışı tanımsız.
3. statusUpdateLoading butonları disable eder.
4. comment parametresi sadece stok girişinde gönderilir; manuel status update'te yok.

## Mobil notlar
- Durum timeline (PENDING→CONFIRMED→SHIPPED→DELIVERED)
- Primary CTA duruma göre değişir
- Stok girişi multi-step wizard (depo → miktar → seri no)
