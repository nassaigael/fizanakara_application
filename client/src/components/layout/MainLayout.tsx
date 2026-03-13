// MainLayout.tsx - Version avec gestion responsive
import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const MainLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Fermer la sidebar automatiquement sur mobile
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="fixed inset-0 flex flex-col bg-brand-bg overflow-hidden">
            <div className="z-50 w-full flex-none">
                <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
            </div>

            <div className="flex flex-1 overflow-hidden relative">
                <Sidebar isOpen={sidebarOpen} />

                <main 
                    className={`
                        flex-1 overflow-y-auto overflow-x-hidden transition-all duration-300
                        ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}
                        ml-0 pb-20 md:pb-6
                    `}
                >
                    <div className="max-w-7xl mx-auto px-4 py-6 md:px-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;