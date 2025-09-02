# 🏷️ Zimmet (Assignment) Sistemi - Detaylı Dokümantasyon

## 📋 Sistem Genel Bakış

Zimmet sistemi, okul malzemelerinin kullanıcılara veya konumlara atanmasını, takibini ve yönetimini sağlayan kapsamlı bir modüldür. Ürün tipine göre farklı davranış sergiler ve detaylı raporlama imkanı sunar.

---
 

## 🏷️ Ürün Tipine Göre Zimmet Davranışları

### **1. CONSUMABLE (Sarf Malzemesi)**
- **Takip Türü:** Adet bazında
- **Geri Kazandırma:** ❌ Mümkün değil
- **Süre Atama:** ✅ Mümkün
- **Örnek:** Kalem, kağıt, silgi

### **2. FIXED_ASSET (Demirbaş)**
- **Takip Türü:** Seri numarası bazında
- **Geri Kazandırma:** ✅ Mümkün (seri numarası ile)
- **Süre Atama:** ✅ Mümkün
- **Örnek:** Bilgisayar, yazıcı

### **3. SEMI_FIXED_ASSET (Yarı Demirbaş)**
- **Takip Türü:** Adet bazında
- **Geri Kazandırma:** ✅ Mümkün (adet ile)
- **Süre Atama:** ✅ Mümkün
- **Örnek:** Projeksiyon cihazı, mikrofon

---

## 🔌 API Endpoint'leri

### **1. CRUD İşlemleri**

#### **Zimmet Oluşturma**
```http
POST /api/v1/assignments
Content-Type: application/json

{
  "productId": 1,                    // Zorunlu
  "stockItemId": 123,                // Seri numaralı ürünler için
  "quantity": 1,                     // Varsayılan: 1
  "assignedUserId": 5,               // Kullanıcı zimmeti için
  "assignedLocationId": 2,           // Konum bilgisi
  "locationName": "Kütüphane",       // Konum zimmeti için
  "locationDetails": "Raf A-5",      // Konum detayları
  "expectedReturnDate": "2024-12-31", // Süre
  "notes": "Öğretmen bilgisayarı"   // Notlar
}
```

**Response:**
```json
{
  "success": true,
  "message": "Zimmet başarıyla oluşturuldu",
  "data": {
    "id": 1,
    "stockItemId": 123,
    "serialNumber": "SN123456",
    "productId": 1,
    "productName": "Dell Laptop",
    "productCode": "LAP001",
    "assignedUserId": 5,
    "assignedUserName": "Ahmet Yılmaz",
    "assignedLocationId": 2,
    "assignedLocationName": "Kütüphane",
    "locationName": null,
    "locationDetails": null,
    "assignmentDate": "2024-01-15T10:30:00",
    "expectedReturnDate": "2024-12-31",
    "actualReturnDate": null,
    "status": "ACTIVE",
    "quantity": 1,
    "notes": "Öğretmen bilgisayarı",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:00",
    "expired": false,
    "userAssignment": true,
    "locationAssignment": false,
    "canBeReturned": true
  }
}
```

#### **Zimmet Detayı Görüntüleme**
```http
GET /api/v1/assignments/{id}
```

#### **Tüm Zimmetleri Listeleme**
```http
GET /api/v1/assignments
```

#### **Zimmet Silme**
```http
DELETE /api/v1/assignments/{id}
```

### **2. Ürün Bazlı İşlemler**

#### **Ürüne Göre Zimmetler**
```http
GET /api/v1/assignments/product/{productId}
```

#### **Ürün + Durum Filtreleme**
```http
GET /api/v1/assignments/product/{productId}/status/{status}
```

### **3. Kullanıcı Bazlı İşlemler**

#### **Kullanıcının Zimmetleri**
```http
GET /api/v1/assignments/user/{userId}
```

#### **Kullanıcının Aktif Zimmetleri**
```http
GET /api/v1/assignments/user/{userId}/active
```

#### **Kullanıcı + Durum Filtreleme**
```http
GET /api/v1/assignments/user/{userId}/status/{status}
```

### **4. Okul/Konum Bazlı İşlemler**

#### **Konuma Zimmetler**
```http
GET /api/v1/assignments/location/{locationId}
```

#### **Konuma Zimmetler**
```http
GET /api/v1/assignments/location?locationName=Kütüphane
```

#### **Konumun Aktif Zimmetleri**
```http
GET /api/v1/assignments/location/active?locationName=Kütüphane
```

### **5. Durum İşlemleri**

#### **Duruma Göre Zimmetler**
```http
GET /api/v1/assignments/status/{status}
```

#### **Aktif Zimmetler**
```http
GET /api/v1/assignments/active
```

#### **Süresi Dolmuş Zimmetler**
```http
GET /api/v1/assignments/expired
```

### **6. Zimmet İşlemleri**

#### **Zimmet İade Etme**
```http
POST /api/v1/assignments/{id}/return
```

#### **Zimmeti Kayıp İşaretleme**
```http
POST /api/v1/assignments/{id}/lost
```

#### **Zimmeti Hasarlı İşaretleme**
```http
POST /api/v1/assignments/{id}/damaged
```

#### **Kullanıcıya Transfer**
```http
POST /api/v1/assignments/{id}/transfer/user?newUserId=10&newLocationId=3
```

#### **Konuma Transfer**
```http
POST /api/v1/assignments/{id}/transfer/location?newLocationName=Laboratuvar&newLocationDetails=Kimya Lab
```

### **7. Sayım İşlemleri**

#### **Ürün Zimmet Sayısı**
```http
GET /api/v1/assignments/count/product/{productId}
```

#### **Kullanıcı Zimmet Sayısı**
```http
GET /api/v1/assignments/count/user/{userId}
```

#### **Konum Zimmet Sayısı**
```http
GET /api/v1/assignments/count/location/{locationId}
```

#### **Konum Zimmet Sayısı**
```http
GET /api/v1/assignments/count/location?locationName=Kütüphane
```

#### **Durum Bazlı Sayım**
```http
GET /api/v1/assignments/count/status/{status}
```

#### **Aktif Zimmet Sayısı**
```http
GET /api/v1/assignments/count/active
```

### **8. Aktif/Pasif İşlemleri**

#### **Sadece Aktif Zimmetler**
```http
GET /api/v1/assignments/active-only
```

#### **Zimmeti Aktif Yapma**
```http
POST /api/v1/assignments/{id}/activate
```

#### **Zimmeti Pasif Yapma**
```http
POST /api/v1/assignments/{id}/deactivate
```

---

## 🔄 İş Akışları

### **1. Bilgisayar Zimmeti (FIXED_ASSET)**

#### **Adım 1: Zimmet Oluşturma**
```json
POST /api/v1/assignments
{
  "productId": 1,
  "stockItemId": 123,
  "assignedUserId": 5,
  "assignedLocationId": 2,
  "expectedReturnDate": "2024-12-31",
  "notes": "Öğretmen bilgisayarı"
}
```

#### **Adım 2: Zimmet Durumu Kontrolü**
```http
GET /api/v1/assignments/user/5/active
```

#### **Adım 3: Zimmet İade Etme**
```http
POST /api/v1/assignments/1/return
```

### **2. Sarf Malzemesi Zimmeti (CONSUMABLE)**

#### **Adım 1: Zimmet Oluşturma**
```json
POST /api/v1/assignments
{
  "productId": 15,
  "quantity": 50,
  "assignedUserId": 8,
  "expectedReturnDate": "2024-06-30",
  "notes": "Sınıf malzemeleri"
}
```

#### **Adım 2: Kullanım Takibi**
```http
GET /api/v1/assignments/user/8/status/ACTIVE
```

**Not:** CONSUMABLE ürünler geri kazandırılamaz.

### **3. Konum Zimmeti**

#### **Adım 1: Konum Zimmeti Oluşturma**
```json
POST /api/v1/assignments
{
  "productId": 25,
  "quantity": 10,
  "locationName": "Kütüphane",
  "locationDetails": "Raf A-5",
  "notes": "Kütüphane mobilyası"
}
```

#### **Adım 2: Konum Zimmetlerini Listeleme**
```http
GET /api/v1/assignments/location?locationName=Kütüphane
```

---

## 📈 Raporlama Senaryoları

### **1. Konum Bazlı Rapor**
```http
GET /api/v1/assignments/location/2
GET /api/v1/assignments/count/location/2
```

### **2. Öğretmen Bazlı Rapor**
```http
GET /api/v1/assignments/user/5
GET /api/v1/assignments/count/user/5
```

### **3. Ürün Bazlı Rapor**
```http
GET /api/v1/assignments/product/1
GET /api/v1/assignments/count/product/1
```

### **4. Süresi Dolmuş Zimmetler**
```http
GET /api/v1/assignments/expired
```

### **5. Kayıp/Hasarlı Zimmetler**
```http
GET /api/v1/assignments/status/LOST
GET /api/v1/assignments/status/DAMAGED
```

---

## ⚠️ Validasyon Kuralları

### **1. Zimmet Oluşturma Validasyonları**
- `productId` zorunlu
- `assignedUserId` VEYA `locationName` zorunlu (ikisi birden olamaz)
- `stockItemId` sadece seri numaralı ürünler için
- `quantity` minimum 1 olmalı
- `expectedReturnDate` gelecek tarih olmalı

### **2. İş Mantığı Kuralları**
- CONSUMABLE ürünler geri kazandırılamaz
- FIXED_ASSET ürünler seri numarası ile geri kazandırılır
- SEMI_FIXED_ASSET ürünler adet ile geri kazandırılır
- Aktif zimmet transfer edilebilir
- İade edilmiş zimmet tekrar aktif yapılamaz

---

## 🏗️ Teknik Detaylar

### **1. Entity Yapısı**
- `Assignment` - Ana zimmet entity'si
- `AssignmentStatus` - Zimmet durumları enum'u
- `AssignmentRepository` - Veritabanı işlemleri
- `AssignmentService` - İş mantığı
- `AssignmentController` - API endpoint'leri
- `AssignmentMapper` - Entity-DTO dönüşümleri

### **2. DTO Yapısı**
- `CreateAssignmentDto` - Zimmet oluşturma request'i
- `AssignmentDto` - Zimmet response'u

### **3. İlişkiler**
- `Assignment` ↔ `Product` (Many-to-One)
- `Assignment` ↔ `StockItem` (Many-to-One, opsiyonel)
- `Assignment` ↔ `User` (Many-to-One, opsiyonel)
- `Assignment` ↔ `Location` (Many-to-One, opsiyonel)

---

## 🎯 Kullanım Senaryoları

### **Senaryo 1: Öğretmen Bilgisayarı Zimmeti**
1. IT departmanı bilgisayarı stoktan çıkarır
2. Öğretmene zimmet eder
3. Öğretmen kullanır
4. Öğretmen değişince transfer edilir
5. Sonunda stoka geri kazandırılır

### **Senaryo 2: Sınıf Malzemesi Zimmeti**
1. Sınıf öğretmenine sarf malzemesi zimmet edilir
2. Öğretmen kullanır
3. Malzeme tükenir
4. Zimmet otomatik olarak kapanır

### **Senaryo 3: Kütüphane Mobilyası**
1. Kütüphaneye mobilya zimmet edilir
2. Konum bazında takip edilir
3. Gerektiğinde başka konuma transfer edilir

---

## 🧪 Test Senaryoları

### **1. Birim Testleri**
- Zimmet oluşturma validasyonları
- Ürün tipine göre davranış testleri
- Durum değişikliği testleri

### **2. Entegrasyon Testleri**
- API endpoint testleri
- Veritabanı işlem testleri
- İş mantığı testleri

### **3. Postman Koleksiyonu**
- Tüm endpoint'ler için test case'leri
- Örnek request/response'lar
- Hata senaryoları
 
