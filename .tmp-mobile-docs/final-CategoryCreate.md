# CategoryCreate — Mobil Analiz (Kaynak: purchase-fe)

## Özet
Yeni envanter kategorisi oluşturma. Ürün tipi, stok varsayılanları (birim, min/max, para birimi), bildirim eşiği ve talep edilebilir flag.

## Route & Güvenlik
| Route | `/categories/create` |
| Koruma | `PrivateRoute` + `CapabilityRoute capability="INVENTORY_MANAGE"` |
| Başarı | 1.5sn mesaj → `/categories` |

## Form alanları
| Alan | name | Zorunlu | Varsayılan |
|------|------|---------|------------|
| Kategori Adı | name | Evet | '' |
| Kategori Kodu | code | Evet | name'den auto (uppercase, `_`) |
| Ürün Tipi | productType | Evet | CONSUMABLE |
| Ölçü birimi | unitOfMeasure | Evet | PIECE (DEFAULT_CATEGORY_STOCK) |
| Min. miktar | minQuantity | Evet | 1 |
| Max. miktar | maxQuantity | Evet | 100 |
| Para birimi | currency | Evet | TRY (TRY/USD/EUR) |
| Bildirim eşiği | minStockNotifyAt | Hayır | undefined |
| Talep edilebilir | requestable | Hayır | false |
| Açıklama | description | Hayır | '' |

**Ürün tipi seçenekleri:** Sarf Malzemesi, Demirbaş, Yarı Demirbaş, Yazılım, Diğer, Ofis Malzemeleri, Mobilya, Donanım

**Ölçü birimi:** PIECE/Adet, BOX/Kutu, PACKAGE/Paket, KILOGRAM, LITER, METER, SET, PAIR, ROLL, BOTTLE

## Butonlar
Geri, İptal → `/categories`; Kaydet → create

## API
| Metod | HTTP | Path |
|-------|------|------|
| createCategory | POST | `/api/categories` |

Payload: minStockNotifyAt null olabilir; requestable, unitOfMeasure, minQuantity, maxQuantity, currency normalize edilir.

## Validasyon
| Kural | Mesaj |
|-------|-------|
| name/code boş | Kategori adı ve kodu zorunludur |
| !productType | Ürün tipi seçilmelidir |

## Edge case'ler
1. isActive create'te gönderilmez (backend default).
2. minStockNotifyAt boş → null API'ye.
3. requestable true → mail bilgiislem@anabilim.k12.tr (UI metni).
4. Kod generate Create'te ad değişince güncellenir.

## Mobil notlar
- Picker'lar için bottom sheet
- Min/max numeric stepper
- Talep edilebilir açıklama tooltip
