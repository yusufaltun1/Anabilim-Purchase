# WarehouseList — Mobil Analiz (Kaynak: purchase-fe)

## Özet
Depo listesi kart görünümü. Pasif depoları göster checkbox filtresi, durum toggle ve detay navigasyonu.

## Route & Güvenlik
| Route | `/warehouses` |
| Koruma | `PrivateRoute` |

## Filtreler
| Filtre | UI | Davranış |
|--------|-----|----------|
| Pasif Depoları Göster | checkbox `showInactive` | false: sadece `warehouse.active`; true: tümü |

`useEffect([showInactive])` → `loadWarehouses()`

## Liste kart alanları
| Alan | Görünüm |
|------|---------|
| name | Başlık (indigo) |
| active | Aktif/Pasif rozeti |
| code | Kod |
| managerName | Depo Sorumlusu |
| phone | İletişim |

## Butonlar
| Buton | Aksiyon |
|-------|---------|
| Yeni Depo | `/warehouses/create` |
| Pasife Al / Aktife Al | `updateWarehouseStatus(id)` → reload |
| Detay | `/warehouses/{id}` |

## API
| Metod | HTTP | Path |
|-------|------|------|
| getWarehouses | GET | `/api/warehouses` |
| updateWarehouseStatus | PUT | `/api/warehouses/{id}/status` |

## Validasyon
Toggle için confirm yok — doğrudan API.

## Edge case'ler
1. Response array değilse "Beklenmeyen response formatı" hatası.
2. İlk yükleme loading + boş liste → tam sayfa spinner.
3. Silme/düzenleme listesinde yok.
4. Sayfalama/arama yok.

## Mobil notlar
- Kart list + toggle switch (aktif/pasif)
- Pull-to-refresh
- FAB: Yeni Depo
