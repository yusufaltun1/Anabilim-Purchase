**Route:** `/products/edit/:id`
**Parent:** ZW-55
**Etiket:** MOBILE

## Özet
Mevcut ürün düzenleme. `ProductForm mode="edit"`.

## Route & Security
- **Route:** `/products/edit/:id`
- **CapabilityRoute:** `INVENTORY_MANAGE`

## Tip
Form sayfası (`ProductEdit.tsx` → `ProductForm.tsx`)

## Amaç
Ürün kaydını güncellemek; demirbaş alanları ve konum; aktif/pasif durumu.

## ProductForm — EDIT modu — TÜM alanlar
Create ile aynı alanlar, farklar:

### Kilitli / salt okunur alanlar
| Alan | Davranış |
|------|----------|
| Ürün kodu (iç SKU) | **readOnly**, gri arka plan; hint: “Kod oluşturulduktan sonra değiştirilmez” |
| Demirbaş etiketi | read-only (= code) |
| Ürün tipi | read-only |

### Edit’e özel alan
| Alan | Tip |
|------|-----|
| Durum kaydı — Aktif ürün | checkbox (`active`) |

### Zimmet durum kilidi (`assetConditionLocked`)
**Kilit koşulu:** `mustReturnFirst` VEYA `stockItemStatus === 'ASSIGNED' | 'IN_USE'`

Kilitliyken:
- Durum select **disabled**, gri
- “Yeni” durum butonu gizli
- Hint: “Cihaz bir kullanıcıya veya konuma zimmetli; durum değiştirmek için önce iade alın.”

### Edit’te GÖSTERİLMEYEN / farklı davranış
| Özellik | Edit |
|---------|------|
| ProductCreateAssignmentSection | **Yok** (zimmet create formda değil) |
| Depo hint | “Boş bırakırsanız…” yerine “Depo seç” / tek depo uyarısı |
| Konum pickers | **Her zaman** gösterilir (`showDefaultLocationPickers = true`) |
| Kategori stok özeti | Gösterilir |

### Tüm düzenlenebilir alanlar (kilit hariç)
Genel: name, categoryId, description, estimatedUnitPrice, active  
Demirbaş: schoolId, warehouseId, serialNumber, deviceModelId, assetConditionId (kilit değilse), ipAddress, macAddress, notes, konum (3 seviye)  
Opsiyonel: domainName, byod  
Sipariş: orderNumber, purchaseDate, warrantyExpiryDate, supplierId, purchasePrice  
Görseller: imageUrls ekle/sil

## Modals
Create ile aynı: CreateDeviceModelModal, EditDeviceModelModal, CreateSupplierModal, CameraCaptureModal, prompt durum/konum.

## Form butonları
| Buton | Hedef |
|-------|-------|
| İptal | `/products/:id` |
| Kaydet | PUT → `/products/:id` |

## Validasyon (edit)
- Ad, kategori, kod zorunlu (kod değiştirilemez ama dolu olmalı)
- Demirbaş create validasyonu **create modunda**; edit’te assetFieldsRequired false — demirbaş zorunlulukları create’e özel
- serialNumber payload’a sadece trim dolu ise eklenir

## API
| İşlem | Endpoint |
|-------|----------|
| Yükle | GET `/api/products/:id` |
| Güncelle | PUT `/api/products/:id` |
| Konum çözümleme | GET `/api/locations` |

## Navigasyon
- ProductDetail → Düzenle
- Başarı → ProductDetail

## Edge cases
- Zimmetli cihazda durum değiştirilemez
- Kod/asetLabel backend’de sabit kabul edilir
- Kategori değişince stok varsayılanları formda güncellenir

## Mobil notlar
- Salt okunur kod alanı mobilde kopyalanabilir olmalı (UX)
- Durum kilidi banner’ı belirgin gösterilmeli
- Edit sonrası detaya dönüş tek geri hedefi

---