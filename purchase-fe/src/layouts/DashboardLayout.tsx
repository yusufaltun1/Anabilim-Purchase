import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

const menu = [
  { name: 'Pozisyonlar', path: '/openpositions' },
  { name: 'Adaylar', path: '/candidates' },
  { name: 'Kredi Satın Al', path: '/purchase-credits' },
];

export const DashboardLayout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen flex bg-gray-100">
    <aside className="w-64 bg-white shadow-lg flex flex-col p-6">
      <div className="text-2xl font-bold text-indigo-600 mb-8">AI Mülakat</div>
      <nav className="flex-1 space-y-2">
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block px-4 py-2 rounded transition font-medium ${isActive ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'}`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
    <main className="flex-1 p-8">{children}</main>
  </div>
);