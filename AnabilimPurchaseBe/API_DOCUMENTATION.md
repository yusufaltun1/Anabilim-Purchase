# Anabilim Satın Alma Sistemi API Dokümantasyonu

## Genel Bakış
Anabilim Satın Alma Sistemi, kurumsal satın alma süreçlerini dijitalleştiren ve otomatikleştiren kapsamlı bir yönetim sistemidir. Sistem, ürün ve kategori yönetiminden tedarikçi ilişkilerine, satın alma taleplerinden onay süreçlerine kadar tüm iş akışlarını yönetir.

## Kimlik Doğrulama
Tüm API endpoint'leri JWT (JSON Web Token) tabanlı kimlik doğrulama kullanır.

### Token Kullanımı
```http
Authorization: Bearer your_jwt_token_here
```

## Depo ve Stok Yönetimi API'si

### 1. Ürün Stok Özeti Listeleme

#### 1.1 Ürünleri Stok Bilgileriyle Listeleme
**Endpoint:** `GET /api/warehouse-stocks/products`

Tüm ürünleri stok özeti bilgileriyle birlikte listeler. Arama, filtreleme ve sayfalama desteği sunar.

**Query Parameters:**
- `page` (optional): Sayfa numarası (default: 0)
- `size` (optional): Sayfa boyutu (default: 20)
- `search` (optional): Ürün adı veya kodu ile arama
- `categoryId` (optional): Kategori ID'si ile filtreleme
- `lowStock` (optional): Sadece düşük stoklu ürünler (true/false)

**Response:**
```json
{
    "content": [
        {
            "id": 1,
            "name": "Laptop Dell XPS 13",
            "code": "LAPTOP-001",
            "description": "13 inç ultrabook laptop",
            "unit": "Adet",
            "category": "Bilgisayar",
            "totalStock": 15,
            "warehouseCount": 3,
            "hasLowStock": false,
            "lastMovementDate": "2024-01-15T10:30:00",
            "active": true
        }
    ],
    "pageable": {
        "sort": {
            "empty": true,
            "sorted": false,
            "unsorted": true
        },
        "offset": 0,
        "pageSize": 20,
        "pageNumber": 0,
        "paged": true,
        "unpaged": false
    },
    "last": true,
    "totalPages": 1,
    "totalElements": 1,
    "size": 20,
    "number": 0,
    "sort": {
        "empty": true,
        "sorted": false,
        "unsorted": true
    },
    "first": true,
    "numberOfElements": 1,
    "empty": false
}
```

**Response Fields:**
- `id`: Ürün ID'si
- `name`: Ürün adı
- `code`: Ürün kodu
- `description`: Ürün açıklaması
- `unit`: Ölçü birimi
- `category`: Kategori adı
- `totalStock`: Tüm depolardaki toplam stok
- `warehouseCount`: Stok bulunan depo sayısı
- `hasLowStock`: Herhangi bir depoda düşük stok durumu
- `lastMovementDate`: En son stok hareket tarihi
- `active`: Ürün aktif durumu

**Örnek Kullanımlar:**

1. **Tüm ürünleri listele:**
   ```
   GET /api/warehouse-stocks/products?page=0&size=20
   ```

2. **Ürün ara:**
   ```
   GET /api/warehouse-stocks/products?search=laptop&page=0&size=10
   ```

3. **Kategoriye göre filtrele:**
   ```
   GET /api/warehouse-stocks/products?categoryId=1&page=0&size=10
   ```

4. **Düşük stoklu ürünleri listele:**
   ```
   GET /api/warehouse-stocks/products?lowStock=true&page=0&size=10
   ```

### 2. Depo Stok Yönetimi

#### 2.1 Depoya Göre Stok Listeleme
**Endpoint:** `GET /api/warehouse-stocks/warehouse/{warehouseId}`

Belirli bir deponun tüm stok kayıtlarını getirir.

#### 2.2 Ürüne Göre Stok Listeleme
**Endpoint:** `GET /api/warehouse-stocks/product/{productId}`

Belirli bir ürünün tüm depolardaki stok kayıtlarını getirir.

#### 2.3 Ürün Stok Detayı
**Endpoint:** `GET /api/warehouse-stocks/product/{productId}/detail`

Ürünün detaylı stok bilgilerini ve son hareketlerini getirir.

#### 2.4 Düşük Stok Uyarıları
**Endpoint:** `GET /api/warehouse-stocks/low-stock`

Düşük stok seviyesindeki ürünleri listeler.

### 3. Stok Hareket Yönetimi

#### 3.1 Stok Hareketi Oluşturma
**Endpoint:** `POST /api/warehouse-stocks/movements`

Depo ve ürün ID'si ile stok hareketi oluşturur.

**Request Body:**
```json
{
    "warehouseId": 1,
    "productId": 1,
    "quantity": 25,
    "movementType": "OUT",
    "referenceType": "MANUAL",
    "notes": "Manuel stok çıkışı"
}
```

**Movement Types:**
- `IN`: Stok girişi
- `OUT`: Stok çıkışı
- `ADJUSTMENT`: Stok düzeltmesi

**Reference Types:**
- `PURCHASE_ORDER`: Satın alma siparişi
- `MANUAL`: Manuel işlem
- `ADJUSTMENT`: Stok düzeltmesi
- `TRANSFER`: Depo transferi

#### 3.2 Stok Hareket Geçmişi
**Endpoint:** `GET /api/warehouse-stocks/{stockId}/movements`

Belirli bir stok kaydının hareket geçmişini getirir.

## Kategori Yönetimi API'si

Kategori yönetimi, ürünlerin organize edilmesini ve hiyerarşik bir yapıda yönetilmesini sağlar.

### 1. Kategori Oluşturma
**Endpoint:** `POST /api/categories`

Ana kategoriler ve alt kategoriler oluşturabilirsiniz. Alt kategori oluşturmak için `parentId` belirtmeniz yeterlidir.

#### Ana Kategori Örneği
```json
{
    "name": "Bilgisayar",
    "code": "BIL",
    "description": "Bilgisayar ve çevre birimleri",
    "parentId": null
}
```

#### Alt Kategori Örneği
```json
{
    "name": "Dizüstü Bilgisayar",
    "code": "BIL_LAP",
    "description": "Dizüstü bilgisayarlar",
    "parentId": 1
}
```

**Önemli Noktalar:**
- Kategori kodu benzersiz olmalıdır
- Kod formatı: Büyük harf ve alt çizgi (_) kullanılabilir
- Alt kategoriler için ana kategori ID'si gereklidir

### 2. Kategori Güncelleme
**Endpoint:** `PUT /api/categories/{id}`

Mevcut bir kategoriyi güncelleyebilirsiniz.

```json
{
    "name": "Güncellenmiş Bilgisayar",
    "description": "Güncellenmiş açıklama",
    "parentId": null,
    "isActive": true
}
```

**Önemli Noktalar:**
- Kategori kodu güncellenemez
- Alt kategori, başka bir kategorinin altına taşınabilir
- Aktiflik durumu değiştirilebilir

### 3. Kategori Silme
**Endpoint:** `DELETE /api/categories/{id}`

**Önemli Noktalar:**
- Alt kategorisi olan kategoriler silinemez
- İçinde ürün bulunan kategoriler silinemez
- Silme işlemi geri alınamaz

### 4. Kategori Listeleme ve Arama

#### Tüm Kategorileri Listeleme
**Endpoint:** `GET /api/categories`

#### Aktif Kategorileri Listeleme
**Endpoint:** `GET /api/categories/active`

#### Ana (Root) Kategorileri Listeleme
**Endpoint:** `GET /api/categories/root`

#### Alt Kategorileri Listeleme
**Endpoint:** `GET /api/categories/sub/{parentId}`

#### Kategori Arama
**Endpoint:** `GET /api/categories/search?name={searchTerm}`

#### ID ile Kategori Getirme
**Endpoint:** `GET /api/categories/{id}`

#### Kod ile Kategori Getirme
**Endpoint:** `GET /api/categories/code/{code}`

## Ürün Yönetimi API'si

Ürün yönetimi, envanter takibi ve satın alma süreçlerinin temelini oluşturur.

### 1. Ürün Oluşturma
**Endpoint:** `POST /api/products`

```json
{
    "name": "Laptop",
    "code": "LAP_001",
    "description": "High performance laptop",
    "categoryId": 1,
    "unit": "ADET",
    "minQuantity": 5,
    "maxQuantity": 20,
    "estimatedUnitPrice": 15000.00,
    "supplierIds": [1, 2]
}
```

**Önemli Noktalar:**
- Ürün kodu benzersiz olmalıdır
- Kategori ID'si zorunludur
- Birim bilgisi zorunludur (ADET, KG, LT vs.)
- Min/Max miktar stok kontrolü için kullanılır
- Tedarikçi ataması opsiyoneldir

### 2. Ürün Güncelleme
**Endpoint:** `PUT /api/products/{id}`

```json
{
    "name": "Updated Laptop",
    "description": "Updated description",
    "categoryId": 1,
    "unit": "ADET",
    "minQuantity": 3,
    "maxQuantity": 15,
    "estimatedUnitPrice": 16000.00,
    "supplierIds": [1, 2, 3],
    "isActive": true
}
```

**Önemli Noktalar:**
- Ürün kodu güncellenemez
- Kategori değiştirilebilir
- Tedarikçi listesi güncellenebilir
- Aktiflik durumu değiştirilebilir

### 3. Ürün Silme
**Endpoint:** `DELETE /api/products/{id}`

**Önemli Noktalar:**
- Satın alma taleplerinde kullanılan ürünler silinemez
- Silme işlemi geri alınamaz

### 4. Ürün Listeleme ve Arama

#### Tüm Ürünleri Listeleme
**Endpoint:** `GET /api/products`

#### Aktif Ürünleri Listeleme
**Endpoint:** `GET /api/products/active`

#### Kategoriye Göre Ürün Listeleme
**Endpoint:** `GET /api/products/category/{categoryId}`

#### Tedarikçiye Göre Ürün Listeleme
**Endpoint:** `GET /api/products/supplier/{supplierId}`

#### Ürün Arama
**Endpoint:** `GET /api/products/search?name={searchTerm}`

#### ID ile Ürün Getirme
**Endpoint:** `GET /api/products/{id}`

#### Kod ile Ürün Getirme
**Endpoint:** `GET /api/products/code/{code}`

### 5. Tedarikçi İlişkileri

#### Ürüne Tedarikçi Ekleme
**Endpoint:** `POST /api/products/{productId}/suppliers/{supplierId}`

#### Üründen Tedarikçi Çıkarma
**Endpoint:** `DELETE /api/products/{productId}/suppliers/{supplierId}`

## UX Önerileri ve Best Practices

### Kategori Yönetimi
1. **Hiyerarşik Görünüm**
   - Kategorileri tree view şeklinde gösterin
   - Alt kategorileri indent ile belirgin hale getirin
   - Expand/collapse özelliği ekleyin

2. **Kategori Oluşturma**
   - Ana kategori/alt kategori seçimini net gösterin
   - Kod oluşturma kurallarını açıkça belirtin
   - Parent kategori seçimini dropdown ile kolaylaştırın

3. **Kategori Düzenleme**
   - Drag & drop ile kategori hiyerarşisini düzenleme imkanı
   - Bulk işlemler için çoklu seçim
   - Aktif/pasif durumu için toggle switch

### Ürün Yönetimi
1. **Ürün Listeleme**
   - Filtreler: Kategori, tedarikçi, aktiflik durumu
   - Sıralama: İsim, kod, fiyat, stok durumu
   - Grid/liste görünüm seçeneği
   - Hızlı arama ve detaylı arama seçenekleri

2. **Ürün Detayı**
   - Kategori breadcrumb'ı gösterimi
   - Stok durumu görsel göstergesi
   - İlişkili tedarikçilerin kolay yönetimi
   - Fiyat geçmişi grafiği

3. **Tedarikçi İlişkileri**
   - Çoklu tedarikçi seçimi için autocomplete
   - Tedarikçi karşılaştırma imkanı
   - Tedarikçi performans göstergeleri

### Genel UX İlkeleri
1. **Tutarlılık**
   - Tüm formlarda benzer layout
   - Tutarlı buton yerleşimi ve renkleri
   - Standart hata ve başarı mesajları

2. **Kullanıcı Geri Bildirimi**
   - İşlem sonuçları için toast mesajları
   - Yükleme durumları için spinners
   - Validation hataları için inline feedback

3. **Performans**
   - Lazy loading ile büyük listeleri optimize etme
   - Önbellek kullanımı
   - Debounce ile arama optimizasyonu

4. **Erişilebilirlik**
   - Klavye navigasyonu desteği
   - ARIA etiketleri
   - Yüksek kontrast renk şeması

5. **Responsive Tasarım**
   - Mobil uyumlu layout
   - Touch-friendly etkileşimler
   - Adaptive grid sistem

## Güvenlik Önlemleri
1. JWT token kullanımı
2. Role-based access control (RBAC)
3. Input validation
4. Rate limiting
5. CORS politikaları

## Hata Yönetimi
Tüm API endpoint'leri standart hata formatı kullanır:

```json
{
    "status": 400,
    "message": "Validation error",
    "errors": [
        {
            "field": "code",
            "message": "Product code must be unique"
        }
    ]
}
```

## Versiyon Kontrolü
API endpoint'leri versiyon kontrolü için URL'de `/v1/` prefix'i kullanır.

## Rate Limiting
- 100 request/minute (authenticated users)
- 20 request/minute (anonymous users)

## Caching
- GET endpoint'leri için 5 dakika cache
- Liste endpoint'leri için sayfalama (default: 20 items/page)

# Supplier Quote API

## Get Quote Details

`GET /api/supplier-quotes/{quoteUid}`

Retrieves detailed information about a specific supplier quote.

### Response Example

```json
{
    "id": 123,
    "quoteUid": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "requestItemId": 456,
    "product": {
        "id": 789,
        "name": "HP LaserJet Pro Yazıcı",
        "code": "PRN-001",
        "description": "HP LaserJet Pro M404dn Yazıcı",
        "category": "Yazıcılar"
    },
    "supplier": {
        "id": 234,
        "companyName": "TechnoMarket A.Ş.",
        "taxNumber": "1234567890",
        "contactPerson": "Ahmet Yılmaz",
        "contactPhone": "+90 532 123 4567",
        "contactEmail": "ahmet.yilmaz@technomarket.com"
    },
    "unitPrice": 5999.99,
    "quantity": 2,
    "totalPrice": 11999.98,
    "currency": "TRY",
    "deliveryDate": "2024-04-15T10:00:00",
    "validityDate": "2024-03-31T23:59:59",
    "notes": "3 yıl garanti dahildir. Kargo ücretsizdir.",
    "supplierReference": "TM-2024-0123",
    "status": "RESPONDED",
    "rejectionReason": null,
    "createdAt": "2024-03-15T09:30:00",
    "updatedAt": "2024-03-15T14:45:00",
    "respondedAt": "2024-03-15T14:45:00"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| id | Long | Teklifin benzersiz ID'si |
| quoteUid | String | Teklifin benzersiz UUID'si |
| requestItemId | Long | İlgili talep kaleminin ID'si |
| product | Object | Ürün bilgileri |
| product.id | Long | Ürün ID'si |
| product.name | String | Ürün adı |
| product.code | String | Ürün kodu |
| product.description | String | Ürün açıklaması |
| product.category | String | Ürün kategorisi |
| supplier | Object | Tedarikçi bilgileri |
| supplier.id | Long | Tedarikçi ID'si |
| supplier.companyName | String | Şirket adı |
| supplier.taxNumber | String | Vergi numarası |
| supplier.contactPerson | String | İletişim kişisi |
| supplier.contactPhone | String | İletişim telefonu |
| supplier.contactEmail | String | İletişim e-postası |
| unitPrice | BigDecimal | Birim fiyat |
| quantity | Integer | Miktar |
| totalPrice | BigDecimal | Toplam fiyat |
| currency | String | Para birimi (TRY, USD, EUR) |
| deliveryDate | DateTime | Teslim tarihi |
| validityDate | DateTime | Geçerlilik tarihi |
| notes | String | Teklif notları |
| supplierReference | String | Tedarikçi referans numarası |
| status | String | Teklif durumu (PENDING, RESPONDED, ACCEPTED, REJECTED, EXPIRED, CANCELLED) |
| rejectionReason | String | Red edilme nedeni (varsa) |
| createdAt | DateTime | Oluşturulma tarihi |
| updatedAt | DateTime | Son güncelleme tarihi |
| respondedAt | DateTime | Yanıtlanma tarihi | 

## Depo ve Stok Yönetimi API

### Depo İşlemleri

#### Yeni Depo Oluşturma
```http
POST /api/v1/warehouses
```

**Request Body:**
```json
{
    "name": "Ana Depo",
    "code": "WH001",
    "address": "İstanbul, Türkiye",
    "phone": "5551234567",
    "email": "anadepo@anabilim.com",
    "managerName": "Ahmet Yılmaz"
}
```

**Response:** `200 OK`
```json
{
    "id": 1,
    "name": "Ana Depo",
    "code": "WH001",
    "address": "İstanbul, Türkiye",
    "phone": "5551234567",
    "email": "anadepo@anabilim.com",
    "managerName": "Ahmet Yılmaz",
    "isActive": true,
    "createdAt": "2024-03-20T10:00:00",
    "updatedAt": "2024-03-20T10:00:00"
}
```

#### Tüm Depoları Listeleme
```http
GET /api/v1/warehouses
```

**Response:** `200 OK`
```json
[
    {
        "id": 1,
        "name": "Ana Depo",
        "code": "WH001",
        "address": "İstanbul, Türkiye",
        "phone": "5551234567",
        "email": "anadepo@anabilim.com",
        "managerName": "Ahmet Yılmaz",
        "isActive": true,
        "createdAt": "2024-03-20T10:00:00",
        "updatedAt": "2024-03-20T10:00:00"
    }
]
```

#### Aktif Depoları Listeleme
```http
GET /api/v1/warehouses/active
```

**Response:** `200 OK`
```json
[
    {
        "id": 1,
        "name": "Ana Depo",
        "code": "WH001",
        "address": "İstanbul, Türkiye",
        "phone": "5551234567",
        "email": "anadepo@anabilim.com",
        "managerName": "Ahmet Yılmaz",
        "isActive": true,
        "createdAt": "2024-03-20T10:00:00",
        "updatedAt": "2024-03-20T10:00:00"
    }
]
```

#### Depo Detayı Görüntüleme
```http
GET /api/v1/warehouses/{id}
```

**Response:** `200 OK`
```json
{
    "id": 1,
    "name": "Ana Depo",
    "code": "WH001",
    "address": "İstanbul, Türkiye",
    "phone": "5551234567",
    "email": "anadepo@anabilim.com",
    "managerName": "Ahmet Yılmaz",
    "isActive": true,
    "createdAt": "2024-03-20T10:00:00",
    "updatedAt": "2024-03-20T10:00:00"
}
```

#### Depo Durumunu Değiştirme
```http
PUT /api/v1/warehouses/{id}/status
```

**Response:** `200 OK`
```json
{
    "id": 1,
    "name": "Ana Depo",
    "code": "WH001",
    "address": "İstanbul, Türkiye",
    "phone": "5551234567",
    "email": "anadepo@anabilim.com",
    "managerName": "Ahmet Yılmaz",
    "isActive": false,
    "createdAt": "2024-03-20T10:00:00",
    "updatedAt": "2024-03-20T10:00:00"
}
```

### Stok İşlemleri

#### Depodaki Stokları Listeleme
```http
GET /api/v1/warehouse-stocks/warehouse/{warehouseId}
```

**Response:** `200 OK`
```json
[
    {
        "id": 1,
        "warehouse": {
            "id": 1,
            "name": "Ana Depo",
            "code": "WH001",
            "address": "İstanbul, Türkiye",
            "phone": "5551234567",
            "email": "anadepo@anabilim.com",
            "managerName": "Ahmet Yılmaz",
            "isActive": true,
            "createdAt": "2024-03-20T10:00:00",
            "updatedAt": "2024-03-20T10:00:00"
        },
        "product": {
            "id": 1,
            "name": "Kalem",
            "code": "P001",
            "unit": "ADET"
        },
        "currentStock": 100,
        "minStock": 20,
        "maxStock": 200,
        "createdAt": "2024-03-20T10:00:00",
        "updatedAt": "2024-03-20T10:00:00"
    }
]
```

#### Ürünün Tüm Depolardaki Stoklarını Listeleme
```http
GET /api/v1/warehouse-stocks/product/{productId}
```

**Response:** `200 OK`
```json
[
    {
        "id": 1,
        "warehouse": {
            "id": 1,
            "name": "Ana Depo",
            "code": "WH001",
            "address": "İstanbul, Türkiye",
            "phone": "5551234567",
            "email": "anadepo@anabilim.com",
            "managerName": "Ahmet Yılmaz",
            "isActive": true,
            "createdAt": "2024-03-20T10:00:00",
            "updatedAt": "2024-03-20T10:00:00"
        },
        "product": {
            "id": 1,
            "name": "Kalem",
            "code": "P001",
            "unit": "ADET"
        },
        "currentStock": 100,
        "minStock": 20,
        "maxStock": 200,
        "createdAt": "2024-03-20T10:00:00",
        "updatedAt": "2024-03-20T10:00:00"
    }
]
```

#### Düşük Stokları Listeleme
```http
GET /api/v1/warehouse-stocks/low-stock
```

**Response:** `200 OK`
```json
[
    {
        "id": 1,
        "warehouse": {
            "id": 1,
            "name": "Ana Depo",
            "code": "WH001",
            "address": "İstanbul, Türkiye",
            "phone": "5551234567",
            "email": "anadepo@anabilim.com",
            "managerName": "Ahmet Yılmaz",
            "isActive": true,
            "createdAt": "2024-03-20T10:00:00",
            "updatedAt": "2024-03-20T10:00:00"
        },
        "product": {
            "id": 1,
            "name": "Kalem",
            "code": "P001",
            "unit": "ADET"
        },
        "currentStock": 15,
        "minStock": 20,
        "maxStock": 200,
        "createdAt": "2024-03-20T10:00:00",
        "updatedAt": "2024-03-20T10:00:00"
    }
]
```

#### Stok Bilgilerini Güncelleme
```http
PUT /api/v1/warehouse-stocks/{stockId}
```

**Request Body:**
```json
{
    "minStock": 20,
    "maxStock": 200
}
```

**Response:** `200 OK`
```json
{
    "id": 1,
    "warehouse": {
        "id": 1,
        "name": "Ana Depo",
        "code": "WH001",
        "address": "İstanbul, Türkiye",
        "phone": "5551234567",
        "email": "anadepo@anabilim.com",
        "managerName": "Ahmet Yılmaz",
        "isActive": true,
        "createdAt": "2024-03-20T10:00:00",
        "updatedAt": "2024-03-20T10:00:00"
    },
    "product": {
        "id": 1,
        "name": "Kalem",
        "code": "P001",
        "unit": "ADET"
    },
    "currentStock": 100,
    "minStock": 20,
    "maxStock": 200,
    "createdAt": "2024-03-20T10:00:00",
    "updatedAt": "2024-03-20T10:00:00"
}
```

#### Stok Hareketi Oluşturma
```http
POST /api/v1/warehouse-stocks/{stockId}/movements
```

**Request Body:**
```json
{
    "quantity": 50,
    "movementType": "IN",
    "referenceType": "PURCHASE_ORDER",
    "referenceId": 1,
    "notes": "Satın alma siparişinden giriş"
}
```

**Response:** `200 OK`
```json
{
    "id": 1,
    "warehouseStock": {
        "id": 1,
        "warehouse": {
            "id": 1,
            "name": "Ana Depo",
            "code": "WH001",
            "address": "İstanbul, Türkiye",
            "phone": "5551234567",
            "email": "anadepo@anabilim.com",
            "managerName": "Ahmet Yılmaz",
            "isActive": true,
            "createdAt": "2024-03-20T10:00:00",
            "updatedAt": "2024-03-20T10:00:00"
        },
        "product": {
            "id": 1,
            "name": "Kalem",
            "code": "P001",
            "unit": "ADET"
        },
        "currentStock": 150,
        "minStock": 20,
        "maxStock": 200,
        "createdAt": "2024-03-20T10:00:00",
        "updatedAt": "2024-03-20T10:00:00"
    },
    "quantity": 50,
    "movementType": "IN",
    "referenceType": "PURCHASE_ORDER",
    "referenceId": 1,
    "notes": "Satın alma siparişinden giriş",
    "createdAt": "2024-03-20T10:00:00",
    "updatedAt": "2024-03-20T10:00:00"
}
```

#### Stok Hareketlerini Listeleme
```http
GET /api/v1/warehouse-stocks/{stockId}/movements?referenceType=PURCHASE_ORDER&referenceId=1&page=0&size=10
```

**Response:** `200 OK`
```json
{
    "content": [
        {
            "id": 1,
            "warehouseStock": {
                "id": 1,
                "warehouse": {
                    "id": 1,
                    "name": "Ana Depo",
                    "code": "WH001",
                    "address": "İstanbul, Türkiye",
                    "phone": "5551234567",
                    "email": "anadepo@anabilim.com",
                    "managerName": "Ahmet Yılmaz",
                    "isActive": true,
                    "createdAt": "2024-03-20T10:00:00",
                    "updatedAt": "2024-03-20T10:00:00"
                },
                "product": {
                    "id": 1,
                    "name": "Kalem",
                    "code": "P001",
                    "unit": "ADET"
                },
                "currentStock": 150,
                "minStock": 20,
                "maxStock": 200,
                "createdAt": "2024-03-20T10:00:00",
                "updatedAt": "2024-03-20T10:00:00"
            },
            "quantity": 50,
            "movementType": "IN",
            "referenceType": "PURCHASE_ORDER",
            "referenceId": 1,
            "notes": "Satın alma siparişinden giriş",
            "createdAt": "2024-03-20T10:00:00",
            "updatedAt": "2024-03-20T10:00:00"
        }
    ],
    "pageable": {
        "pageNumber": 0,
        "pageSize": 10,
        "sort": {
            "empty": true,
            "sorted": false,
            "unsorted": true
        },
        "offset": 0,
        "paged": true,
        "unpaged": false
    },
    "last": true,
    "totalElements": 1,
    "totalPages": 1,
    "size": 10,
    "number": 0,
    "sort": {
        "empty": true,
        "sorted": false,
        "unsorted": true
    },
    "first": true,
    "numberOfElements": 1,
    "empty": false
} 

## School Management API

### Okul Oluşturma
```http
POST /api/schools
```

**Request Body:**
```json
{
    "name": "Atatürk İlkokulu",
    "code": "ATK_ILK_001",
    "address": "Cumhuriyet Mahallesi, Atatürk Caddesi No:15, Merkez",
    "phone": "+90 212 555 0101",
    "email": "info@ataturkilkokulu.edu.tr",
    "principalName": "Mehmet Yılmaz",
    "district": "Merkez",
    "city": "İstanbul",
    "schoolType": "İlkokul",
    "studentCapacity": 500
}
```

**Response:** `201 Created`
```json
{
    "id": 1,
    "name": "Atatürk İlkokulu",
    "code": "ATK_ILK_001",
    "address": "Cumhuriyet Mahallesi, Atatürk Caddesi No:15, Merkez",
    "phone": "+90 212 555 0101",
    "email": "info@ataturkilkokulu.edu.tr",
    "principalName": "Mehmet Yılmaz",
    "district": "Merkez",
    "city": "İstanbul",
    "schoolType": "İlkokul",
    "studentCapacity": 500,
    "active": true,
    "employeeCount": 0,
    "transferCount": 0,
    "createdAt": "2024-12-01T14:30:00",
    "updatedAt": "2024-12-01T14:30:00"
}
```

### Okul Güncelleme
```http
PUT /api/schools/{id}
```

**Request Body:**
```json
{
    "name": "Atatürk İlkokulu - Güncellenmiş",
    "code": "ATK_ILK_001",
    "address": "Cumhuriyet Mahallesi, Atatürk Caddesi No:15, Merkez - Yeni Adres",
    "phone": "+90 212 555 0102",
    "email": "yeni@ataturkilkokulu.edu.tr",
    "principalName": "Ahmet Demir",
    "district": "Merkez",
    "city": "İstanbul",
    "schoolType": "İlkokul",
    "studentCapacity": 600
}
```

**Response:** `200 OK`
```json
{
    "id": 1,
    "name": "Atatürk İlkokulu - Güncellenmiş",
    "code": "ATK_ILK_001",
    "address": "Cumhuriyet Mahallesi, Atatürk Caddesi No:15, Merkez - Yeni Adres",
    "phone": "+90 212 555 0102",
    "email": "yeni@ataturkilkokulu.edu.tr",
    "principalName": "Ahmet Demir",
    "district": "Merkez",
    "city": "İstanbul",
    "schoolType": "İlkokul",
    "studentCapacity": 600,
    "active": true,
    "employeeCount": 0,
    "transferCount": 0,
    "createdAt": "2024-12-01T14:30:00",
    "updatedAt": "2024-12-01T15:45:00"
}
```

### Okul Silme (Deaktive Etme)
```http
DELETE /api/schools/{id}
```

**Response:** `204 No Content`

### Okul Detayı Getirme
```http
GET /api/schools/{id}
```

**Response:** `200 OK`
```json
{
    "id": 1,
    "name": "Atatürk İlkokulu",
    "code": "ATK_ILK_001",
    "address": "Cumhuriyet Mahallesi, Atatürk Caddesi No:15, Merkez",
    "phone": "+90 212 555 0101",
    "email": "info@ataturkilkokulu.edu.tr",
    "principalName": "Mehmet Yılmaz",
    "district": "Merkez",
    "city": "İstanbul",
    "schoolType": "İlkokul",
    "studentCapacity": 500,
    "active": true,
    "employeeCount": 12,
    "transferCount": 5,
    "createdAt": "2024-12-01T14:30:00",
    "updatedAt": "2024-12-01T14:30:00"
}
```

### Okul Kodu ile Getirme
```http
GET /api/schools/code/{code}
```

**Response:** `200 OK` (Yukarıdaki ile aynı format)

### Tüm Okulları Listeleme (Sayfalı)
```http
GET /api/schools?page=0&size=10&sort=name,asc
```

**Response:** `200 OK`
```json
{
    "content": [
        {
            "id": 1,
            "name": "Atatürk İlkokulu",
            "code": "ATK_ILK_001",
            "address": "Cumhuriyet Mahallesi, Atatürk Caddesi No:15, Merkez",
            "phone": "+90 212 555 0101",
            "email": "info@ataturkilkokulu.edu.tr",
            "principalName": "Mehmet Yılmaz",
            "district": "Merkez",
            "city": "İstanbul",
            "schoolType": "İlkokul",
            "studentCapacity": 500,
            "active": true,
            "employeeCount": 12,
            "transferCount": 5,
            "createdAt": "2024-12-01T14:30:00",
            "updatedAt": "2024-12-01T14:30:00"
        }
    ],
    "pageable": {
        "pageNumber": 0,
        "pageSize": 10,
        "sort": {
            "empty": false,
            "sorted": true,
            "unsorted": false
        },
        "offset": 0,
        "paged": true,
        "unpaged": false
    },
    "last": true,
    "totalElements": 1,
    "totalPages": 1,
    "size": 10,
    "number": 0,
    "sort": {
        "empty": false,
        "sorted": true,
        "unsorted": false
    },
    "first": true,
    "numberOfElements": 1,
    "empty": false
}
```

### Aktif Okulları Listeleme
```http
GET /api/schools/active
```

**Response:** `200 OK`
```json
[
    {
        "id": 1,
        "name": "Atatürk İlkokulu",
        "code": "ATK_ILK_001",
        "address": "Cumhuriyet Mahallesi, Atatürk Caddesi No:15, Merkez",
        "phone": "+90 212 555 0101",
        "email": "info@ataturkilkokulu.edu.tr",
        "principalName": "Mehmet Yılmaz",
        "district": "Merkez",
        "city": "İstanbul",
        "schoolType": "İlkokul",
        "studentCapacity": 500,
        "active": true,
        "employeeCount": 12,
        "transferCount": 5,
        "createdAt": "2024-12-01T14:30:00",
        "updatedAt": "2024-12-01T14:30:00"
    }
]
```

### Okul Arama
```http
GET /api/schools/search?query=Atatürk&page=0&size=10
```

**Response:** `200 OK` (Sayfalı format ile)

### Şehre Göre Okul Listeleme
```http
GET /api/schools/city/{city}
```

**Response:** `200 OK` (Array formatında)

### İlçeye Göre Okul Listeleme
```http
GET /api/schools/district/{district}
```

**Response:** `200 OK` (Array formatında)

### Okul Türüne Göre Listeleme
```http
GET /api/schools/type/{schoolType}
```

**Response:** `200 OK` (Array formatında)

### Aktif Okul Sayısı
```http
GET /api/schools/statistics/count
```

**Response:** `200 OK`
```json
25
```

### Şehirlere Göre Okul Sayısı
```http
GET /api/schools/statistics/by-city
```

**Response:** `200 OK`
```json
[
    ["İstanbul", 15],
    ["Ankara", 8],
    ["İzmir", 2]
]
```

## Asset Transfer Management API

### Eşya Transferi Oluşturma
```http
POST /api/asset-transfers
```

**Request Body:**
```json
{
    "sourceWarehouseId": 1,
    "targetSchoolId": 1,
    "transferDate": "2024-12-15T10:00:00",
    "notes": "Okul açılışı için gerekli eşyalar",
    "items": [
        {
            "productId": 1,
            "requestedQuantity": 10,
            "notes": "Sınıf masaları",
            "serialNumbers": "MASA001-MASA010",
            "conditionNotes": "Yeni, hasarsız"
        },
        {
            "productId": 2,
            "requestedQuantity": 20,
            "notes": "Öğrenci sandalyeleri",
            "serialNumbers": "SAND001-SAND020",
            "conditionNotes": "İyi durumda"
        }
    ]
}
```

**Response:** `201 Created`
```json
{
    "id": 1,
    "transferCode": "TR-2024-123456",
    "status": "PENDING",
    "statusDisplayName": "Beklemede",
    "transferDate": "2024-12-15T10:00:00",
    "actualTransferDate": null,
    "notes": "Okul açılışı için gerekli eşyalar",
    "sourceWarehouse": {
        "id": 1,
        "name": "Ana Depo",
        "code": "WH001",
        "address": "İstanbul, Türkiye"
    },
    "targetSchool": {
        "id": 1,
        "name": "Atatürk İlkokulu",
        "code": "ATK_ILK_001",
        "city": "İstanbul",
        "district": "Merkez"
    },
    "requestedBy": null,
    "approvedBy": null,
    "deliveredBy": null,
    "receivedBy": null,
    "items": [
        {
            "id": 1,
            "product": {
                "id": 1,
                "name": "Masa",
                "code": "MASA001",
                "productType": "Mobilya",
                "unit": "Adet",
                "category": "Mobilya"
            },
            "requestedQuantity": 10,
            "transferredQuantity": null,
            "remainingQuantity": 10,
            "notes": "Sınıf masaları",
            "serialNumbers": "MASA001-MASA010",
            "conditionNotes": "Yeni, hasarsız",
            "fullyTransferred": false,
            "partiallyTransferred": false,
            "createdAt": "2024-12-01T16:00:00",
            "updatedAt": "2024-12-01T16:00:00"
        },
        {
            "id": 2,
            "product": {
                "id": 2,
                "name": "Sandalye",
                "code": "SAND001",
                "productType": "Mobilya",
                "unit": "Adet",
                "category": "Mobilya"
            },
            "requestedQuantity": 20,
            "transferredQuantity": null,
            "remainingQuantity": 20,
            "notes": "Öğrenci sandalyeleri",
            "serialNumbers": "SAND001-SAND020",
            "conditionNotes": "İyi durumda",
            "fullyTransferred": false,
            "partiallyTransferred": false,
            "createdAt": "2024-12-01T16:00:00",
            "updatedAt": "2024-12-01T16:00:00"
        }
    ],
    "totalItemCount": 2,
    "totalRequestedQuantity": 30,
    "totalTransferredQuantity": 0,
    "createdAt": "2024-12-01T16:00:00",
    "updatedAt": "2024-12-01T16:00:00"
}
```

### Transfer Durumu Güncelleme
```http
PUT /api/asset-transfers/{id}/status?status=PREPARING
```

**Response:** `200 OK` (Yukarıdaki format ile, status alanları güncellenmiş)

### Transfer Onaylama
```http
PUT /api/asset-transfers/{id}/approve?approvedByUserId=2
```

**Response:** `200 OK`
```json
{
    "id": 1,
    "transferCode": "TR-2024-123456",
    "status": "APPROVED",
    "statusDisplayName": "Onaylandı",
    "transferDate": "2024-12-15T10:00:00",
    "actualTransferDate": null,
    "notes": "Okul açılışı için gerekli eşyalar",
    "sourceWarehouse": {
        "id": 1,
        "name": "Ana Depo",
        "code": "WH001",
        "address": "İstanbul, Türkiye"
    },
    "targetSchool": {
        "id": 1,
        "name": "Atatürk İlkokulu",
        "code": "ATK_ILK_001",
        "city": "İstanbul",
        "district": "Merkez"
    },
    "requestedBy": null,
    "approvedBy": {
        "id": 2,
        "fullName": "Ahmet Yılmaz",
        "email": "ahmet@anabilim.com",
        "department": "Satın Alma",
        "position": "Müdür"
    },
    "deliveredBy": null,
    "receivedBy": null,
    "items": [
        // ... items array
    ],
    "totalItemCount": 2,
    "totalRequestedQuantity": 30,
    "totalTransferredQuantity": 0,
    "createdAt": "2024-12-01T16:00:00",
    "updatedAt": "2024-12-01T16:30:00"
}
```

### Transfer Başlatma
```http
PUT /api/asset-transfers/{id}/start?deliveredByUserId=3
```

**Response:** `200 OK` (Status: IN_TRANSIT, deliveredBy dolu, actualTransferDate set)

### Transfer Tamamlama
```http
PUT /api/asset-transfers/{id}/complete?receivedByUserId=4
```

**Response:** `200 OK` (Status: COMPLETED, receivedBy dolu)

### Transfer İptal Etme
```http
PUT /api/asset-transfers/{id}/cancel?reason=Okul ihtiyaç değişikliği
```

**Response:** `200 OK` (Status: CANCELLED, notes'a iptal nedeni eklendi)

### Transfer Silme
```http
DELETE /api/asset-transfers/{id}
```

**Response:** `204 No Content`

### Transfer Detayı Getirme
```http
GET /api/asset-transfers/{id}
```

**Response:** `200 OK` (Yukarıdaki format ile)

### Transfer Kodu ile Getirme
```http
GET /api/asset-transfers/code/{transferCode}
```

**Response:** `200 OK` (Yukarıdaki format ile)

### Tüm Transferleri Listeleme
```http
GET /api/asset-transfers?page=0&size=10&sort=createdAt,desc
```

**Response:** `200 OK` (Sayfalı format)

### Duruma Göre Transfer Listeleme
```http
GET /api/asset-transfers/status/{status}?page=0&size=10
```

**Response:** `200 OK` (Sayfalı format)

### Depoya Göre Transfer Listeleme
```http
GET /api/asset-transfers/warehouse/{warehouseId}?page=0&size=10
```

**Response:** `200 OK` (Sayfalı format)

### Okula Göre Transfer Listeleme
```http
GET /api/asset-transfers/school/{schoolId}?page=0&size=10
```

**Response:** `200 OK` (Sayfalı format)

### Transfer Arama
```http
GET /api/asset-transfers/search?query=TR-2024&page=0&size=10
```

**Response:** `200 OK` (Sayfalı format)

### Filtreli Transfer Listeleme
```http
GET /api/asset-transfers/filter?status=PENDING&warehouseId=1&schoolId=1&startDate=2024-12-01T00:00:00&endDate=2024-12-31T23:59:59&page=0&size=10
```

**Response:** `200 OK` (Sayfalı format)

### Bekleyen Transferler
```http
GET /api/asset-transfers/pending
```

**Response:** `200 OK`
```json
[
    {
        // Transfer objesi (PENDING, APPROVED, PREPARING durumundakiler)
    }
]
```

### Geciken Transferler
```http
GET /api/asset-transfers/overdue
```

**Response:** `200 OK`
```json
[
    {
        // Transfer objesi (transferDate geçmiş olanlar)
    }
]
```

### Transfer Kalemi Güncelleme
```http
PUT /api/asset-transfers/{transferId}/items/{itemId}?transferredQuantity=8
```

**Response:** `200 OK` (Güncellenmiş transfer objesi)

### Transfer İstatistikleri

#### Duruma Göre Transfer Sayısı
```http
GET /api/asset-transfers/statistics/count/{status}
```

**Response:** `200 OK`
```json
15
```

#### Tüm Durumlara Göre Transfer Sayıları
```http
GET /api/asset-transfers/statistics/count-by-status
```

**Response:** `200 OK`
```json
[
    ["PENDING", 5],
    ["APPROVED", 3],
    ["COMPLETED", 12],
    ["CANCELLED", 2]
]
```

#### En Çok Transfer Alan Okullar
```http
GET /api/asset-transfers/statistics/top-schools?startDate=2024-01-01T00:00:00
```

**Response:** `200 OK`
```json
[
    ["Atatürk İlkokulu", 8],
    ["Cumhuriyet Ortaokulu", 5],
    ["Gazi Lisesi", 3]
]
```

## Transfer Durumları

- **PENDING**: Beklemede - Yeni oluşturulan transfer
- **APPROVED**: Onaylandı - Yetkili tarafından onaylandı
- **PREPARING**: Hazırlanıyor - Eşyalar hazırlanıyor
- **IN_TRANSIT**: Yolda - Transfer başladı
- **DELIVERED**: Teslim Edildi - Okula teslim edildi
- **COMPLETED**: Tamamlandı - Transfer tamamlandı
- **CANCELLED**: İptal Edildi - Transfer iptal edildi
- **REJECTED**: Reddedildi - Transfer reddedildi
- **PARTIALLY_COMPLETED**: Kısmi Tamamlandı - Bazı eşyalar transfer edildi 