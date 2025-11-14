import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../config/msalConfig';
import { authService } from '../services/auth.service';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error } = useAuth();
  const { instance } = useMsal();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [microsoftLoading, setMicrosoftLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      
      const userInfo = authService.getUserInfo();
      const userRoles = userInfo?.roles || [];
      
      const restrictedRoles = ['OGRETMEN', 'ZUMRE_BASKANI', 'OKUL_MUDURU'];
      
      const hasRestrictedRole = userRoles.some(role => restrictedRoles.includes(role));

      if (hasRestrictedRole) {
        navigate('/purchase-requests');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      // Error is handled by AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handleMicrosoftLogin = async () => {
    setMicrosoftLoading(true);
    try {
      await instance.loginRedirect({
        ...loginRequest,
        prompt: 'create',
      });
    } catch (err) {
      console.error('Microsoft login error:', err);
      setMicrosoftLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="bg-white bg-opacity-90 shadow-2xl rounded-2xl px-8 py-10 w-full max-w-md mx-4 animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-indigo-100 rounded-full p-3 mb-2">
            <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Giriş</h2>
          <p className="text-gray-500 text-sm mt-1">Lütfen hesabınıza giriş yapın</p>
        </div>
        <form className="flex flex-col items-center space-y-6" onSubmit={handleSubmit} autoComplete="off">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative animate-shake w-72 text-center" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <div className="w-72">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
              </span>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
                placeholder="E-posta adresiniz"
                autoFocus
              />
            </div>
          </div>
          <div className="w-72">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm0 0v2m0 4h.01" /></svg>
              </span>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
                placeholder="Şifre"
              />
            </div>
          </div>
          <div className="w-72">
            <button
              type="submit"
              disabled={loading || microsoftLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition disabled:opacity-60"
            >
              {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </button>
          </div>
          
          <div className="w-72">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">veya</span>
              </div>
            </div>
          </div>
          
          <div className="w-72">
            <button
              type="button"
              onClick={handleMicrosoftLogin}
              disabled={loading || microsoftLoading}
              className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition disabled:opacity-60"
            >
              {microsoftLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#00BCF2" d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/>
                  </svg>
                  Microsoft ile Giriş Yap
                </>
              )}
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Hesabınız yok mu?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              Ücretsiz üye olun
            </button>
          </p>
        </div>
      </div>
      <style>{`
        .animate-fade-in { animation: fadeIn 0.7s; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        .animate-shake { animation: shake 0.3s; }
        @keyframes shake { 10%, 90% { transform: translateX(-2px); } 20%, 80% { transform: translateX(4px); } 30%, 50%, 70% { transform: translateX(-8px); } 40%, 60% { transform: translateX(8px); } }
      `}</style>
    </div>
  );
};