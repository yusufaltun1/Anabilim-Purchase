# SupplierList — Mobil Analiz (Kaynak: purchase-fe)

## Özet
Tedarikçi tablo listesi. Filtre/sayfalama yok; tüm tedarikçiler tek seferde yüklenir. Düzenle ve sil aksiyonları.

## Route & Güvenlik
| Route | `/suppliers` |
| Koruma | `PrivateRoute` |
| Capability | Yok |

## Filtreler
**Yok** — client-side filtre/arama implementasyonu bulunmuyor.

## Tablo kolonları
| Kolon | İçerik |
|-------|--------|
| Firma Adı | supplier.name |
| Vergi No / Vergi Dairesi | taxNumber + taxOffice (alt satır) |
| İletişim Bilgileri | contactPerson, contactPhone, contactEmail |
| Durum | isActive → Aktif/Pasif rozeti |
| İşlemler | Düzenle (PencilIcon), Sil (TrashIcon) |

## Butonlar
| Buton | Aksiyon |
|-------|---------|
| Yeni Tedarikçi | `/suppliers/create` |
| Düzenle (icon) | `/suppliers/edit/{id}` |
| Sil (icon) | confirm → deleteSupplier → reload |

## API (`supplier.service.ts`, fetch + Bearer)
| Metod | HTTP | Path |
|-------|------|------|
| getAllSuppliers | GET | `/api/suppliers` |
| deleteSupplier | DELETE | `/api/suppliers/{id}` |

Response mapping: API `active`→`isActive`, `preferred`→`isPreferred`

## Validasyon
Silme: native confirm ("Bu tedarikçiyi silmek istediğinizden emin misiniz?")

## Edge case'ler
1. Hata state inline kırmızı banner (`error`).
2. Loading: tablo içinde "Yükleniyor..." satırı.
3. Boş liste: "Tedarikçi bulunamadı".
4. Detay sayfası yok — sadece edit.
5. Pagination yok; büyük listelerde performans riski.

## Mobil notlar
- Tablo → kart listesi (firma adı, vergi, iletişim, durum)
- FAB: Yeni Tedarikçi
- Swipe: Düzenle/Sil
- Arama/filtre eklenmesi önerilir
