# PersonnelDetail — Mobil Analiz (Kaynak: purchase-fe)

## Özet
Personel detay salt okunur ekranı; tüm kayıt alanları, durum rozeti ve hızlı iletişim/düzenleme aksiyonları.

## Route & Güvenlik
| Route | `/personnel/:id` |
| Koruma | `PrivateRoute` |

## Detay alanları
| Etiket | Alan | Koşul |
|--------|------|-------|
| Ad Soyad | firstName + lastName | |
| TC Kimlik No | tcNo | |
| Okul | schoolName | yoksa "Okul bilgisi yok" |
| Görev | role | |
| İstihdam Türü | employmentType | |
| Durum | status | rozet |
| E-posta | email | mailto link |
| Telefon | phone | tel link |
| Adres | address | |
| İşe Başlama | startDate | tr-TR date |
| İşten Ayrılma | endDate | varsa |
| Maaş | salary | varsa, toLocaleString + TL |
| Departman | department | varsa |
| Branş | branchSubject | varsa |
| Nitelikler | qualifications | varsa, whitespace-pre-wrap |
| Notlar | notes | varsa |
| Kayıt Tarihi | createdAt | varsa, tr-TR datetime |
| Son Güncelleme | updatedAt | varsa |

## Butonlar
| Buton | Aksiyon |
|-------|---------|
| Geri | `/personnel` |
| Düzenle | `/personnel/edit/{id}` — **route tanımsız** |
| Sil | confirm → delete → `/personnel` |
| Personel Bilgilerini Düzenle | aynı edit URL |
| Telefon Et | tel: |
| E-posta Gönder | mailto: |

## API
| Metod | Path |
|-------|------|
| getPersonnelById | GET `/api/school-personnel/{id}` |
| deletePersonnel | DELETE `/api/school-personnel/{id}` |

## Edge case'ler
1. Yükleme hatası → toast + `/personnel`.
2. Düzenle butonu kırık route'a gider.
3. Maaş/sensitive alanlar mobilde maskeleme düşünülebilir.
4. isActive alanı UI'da gösterilmez (modelde var).

## Mobil notlar
- Section-based layout
- Linking API ile arama/e-posta
- Silme onay dialog
