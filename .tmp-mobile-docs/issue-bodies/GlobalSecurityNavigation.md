## Güvenlik katmanı (ortak)

### PrivateRoute (`src/components/PrivateRoute.tsx`)
- **Kontrol:** MSAL aktif hesap (`accounts.length > 0 && instance.getActiveAccount()`) **veya** `authService.isAuthenticated()` (`localStorage.access_token`).
- **Başarısız:** `<Navigate to="/login" replace />`
- **Not:** Capability kontrolü yok; yalnızca oturum.

### CapabilityRoute (`src/components/CapabilityRoute.tsx`)
- Auth yok → `/login`
- `authService.hasCapability(capability)` false → `/dashboard`
- Bu dokümandaki sayfalarda **kullanılmıyor** (yalnızca PrivateRoute).

### AuthContext (`src/contexts/AuthContext.tsx`)
- Geleneksel login: `authService.login` → token/`user_info` localStorage
- Microsoft: MSAL `LOGIN_SUCCESS` → `POST /api/v1/auth/microsoft/verify-token` → token + userInfo → `/dashboard`
- Loading spinner tüm uygulamayı bloklar
- Logout: MSAL `logoutRedirect` + `authService.logout()`

### authService capability / roller
- `SYSTEM_MANAGE`: roller `BILGI_ISLEM_DEPARTMANI` | `SYSTEM_ADMIN`
- Navigation’da Sistem menüsü (Users/Roles/Workflows/Permissions/UserGroups) **yalnızca** `canSystemManage` ile görünür
- Route seviyesinde bu sayfalarda CapabilityRoute **yok** → URL ile doğrudan erişim mümkün (backend yetkisi ayrı)

### Navigation görünürlük
Sistem menüsü (`/workflows`, `/roles`, `/permissions`, `/users`, `/user-groups/whiteboard`): `hasCapability('SYSTEM_MANAGE')`

---

---

## Navigation capabilities (purchase-fe Navigation.tsx)

Menü/özellik görünürlüğü için kullanılan capability'ler:

| Capability | Kullanım |
|------------|----------|
| `SYSTEM_MANAGE` | Sistem menüsü (Users/Roles/Workflows/Permissions/UserGroups) |
| `INVENTORY_VIEW` | Envanter görüntüleme menüleri |
| `INVENTORY_MANAGE` | Envanter yönetim aksiyonları |
| `QUOTE_COLLECT` | Teklif toplama |
| `ORDER_CREATE` | Sipariş oluşturma |
| `REQUEST_VIEW` | Talep görüntüleme |
| `ACCOUNTING_VIEW` | Muhasebe siparişleri |

Kaynak: `authService.hasCapability(...)` in `Navigation.tsx`.
