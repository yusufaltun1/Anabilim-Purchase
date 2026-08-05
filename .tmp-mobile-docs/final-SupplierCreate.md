# SupplierCreate — Mobil Analiz (Kaynak: purchase-fe)

## Özet
Yeni tedarikçi oluşturma formu. Vergi/IBAN/telefon validasyonu, çoklu kategori seçimi (react-select), tercih edilen tedarikçi checkbox.

## Route & Güvenlik
| Route | `/suppliers/create` |
| Koruma | `PrivateRoute` |

## Form alanları
| Alan | name | Tip | Zorunlu | Not |
|------|------|-----|---------|-----|
| Firma Adı | name | text | Evet (HTML) | |
| Vergi Numarası | taxNumber | text | Evet | pattern `[0-9]{10}`, maxLength 10 |
| Vergi Dairesi | taxOffice | text | Evet | |
| Adres | address | textarea | Evet | |
| Telefon | phone | tel | Evet | |
| E-posta | email | email | Evet | |
| Web Sitesi | website | url | Hayır | |
| İletişim Kişisi | contactPerson | text | Evet | |
| İletişim Telefonu | contactPhone | tel | Evet | pattern 10-11 digit |
| İletişim E-postası | contactEmail | email | Evet | |
| Banka Hesabı | bankAccount | text | Evet | |
| IBAN | iban | text | Hayır | maxLength 34, TR IBAN |
| Tercih Edilen | isPreferred | checkbox | Hayır | default false |
| Kategoriler | categoryIds | multi-select | Hayır | react-select, aktif kategoriler |

**isActive:** state default true, UI'da gösterilmez; API'ye `active: true` map edilir.

## Kategori seçimi
- Kaynak: `categoryService.getActiveCategories()` → GET `/api/categories/active`
- isMulti, isSearchable, isClearable
- placeholder: "Kategorileri seçin..."

## Butonlar
Geri, İptal → `/suppliers`; Kaydet → create → success → `/suppliers`

## API
| Metod | HTTP | Path | Body map |
|-------|------|------|----------|
| createSupplier | POST | `/api/suppliers` | name, taxNumber, taxOffice, address, phone, email, website, contactPerson, contactPhone, contactEmail, bankAccount, iban (trim/upper), active, preferred, categoryIds |

## Validasyon (validateForm)
| Kural | Mesaj |
|-------|-------|
| taxNumber dolu ve ≠10 digit | Vergi numarası 10 haneli olmalıdır |
| contactPhone dolu ve 10-11 digit değil | İletişim telefonu 10-11 haneli olmalıdır |
| iban dolu ve TR regex fail | Geçerli bir IBAN (TR, 26 hane) |

IBAN regex: `^TR\d{2}\d{4}\d{4}\d{4}\d{4}\d{4}\d{2}$` (boşluk strip)

## Edge case'ler
1. Kategori yüklenemezse error banner.
2. supplierService hata dönerse `success: false` — navigate yapılmaz.
3. IBAN opsiyonel ama girilirse sıkı format.
4. Web sitesi boş string gönderilebilir.

## Mobil notlar
- react-select yerine bottom sheet multi-picker
- Vergi no / telefon numeric mask
- IBAN formatter (4'lü gruplar)
