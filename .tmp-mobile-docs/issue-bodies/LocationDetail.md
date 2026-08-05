**Route:** `/locations/:id`
**Parent:** ZW-55
**Etiket:** MOBILE

## Özet
Konum metadata, bu konumdaki ürünler, aktif/iade edilebilir zimmetler.

## Route & Security
- **Route:** `/locations/:id`
- **CapabilityRoute:** `INVENTORY_VIEW`
- Düzenle/Sil butonları yetki kontrolsüz; edit route MANAGE ister

## Tip
Detay sayfası

## Amaç
Konum bazlı envanter ve zimmet görünümü.

## Konum bilgi kartı (dl)
| Alan | İçerik |
|------|--------|
| Konum Adı | name |
| Tam yol | path |
| Seviye | Üst / Alt / Detay konum |
| Üst konum | parentName (varsa) |
| Açıklama | description |
| Oluşturulma Tarihi | createdAt |
| Son Güncelleme | updatedAt |

## Butonlar
Düzenle `/locations/edit/:id` | Sil (confirm) | Geri `/locations`

## Konumdaki Ürünler — ProductListPanel
title="Konumdaki Ürünler"  
API: GET `/api/locations/:locationId/products`  
onRefresh: loadProducts

## Konum Zimmetleri — AssignmentManageSection
title="Konum Zimmetleri"  
showProductColumn=true  
Filtre: ACTIVE veya canBeReturned  
API: assignmentService.getAssignmentsByLocationId

AssignmentManageSection aksiyonları (ProductDetail zimmet tablosu ile paralel):
Form indir, fotoğraf yükle, imzalı yükle, iade, iptal, belge indirmeleri

## API özeti
GET `/api/locations/:id`  
GET `/api/locations/:id/products`  
GET assignments by location  
DELETE `/api/locations/:id`

## Navigasyon
LocationList → Detay  
Ürün satırı → ProductDetail

## Edge cases
- Geçersiz id hata ekranı
- Silme başarılı → liste
- Zimmet listesi filtrelenmiş (sadece aktif/iade edilebilir)

## Mobil notlar
- Üst 3 buton mobilde wrap
- ProductListPanel + geniş zimmet tablosu scroll
- Sil kırmızı buton confirm native

[REDACTED]

---

## Ek kaynak analizi (explore)

## LocationDetail

- **Route:** `/locations/:id` — `INVENTORY_VIEW`
- **Tip:** detail
- **Alanlar:** ad, path, seviye, üst konum, açıklama, created/updated
- **ProductListPanel:** konum ürünleri
- **AssignmentManageSection:** ACTIVE veya `canBeReturned` zimmetler; `showProductColumn`
- **Butonlar:** Düzenle, Sil, Geri (capability UI yok)
- **APIs:** `GET /api/locations/:id`, `GET .../:id/products`, `GET /api/v1/assignments/location/:id`

---