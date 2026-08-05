## Özet
Yeni ürün veya klon modunda ürün oluşturma formu. `ProductForm mode="create"`.

## Route & Security
- **Route:** `/products/create` (opsiyonel `?cloneFrom=:id`)
- **CapabilityRoute:** `INVENTORY_MANAGE`

## Tip
Form sayfası (`ProductCreate.tsx` → `ProductForm.tsx`)

## Amaç
Demirbaş veya sarf ürün kaydı oluşturmak; isteğe bağlı depo atlaması ile doğrudan zimmet; klon ile mevcut üründen kopyalama.

## Başlık
- Normal: **Yeni ürün** — “Demirbaş veya sarf ürün kaydı”
- Klon (`cloneFrom` geçerli): **Ürün klonla** — kod ve seri no sıfırlanır uyarısı

## ProductForm — CREATE modu — TÜM alanlar

### Bölüm: Genel bilgiler
| Alan | Zorunlu | Tip | Not |
|------|---------|-----|-----|
| Ürün adı | Evet | text | `name` |
| Ürün kodu (iç SKU) | Evet | text uppercase | `code`; otomatik `assetLabel=code` |
| Kategori | Evet | SearchableCategorySelect | Seçilince productType, birim, min/max, currency kategoriden |
| Ürün tipi | — | read-only | Kategoriden türetilir |

Kategori seçilmeden uyarı banner: “Kayıt için kategori seçin…”

### Bölüm: Stok ve fiyat
| Alan | Zorunlu | Tip | Not |
|------|---------|-----|-----|
| Açıklama | Hayır | textarea | |
| Tahmini birim fiyat | Hayır | number + para birimi | categoryStock.currency |

### Bölüm: Demirbaş bilgileri
| Alan | Zorunlu (demirbaş*) | Tip | Not |
|------|---------------------|-----|-----|
| Şirket | Hayır | select | schools |
| Depo | Hayır | select | warehouses; dolu ise zimmet bölümü gizlenir, konum sıfırlanır |
| Demirbaş etiketi | Demirbaş* | read-only | = ürün kodu |
| Seri no | Demirbaş* | text | |
| Marka / model | Demirbaş* | SearchableDeviceModelSelect + Düzenle + Yeni | `deviceModelId` |
| Durum | Hayır | select + Yeni | asset conditions; `(zimmet yok)` etiketi |
| IP adresi | Koşullu | text | Sadece `selectedModel.enableIp` |
| MAC adresi | Koşullu | text | Sadece `selectedModel.enableMac` |
| Notlar | Hayır | textarea | |
| Konum | Demirbaş* (depo yoksa) | LocationHierarchyPickers + Yeni | 3 seviye; `autoSelectDefaults` |
| Zimmet bilgileri | Depo yok + demirbaş | ProductCreateAssignmentSection | Aşağıda |

\* Demirbaş = kategori tipi FIXED_ASSET, SEMI_FIXED_ASSET veya IT_HARDWARE (`isAssetProductType`)

### Bölüm: Opsiyonel bilgi
| Alan | Tip |
|------|-----|
| Demirbaş adı (domainName) | text |
| BYOD | checkbox |

### Bölüm: Sipariş bilgileri
| Alan | Tip |
|------|-----|
| Sipariş numarası | text |
| Satın alma tarihi | date |
| Garanti bitiş süresi | date |
| Tedarikçi | SearchableSupplierSelect + Yeni |
| Satın alma ücreti | number TRY |

### Bölüm: Görseller
| Alan | Tip | Kısıt |
|------|-----|-------|
| Dosya yükle | file multiple | jpg, webp, png, gif, svg; max 8 MB |
| Kameradan çek | buton → CameraCaptureModal | base64 data URL |

Görsel önizleme grid; her görselde × ile silme.

### Alt bilgi
Kategori stok ayarları özeti: birim, min, max, currency (kayıtta otomatik)

### Form butonları
| Buton | Aksiyon |
|-------|---------|
| İptal | `/products` |
| Kaydet | Validasyon → createProduct → opsiyonel zimmet → `/products` |

## ProductCreateAssignmentSection (create + depo yok + demirbaş)
| Alan | Zorunlu | Not |
|------|---------|-----|
| Zimmet tipi | — | Kişi / Konum |
| Kullanıcı | Kişi zimmeti* | Autocomplete arama |
| Okul | Hayır | Kullanıcı seçilince otomatik dolabilir |
| Konum | Konum zimmeti* | `useSharedLocationPickers`: üstteki Konum alanı kullanılır |
| Konum detayı | Hayır | |
| Beklenen iade tarihi | Hayır | date |
| Ürün fotoğrafı (F8) | Hayır | jpeg/png |
| Not | Hayır | textarea |

Kayıt sonrası: `createAssignment` → opsiyonel `uploadFormPhoto` → `downloadAssignmentForm`.

## Modals — alanlar

### CreateDeviceModelModal
| Alan | Zorunlu |
|------|---------|
| Marka | Evet (mevcut veya + Yeni marka) |
| Yeni marka adı | Yeni marka seçilince |
| Model | Evet (mevcut veya + Yeni model) |
| Yeni model adı | Yeni model seçilince |
| IP alanı etkin | checkbox (default true) |
| MAC alanı etkin | checkbox (default true) |

API: POST `/api/inventory/device-models`

### EditDeviceModelModal
Aynı alanlar; mevcut model düzenlenir. API: PUT `/api/inventory/device-models/:id`

### CreateSupplierModal
| Alan | Zorunlu |
|------|---------|
| Tedarikçi adı | Evet |
| Vergi no | Hayır (10 hane) |
| Vergi dairesi | Hayır |
| Telefon | Hayır |
| Adres | Hayır |
| E-posta | Hayır |
| Web sitesi | Hayır |
| Yetkili kişi | Hayır |
| Yetkili telefon | Hayır (10-11 hane) |
| Yetkili e-posta | Hayır |
| Banka hesabı | Hayır |
| IBAN | Hayır (TR 26 hane) |
| Tercih edilen | checkbox |
| Kategoriler | multi-select (defaultCategoryId ön seçili) |

### CameraCaptureModal
Kamera görüntüsü → data URL → imageUrls

### Inline prompt modals (ProductForm)
- **Yeni durum:** prompt ad + confirm “Dağıtılabilir mi?” → POST asset-conditions
- **Yeni konum:** prompt ad → POST inventory/locations

## Validasyon (create)
- Ad + kategori + kod zorunlu
- Demirbaş: kod, seri no, model, konum (depo yoksa); zimmet alanları (depo yok + showCreateAssignment)
- Görsel max 8 MB

## API
| İşlem | Endpoint |
|-------|----------|
| Oluştur | POST `/api/products` |
| Klon kaynak | GET `/api/products/:cloneFromId` |
| Zimmet | POST `/api/v1/assignments` |
| Masters | categories, schools, warehouses, suppliers, device-models, asset-conditions, locations, users |

## Navigasyon
- Liste → Yeni Ürün
- Liste → Klonla → `/products/create?cloneFrom=:id`
- Başarı → `/products`

## Edge cases
- Klon: name “ (Kopya)” eklenir; code, serialNumber, assetLabel boş
- Depo seçilince zimmet state sıfırlanır
- Ürün oluştu ama zimmet fail: kısmi başarı mesajı, liste yine `/products`’a gitmez (hata gösterilir)
- Kategori değişince tedarikçi listesi ve supplierId sıfırlanır

## Mobil notlar
- Form bölümleri dikey stack; sticky Kaydet/İptal alt bar
- Kamera butonu mobilde kritik
- Kullanıcı arama dropdown z-index yüksek
- LocationHierarchyPickers 3 select mobilde tam genişlik

---