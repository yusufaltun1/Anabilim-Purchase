**Route:** `/categories/:id`
**Parent:** ZW-55
**Etiket:** MOBILE

## Özet
Kategori detayı: stok KPI kartları, varsayılanlar, ürün listesi (`CategoryProductListSection`), depo özeti (sarf tipleri).

## Route & Security
- **Route:** `/categories/:id`
- **CapabilityRoute:** `INVENTORY_VIEW`
- Yeni ürün: `INVENTORY_MANAGE` (headerAction)
- **Düzenle butonu yetki kontrolsüz** (route MANAGE ister)

## Tip
Detay + gömülü ürün listesi

## Amaç
Kategori bazlı envanter görünümü; düşük stok uyarısı; kategorideki ürünlere erişim.

## Üst bilgi
- name, code · productType
- Talep edilebilir chip + bilgiislem@anabilim.k12.tr
- Düşük stok uyarısı (availableQuantity ≤ minStockNotifyAt)

## KPI kartları (4)
Ürün sayısı | Toplam (stok) | Atanan | Kalan

## Stok varsayılanları dl
Ölçü birimi | Min. miktar | Max. miktar | Para birimi

## Açıklama
Varsa ayrı kart

## CategoryProductListSection
ProductListPanel tabanlı; `showAssetFilters` = FIXED_ASSET veya IT_HARDWARE  
Filtreler ProductList ile benzer (kategori filtresi yok — zaten kategori scope)  
Pagination 10 default  
headerAction: Yeni ürün → `/products/create`

## Depo özeti tablosu (sarf tipleri; demirbaşta gizli)
Depo | Toplam | Atanan | Kalan

## Butonlar
Geri `/categories` | Düzenle `/categories/edit/:id`

## API
GET `/api/categories/:id/detail`  
GET `/api/products/category/:categoryId`

## Edge cases
- Demirbaş kategoride warehouseBreakdown gizli
- Düzenle VIEW kullanıcıda görünür, route redirect

## Mobil notlar
- KPI 2×2 grid mobil
- Ürün listesi ProductList mobil notları geçerli

---

---

## Ek kaynak analizi (explore)

## CategoryDetail

- **Route:** `/categories/:id` — `INVENTORY_VIEW`
- **Tip:** detail
- **Özet kartlar:** ürün sayısı, toplam, atanan, kalan
- **Stok varsayılanları:** unit/min/max/currency
- **CategoryProductListSection:** ProductList benzeri filtreler; `showAssetFilters` sadece FIXED_ASSET/IT_HARDWARE
- **Depo özeti tablosu:** demirbaş tipte **gizli**; Depo | Toplam | Atanan | Kalan
- **Butonlar:** Geri, Düzenle (capability UI yok), Yeni ürün (`INVENTORY_MANAGE`)
- **APIs:** `GET /api/categories/:id/detail`, `GET /api/products/category/:id`
- **Edge:** lowStock banner; requestable badge + mail

---