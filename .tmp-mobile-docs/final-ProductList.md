## Özet
Tüm ürünleri listeler; hızlı arama, genişletilebilir filtre paneli, aktif filtre çipleri ve istemci tarafı sayfalama sunar. Tablo `ProductListPanel` ile render edilir.

## Route & Security
- **Route:** `/products`
- **PrivateRoute:** Evet (oturum zorunlu)
- **CapabilityRoute:** `INVENTORY_VIEW` (yoksa `/dashboard`)
- **INVENTORY_VIEW:** `INVENTORY_READ` izni veya belirli roller
- **INVENTORY_MANAGE:** `INVENTORY_UPDATE` izni veya satın alma/bilgi işlem rolleri — sayfa içi “Yeni Ürün” ve satır işlemlerinde kullanılır

## Tip
Liste sayfası (`ProductList.tsx` + `productListFilters.ts` + `ProductListPanel.tsx`)

## Amaç
Envanterdeki ürünleri aramak, filtrelemek, sıralamak; detaya gitmek; yetkili kullanıcıların oluşturma/klonlama/düzenleme/silme/zimmet/etiket basma işlemlerini başlatmak.

## Üst başlık ve butonlar
| Buton | Koşul | Aksiyon |
|-------|-------|---------|
| Filtrele | Her zaman | Filtre panelini aç/kapat; aktif filtre sayısı rozeti |
| Yeni Ürün | `INVENTORY_MANAGE` | `/products/create` |

## Hızlı arama
- **Alan:** `filters.search` (type=search)
- **Placeholder:** ad, kod, kategori, etiket, seri no, sipariş no…
- **Aramayı temizle:** Sadece `search` dolu iken görünür
- **Eşleşen alanlar** (`matchesSearch`): name, code, description, serialNumber, assetLabel, domainName, orderNumber, notes, schoolName, deviceModelName, assetConditionName, primarySupplierName, ipAddress, macAddress, stockItemStatus, category alanları, productType etiketi

## Filtre paneli (`ProductListFilters`)
Panel açıkken 3 bölüm:

### Genel
| Alan | Tip | Seçenekler / Not |
|------|-----|------------------|
| Kategori | SearchableCategorySelect | allowClear |
| Ürün tipi | SearchableOptionSelect | Tümü + CATEGORY_PRODUCT_TYPE_OPTIONS |
| Kayıt durumu | SearchableOptionSelect | Tümü / Aktif / Pasif |

### Demirbaş
| Alan | Tip | Not |
|------|-----|-----|
| Şirket | SearchableOptionSelect | Aktif okullar |
| Marka | SearchableOptionSelect | deviceModels’ten türetilir |
| Model | SearchableDeviceModelSelect | brandFilter; marka seçilince nameOnly |
| Cihaz durumu | SearchableOptionSelect | asset conditions |
| Demirbaş etiketi | SearchableOptionSelect | Tümü / Etiketli / Etiketsiz |
| Üst konum | SearchableOptionSelect | LOCATION_LEVEL_LABELS[1] |
| Alt konum | SearchableOptionSelect | parent seçilmeden disabled |
| Detay konum | SearchableOptionSelect | middle seçilmeden disabled |
| BYOD | SearchableOptionSelect | Tümü / Evet / Hayır |
| Stok kalemi durumu | SearchableOptionSelect | IN_STOCK, ASSIGNED, IN_USE, MAINTENANCE, RETIRED |
| Zimmet / kullanım | SearchableOptionSelect | CAN_ASSIGN, IN_USE (önce iade), NOT_ASSIGNABLE |

### Sipariş & fiyat
| Alan | Tip |
|------|-----|
| Tedarikçi | SearchableSupplierSelect |
| Sipariş numarası | text (kısmi eşleşme) |
| Min/Max tahmini fiyat | number (₺) |
| Min/Max satın alma | number (₺) |
| Birim | PIECE, METER, LITER, KILOGRAM, BOX, PACKAGE, SET, PAIR |
| Sırala | name, code, price, purchasePrice, createdAt |
| Sıralama yönü | ↑ asc / ↓ desc butonu |

### Filtre paneli altı
- Sonuç sayısı
- Sayfa başına: 10 / 20 / 50 / 100
- **Filtreleri Temizle** (aktif filtre varken)
- Panel kapat (X)

## Aktif filtre çipleri (`ActiveFiltersBar`)
Her chip tek tek kaldırılabilir; **Tümünü temizle** → `defaultProductListFilters()`.

## Sayfalama
- Üstte (totalPages > 1): ilk / önceki / 5 sayfa numarası / sonraki / son
- Filtre veya sayfa boyutu değişince `currentPage = 1`
- Sayfa değişince `window.scrollTo({ top: 0 })`

## Tablo (`ProductListPanel`)
| Sütun | İçerik |
|-------|--------|
| Görsel | thumbnail veya FiImage placeholder; tıklanınca lightbox |
| Ürün | ProductNameCell: ad, kod, ürün tipi |
| Etiket | AssetLabelCell |
| Seri no | SerialNumberCell |
| Model | ModelCell |
| Kategori | CategoryCell |
| Stok / Zimmet | StockStatusCell (IN_STOCK, ASSIGNED, IN_USE, MAINTENANCE, RETIRED + canAssign ipuçları) |
| Konum | LocationCell |
| İşlemler | sticky sağ kolon |

### Satır tıklama
Tüm satır → `/products/:id`

### Satır işlemleri (`renderActions`)
| İkon | Yetki | Aksiyon |
|------|-------|---------|
| Zimmetle (FiUserPlus) | `product.canAssign` | `/products/:id?assign=1` |
| Detay (FiEye) | Herkes | `/products/:id` |
| Klonla (FiCopy) | INVENTORY_MANAGE | `/products/create?cloneFrom=:id` |
| Düzenle (FiEdit2) | INVENTORY_MANAGE | `/products/edit/:id` |
| Etiket bas (FiPrinter) | Herkes | ProductLabelPrint modal |
| Sil (FiTrash2) | INVENTORY_MANAGE | confirm → deleteProduct |

## Modals
### Görsel lightbox
- Tam ekran siyah arka plan, Kapat butonu

### ProductLabelPrint
- **Girdi:** productCode (code veya assetLabel), productName
- **Aksiyon:** Etiket yazdırma UI; Kapat

## API çağrıları (sayfa yükü)
| Servis | Endpoint | Amaç |
|--------|----------|------|
| productService | GET `/api/products` | Tüm ürünler |
| categoryService | GET `/api/categories/active` veya `/all` | Kategori master |
| schoolService | getActiveSchools | Filtre |
| supplierService | getActiveSuppliers | Filtre |
| inventoryService | getDeviceModels, getAssetConditions, getParentLocations | Filtre |
| locationService | GET `/api/locations` | Konum hiyerarşisi filtresi |
| inventoryService | getChildLocations(parentId) | Alt/detay konum seçenekleri |
| productService | DELETE `/api/products/:id` | Silme |

## Navigasyon
- Navigation → Envanter menüsü → Ürünler
- Çıkış: satır detay, Yeni Ürün, klon/düzenle

## Edge cases
- Filtreleme tamamen istemci tarafı; tüm ürünler bir seferde yüklenir
- `assign=1` query ProductDetail’de işlenmiyor (zimmet modal otomatik açılmaz)
- Marka değişince model filtresi sıfırlanır
- Üst/alt konum değişince alt seviyeler sıfırlanır
- Silme hata mesajı `window.alert`

## Mobil notlar
- Tablo yatay kaydırmalı; işlem kolonu sticky
- Filtre paneli tek sütun grid; mobilde tam genişlik arama
- Lightbox ve pagination dokunmatik uyumlu
- Mobilde filtre sayısı rozeti ve chip bar öncelikli UX

---