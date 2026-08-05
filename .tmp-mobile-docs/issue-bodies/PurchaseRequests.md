**Route:** `/purchase-requests`
**Parent:** ZW-55
**Etiket:** MOBILE

**Özet**  
Satın alma taleplerinin listelendiği ana sayfa. İki sekme ile “Taleplerim” ve “Onay Bekleyenler” görünümleri sunar; her satırda durum rozeti, talep sahibi, bekleyen onaycı ve oluşturulma tarihi gösterilir.

**Route & Security**  
- Route: `/purchase-requests`  
- `PrivateRoute` (MSAL veya geleneksel oturum gerekli)  
- Yetkiler: `REQUEST_VIEW` (uyarı banner), `REQUEST_CREATE` (yeni talep butonu), `REQUEST_EDIT` (düzenle/sil)

**Tip**  
Liste / filtre (2 sekme)

**Amaç**  
Kullanıcının kendi taleplerini ve onay bekleyen talepleri tek ekranda görmesi, detaya/düzenlemeye geçmesi ve uygun koşullarda silmesi.

**Filtreler / Sekmeler**  
| Sekme | API | Açıklama |
|-------|-----|----------|
| Taleplerim | `GET /api/purchase-requests/my-requests` | Kullanıcının talepleri |
| Onay Bekleyenler | `GET /api/purchase-requests/pending-approvals` | Onay bekleyen talepler |

**Liste satır alanları**  
- Başlık (`title`) + durum rozeti  
- Talep sahibi: `requester.firstName lastName`  
- Onaylayacak kişi: `approvals` içinde `PENDING` adımın `approver`  
- Oluşturulma: `createdAt` (tr-TR)

**Talep durumları (status)**  
| Kod | Türkçe |
|-----|--------|
| DRAFT | Taslak |
| IN_APPROVAL | Onay Bekliyor |
| APPROVED | Onaylandı |
| REJECTED | Reddedildi |
| CANCELLED | İptal Edildi |
| IN_PROGRESS | İşlemde |
| PARTIAL_APPROVAL | Kısmi Onay |
| COMPLETED | Tamamlandı |

**Butonlar**  
- **Yeni Talep Oluştur** → `/purchase-requests/create` (`REQUEST_CREATE`)  
- **Detay** → `/purchase-requests/:id`  
- **Düzenle** → `/purchase-requests/edit/:id` (koşullu)  
- **Sil** → `DELETE /api/purchase-requests/:id` (confirm dialog)

**Düzenle/Sil koşulları**  
- Düzenle: `REQUEST_EDIT` + talep `CANCELLED`/`COMPLETED` değil  
- Sil: `REQUEST_EDIT` + talep sahibi = giriş yapan + `COMPLETED`/`CANCELLED` değil

**API'ler**  
- `purchaseRequestService.getMyRequests()`  
- `purchaseRequestService.getPendingApprovals()`  
- `purchaseRequestService.deleteRequest(id)`

**Navigasyon**  
- `Navigation` bileşeni üst menü

**Edge case'ler**  
- `REQUEST_VIEW` yoksa sarı uyarı banner gösterilir; liste yine yüklenir  
- `restrictedRoles` değişkeni tanımlı ama kullanılmıyor  
- Boş liste mesajları sekmeye göre değişir

**Mobil notlar**  
- Liste kart yapısında; aksiyon butonları yan yana küçük ekranda sıkışabilir  
- Tab filtreleri yatay `flex space-x-4`

---

---

## Ek kaynak analizi (explore)

## PurchaseRequests

- **Route + security:** `/purchase-requests` · `PrivateRoute` · Yetkiler: `REQUEST_CREATE` (yeni talep), `REQUEST_EDIT` (düzenle/sil), `REQUEST_VIEW` (uyarı bandı; route engeli yok)
- **Tip:** Liste (card/list satırları, klasik tablo değil)
- **Amaç:** Kullanıcının taleplerini ve onay bekleyenleri görüntüleme/yönetme
- **Form alanları:** Yok
- **Tablo / satır alanları:** Başlık, durum badge, talep sahibi, mevcut onaycı (PENDING), oluşturulma tarihi
- **Filtreler:** `Taleplerim` | `Onay Bekleyenler`
- **Aksiyonlar:** Yeni Talep Oluştur · Detay · Düzenle · Sil (confirm)
- **Modals:** Yok (`window.confirm` silme)
- **APIs:** `GET /api/purchase-requests/my-requests` · `GET /api/purchase-requests/pending-approvals` · `DELETE /api/purchase-requests/{id}`
- **Workflow/status:** Badge: DRAFT, IN_APPROVAL, APPROVED, REJECTED, CANCELLED, IN_PROGRESS, PARTIAL_APPROVAL, COMPLETED
- **Edge cases:** Düzenle: `REQUEST_EDIT` + status ≠ CANCELLED/COMPLETED · Sil: owner + `REQUEST_EDIT` + status ≠ COMPLETED/CANCELLED · `hasRestrictedRole` tanımlı ama kullanılmıyor · `REQUEST_VIEW` yoksa sarı uyarı, liste yine yüklenir

---