
import React from 'react';
import { Sidebar } from './Sidebar';
import { AppView, User } from '../../types';

interface MainLayoutProps {
    children: React.ReactNode;
    activeView: AppView;
    setView: (view: AppView) => void;
    user: User | null;
    onLogout: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, activeView, setView, user, onLogout }) => {
    return (
        <div className="flex h-screen bg-[#fafafa] overflow-hidden font-sans">
            <Sidebar activeView={activeView} setView={setView} user={user} onLogout={onLogout} />
            {/* Main Content Area */}
            <main className="flex-1 h-full overflow-hidden relative flex flex-col">
                {children}
            </main>
        </div>
    );
};
