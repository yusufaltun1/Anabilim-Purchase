**Özet**  
Depolar arası varlık transferi listesi; arama, filtre paneli, sayfalama.

**Route & Security**  
- Route: `/transfers`  
- `PrivateRoute`

**Tip**  
Tablo + filtre paneli

**Arama**  
Transfer kodu veya depo — Enter veya arama sonrası `searchTransfers`

**Filtre paneli (toggle)**  
| Alan | Tip |
|------|-----|
| status | select (TransferStatus enum) |
| startDate | date |
| endDate | date |

**Tablo kolonları**  
Transfer Kodu, Durum, Kaynak Depo (id), Hedef Depo (id), Transfer Tarihi, Detay

**TransferStatus değerleri**  
PENDING, APPROVED, PREPARING, IN_TRANSIT, DELIVERED, COMPLETED, CANCELLED, REJECTED, PARTIALLY_COMPLETED

**Butonlar**  
Yeni Transfer, Filtreler, Yenile, Detay

**API'ler**  
- `AssetTransferService.getTransfers(filters)`  
- `searchTransfers(query, page, size)`

**Edge case'ler**  
- Depo adları yerine sadece ID gösterilir  
- Hata bildirimi TODO (console only)

**Mobil notlar**  
- Filtre grid `md:grid-cols-3`

---