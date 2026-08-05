**Özet**  
Tedarikçi master listesi; düzenle/sil ikon butonları.

**Route & Security**  
- Route: `/suppliers`  
- `PrivateRoute`

**Tip**  
Tablo CRUD listesi

**Amaç**  
Tedarikçileri listelemek, yeni oluşturmak, düzenlemek, silmek.

**Tablo kolonları**  
Firma Adı, Vergi No / Vergi Dairesi, İletişim (kişi, telefon, e-posta), Durum (Aktif/Pasif), İşlemler

**Butonlar**  
- **Yeni Tedarikçi** → `/suppliers/create`  
- Düzenle (kalem ikon) → `/suppliers/edit/:id`  
- Sil (çöp ikon, confirm) → `DELETE` supplier

**API'ler**  
- `GET` all suppliers (`supplierService.getAllSuppliers`)

**Mobil notlar**  
- Tablo yatay scroll

---