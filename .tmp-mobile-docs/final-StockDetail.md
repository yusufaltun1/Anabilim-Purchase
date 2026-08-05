# StockDetail — Mobil Analiz (Kaynak: purchase-fe)

## Özet
Tek ürünün stok detayı: ürün bilgileri, depo bazlı stok dağılımı, son hareketler tablosu. Salt okunur — stok girişi/çıkışı bu sayfada yok.

## Route & Güvenlik
| Route | `/stock-management/:id` |
| Param | `id` = productId |
| Koruma | `PrivateRoute` |

## Üst bilgi
- Başlık: product.name
- Meta: Kod, Kategori, Toplam stok rozeti (totalStock + unit)
- Geri → `/stock-management`

## Ürün bilgi kartı
| Alan | Kaynak |
|------|--------|
| Ürün Adı | product.name |
| Ürün Kodu | product.code |
| Açıklama | product.description |
| Kategori | product.category |
| Birim | product.unit |

## Depo Stokları tablosu
| Kolon | Alan |
|-------|------|
| Depo | warehouse.name, warehouse.code |
| Mevcut Stok | currentStock + unit |
| Min Stok | minStock |
| Max Stok | maxStock |
| Durum | isLowStock → Düşük Stok / Normal |
| Son Hareket | lastMovementDate (formatDate) |

## Son Hareketler tablosu
| Kolon | Alan | Format |
|-------|------|--------|
| Depo | warehouseStock.warehouse.name/code | |
| Hareket Tipi | movementType | IN→Giriş, OUT→Çıkış, TRANSFER, ADJUSTMENT + renk rozet |
| Miktar | quantity | OUT '-' prefix |
| Referans | referenceType + referenceId | Türkçe map + #id |
| Notlar | notes | |
| Tarih | createdAt | formatDate |

**referenceType Türkçe:** PURCHASE_ORDER→Satın Alma Siparişi, SALES_ORDER, TRANSFER, ADJUSTMENT, MANUAL→Manuel, ASSIGNMENT→Zimmet

## API
| Metod | Path |
|-------|------|
| getProductStockDetail | GET `/api/warehouse-stocks/product/{productId}/detail` |

Response: `ProductStockDetail` { product, totalStock, warehouseStocks[], recentMovements[] }

## Butonlar
Sadece **Geri**. Stok hareketi oluşturma/düzenleme yok.

## Edge case'ler
1. recentMovements boş olabilir — boş tablo.
2. ASSIGNMENT_RETURN, ASSIGNMENT_CANCEL tip map'te yok — ham gösterilir.
3. warehouseStocks boş — ürün hiç depoda yok.
4. Hata: toast, stockDetail null → "Stok detayı bulunamadı".

## Mobil notlar
- Section: Özet → Depolar → Hareketler
- Depo satırına tıklayınca depo detayına deep link
- Hareket listesi timeline UI alternatif
