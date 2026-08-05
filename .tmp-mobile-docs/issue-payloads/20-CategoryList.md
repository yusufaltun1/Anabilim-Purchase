**Route:** `/categories`
**Parent:** ZW-55
**Etiket:** MOBILE

## Özet
Kategori envanter özet tablosu; arama, aktif filtresi, CRUD kısayolları.

## Route & Security
- **Route:** `/categories`
- **CapabilityRoute:** `INVENTORY_VIEW`
- Düzenle/Sil/Yeni: `INVENTORY_MANAGE` (UI içi)

## Tip
Liste sayfası

## Amaç
Kategorileri stok metrikleriyle görmek; detaya/düzenlemeye gitmek.

## Filtreler
| Alan | Tip | Davranış |
|------|-----|----------|
| Arama | text + Enter veya Ara | API search veya client filter (name, code) |
| Sadece aktif | checkbox | getActiveCategories vs getAllCategories |

## Tablo sütunları
| Sütun | İçerik |
|-------|--------|
| Kategori | name, code, Aktif/Pasif rozeti |
| Tip | productType label |
| Talep | “Talep edilebilir” chip veya — |
| Ürün | activeProductCount |
| Toplam | totalQuantity |
| Atanan | assignedQuantity |
| Kalan | availableQuantity (minStockNotifyAt altında kırmızı) |
| İşlem | Düzenle, Sil (MANAGE) |

Satır tıklama → `/categories/:id`

## Butonlar
| Buton | Yetki | Route |
|-------|-------|-------|
| Yeni Oluştur | MANAGE | `/categories/create` |
| Düzenle | MANAGE | `/categories/edit/:id` |
| Sil | MANAGE | confirm → deleteCategory |

## API
| İşlem | Endpoint |
|-------|----------|
| Aktif | GET `/api/categories/active` |
| Tümü | GET `/api/categories/all` |
| Arama | GET `/api/categories/search?name=` |
| Sil | DELETE `/api/categories/:id` |

## Navigasyon
Envanter menüsü → Kategoriler

## Edge cases
- location.key değişince liste yenilenir
- Silme hata mesajı genel

## Mobil notlar
- 8 sütunlu tablo mobilde kaydırmalı
- Kalan stok kırmızı vurgu küçük ekranda önemli
- Satır tıklama vs işlem butonları stopPropagation

---

---

## Ek kaynak analizi (explore)

## CategoryList

- **Route:** `/categories` — `INVENTORY_VIEW`
- **Tip:** list
- **Filtre:** arama (Enter/Ara → API search), “Sadece aktif” checkbox
- **Tablo:** Kategori(ad+kod+aktif) | Tip | Talep | Ürün | Toplam | Atanan | Kalan (eşiğin altı kırmızı) | İşlem
- **Aksiyonlar:** satır → detay; Düzenle/Sil (`INVENTORY_MANAGE`); Yeni Oluştur
- **APIs:** `GET /api/categories/active|all`, `GET /api/categories/search?name=`, `DELETE /api/categories/:id`
- **Edge:** client filter + server search birlikte; kalan ≤ minStockNotifyAt highlight

---