
import React from 'react';
import { Home, Wand2, FolderOpen, User, LogOut, Settings } from 'lucide-react';
import { AppView, User as UserType } from '../../types';

interface SidebarProps {
    activeView: AppView;
    setView: (view: AppView) => void;
    user: UserType | null;
    onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setView, user, onLogout }) => {
    const menuItems = [
        { id: AppView.INSPIRATION, icon: Home, label: '灵感' },
        { id: AppView.GENERATION, icon: Wand2, label: '生成' },
        { id: AppView.USER_CENTER, icon: FolderOpen, label: '资产' },
    ];

    return (
        <div className="w-[72px] h-screen bg-white border-r border-gray-100 flex flex-col items-center py-6 z-50 shadow-[2px_0_20px_rgba(0,0,0,0.02)] transition-all duration-300 flex-shrink-0">
            {/* Logo */}
            <div className="mb-8 cursor-pointer" onClick={() => setView(AppView.INSPIRATION)}>
                <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-orange-400 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-rose-200 hover:scale-105 transition-transform">
                    K
                </div>
            </div>

            {/* Main Menu */}
            <div className="flex-1 flex flex-col gap-4 w-full px-3">
                {menuItems.map((item) => {
                    const isActive = activeView === item.id ||
                        (item.id === AppView.USER_CENTER && activeView === AppView.RESOURCES); // Handle sub-active states if strictly needed

                    return (
                        <button
                            key={item.id}
                            onClick={() => setView(item.id)}
                            className={`group flex flex-col items-center justify-center w-full aspect-square rounded-2xl transition-all duration-200 ${isActive
                                    ? 'bg-rose-50 text-rose-600 shadow-sm ring-1 ring-rose-100'
                                    : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                                }`}
                        >
                            <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} className={`mb-1 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col gap-4 w-full px-3 mt-auto">
                {/* Admin Link */}
                {user?.role === 'ADMIN' && (
                    <button
                        onClick={() => setView(AppView.STATS)}
                        className={`group flex flex-col items-center justify-center w-full aspect-square rounded-2xl transition-all duration-200 ${[AppView.STATS, AppView.USERS, AppView.AUDIT, AppView.CONFIG].includes(activeView)
                                ? 'bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100'
                                : 'text-gray-400 hover:bg-gray-50'
                            }`}
                        title="管理后台"
                    >
                        <Settings size={22} strokeWidth={2} />
                    </button>
                )}

                {/* User Avatar / Profile */}
                <div
                    onClick={() => setView(AppView.USER_CENTER)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer transition-all border-2 mx-auto ${activeView === AppView.USER_CENTER ? 'border-rose-500 bg-rose-50 text-rose-600' : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-rose-200'
                        }`}
                    title={user?.phone || '用户'}
                >
                    {user?.phone ? user.phone.slice(-2) : <User size={18} />}
                </div>

                {/* Logout */}
                <button
                    onClick={onLogout}
                    className="flex items-center justify-center w-full h-10 rounded-xl text-gray-300 hover:bg-red-50 hover:text-red-500 transition-all mt-2"
                    title="退出登录"
                >
                    <LogOut size={20} />
                </button>
            </div>
        </div>
    );
};
