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
  const [isSystemMenuOpen, setIsSystemMenuOpen] = useState(false);
  const [isTransferMenuOpen, setIsTransferMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const isSystemRoute = () => [
    '/workflows', '/workflows/create', '/roles', '/roles/create',
    '/users', '/users/create', '/products', '/products/create',
    '/categories', '/categories/create', '/suppliers', '/suppliers/create',
    '/warehouses', '/warehouses/create', '/schools', '/schools/create',
    '/personnel', '/personnel/create', '/locations', '/locations/create'
  ].some(path => location.pathname.startsWith(path));

  const isTransferRoute = () => location.pathname.startsWith('/transfers');

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

              <div className="relative">
                <button onClick={() => setIsSystemMenuOpen(!isSystemMenuOpen)} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center ${isSystemRoute() ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'}`}>
                  <span>Sistem</span>
                  <svg className={`ml-2 h-4 w-4 transition-transform ${isSystemMenuOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </button>
                {isSystemMenuOpen && (
                  <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5" onMouseLeave={() => setIsSystemMenuOpen(false)}>
                    {/* Dropdown content here */}
                  </div>
                )}
              </div>

              <button onClick={() => navigate('/purchase-requests')} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname.startsWith('/purchase-requests') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'}`}>
                Satın Alma Talepleri
              </button>

              <button onClick={() => navigate('/purchase-orders')} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname.startsWith('/purchase-orders') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'}`}>
                Satın Alma Siparişleri
              </button>
              <button onClick={() => navigate('/stock-management')} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname.startsWith('/stock-management') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'}`}>
                Stok Yönetimi
              </button>
              <button onClick={() => navigate('/warehouses')} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/warehouses') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'}`}>
                Depolar
              </button>
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
                </div>
              </div>
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