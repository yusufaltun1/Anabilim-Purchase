import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/auth.service';
import { NotificationBell } from './NotificationBell'; // Bildirim bileşenini import et

export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const userInfo = authService.getUserInfo();
  const effectiveUserInfo = authService.getEffectiveUserInfo();
  const canSystemManage = authService.hasCapability('SYSTEM_MANAGE');
  const canInventoryView = authService.hasCapability('INVENTORY_VIEW');
  const canInventoryManage = authService.hasCapability('INVENTORY_MANAGE');
  const canQuoteCollect = authService.hasCapability('QUOTE_COLLECT');
  const canOrderCreate = authService.hasCapability('ORDER_CREATE');
  const canRequestView = authService.hasCapability('REQUEST_VIEW');
  const isRealSystemAdmin = authService.isRealSystemAdmin();
  const perspectiveRole = authService.getPerspectiveRole() || '';
  const [isSystemMenuOpen, setIsSystemMenuOpen] = useState(false);
  const [isTransferMenuOpen, setIsTransferMenuOpen] = useState(false);
  const [isInventoryMenuOpen, setIsInventoryMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const isSystemRoute = () => [
    '/workflows', '/workflows/create', '/roles', '/roles/create',
    '/users', '/users/create', '/suppliers', '/suppliers/create',
    '/warehouses', '/warehouses/create', '/schools', '/schools/create',
    '/personnel', '/personnel/create', '/user-groups',
  ].some((path) => location.pathname.startsWith(path));

  const isInventoryRoute = () =>
    ['/products', '/categories', '/locations'].some((path) => location.pathname.startsWith(path));

  const isTransferRoute = () => location.pathname.startsWith('/transfers');

  const handlePerspectiveChange = (value: string) => {
    authService.setPerspectiveRole(value || null);
    window.location.reload();
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="bg-indigo-600 rounded-lg p-2 mr-3">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Satınalma Sistemi</h1>
            </div>
          </div>

          <div className="flex items-center space-x-8">
            <div className="hidden md:flex space-x-4">
              <button onClick={() => navigate('/dashboard')} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/dashboard') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'}`}>
                Dashboard
              </button>
              
              {canInventoryView && (
              <div className="relative">
                <button onClick={() => setIsInventoryMenuOpen(!isInventoryMenuOpen)} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center ${isInventoryRoute() ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'}`}>
                  <span>Envanter</span>
                  <svg className={`ml-2 h-4 w-4 transition-transform ${isInventoryMenuOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </button>
                {isInventoryMenuOpen && (
                  <div className="absolute z-10 mt-2 w-52 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5" onMouseLeave={() => setIsInventoryMenuOpen(false)}>
                    <div className="py-1">
                      <button onClick={() => { navigate('/products'); setIsInventoryMenuOpen(false); }} className={`block px-4 py-2 text-sm w-full text-left ${location.pathname.startsWith('/products') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}>Ürünler</button>
                      {canInventoryManage && (
                        <button onClick={() => { navigate('/products/create'); setIsInventoryMenuOpen(false); }} className={`block px-4 py-2 text-sm w-full text-left ${location.pathname === '/products/create' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}>Yeni ürün</button>
                      )}
                      <button onClick={() => { navigate('/categories'); setIsInventoryMenuOpen(false); }} className={`block px-4 py-2 text-sm w-full text-left ${location.pathname.startsWith('/categories') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}>Kategoriler</button>
                      {canInventoryManage && (
                        <button onClick={() => { navigate('/categories/create'); setIsInventoryMenuOpen(false); }} className={`block px-4 py-2 text-sm w-full text-left ${location.pathname === '/categories/create' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}>Yeni kategori</button>
                      )}
                      <button onClick={() => { navigate('/locations'); setIsInventoryMenuOpen(false); }} className={`block px-4 py-2 text-sm w-full text-left ${location.pathname.startsWith('/locations') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}>Lokasyonlar</button>
                    </div>
                  </div>
                )}
              </div>
              )}

              {canSystemManage && (
              <div className="relative">
                <button onClick={() => setIsTransferMenuOpen(!isTransferMenuOpen)} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center ${isTransferRoute() ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'}`}>
                  <span>Transfer Yönetimi</span>
                  <svg className={`ml-2 h-4 w-4 transition-transform ${isTransferMenuOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </button>
                {isTransferMenuOpen && (
                  <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5" onMouseLeave={() => setIsTransferMenuOpen(false)}>
                    <div className="py-1">
                      <button onClick={() => { navigate('/transfers'); setIsTransferMenuOpen(false); }} className={`block px-4 py-2 text-sm w-full text-left ${isActive('/transfers') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}>Transfer Listesi</button>
                      <button onClick={() => { navigate('/transfers/create'); setIsTransferMenuOpen(false); }} className={`block px-4 py-2 text-sm w-full text-left ${isActive('/transfers/create') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}>Yeni Transfer</button>
                    </div>
                  </div>
                )}
              </div>
              )}

              {canSystemManage && (
              <div className="relative">
                <button onClick={() => setIsSystemMenuOpen(!isSystemMenuOpen)} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center ${isSystemRoute() ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'}`}>
                  <span>Sistem</span>
                  <svg className={`ml-2 h-4 w-4 transition-transform ${isSystemMenuOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </button>
                {isSystemMenuOpen && (
                  <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5" onMouseLeave={() => setIsSystemMenuOpen(false)}>
                    <div className="py-1">
                      <button onClick={() => { navigate('/workflows'); setIsSystemMenuOpen(false); }} className={`block px-4 py-2 text-sm w-full text-left ${location.pathname.startsWith('/workflows') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}>İş Akışları</button>
                      <button onClick={() => { navigate('/roles'); setIsSystemMenuOpen(false); }} className={`block px-4 py-2 text-sm w-full text-left ${location.pathname.startsWith('/roles') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}>Roller</button>
                      <button onClick={() => { navigate('/permissions'); setIsSystemMenuOpen(false); }} className={`block px-4 py-2 text-sm w-full text-left ${location.pathname.startsWith('/permissions') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}>Permissionlar</button>
                      <button onClick={() => { navigate('/users'); setIsSystemMenuOpen(false); }} className={`block px-4 py-2 text-sm w-full text-left ${location.pathname.startsWith('/users') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}>Kullanıcılar</button>
                      <button onClick={() => { navigate('/suppliers'); setIsSystemMenuOpen(false); }} className={`block px-4 py-2 text-sm w-full text-left ${location.pathname.startsWith('/suppliers') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}>Tedarikçiler</button>
                      <button onClick={() => { navigate('/schools'); setIsSystemMenuOpen(false); }} className={`block px-4 py-2 text-sm w-full text-left ${location.pathname.startsWith('/schools') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}>Okullar</button>
                      <button onClick={() => { navigate('/personnel'); setIsSystemMenuOpen(false); }} className={`block px-4 py-2 text-sm w-full text-left ${location.pathname.startsWith('/personnel') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}>Personel</button>
                      <button onClick={() => { navigate('/user-groups/whiteboard'); setIsSystemMenuOpen(false); }} className={`block px-4 py-2 text-sm w-full text-left ${location.pathname.startsWith('/user-groups') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}>Kullanıcı Grupları</button>
                    </div>
                  </div>
                )}
              </div>
              )}

              {canRequestView && <button onClick={() => navigate('/purchase-requests')} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname.startsWith('/purchase-requests') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'}`}>
                Satın Alma Talepleri
              </button>}

              {canOrderCreate && <button onClick={() => navigate('/purchase-orders')} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname.startsWith('/purchase-orders') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'}`}>
                Satın Alma Siparişleri
              </button>}
              {canQuoteCollect && <button onClick={() => navigate('/stock-management')} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname.startsWith('/stock-management') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'}`}>
                Stok Yönetimi
              </button>}
              {(canQuoteCollect || canSystemManage) && <button onClick={() => navigate('/warehouses')} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/warehouses') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'}`}>
                Depolar
              </button>}
            </div>

            <div className="flex items-center space-x-4">
              <NotificationBell />
              <div className="hidden md:flex items-center space-x-2">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <div className="text-sm">
                  <p className="text-gray-900 font-medium">{userInfo?.displayName || 'Kullanıcı'}</p>
                  <p className="text-gray-500">{userInfo?.department || 'Departman'}</p>
                  {effectiveUserInfo?.roles?.length ? (
                    <p className="text-gray-400 text-xs">{effectiveUserInfo.roles.join(', ')}</p>
                  ) : null}
                </div>
              </div>
              {isRealSystemAdmin && (
                <select
                  value={perspectiveRole}
                  onChange={(e) => handlePerspectiveChange(e.target.value)}
                  className="hidden md:block border border-gray-300 rounded-md text-xs px-2 py-1 bg-white"
                  title="Perspective (rol simülasyonu)"
                >
                  <option value="">Perspective: Gerçek rol</option>
                  <option value="IDARI_ASISTAN">İdari Asistan</option>
                  <option value="DOKTOR">Doktor</option>
                  <option value="HEMSIRE">Hemşire</option>
                  <option value="DIZGICI">Dizgici</option>
                  <option value="UZMAN">Uzman</option>
                  <option value="UZMAN_YARDIMCISI">Uzm Yard.</option>
                  <option value="MUDUR">Müdür</option>
                  <option value="MUDUR_YARDIMCISI">Md Yard.</option>
                  <option value="IDARI_YONETIM_MUDURU">İdari Yönetim Müdürü</option>
                  <option value="SATIN_ALMA_DEPARTMANI">Satın Alma Departmanı</option>
                  <option value="SERKAN_BEY">Serkan Bey</option>
                  <option value="OGRETMEN">Öğretmen</option>
                  <option value="ZUMRE_BASKANI">Zümre Başkanı</option>
                  <option value="BOLUM_BASKANI">Bölüm Başkanı</option>
                  <option value="KAMPUS_MUDURU">Kampüs Müdürü</option>
                  <option value="SEDA_HANIM">Seda Hanım</option>
                </select>
              )}
              <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                Çıkış
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};