# LocationCreate — Mobil Analiz (Kaynak: purchase-fe)

## Özet
Hiyerarşik konum (max 3 seviye) oluşturma. Üst konum seçimi, varsayılan konum flag.

## Route & Güvenlik
| Route | `/locations/create` |
| Koruma | `PrivateRoute` + `CapabilityRoute INVENTORY_MANAGE` |
| Başarı | 1.5sn → `/locations` |

## Form alanları
| Alan | name | Zorunlu | Not |
|------|------|---------|-----|
| Üst konum (root) | parentRootId | Hayır | LocationHierarchyPickers |
| Üst konum (middle) | parentMiddleId | Hayır | İkisi de seçilirse 3. seviye |
| Konum adı | name | Evet | |
| Açıklama | description | Hayır | boşsa name trim kullanılır |
| Varsayılan konum | isDefault | checkbox | aynı seviyede tek varsayılan |

**Seviye hesabı:** `newLocationLevel(parentId, allLocations)` — parent yok→1, root seç→2, root+middle→3

**parentId payload:** `resolveParentForNewLocation(rootId, middleId)` → middleId ?? rootId ?? null

## LocationHierarchyPickers
- rootId, middleId state
- autoSelectDefaults: false (create)
- Mount'ta getAllLocations ile seviye bilgisi

## Butonlar
Geri, İptal → `/locations`; Kaydet

## API
| Metod | Path | Body |
|-------|------|------|
| getAllLocations | GET | `/api/locations` |
| createLocation | POST | `/api/locations` | name, description, parentId, isDefault |

## Validasyon
| Kural | Mesaj |
|-------|-------|
| name boş | Konum adı zorunludur |
| targetLevel > 3 | En fazla 3 seviye konum tanımlanabilir |

## Edge case'ler
1. Açıklama boş → API'ye name kopyalanır.
2. isDefault true: aynı üst altında diğer varsayılanlar backend'de kaldırılır (UI açıklaması).
3. Seviye etiketleri: Üst konum / Alt konum / Detay konum.

## Mobil notlar
- Cascading picker (3 seviye)
- Seviye önizleme badge
- Varsayılan switch + açıklama
