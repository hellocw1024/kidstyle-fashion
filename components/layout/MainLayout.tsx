
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
        <div className="flex flex-col md:flex-row h-screen bg-[#fafafa] overflow-hidden font-sans">
            <Sidebar activeView={activeView} setView={setView} user={user} onLogout={onLogout} />
            {/* Main Content Area */}
            <main className="flex-1 h-full overflow-auto relative flex flex-col pb-[60px] md:pb-0">
                {children}
            </main>
        </div>
    );
};
