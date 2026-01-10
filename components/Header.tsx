
import React from 'react';
import { AppView, User } from '../types.ts';
import { NAV_ITEMS, ADMIN_NAV_ITEMS } from '../constants.tsx';
import { LogOut, Shirt } from 'lucide-react';

interface HeaderProps {
  activeView: AppView;
  setView: (v: AppView) => void;
  user: User | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeView, setView, user, onLogout }) => {
  const items = user?.role === 'ADMIN' ? ADMIN_NAV_ITEMS : NAV_ITEMS;

  return (
    <header className="sticky top-0 z-50 glass-morphism h-16 px-4 flex items-center justify-between border-b shadow-sm">
      <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setView(user?.role === 'ADMIN' ? AppView.ADMIN : AppView.GENERATION)}>
        <div className="w-10 h-10 rounded-xl macaron-pink flex items-center justify-center">
          <Shirt className="text-rose-400" />
        </div>
        <span className="font-bold text-xl tracking-tight hidden md:block">
          Kid<span className="text-rose-400">Style</span> AI
        </span>
      </div>

      <nav className="flex items-center space-x-1 md:space-x-4">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id as AppView)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
              activeView === item.id 
              ? 'bg-rose-50 text-rose-500 font-semibold' 
              : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {item.icon}
            <span className="hidden sm:inline text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="flex items-center space-x-3">
        {user?.role === 'ADMIN' && (
            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded">管理模式</span>
        )}
        <button 
          onClick={onLogout}
          className="p-2 text-gray-400 hover:text-rose-500 transition-colors"
          title="登出"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;
