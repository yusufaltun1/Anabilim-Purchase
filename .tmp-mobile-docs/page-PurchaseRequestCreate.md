**Özet**  
Yeni satın alma talebi oluşturma formu. Başlık, açıklama, isteğe bağlı ilk onaycı seçimi ve dinamik kalem listesi içerir.

**Route & Security**  
- Route: `/purchase-requests/create`  
- `PrivateRoute` + `REQUEST_CREATE` (yoksa `/purchase-requests`’e yönlendirilir)

**Tip**  
Oluşturma formu

**Amaç**  
Talep sahibinin ürün kalemleriyle birlikte yeni talep açması ve onay zincirini başlatması.

**Form alanları — Talep**  
| Alan | Tip | Zorunlu | Not |
|------|-----|---------|-----|
| title | text | Evet | Talep Başlığı |
| description | textarea | Evet | Açıklama |
| firstApproverUserId | select | Koşullu | Birden fazla seçilebilir üst grup varsa zorunlu |

**İlk onaycı select**  
- API: `GET /api/purchase-requests/first-approver-candidates`  
- Tek seçilebilir aday varsa otomatik seçilir ve select disabled  
- Üye atanmamış gruplar disabled option  
- Payload: `firstApproverUserId` (tek adayda otomatik)

**Form alanları — Kalem (her ürün)**  
| Alan | Tip | Zorunlu |
|------|-----|---------|
| productName | text | Evet |
| quantity | number (min 1) | Evet |
| description | textarea | Evet |
| productLink | url | Hayır |
| estimatedDeliveryDate | datetime-local | Evet |
| imageBase64 | file (image/*) | Hayır |
| notes | textarea | Hayır |
| potentialSupplierIds | — | Hayır (create’te UI yok, boş array) |

**Butonlar**  
- **+ Ürün Ekle** / kalem sil (X)  
- **İptal** → `/purchase-requests`  
- **Oluştur** → `POST /api/purchase-requests` (en az 1 kalem + onaycı validasyonu)

**API'ler**  
- `getFirstApproverCandidates()`  
- `createRequest(payload)`

**Edge case'ler**  
- Resim sadece `image/*` kabul edilir (FileReader base64)  
- Submit disabled: loading, kalem yok, çoklu onaycı seçilmemiş  
- Başarı sonrası 1.5 sn sonra listeye dönüş

**Mobil notlar**  
- Kalem grid `md:grid-cols-2`; mobilde tek sütun  
- Resim yükleme alanı dokunmatik uyumlu

---