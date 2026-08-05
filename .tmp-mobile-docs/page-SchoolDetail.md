**Özet**  
Okul detay kartı + hızlı işlemler (düzenle, ara, e-posta).

**Route & Security**  
- Route: `/schools/:id`  
- `PrivateRoute`

**Görüntülenen alanlar**  
name, code, schoolType (Türkçe mapping), principalName, city, district, address, phone (tel: link), email (mailto:), studentCapacity, isActive, createdAt, updatedAt

**Butonlar (header)**  
Geri, Düzenle, Sil (confirm → listeye dön)

**Hızlı işlemler kartı**  
Okul Bilgilerini Düzenle, Okulu Ara, E-posta Gönder

**Edge case'ler**  
- schoolType display mapping Create/Edit enum’larından farklı backend değerleri de kapsar (PRIMARY_SCHOOL vb.)

**Mobil notlar**  
- Hızlı işlemler grid 1/2/3 kolon responsive

---