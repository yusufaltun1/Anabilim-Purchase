# AccountingOrders — Mobil Analiz (Kaynak: purchase-fe)

## Özet
Muhasebe görünümü — satın alma siparişlerinin finansal özeti. Durum filtresi, özet kartlar, detaylı tablo ve genel toplam footer.

## Route & Güvenlik
| Route | `/accounting` |
| Koruma | `PrivateRoute` + `CapabilityRoute capability="ACCOUNTING_VIEW"` |
| Yetkisiz | `/dashboard` redirect |

## Filtreler
| Filtre | UI | Değerler | API |
|--------|-----|----------|-----|
| Durum | select (w-48) | ALL, PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED, REJECTED | ALL→getAllOrders; diğer→getOrdersByStatus |

**Not:** DRAFT filtresi UI'da yok.

`useEffect([selectedStatus])` → loadOrders

## Özet kartlar
| Kart | Hesap |
|------|-------|
| Toplam Sipariş | orders.length |
| Teslim Edilen | status === 'DELIVERED' count |
| Toplam Tutar | sum(totalPrice), currency: orders[0]?.supplierQuote?.currency \|\| 'TL' |

## Tablo kolonları
| Kolon | Alan | Format |
|-------|------|--------|
| Sipariş No | orderCode | |
| Ürün | supplierQuote.product.name/code | — yoksa |
| Tedarikçi | supplierQuote.supplier.companyName | |
| Miktar | quantity | sağ hizalı |
| Birim Fiyat | unitPrice | tr-TR 2 decimal + currency |
| Toplam | totalPrice | font-semibold |
| Durum | status | Türkçe label + renk rozet |
| Beklenen Teslimat | expectedDeliveryDate | formatDate |
| Gerçek Teslimat | actualDeliveryDate | formatDate veya — |

## Durum etiketleri
DRAFT→Taslak, PENDING→Beklemede, CONFIRMED→Onaylandı, SHIPPED→Sevk Edildi, DELIVERED→Teslim Edildi, CANCELLED→İptal, REJECTED→Reddedildi

## Footer
Genel Toplam: totalAmount (filtrelenmiş liste üzerinden)

## Butonlar
**Yok** — satır tıklama/detay navigasyonu yok (read-only liste).

## API (`purchase-order.service.ts`, base `/api/v1/purchase-orders`)
| Metod | Path |
|-------|------|
| getAllOrders | GET `/api/v1/purchase-orders` |
| getOrdersByStatus | GET `/api/v1/purchase-orders/status/{status}` |

## Edge case'ler
1. Karışık para birimlerinde toplam tek currency varsayımı (ilk sipariş currency).
2. Detay sayfasına link yok.
3. Export/CSV yok.
4. DRAFT siparişler ALL'da gelir ama filtrelenemez.
5. supplierQuote null alanlar — gösterim '—'.

## Mobil notlar
- Özet kartlar horizontal scroll
- Tablo → kart (sipariş no, tutar, durum prominent)
- Durum filter chips
- Detay deep link eklenebilir
