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
    AiOutlineHistory,
} from 'react-icons/ai';

interface SidebarProps {
    isOpen: boolean;
    toggleSidebar?: () => void;
}

const Sidebar = ({ isOpen }: SidebarProps) => {
    const { logout, isSuperAdmin } = useAuth();
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
        { path: '/admin/payment-history', label: 'Historique', icon: AiOutlineHistory },
        { path: '/admin/profile', label: 'Profil', icon: AiOutlineUser },
    ];

    const liensSuperAdmin = [
        { path: '/superadmin/dashboard', label: 'Tableau de bord', icon: AiOutlineDashboard },
        { path: '/superadmin/management', label: 'Gestion', icon: AiOutlineSetting },
        { path: '/superadmin/profile', label: 'Profil', icon: AiOutlineUser },
    ];

    const liens = isSuperAdmin ? liensSuperAdmin : liensAdmin;

    const styleBarreLaterale = aDefile
        ? 'bg-white/80 backdrop-blur-xl border-r border-white/30 shadow-lg'
        : 'bg-white/95 backdrop-blur-md border-r-2 border-brand-border';

    return (
        <>
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