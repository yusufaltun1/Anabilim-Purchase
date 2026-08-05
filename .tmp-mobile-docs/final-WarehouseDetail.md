# WarehouseDetail — Mobil Analiz (Kaynak: purchase-fe)

## Özet
Depo detayı + depo stok tablosu + stok hareketleri modal. Stok güncelleme/hareket fonksiyonları tanımlı ama UI'da stok güncelleme formu **render edilmiyor**.

## Route & Güvenlik
| Route | `/warehouses/:id` |
| Koruma | `PrivateRoute` |

## Depo bilgi alanları
| Etiket | Alan |
|--------|------|
| Depo Kodu | code |
| Adres | address |
| Depo Sorumlusu | managerName |
| İletişim | phone, email |
| Durum | active → Aktif/Pasif |

## Stok tablosu kolonları
| Kolon | Alan |
|-------|------|
| Ürün | product.name, product.code |
| Stok Miktarı | currentStock + product.unit |
| Min. Stok | minStock |
| Max. Stok | maxStock |
| Son Hareket | lastMovementDate (formatDate) veya '-' |
| İşlemler | **Hareketler** butonu |

## Stok hareketleri modal
**Tetikleyici:** Hareketler → `setSelectedStock`, `showMovements=true`

| Kolon | Alan |
|-------|------|
| Tarih | createdAt |
| Miktar | +/- quantity + unit (IN yeşil, OUT kırmızı) |
| Hareket Tipi | Giriş/Çıkış |
| Referans | referenceType #referenceId |
| Açıklama | notes |

Modal pagination: page size 10, totalPages backend'den gelmiyorsa **varsayılan 1**.

## Butonlar
| Buton | Aksiyon |
|-------|---------|
| Geri | `/warehouses` |
| Kapat (modal) | modal state reset |

## Tanımlı ama UI'da kullanılmayan handler'lar
- `handleUpdateStock(stockId, minStock, maxStock)` → PUT warehouse-stocks
- `handleCreateStockMovement(...)` → POST movements

## API
| Metod | Path |
|-------|------|
| getWarehouseById | GET `/api/warehouses/{id}` |
| getWarehouseStocks | GET `/api/warehouse-stocks/warehouse/{warehouseId}` |
| getStockMovements | GET `/api/warehouse-stocks/{stockId}/movements?page&size` |
| updateStock | PUT `/api/warehouse-stocks/{stockId}` |
| createStockMovement | POST `/api/warehouse-stocks/movements` |

## Edge case'ler
1. Stok min/max düzenleme UI eksik.
2. Hareket pagination backend totalPages desteklemiyor olabilir.
3. Boş stok listesi — tablo boş tbody.
4. referenceType ham enum gösterilir (PURCHASE_ORDER vb.).

## Mobil notlar
- Depo info card + stok list (accordion)
- Hareketler → full-screen modal veya ayrı ekran
- Min/max edit form eklenmeli (web'de de eksik)
