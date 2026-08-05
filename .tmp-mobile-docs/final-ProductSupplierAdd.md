# ProductSupplierAdd — Mobil Analiz (Kaynak: purchase-fe)

## Özet
Mevcut ürüne aktif tedarikçi ilişkilendirme ekranı. Tek select + submit.

## Route & Güvenlik
| Route | `/products/:id/suppliers/add` |
| Param | `id` = productId |
| Koruma | `PrivateRoute` + `CapabilityRoute INVENTORY_MANAGE` |
| Başarı | toast → `/products/{id}` |

## Form alanları
| Alan | UI | Zorunlu | Kaynak |
|------|-----|---------|--------|
| Tedarikçi | `<select id="supplier">` | Evet | `supplierService.getActiveSuppliers()` |

- İlk option: "Tedarikçi seçin" (value '')
- Option label: supplier.name
- state: selectedSupplierId (number | null)

## Üst bilgi (read-only)
- Başlık: "Tedarikçi Ekle"
- Alt: "Ürün: {product.name} ({product.code})"

## Butonlar
| Buton | Aksiyon |
|-------|---------|
| Geri | `/products/{id}` |
| İptal | `/products/{id}` |
| Ekle | submit, disabled loading \|\| !selectedSupplierId |

## API
| Metod | HTTP | Path |
|-------|------|------|
| getProductById | GET | `/api/products/{id}` (productService) |
| getActiveSuppliers | GET | `/api/suppliers/active` |
| addSupplierToProduct | POST | `/api/products/{productId}/suppliers/{supplierId}` |

## Validasyon
| Kural | Mesaj |
|-------|-------|
| !selectedSupplierId | Lütfen bir tedarikçi seçin |
| HTML required | select required |

## Edge case'ler
1. Ürün yüklenemezse error banner veya "Ürün bulunamadı".
2. Aktif tedarikçi yoksa boş select — submit disabled.
3. Zaten ilişkili tedarikçi filtresi yok — duplicate API hatası backend'e bağlı.
4. Sadece **aktif** tedarikçiler listelenir (getActiveSuppliers).
5. Yeni tedarikçi oluşturma linki yok.

## Mobil notlar
- Searchable supplier picker (uzun liste)
- Ürün özeti sticky header
- Başarı sonrası product detail suppliers section refresh
