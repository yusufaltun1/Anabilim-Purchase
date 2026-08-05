## Özet
Mevcut kategori güncelleme; kod alanı yok (create’teki code edit’te değiştirilmez — formda code alanı hiç yok).

## Route & Security
- **Route:** `/categories/edit/:id`
- **CapabilityRoute:** `INVENTORY_MANAGE`

## Tip
Form sayfası

## Amaç
Kategori metadata ve stok varsayılanlarını güncellemek; aktif/pasif yapmak.

## TÜM form alanları
| Alan | Zorunlu | Create farkı |
|------|---------|--------------|
| Kategori Adı | Evet | — |
| Ürün Tipi | Evet | — |
| Ölçü birimi | Evet | — |
| Min. miktar | Evet | — |
| Max. miktar | Evet | — |
| Para birimi | Evet | — |
| Bildirim eşiği | Hayır | — |
| Talep edilebilir | Hayır | — |
| Aktif | Hayır | **Sadece edit** (`isActive`) |
| Açıklama | Hayır | — |

**Not:** Kategori kodu edit formunda gösterilmez/değiştirilmez.

## Butonlar
Geri → detail | İptal | Kaydet

## API
GET `/api/categories/:id` | PUT `/api/categories/:id`

## Navigasyon
Başarı → `/categories/:id`

## Edge cases
- Loading spinner name yokken

## Mobil notlar
Create ile aynı layout

---