**Route:** `/locations/create`
**Parent:** ZW-55
**Etiket:** MOBILE

## Özet
Yeni konum; üst seçimine göre 1–3. seviye.

## Route & Security
- **Route:** `/locations/create`
- **CapabilityRoute:** `INVENTORY_MANAGE`

## Tip
Form sayfası

## Amaç
Hiyerarşik konum eklemek; varsayılan konum işaretlemek.

## TÜM alanlar
| Alan | Zorunlu | Tip |
|------|---------|-----|
| Üst konum seçimi | Hayır | LocationHierarchyPickers (root, middle; leaf yok) |
| Oluşturulacak seviye | — | read-only önizleme |
| Konum adı | Evet | text |
| Açıklama | Hayır | textarea (boşsa name kullanılır payload’da) |
| Bu seviyede varsayılan konum | Hayır | checkbox isDefault |

## Butonlar
Geri | İptal | Kaydet

## API
POST `/api/locations` — body: name, description, parentId, isDefault

## Navigasyon
Başarı 1.5s → `/locations`

## Edge cases
- targetLevel > 3 hata
- Boş üst = 1. seviye kök
- Varsayılan işaretlenince aynı seviyede diğerleri kaldırılır (backend)

## Mobil notlar
- max-w-3xl form mobilde tam genişlik
- Seviye önizleme banner okunaklı

---

---

## Ek kaynak analizi (explore)

## LocationCreate

- **Route:** `/locations/create` — `INVENTORY_MANAGE`
- **Tip:** create
- **Alanlar:** Üst konum pickers (root+middle, leaf yok), hedef seviye göstergesi, Ad*, Açıklama (boşsa ad kopyalanır), Varsayılan checkbox
- **Validation:** ad; targetLevel ≤ 3
- **APIs:** `GET/POST /api/locations`

---