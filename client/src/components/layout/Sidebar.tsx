import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    AiOutlineDashboard,
    AiOutlineTeam,
    AiOutlineWallet,
    AiOutlineUser,
    AiOutlineSetting,
    AiOutlineLogout,
    AiOutlineClose,
    AiOutlineMenu
} from 'react-icons/ai';

interface SidebarProps {
    isOpen: boolean;
    toggleSidebar?: () => void;
}

const Sidebar = ({ isOpen }: SidebarProps) => {
    const { logout, isSuperAdmin } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const adminLinks = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: AiOutlineDashboard },
        { path: '/admin/members', label: 'Membres', icon: AiOutlineTeam },
        { path: '/admin/finance', label: 'Finance', icon: AiOutlineWallet },
        { path: '/admin/profile', label: 'Profil', icon: AiOutlineUser },
    ];

    const superAdminLinks = [
        { path: '/superadmin/dashboard', label: 'Dashboard', icon: AiOutlineDashboard },
        { path: '/superadmin/management', label: 'Gestion', icon: AiOutlineSetting },
        { path: '/superadmin/profile', label: 'Profil', icon: AiOutlineUser },
    ];

    const links = isSuperAdmin ? superAdminLinks : adminLinks;

    // Style glassmorphism pour la sidebar desktop
    const sidebarStyle = scrolled
        ? 'bg-white/80 backdrop-blur-xl border-r border-white/30 shadow-lg'
        : 'bg-white/95 backdrop-blur-md border-r-2 border-brand-border';

    return (
        <>
            <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden fixed bottom-20 right-4 z-50 p-3 rounded-full bg-white/80 backdrop-blur-xl border border-white/30 shadow-lg text-brand-primary transition-all duration-300 hover:scale-110"
            >
                <AiOutlineMenu size={24} />
            </button>

            <aside className={`
                hidden md:flex flex-col fixed left-0 h-full transition-all duration-300 z-40
                ${sidebarStyle}
                ${isOpen ? 'w-64' : 'w-20'}
            `}>
                <div className="absolute inset-0 bg-linear-to-b from-white/40 to-white/10 pointer-events-none" />
                
                <nav className="relative flex-1 mt-20 p-4 space-y-2 overflow-y-auto">
                    {links.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            className={({ isActive }) => `
                                flex items-center gap-4 p-3 rounded-xl transition-all duration-200 font-black text-xs uppercase tracking-wider
                                ${isActive 
                                    ? 'bg-linear-to-r from-brand-primary to-brand-primary text-white shadow-lg' 
                                    : 'text-brand-muted hover:bg-white/50 backdrop-blur-sm hover:text-brand-primary border border-transparent hover:border-white/30'
                                }
                                ${isOpen ? 'justify-start' : 'justify-center'}
                            `}
                        >
                            <link.icon size={22} />
                            {isOpen && <span>{link.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                <div className="relative p-4 border-t border-white/30">
                    <button
                        onClick={logout}
                        className={`
                            flex items-center gap-4 p-3 w-full rounded-xl transition-all duration-200 font-black text-xs uppercase tracking-wider
                            text-brand-muted hover:bg-red-50/80 backdrop-blur-sm hover:text-red-500 border border-transparent hover:border-red-200
                            ${isOpen ? 'justify-start' : 'justify-center'}
                        `}
                    >
                        <AiOutlineLogout size={22} />
                        {isOpen && <span>Déconnexion</span>}
                    </button>
                </div>
                
                <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/50 to-transparent" />
            </aside>

            {/* Mobile Sidebar Menu - Glassmorphism */}
            {isMobileMenuOpen && (
                <>
                    {/* Overlay avec blur */}
                    <div 
                        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    
                    {/* Menu latéral mobile */}
                    <div className="fixed left-0 top-0 bottom-0 w-72 bg-white/90 backdrop-blur-xl border-r border-white/30 shadow-2xl z-50 animate-in slide-in-from-left duration-300">
                        {/* Effet de brillance */}
                        <div className="absolute inset-0 bg-linear-to-b from-white/40 to-white/10 pointer-events-none" />
                        
                        {/* Header avec logo */}
                        <div className="relative p-6 border-b border-white/30 bg-linear-to-r from-brand-primary/10 to-orange-500/10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-brand-primary to-orange-500 flex items-center justify-center shadow-lg">
                                        <svg 
                                            width="20" 
                                            height="20" 
                                            viewBox="0 0 24 24" 
                                            fill="currentColor" 
                                            className="text-white"
                                        >
                                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                                            <path d="M11 5l1 1-1 1-1-1 1-1zM15 3l1 1-1 1-1-1 1-1zM18 6l1 1-1 1-1-1 1-1z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="font-black text-sm text-gray-800">FIZANAKARA</h2>
                                        <p className="text-[8px] text-gray-500">Gestion cotisation</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 rounded-lg hover:bg-white/50 backdrop-blur-sm transition-colors"
                                >
                                    <AiOutlineClose size={20} className="text-gray-500" />
                                </button>
                            </div>
                        </div>

                        {/* Navigation items */}
                        <nav className="relative p-4 space-y-2">
                            {links.map((link) => (
                                <NavLink
                                    key={link.path}
                                    to={link.path}
                                    className={({ isActive }) => `
                                        flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                                        ${isActive 
                                            ? 'bg-linear-to-r from-brand-primary to-orange-500 text-white shadow-lg' 
                                            : 'text-gray-600 hover:bg-white/50 backdrop-blur-sm hover:text-brand-primary'
                                        }
                                    `}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <link.icon size={20} />
                                    <span className="font-medium text-sm">{link.label}</span>
                                </NavLink>
                            ))}

                            <div className="h-px bg-linear-to-r from-transparent via-gray-200 to-transparent my-3" />

                            <button
                                onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-red-500 hover:bg-red-50/80 backdrop-blur-sm"
                            >
                                <AiOutlineLogout size={20} />
                                <span className="font-medium text-sm">Déconnexion</span>
                            </button>
                        </nav>

                        {/* Version et footer */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/30">
                            <p className="text-[8px] text-center text-gray-400">
                                Version 1.0.0 • © 2024 Fizanakara
                            </p>
                        </div>

                        {/* Effet de bordure brillante en haut */}
                        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/50 to-transparent" />
                    </div>
                </>
            )}

            {/* Bottom Navigation Mobile - Glassmorphism */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-white/30 px-2 py-2 z-50 flex items-center justify-around shadow-2xl">
                {links.slice(0, 4).map((link) => (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        className={({ isActive }) => `
                            flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200
                            ${isActive 
                                ? 'text-brand-primary bg-white/50 backdrop-blur-sm' 
                                : 'text-brand-muted hover:text-brand-primary hover:bg-white/30 backdrop-blur-sm'
                            }
                        `}
                    >
                        <link.icon size={20} />
                        <span className="text-[8px] font-black uppercase tracking-tighter">
                            {link.label}
                        </span>
                    </NavLink>
                ))}
                
                <button
                    onClick={logout}
                    className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 text-brand-muted hover:text-red-500 hover:bg-red-50/50 backdrop-blur-sm"
                >
                    <AiOutlineLogout size={20} />
                    <span className="text-[8px] font-black uppercase">Exit</span>
                </button>
            </nav>
        </>
    );
};

export default Sidebar;