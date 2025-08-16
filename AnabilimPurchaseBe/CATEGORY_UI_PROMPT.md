# Anabilim Satın Alma Sistemi - Kategori Yönetimi UI/UX Tasarım Kılavuzu

## Genel Bakış
Anabilim Satın Alma Sistemi'nin kategori yönetim modülü için kullanıcı dostu, modern ve etkili bir arayüz tasarımı gerekiyor. Kategoriler, ürün yönetiminin temelidir ve hiyerarşik bir yapıda organize edilmelidir.

## Temel Özellikler

### 1. Kategori Listeleme Ekranı
- Tree view yapısında hiyerarşik kategori görünümü
- Her kategori için:
  * Kategori adı
  * Kategori kodu
  * Aktif/Pasif durumu
  * Alt kategori sayısı
  * İçerdiği ürün sayısı
- Kolay gezinme için expand/collapse kontrolleri
- Sağ tıklama menüsü ile hızlı işlemler
- Drag & drop ile kategori taşıma özelliği

### 2. Kategori Oluşturma Formu
- İki seçenek sunulmalı:
  * Ana Kategori Oluşturma
  * Alt Kategori Oluşturma
- Form alanları:
  * Kategori Adı (zorunlu)
  * Kategori Kodu (zorunlu, otomatik önerme özelliği)
  * Açıklama (opsiyonel)
  * Üst Kategori Seçimi (alt kategori için zorunlu)
- Validation kuralları:
  * Kod formatı: Sadece büyük harf ve alt çizgi (_)
  * Benzersiz kod kontrolü
  * Minimum 2, maksimum 100 karakter uzunluğunda isim

### 3. Kategori Düzenleme Formu
- Mevcut bilgilerin ön yüklemesi
- Değiştirilemez alanlar:
  * Kategori Kodu
- Düzenlenebilir alanlar:
  * Kategori Adı
  * Açıklama
  * Üst Kategori
  * Aktiflik Durumu
- Bulk editing imkanı (çoklu kategori seçimi)

## UI Bileşenleri

### 1. Kategori Ağacı (Tree View)
```
└── Bilgisayar [BIL]
    ├── Dizüstü Bilgisayar [BIL_LAP]
    │   ├── Gaming Laptop [BIL_LAP_GAM]
    │   └── İş Bilgisayarı [BIL_LAP_BUS]
    └── Masaüstü Bilgisayar [BIL_DSK]
```
- İç içe geçmiş liste yapısı
- Her seviye için farklı indent
- Expand/collapse ikonları
- Hover durumunda aksiyon butonları
- Aktif/pasif durumu için görsel gösterge

### 2. Toolbar ve Filtreler
- Yeni Kategori butonu (split button: Ana/Alt kategori)
- Arama kutusu (anlık filtreleme)
- Filtreler:
  * Aktif/Pasif durumu
  * Üst kategoriler
  * Alt kategori içerenler
  * Ürün içerenler
- Görünüm seçenekleri:
  * Tree view
  * Grid view
  * List view

### 3. Sağ Tıklama (Context) Menüsü
- Düzenle
- Alt Kategori Ekle
- Aktif/Pasif Yap
- Taşı
- Sil
- Detayları Görüntüle

## Etkileşim ve Animasyonlar

### 1. Drag & Drop
- Kategorileri sürükleyerek taşıma
- Hedef bölge vurgulaması
- Geçerli/geçersiz taşıma görsel feedback'i
- Taşıma sırasında yardımcı çizgiler

### 2. Bildirimler
- İşlem başarılı/başarısız toast mesajları
- Yükleniyor durumu için skeleton screens
- Validation hataları için inline feedback
- Silme işlemi için onay modalı

## Responsive Tasarım
- Mobil görünüm için:
  * Collapse edilebilir kategori ağacı
  * Touch-friendly büyük dokunma alanları
  * Swipe gestures ile temel işlemler
  * Kompakt toolbar

## Erişilebilirlik
- Klavye navigasyonu
- ARIA etiketleri
- Yüksek kontrast tema desteği
- Screen reader uyumluluğu

## Renk Şeması ve Tipografi
- Ana Renkler:
  * Kategori aktif: #28a745
  * Kategori pasif: #dc3545
  * Seçili kategori: #007bff
  * Hover durumu: #f8f9fa
- Font:
  * Başlıklar: 16px/20px
  * Normal metin: 14px/18px
  * Kod: monospace

## Örnek Kullanım Senaryoları

### 1. Yeni Alt Kategori Oluşturma
1. Üst kategoriye sağ tıklama
2. "Alt Kategori Ekle" seçimi
3. Form açılır (üst kategori otomatik seçili)
4. Bilgilerin girilmesi
5. Otomatik kod önerisi
6. Kaydet ve ağaçta göster

### 2. Kategori Taşıma
1. Kategoriyi sürüklemeye başla
2. Geçerli hedef kategoriler vurgulanır
3. Hedef üzerinde hover - içine/yanına göstergesi
4. Bırakma ve pozisyon güncelleme
5. Başarılı işlem bildirimi

### 3. Toplu Güncelleme
1. Ctrl/Cmd + tıklama ile çoklu seçim
2. Sağ tıklama menüsünden "Düzenle"
3. Toplu güncelleme formu
4. Değişikliklerin önizlemesi
5. Kaydet ve güncelleme

## API Entegrasyonu
Tüm UI etkileşimleri aşağıdaki API endpoint'leri ile çalışmalıdır:

```http
POST   /api/categories       // Yeni kategori oluşturma
PUT    /api/categories/{id}  // Kategori güncelleme
DELETE /api/categories/{id}  // Kategori silme
GET    /api/categories      // Tüm kategorileri getirme
GET    /api/categories/root // Ana kategorileri getirme
GET    /api/categories/sub/{parentId} // Alt kategorileri getirme
GET    /api/categories/search?name={searchTerm} // Kategori arama
```

## Performans Gereksinimleri
- İlk yükleme: < 2 saniye
- Kategori ağacı render: < 500ms
- Drag & drop tepki: < 100ms
- Arama tepki süresi: < 300ms 