
import React from 'react';
import { AppView, User as UserType } from '../../types';
import { IconHomeRounding, IconAssets, IconSettings, IconUser, IconLogout } from '../icons/AppIcons';

interface SidebarProps {
    activeView: AppView;
    setView: (view: AppView) => void;
    user: UserType | null;
    onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setView, user, onLogout }) => {
    const menuItems = [
        { id: AppView.INSPIRATION, icon: IconHomeRounding, label: '灵感' },
        { id: AppView.USER_CENTER, icon: IconAssets, label: '资产' },
    ];

    return (
        <div className="md:w-[72px] md:h-screen w-full h-[60px] fixed bottom-0 md:relative bg-white border-t md:border-t-0 md:border-r border-gray-100 flex md:flex-col flex-row items-center md:py-6 py-0 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] md:shadow-[2px_0_20px_rgba(0,0,0,0.02)] transition-all duration-300 md:flex-shrink-0 justify-around md:justify-start">
            {/* Logo - Hidden on Mobile */}
            <div className="hidden md:block mb-8 cursor-pointer" onClick={() => setView(AppView.INSPIRATION)}>
                <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-orange-400 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-rose-200 hover:scale-105 transition-transform">
                    K
                </div>
            </div>

            {/* Main Menu */}
            <div className="flex md:flex-col flex-row gap-1 md:gap-4 w-full md:px-3 px-6 h-full md:h-auto items-center justify-around md:justify-start">
                {menuItems.map((item) => {
                    const isActive = activeView === item.id ||
                        (item.id === AppView.USER_CENTER && activeView === AppView.RESOURCES);

                    return (
                        <button
                            key={item.id}
                            onClick={() => setView(item.id)}
                            className={`group flex flex-col items-center justify-center md:w-full md:aspect-square h-full md:h-auto px-4 md:px-0 rounded-2xl transition-all duration-200 ${isActive
                                ? 'md:bg-rose-50 md:shadow-sm md:ring-1 md:ring-rose-100'
                                : 'hover:bg-gray-50'
                                }`}
                        >
                            <item.icon
                                size={24}
                                active={isActive}
                                className={`mb-1 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110 text-gray-400'}`}
                            />
                            <span className={`text-[10px] font-medium ${isActive ? 'text-rose-600' : 'text-gray-400'}`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}


                {/* Mobile: Admin Link if admin */}
                {user?.role === 'ADMIN' && (
                    <button
                        onClick={() => setView(AppView.STATS)}
                        className={`md:hidden flex flex-col items-center justify-center h-full px-4`}
                    >
                        <IconSettings
                            size={22}
                            active={[AppView.STATS, AppView.USERS, AppView.AUDIT, AppView.CONFIG].includes(activeView)}
                            className="mb-1"
                        />
                        <span className={`text-[10px] font-medium ${[AppView.STATS, AppView.USERS, AppView.AUDIT, AppView.CONFIG].includes(activeView) ? 'text-blue-600' : 'text-gray-400'}`}>
                            管理
                        </span>
                    </button>
                )}

                {/* Mobile: User/Logout merged or simplified */}
                <div
                    onClick={() => setView(AppView.USER_CENTER)}
                    className={`md:hidden flex flex-col items-center justify-center h-full px-4`}
                >
                    <IconUser
                        size={22}
                        active={activeView === AppView.USER_CENTER}
                        className="mb-1"
                    />
                    <span className={`text-[10px] font-medium ${activeView === AppView.USER_CENTER ? 'text-rose-600' : 'text-gray-400'}`}>
                        我的
                    </span>
                </div>
            </div>

            {/* Desktop Bottom Actions */}
            <div className="hidden md:flex flex-col gap-4 w-full px-3 mt-auto">
                {/* Admin Link */}
                {user?.role === 'ADMIN' && (
                    <button
                        onClick={() => setView(AppView.STATS)}
                        className={`group flex flex-col items-center justify-center w-full aspect-square rounded-2xl transition-all duration-200 ${[AppView.STATS, AppView.USERS, AppView.AUDIT, AppView.CONFIG].includes(activeView)
                            ? 'bg-blue-50 shadow-sm ring-1 ring-blue-100'
                            : 'hover:bg-gray-50'
                            }`}
                        title="管理后台"
                    >
                        <IconSettings
                            size={22}
                            active={[AppView.STATS, AppView.USERS, AppView.AUDIT, AppView.CONFIG].includes(activeView)}
                        />
                    </button>
                )}

                {/* User Avatar / Profile */}
                <div
                    onClick={() => setView(AppView.USER_CENTER)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer transition-all border-2 mx-auto ${activeView === AppView.USER_CENTER ? 'border-rose-500 bg-rose-50 text-rose-600' : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-rose-200'
                        }`}
                    title={user?.phone || '用户'}
                >
                    {user?.phone ? user.phone.slice(-2) : <IconUser size={18} active={activeView === AppView.USER_CENTER} />}
                </div>

                {/* Logout */}
                <button
                    onClick={onLogout}
                    className="flex items-center justify-center w-full h-10 rounded-xl text-gray-300 hover:bg-red-50 hover:text-red-500 transition-all mt-2 group"
                    title="退出登录"
                >
                    <IconLogout size={20} active={false} className="group-hover:text-red-500" />
                </button>
            </div>
        </div>
    );
};
