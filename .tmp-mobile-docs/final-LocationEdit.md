# LocationEdit — Mobil Analiz (Kaynak: purchase-fe)

## Özet
Mevcut konum düzenleme; üst hiyerarşi değiştirilebilir, kendi id hariç tutulur (döngü önleme).

## Route & Güvenlik
| Route | `/locations/edit/:id` |
| Koruma | `PrivateRoute` + `CapabilityRoute INVENTORY_MANAGE` |
| Başarı | 1.5sn → `/locations` |

## Form alanları
LocationCreate ile aynı yapı:
| Alan | Not |
|------|-----|
| parentRootId, parentMiddleId | `parentPickersForLocation` ile mevcut konumdan doldurulur |
| name | zorunlu |
| description | |
| isDefault | checkbox |

**LocationHierarchyPickers:** `excludeIds={[locationId]}` — kendini parent seçemez.

## Yükleme
Parallel: `getLocationById` + `getAllLocations` → picker state + form.

## Butonlar
Geri → `/locations`; İptal; Güncelle

## API
| Metod | Path |
|-------|------|
| getLocationById | GET `/api/locations/{id}` |
| getAllLocations | GET `/api/locations` |
| updateLocation | PUT `/api/locations/{id}` |

Body: UpdateLocationRequest + parentId + isDefault

## Validasyon
| Kural | Mesaj |
|-------|-------|
| name boş | Konum adı gereklidir |
| invalid id | Geçersiz konum ID |
| targetLevel > 3 | En fazla 3 seviye |

## Edge case'ler
1. Parent değişince seviye yeniden hesaplanır.
2. Başarı mesajı "Konum güncellendi. Yönlendiriliyorsunuz…"
3. Detail sayfasına değil listeye yönlendirir.

## Mobil notlar
Create ile aynı picker UX; mevcut path gösterimi faydalı
