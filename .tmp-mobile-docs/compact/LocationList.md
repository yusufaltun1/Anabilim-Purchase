**Route:** `/locations`
**Parent:** ZW-55
**Etiket:** MOBILE

## Özet
3 seviyeli konum ağacı düzleştirilmiş tablo; detay, düzenle, sil.

## Route & Security
- **Route:** `/locations`
- **CapabilityRoute:** `INVENTORY_VIEW`
- **Yeni Konum Ekle** butonu sayfada yetki kontrolsüz; create route `INVENTORY_MANAGE`
- Sil/Düzenle butonları yetki kontrolsüz; API/backend yetki belirler

## Tip
Liste sayfası

## Amaç
Konum hiyerarşisini görmek ve yönetmek.

## Tablo sütunları
| Sütun | İçerik |
|-------|--------|
| Seviye | Üst / Alt / Detay konum badge |
| Konum | Girinti + └ + name + Varsayılan chip |
| Tam yol | path |
| Açıklama | description veya — |
| İşlem | Detay, Düzenle, Sil |

## Butonlar
| Buton | Route/Aksiyon |
|-------|---------------|
| Yeni Konum Ekle | `/locations/create` |
| Detay | `/locations/:id` |
| Düzenle | `/locations/edit/:id` |
| Sil | confirm → DELETE |

## API
GET `/api/locations` | DELETE `/api/locations/:id`

## Navigasyon
Envanter → Konumlar

## Edge cases
- Boş liste mesajı
- Silme backend parent/usage hatası

## Mobil notlar
- Girintili konum adı mobilde truncate
- İşlem linkleri touch-friendly

---

---

## Ek kaynak analizi (explore)

## LocationList

- **Route:** `/locations` — `INVENTORY_VIEW`
- **Tip:** list (ağaç flatten)
- **Tablo:** Seviye | Konum (+Varsayılan badge, indent) | Tam yol | Açıklama | Detay/Düzenle/Sil
- **Buton:** Yeni Konum Ekle (UI’da capability yok; create route MANAGE)
- **APIs:** `GET/DELETE /api/locations[/:id]`
- **Edge:** max 3 seviye hiyerarşi

---