# StockManagement — Mobil Analiz (Kaynak: purchase-fe)

## Özet
Ürün bazlı toplam stok listesi. Sunucu sayfalama (20/sayfa), düşük stok/pasif durum rozetleri, ürün detay navigasyonu.

## Route & Güvenlik
| Route | `/stock-management` |
| Koruma | `PrivateRoute` |
| Capability | Yok (Inventory route'larından farklı — ek capability yok) |

## Filtreler
**Yok** — arama, kategori veya depo filtresi implementasyonu yok.

## Tablo kolonları
| Kolon | Alan | Format |
|-------|------|--------|
| Ürün | name, code, description | çok satır |
| Kategori | category | |
| Toplam Stok | totalStock + unit | |
| Depo Sayısı | warehouseCount | "{n} depo" |
| Durum | active, hasLowStock | Pasif / Düşük Stok / Normal rozeti |
| Son Hareket | lastMovementDate | formatDate veya '-' |
| İşlemler | Detay | `/stock-management/{id}` |

## Durum rozeti mantığı
1. `!active` → Pasif (gri)
2. `hasLowStock` → Düşük Stok (kırmızı)
3. else → Normal (yeşil)

## Sayfalama
- pageSize=20 (sabit)
- currentPage state → useEffect reload
- Tüm sayfa numaraları listelenir (totalPages kadar buton)
- Metin: "{totalElements} sonuçtan X-Y arası"

## Butonlar
| Buton | Aksiyon |
|-------|---------|
| Detay | navigate `/stock-management/{productId}` |

**Not:** Başlıkta yeni stok girişi / export butonu yok.

## API
| Metod | HTTP | Path | Query |
|-------|------|------|-------|
| getProductStocksList | GET | `/api/warehouse-stocks/products` | page, size |

Response: `ProductStockListResponse` (Spring page: content, totalPages, totalElements, first, last)

## Edge case'ler
1. Filtre/arama yok — büyük katalogda gezinme zor.
2. Pagination tüm sayfa butonları render — çok sayfa varsa UI sorunu.
3. product id = stock list item `id` (ProductStock.id).
4. Boş liste: "Stok bilgisi bulunamadı".

## Mobil notlar
- Arama bar + kategori/düşük stok filtresi eklenmeli
- Infinite scroll tercih
- Düşük stok badge prominent
- Detay → push navigation
