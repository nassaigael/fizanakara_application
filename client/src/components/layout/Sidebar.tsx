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
    const [estMenuMobileOuvert, setEstMenuMobileOuvert] = useState(false);
    const [aDefile, setADefile] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setADefile(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const liensAdmin = [
        { path: '/admin/dashboard', label: 'Tableau de bord', icon: AiOutlineDashboard },
        { path: '/admin/members', label: 'Membres', icon: AiOutlineTeam },
        { path: '/admin/finance', label: 'Finances', icon: AiOutlineWallet },
        { path: '/admin/profile', label: 'Profil', icon: AiOutlineUser },
    ];

    const liensSuperAdmin = [
        { path: '/superadmin/dashboard', label: 'Tableau de bord', icon: AiOutlineDashboard },
        { path: '/superadmin/management', label: 'Gestion', icon: AiOutlineSetting },
        { path: '/superadmin/profile', label: 'Profil', icon: AiOutlineUser },
    ];

    const liens = isSuperAdmin ? liensSuperAdmin : liensAdmin;

    // Style glassmorphism pour la barre latérale desktop
    const styleBarreLaterale = aDefile
        ? 'bg-white/80 backdrop-blur-xl border-r border-white/30 shadow-lg'
        : 'bg-white/95 backdrop-blur-md border-r-2 border-brand-border';

    return (
        <>
            <button
                onClick={() => setEstMenuMobileOuvert(true)}
                className="md:hidden fixed bottom-20 right-4 z-50 p-3 rounded-full bg-white/80 backdrop-blur-xl border border-white/30 shadow-lg text-brand-primary transition-all duration-300 hover:scale-110"
            >
                <AiOutlineMenu size={24} />
            </button>

            {/* Barre latérale Desktop - Glassmorphism */}
            <aside className={`
                hidden md:flex flex-col fixed left-0 h-full transition-all duration-300 z-40
                ${styleBarreLaterale}
                ${isOpen ? 'w-64' : 'w-20'}
            `}>
                <div className="absolute inset-0 bg-linear-to-b from-white/40 to-white/10 pointer-events-none" />
                
                <nav className="relative flex-1 mt-20 p-4 space-y-2 overflow-y-auto">
                    {liens.map((lien) => (
                        <NavLink
                            key={lien.path}
                            to={lien.path}
                            className={({ isActive }) => `
                                flex items-center gap-4 p-3 rounded-xl transition-all duration-200 font-black text-xs uppercase tracking-wider
                                ${isActive 
                                    ? 'bg-linear-to-r from-brand-primary to-brand-primary text-white shadow-lg' 
                                    : 'text-brand-muted hover:bg-white/50 backdrop-blur-sm hover:text-brand-primary border border-transparent hover:border-white/30'
                                }
                                ${isOpen ? 'justify-start' : 'justify-center'}
                            `}
                        >
                            <lien.icon size={22} />
                            {isOpen && <span>{lien.label}</span>}
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

            {/* Menu latéral Mobile - Glassmorphism */}
            {estMenuMobileOuvert && (
                <>
                    {/* Superposition avec flou */}
                    <div 
                        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setEstMenuMobileOuvert(false)}
                    />
                    
                    {/* Menu latéral mobile */}
                    <div className="fixed left-0 top-0 bottom-0 w-72 bg-white/90 backdrop-blur-xl border-r border-white/30 shadow-2xl z-50 animate-in slide-in-from-left duration-300">
                        {/* Effet de brillance */}
                        <div className="absolute inset-0 bg-linear-to-b from-white/40 to-white/10 pointer-events-none" />
                        
                        {/* En-tête avec logo */}
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
                                    onClick={() => setEstMenuMobileOuvert(false)}
                                    className="p-2 rounded-lg hover:bg-white/50 backdrop-blur-sm transition-colors"
                                >
                                    <AiOutlineClose size={20} className="text-gray-500" />
                                </button>
                            </div>
                        </div>

                        {/* Éléments de navigation */}
                        <nav className="relative p-4 space-y-2">
                            {liens.map((lien) => (
                                <NavLink
                                    key={lien.path}
                                    to={lien.path}
                                    className={({ isActive }) => `
                                        flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                                        ${isActive 
                                            ? 'bg-linear-to-r from-brand-primary to-orange-500 text-white shadow-lg' 
                                            : 'text-gray-600 hover:bg-white/50 backdrop-blur-sm hover:text-brand-primary'
                                        }
                                    `}
                                    onClick={() => setEstMenuMobileOuvert(false)}
                                >
                                    <lien.icon size={20} />
                                    <span className="font-medium text-sm">{lien.label}</span>
                                </NavLink>
                            ))}

                            <div className="h-px bg-linear-to-r from-transparent via-gray-200 to-transparent my-3" />

                            <button
                                onClick={() => { logout(); setEstMenuMobileOuvert(false); }}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-red-500 hover:bg-red-50/80 backdrop-blur-sm"
                            >
                                <AiOutlineLogout size={20} />
                                <span className="font-medium text-sm">Déconnexion</span>
                            </button>
                        </nav>

                        {/* Version et pied de page */}
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

            {/* Navigation inférieure Mobile - Glassmorphism */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-white/30 px-2 py-2 z-50 flex items-center justify-around shadow-2xl">
                {liens.slice(0, 4).map((lien) => (
                    <NavLink
                        key={lien.path}
                        to={lien.path}
                        className={({ isActive }) => `
                            flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200
                            ${isActive 
                                ? 'text-brand-primary bg-white/50 backdrop-blur-sm' 
                                : 'text-brand-muted hover:text-brand-primary hover:bg-white/30 backdrop-blur-sm'
                            }
                        `}
                    >
                        <lien.icon size={20} />
                        <span className="text-[8px] font-black uppercase tracking-tighter">
                            {lien.label}
                        </span>
                    </NavLink>
                ))}
                
                <button
                    onClick={logout}
                    className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 text-brand-muted hover:text-red-500 hover:bg-red-50/50 backdrop-blur-sm"
                >
                    <AiOutlineLogout size={20} />
                    <span className="text-[8px] font-black uppercase">Sortie</span>
                </button>
            </nav>
        </>
    );
};

export default Sidebar;