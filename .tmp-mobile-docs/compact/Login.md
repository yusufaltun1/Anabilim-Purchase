**Route:** `/login`
**Parent:** ZW-55
**Etiket:** MOBILE

## Özet
Kimlik doğrulama giriş sayfası. E-posta/şifre ile geleneksel giriş ve Microsoft (Azure MSAL) ile OAuth redirect girişi sunar. Başarılı giriş sonrası `/dashboard` yönlendirmesi yapılır. `AuthContext` üzerinden oturum durumu ve hata mesajları yönetilir.

## Route & Security
| Özellik | Değer |
|---------|-------|
| Path | `/login` |
| Koruma | **PUBLIC** — `PrivateRoute` yok |
| Root redirect | `/` → `/login` |
| MSAL | `MsalProvider` + `@azure/msal-react` (`loginRedirect`) |
| AuthContext | Mount'ta MSAL + `localStorage access_token` kontrolü; loading spinner |

**PrivateRoute mantığı (diğer sayfalar için referans):** MSAL active account VEYA `authService.isAuthenticated()` (localStorage token) varsa geçiş; yoksa `/login`.

## Sayfa tipi
**Form + OAuth aksiyon sayfası** — tam ekran merkezlenmiş kart layout, Navigation yok.

## Amaç / özellikler
- Mevcut kullanıcıların e-posta/şifre ile sisteme girmesi
- Microsoft 365 hesabı ile SSO girişi (MSAL redirect)
- Kayıt sayfasına yönlendirme linki (`/register` — **App.tsx'te route tanımlı değil**, tıklanınca `*` → `/` → `/login` döngüsü)
- Hata gösterimi (`AuthContext.error`)
- Loading durumları (email login + Microsoft butonu)

## Form alanları

### email
| Özellik | Değer |
|---------|-------|
| Ad | `email` |
| Tip | `type="email"` text input |
| Label | E-posta |
| Placeholder | E-posta adresiniz |
| Required | Evet (`required` HTML) |
| Validation | Tarayıcı email formatı; backend hata mesajı AuthContext'e düşer |
| Options | — |
| Disabled | `loading \|\| microsoftLoading` iken submit butonu disabled; input disabled değil |
| autoFocus | Evet |
| autoComplete | `off` (form seviyesinde) |

### password
| Özellik | Değer |
|---------|-------|
| Ad | `password` |
| Tip | `type="password"` |
| Label | Şifre |
| Placeholder | Şifre |
| Required | Evet |
| Validation | Boş bırakılamaz (HTML); backend mesajı AuthContext |
| Options | — |
| Disabled | Submit sırasında buton disabled |

## Tablo kolonları
Yok.

## Filtreler / arama
Yok.

## Butonlar & aksiyonlar

| Buton | Tip | Metin (durum) | Aksiyon | Disabled koşulu |
|-------|-----|---------------|---------|-----------------|
| Giriş Yap | `submit` | Giriş Yap / Giriş Yapılıyor... | `handleSubmit` → `login(email, password)` → `/dashboard` | `loading \|\| microsoftLoading` |
| Microsoft ile Giriş Yap | `button` | Microsoft ile Giriş Yap / spinner | `instance.loginRedirect({ ...loginRequest, prompt: 'create' })` | `loading \|\| microsoftLoading` |
| Ücretsiz üye olun | `button` (link stili) | — | `navigate('/register')` | — |

## Modallar
Yok.

## API'ler

| Servis / kaynak | Method | HTTP Path | Tetikleyici |
|-----------------|--------|-----------|-------------|
| `authService.login` | POST | `/api/auth/login` | Email/şifre submit |
| Body | `{ email, password }` | | |
| Response storage | `access_token`, `refresh_token`, `user_info`, `token_expires_in` → localStorage | | |
| AuthContext `verifyMicrosoftToken` | POST | `/api/v1/auth/microsoft/verify-token` | MSAL `LOGIN_SUCCESS` event veya mount'ta token yoksa |
| Body | `{ accessToken, microsoftId, email, name }` | | |
| Response storage | `access_token`, `user_info` → localStorage | | |

**MSAL config:** `loginRequest.scopes: ['User.Read']`, redirect URI env'den (`VITE_MICROSOFT_REDIRECT_URI`).

## Navigasyon
| Kaynak | Hedef |
|--------|-------|
| Başarılı email login | `/dashboard` |
| MSAL LOGIN_SUCCESS (AuthContext callback) | `window.location.href = '/dashboard'` |
| Ücretsiz üye olun | `/register` (route yok) |
| PrivateRoute reddi | `/login` |

## Edge cases / koşullu UI
- `localStorage.isNewlyRegistered === 'true'` kontrol edilir ama **her iki dalda da** `/dashboard`'a gidilir (onboarding farkı yok).
- Login hata durumunda catch bloğu boş; hata `AuthContext.error` ile gösterilir.
- Microsoft redirect başarısız olursa `microsoftLoading` false yapılır; kullanıcı sayfada kalır.
- AuthProvider `isLoading` iken tüm uygulama spinner gösterir (Login render edilmez).
- MSAL oturumu varsa ama backend verify başarısızsa `error` set edilir, `isAuthenticated: false`.
- `storage` event listener: başka sekmede logout → auth yeniden kontrol.
- Email login butonu ve Microsoft butonu birbirini mutex eder (loading flags).

## Mobil notlar
- Tam ekran gradient arka plan + sabit `max-w-md` kart — mobilde uyumlu.
- Input genişliği sabit `w-72` (288px); küçük ekranlarda yeterli ama tablet'te dar kalabilir.
- Microsoft login mobilde **browser redirect / custom tab / WebView** gerekir; Expo'da `@azure/msal-react` yerine `@azure/msal-browser` veya backend OAuth flow (`authService.microsoftLogin` → `/oauth2/authorization/microsoft`) tercih edilmeli.
- Şifre alanında göster/gizle toggle yok — mobil UX için eklenebilir.
- Biometric / secure storage: token'lar web'de `localStorage`; mobilde `expo-secure-store` kullanılmalı.
- `/register` route eksik — mobil portta ya kaldırılır ya da Register sayfası eklenir.
- Keyboard: `autoFocus` email alanında; iOS'ta klavye açılış animasyonu ile kart kaydırma düşünülmeli.

---