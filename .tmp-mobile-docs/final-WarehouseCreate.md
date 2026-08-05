# WarehouseCreate — Mobil Analiz (Kaynak: purchase-fe)

## Özet
Yeni depo oluşturma formu. 6 zorunlu alan, e-posta/telefon client validasyonu.

## Route & Güvenlik
| Route | `/warehouses/create` |
| Koruma | `PrivateRoute` |
| Başarı | toast + 1sn sonra `/warehouses` |

## Form alanları
| Alan | name | Tip | Zorunlu |
|------|------|-----|---------|
| Depo Adı | name | text | Evet |
| Depo Kodu | code | text | Evet |
| Adres | address | textarea (3) | Evet |
| Telefon | phone | tel | Evet |
| E-posta | email | email | Evet |
| Depo Sorumlusu | managerName | text | Evet |

## Butonlar
| Buton | Not |
|-------|-----|
| Test Bildirim | **Dev/debug** — showNotification test |
| Geri | `/warehouses` |
| Depo Oluştur | submit |

## API
| Metod | HTTP | Path | Body |
|-------|------|------|------|
| createWarehouse | POST | `/api/warehouses` | CreateWarehouseRequest |

## Validasyon (validateForm)
| Kural | Mesaj |
|-------|-------|
| Her alan trim boş | Alan adına göre zorunluluk mesajı |
| email regex | Geçerli bir e-posta adresi giriniz |
| phone: `\d{10,11}` (non-digit strip) | Geçerli bir telefon numarası giriniz |

## Edge case'ler
1. Test Bildirim butonu production mobilde olmamalı.
2. createWarehouse catch'te hem setError hem showNotification.
3. Başarıda setTimeout 1000ms navigate.

## Mobil notlar
- Tek kolon form
- Test butonunu kaldır
- Sorumlu alanı contact picker entegrasyonu (opsiyonel)
