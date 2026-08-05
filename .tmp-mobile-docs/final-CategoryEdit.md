# CategoryEdit — Mobil Analiz (Kaynak: purchase-fe)

## Özet
Mevcut kategori düzenleme. Kod alanı **yok** (değiştirilemez). isActive checkbox eklenmiş.

## Route & Güvenlik
| Route | `/categories/edit/:id` |
| Koruma | `PrivateRoute` + `CapabilityRoute INVENTORY_MANAGE` |
| Başarı | 1.5sn → `/categories/{id}` |

## Form alanları
| Alan | name | Zorunlu | Not |
|------|------|---------|-----|
| Kategori Adı | name | Evet | |
| Ürün Tipi | productType | Evet | |
| Ölçü birimi | unitOfMeasure | Evet | |
| Min. miktar | minQuantity | Evet | |
| Max. miktar | maxQuantity | Evet | |
| Para birimi | currency | Evet | |
| Bildirim eşiği | minStockNotifyAt | Hayır | |
| Talep edilebilir | requestable | checkbox | |
| Aktif | isActive | checkbox | |
| Açıklama | description | Hayır | |

**Create'ten fark:** code alanı yok; isActive var.

## Yükleme
`getCategoryById(id)` → form doldur; initial spinner name boşken.

## Butonlar
Geri → `/categories/{id}`; İptal; Kaydet

## API
| Metod | Path |
|-------|------|
| getCategoryById | GET `/api/categories/{id}` |
| updateCategory | PUT `/api/categories/{id}` |

Body: `UpdateCategoryRequest`

## Validasyon
name boş → "Kategori adı zorunludur"

## Edge case'ler
1. Kod edit'te değiştirilemez.
2. API active/isActive mapping categoryService'te.
3. Başarı redirect detail sayfasına (list değil).

## Mobil notlar
Create ile aynı + Aktif toggle
