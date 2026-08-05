**Route:** `/categories/create`
**Parent:** ZW-55
**Etiket:** MOBILE

## Özet
Yeni kategori oluşturma formu; stok varsayılanları ve bildirim eşiği.

## Route & Security
- **Route:** `/categories/create`
- **CapabilityRoute:** `INVENTORY_MANAGE`

## Tip
Form sayfası

## Amaç
Ürün tipi ve stok varsayılanlarıyla kategori tanımlamak.

## TÜM form alanları
| Alan | name | Zorunlu | Not |
|------|------|---------|-----|
| Kategori Adı | name | Evet | Değişince code otomatik üretilir |
| Kategori Kodu | code | Evet | uppercase |
| Ürün Tipi | productType | Evet | CATEGORY_PRODUCT_TYPE_OPTIONS |
| Ölçü birimi | unitOfMeasure | Evet | UnitOfMeasureLabels |
| Min. miktar | minQuantity | Evet | default 1 |
| Max. miktar | maxQuantity | Evet | default 100 |
| Para birimi | currency | Evet | TRY, USD, EUR |
| Bildirim eşiği | minStockNotifyAt | Hayır | kalan adet; günlük mail/bildirim |
| Talep edilebilir | requestable | Hayır | checkbox; mail bilgiislem@anabilim.k12.tr |
| Açıklama | description | Hayır | textarea |

## Butonlar
Geri | İptal | Kaydet

## API
POST `/api/categories`

## Navigasyon
Başarı (1.5s) → `/categories`

## Edge cases
- name/code boş validasyon
- productType zorunlu

## Mobil notlar
- 2 kolon grid sm breakpoint’te tek sütun
- Checkbox + uzun açıklama metni wrap

---

---

## Ek kaynak analizi (explore)

## CategoryCreate

- **Route:** `/categories/create` — `INVENTORY_MANAGE`
- **Tip:** create
- **Alanlar:** Ad*, Kod* (addan auto), Ürün tipi*, Ölçü birimi*, Min/Max miktar*, Para birimi* (TRY/USD/EUR), Bildirim eşiği, Talep edilebilir checkbox, Açıklama
- **APIs:** `POST /api/categories`
- **Edge:** 1.5s sonra listeye yönlendir

---