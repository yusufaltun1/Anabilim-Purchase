**Route:** `/locations/edit/:id`
**Parent:** ZW-55
**Etiket:** MOBILE

## Özet
Konum adı, üst hiyerarşi, açıklama, varsayılan güncelleme.

## Route & Security
- **Route:** `/locations/edit/:id`
- **CapabilityRoute:** `INVENTORY_MANAGE`

## Tip
Form sayfası

## Amaç
Mevcut konumu taşımak veya metadata güncellemek.

## TÜM alanlar
| Alan | Zorunlu | Not |
|------|---------|-----|
| Üst konum | Hayır | LocationHierarchyPickers; excludeIds=[locationId] |
| Seviye | — | önizleme |
| Konum adı | Evet | |
| Açıklama | Hayır | |
| Varsayılan konum | Hayır | isDefault |

## Butonlar
Geri `/locations` | İptal | Güncelle

## API
GET `/api/locations/:id` + GET all locations  
PUT `/api/locations/:id`

## Navigasyon
Başarı → `/locations`

## Edge cases
- Kendini parent yapma excludeIds ile engellenir
- level > 3 validasyon

## Mobil notlar
Create ile aynı

---

---

## Ek kaynak analizi (explore)

## LocationEdit

- **Route:** `/locations/edit/:id` — `INVENTORY_MANAGE`
- **Tip:** edit
- **Alanlar:** Create ile aynı; pickers `excludeIds=[self]`
- **APIs:** `GET/PUT /api/locations/:id`

---