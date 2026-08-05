## Özet
Ürüne aktif tedarikçi bağlama formu.

## Route & Security
- **Route:** `/products/:id/suppliers/add`
- **CapabilityRoute:** `INVENTORY_MANAGE`

## Tip
Tek alanlı form sayfası

## Amaç
Mevcut ürün kaydına tedarikçi ilişkisi eklemek.

## Alanlar
| Alan | Zorunlu | Tip |
|------|---------|-----|
| Tedarikçi | Evet | select (active suppliers) |

## Butonlar
| Buton | Hedef |
|-------|-------|
| Geri | `/products/:id` |
| İptal | `/products/:id` |
| Ekle | POST → success notification → `/products/:id` |

## API
| İşlem | Endpoint |
|-------|----------|
| Ürün | GET `/api/products/:id` |
| Tedarikçiler | supplierService.getActiveSuppliers |
| Ekle | POST `/api/products/:productId/suppliers/:supplierId` |

## Navigasyon
ProductDetail → Tedarikçi Ekle

## Edge cases
- Zaten bağlı tedarikçi backend hatası
- Loading sırasında form disabled

## Mobil notlar
- Basit tek select form; native picker uygun
- Başarı sonrası detaya dönüş

---