# PurchaseOrders — Mobil Analiz (Kaynak: purchase-fe)

## Özet
Satın alma siparişleri operasyon listesi. Durum filtresi, detay navigasyonu, SHIPPED siparişlerde stok girişi modal.

## Route & Güvenlik
| Route | `/purchase-orders` |
| Koruma | `PrivateRoute` |
| Capability | Yok |

## Filtreler
| Filtre | Değerler |
|--------|----------|
| Durum select | ALL, PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED, REJECTED |

(DRAFT UI'da yok)

## Tablo kolonları
| Kolon | Alan |
|-------|------|
| Sipariş Kodu | orderCode |
| Ürün | supplierQuote.product.name/code |
| Tedarikçi | supplierQuote.supplier.companyName |
| Miktar | quantity |
| Birim Fiyat | unitPrice + currency |
| Toplam Fiyat | totalPrice + currency |
| Durum | status rozeti |
| Teslim Tarihi | expectedDeliveryDate |
| İşlemler | Detay; SHIPPED ise Stoğa Kaydet |

## Butonlar & Aksiyonlar
| Aksiyon | Koşul | Davranış |
|---------|-------|----------|
| Detay | her zaman | `/purchase-orders/{id}` |
| Stoğa Kaydet | status === 'SHIPPED' | StockEntryModal aç |

## StockEntryModal (özet)
- Depo seçimi: getActiveWarehouses
- Teslim alınan miktar, notlar
- FIXED_ASSET / SEMI_FIXED_ASSET: seri no + resim (adet başına)
- CONSUMABLE: tek stok hareketi IN
- Başarı SHIPPED→DELIVERED status update

## API
| Metod | Path |
|-------|------|
| getAllOrders | GET `/api/v1/purchase-orders` |
| getOrdersByStatus | GET `/api/v1/purchase-orders/status/{status}` |

Modal ek API: `/api/warehouses/active`, `/api/warehouse-stocks/movements`, `/api/v1/stock-items`, PUT status

## Edge case'ler
1. Stoğa Kaydet sadece listede SHIPPED için; Detail'de farklı koşul var.
2. Fiyat formatı locale kullanmıyor (raw number).
3. Yeni sipariş oluşturma butonu yok.
4. supplierQuote null fallback metinleri.

## Mobil notlar
- Durum badge + primary action (Stoğa Kaydet) prominent
- Modal → full-screen stok girişi flow
- Push notification teslim hatırlatıcı (opsiyonel)
