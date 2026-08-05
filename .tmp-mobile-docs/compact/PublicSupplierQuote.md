**Route:** `/supplier-quote/:quoteUid`
**Parent:** ZW-55
**Etiket:** MOBILE

**Özet**  
Tedarikçilere e-posta/link ile gönderilen **public** teklif formu. Giriş gerektirmez; Navigation yok.

**Route & Security**  
- Route: `/supplier-quote/:quoteUid`  
- **Public** (PrivateRoute yok, token yok)  
- Kimlik doğrulama: sadece `quoteUid` bilgisi

**Tip**  
Public form (read + update)

**Amaç**  
Tedarikçinin ürün bilgilerini görüp fiyat/miktar/teslim koşullarını girmesi veya güncellemesi.

---

#### Yükleme akışı

1. `GET /api/supplier-quotes/:quoteUid`  
2. Başarılıysa form mevcut değerlerle doldurulur  
3. Hata / bulunamama → tam ekran hata/boş mesaj

---

#### Salt okunur — Ürün bilgileri

- Ürün Adı (`quote.product.name`)  
- Ürün Kodu (`quote.product.code`)  
- Açıklama (`quote.product.description`)  
- Kategori (`quote.product.category`)

#### Salt okunur — Tedarikçi bilgileri

- Firma Adı (`quote.supplier.companyName`)  
- Vergi Numarası  
- İletişim Kişisi, Telefon, E-posta

---

#### Teklif form alanları

| Alan | Tip | Zorunlu | Validasyon |
|------|-----|---------|------------|
| unitPrice | number (step 0.01) | Evet | > 0 |
| quantity | number (min 1) | Evet | > 0 |
| currency | select | Evet | TRY / USD / EUR |
| supplierReference | text | Evet (HTML required) | |
| deliveryDate | date | Evet | |
| validityDate | date | Evet | |
| notes | textarea (4 satır) | Hayır | |

**Submit payload:**  
- `deliveryDate` → `...T00:00:00`  
- `validityDate` → `...T23:59:59`  
- `PUT /api/supplier-quotes/:quoteUid`

**Buton:** **Teklifi Gönder** (loading spinner)

---

#### Teklif yaşam döngüsü (backend tarafı, detay sayfasında görünür)

| status | Anlam (UI) |
|--------|------------|
| PENDING | Tedarikçi henüz yanıtlamadı / satın alma manuel girebilir |
| RESPONDED | Teklif girildi; karşı teklif/sipariş adımlarına uygun |
| REJECTED | Reddedildi |
| CONVERTED_TO_ORDER | Siparişe dönüştürüldü |

Public form yalnızca `updateQuote` çağırır; durum backend’de güncellenir.

**Edge case'ler**  
- İlk yüklemede hata varsa tüm sayfa hata ekranı (form görünmez)  
- Loading spinner tam ekran büyük (h-32 w-32)  
- Birim fiyat input’unda sabit ₺ suffix (currency select’ten bağımsız görsel)  
- Auth header yok (`supplierQuoteService` sadece JSON Content-Type)

**Mobil notlar**  
- `max-w-7xl` container, form 2 sütun → mobilde tek sütun  
- Public sayfa menüsüz; bookmark ile erişim

---

---

## Ek kaynak analizi (explore)

## PublicSupplierQuote

- **Route + security:** `/supplier-quote/:quoteUid` · **Public** (PrivateRoute yok, Navigation yok)
- **Tip:** Public teklif formu
- **Read-only bloklar:** Ürün (name, code, description, category) · Tedarikçi (companyName, taxNumber, contact*)
- **Form:**
  | Alan | Zorunlu | Validasyon |
  |---|---|---|
  | unitPrice | Evet | >0 |
  | quantity | Evet | >0 |
  | currency | Evet | TRY/USD/EUR |
  | supplierReference | Evet (`required`) | — |
  | deliveryDate | Evet | → `T00:00:00` |
  | validityDate | Evet | → `T23:59:59` |
  | notes | Hayır | — |
- **APIs:** `GET /api/supplier-quotes/{quoteUid}` · `PUT` aynı (Authorization header yok)
- **Edge:** Hata ekranı success path’i kapatır; loading spinner tüm sayfayı kaplar

---