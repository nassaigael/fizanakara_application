import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    AiOutlineDashboard,
    AiOutlineTeam,
    AiOutlineWallet,
    AiOutlineUser,
    AiOutlineSetting,
    AiOutlineLogout,
} from 'react-icons/ai';

interface SidebarProps {
    isOpen: boolean;
    toggleSidebar?: () => void;
}

const Sidebar = ({ isOpen }: SidebarProps) => {
    const { logout, isSuperAdmin } = useAuth();

    const adminLinks = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: AiOutlineDashboard },
        { path: '/admin/members', label: 'Members', icon: AiOutlineTeam },
        { path: '/admin/finance', label: 'Finance', icon: AiOutlineWallet },
        { path: '/admin/profile', label: 'Profile', icon: AiOutlineUser },
    ];

    const superAdminLinks = [
        { path: '/superadmin/dashboard', label: 'Dashboard', icon: AiOutlineDashboard },
        { path: '/superadmin/management', label: 'Management', icon: AiOutlineSetting },
        { path: '/superadmin/profile', label: 'Profile', icon: AiOutlineUser },
    ];

    const links = isSuperAdmin ? superAdminLinks : adminLinks;

    return (
        <>
            <aside className={`
                hidden md:flex flex-col fixed left-0 h-full bg-brand-card border-r-2 border-brand-border 
                transition-all duration-300 z-40 ${isOpen ? 'w-64' : 'w-20'}
            `}>
                <nav className="flex-1 mt-20 p-4 space-y-2 overflow-y-auto">
                    {links.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            className={({ isActive }) => `
                                flex items-center gap-4 p-3 rounded-xl transition-all font-black text-xs uppercase tracking-wider
                                ${isActive 
                                    ? 'bg-brand-primary text-white border-b-4 border-brand-primary-dark' 
                                    : 'text-brand-muted hover:bg-brand-bg hover:text-brand-primary border-2 border-transparent'
                                }
                                ${isOpen ? 'justify-start' : 'justify-center'}
                            `}
                        >
                            <link.icon size={22} />
                            {isOpen && <span>{link.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t-2 border-brand-border">
                    <button
                        onClick={logout}
                        className={`
                            flex items-center gap-4 p-3 w-full rounded-xl transition-all font-black text-xs uppercase tracking-wider
                            text-brand-muted hover:bg-brand-primary-light hover:text-brand-primary border-2 border-transparent hover:border-brand-primary/20
                            ${isOpen ? 'justify-start' : 'justify-center'}
                        `}
                    >
                        <AiOutlineLogout size={22} />
                        {isOpen && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-brand-card border-t-2 border-brand-border px-2 py-3 z-50 flex items-center justify-around shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                {links.map((link) => (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        className="flex-1 flex justify-center"
                    >
                        {({ isActive }) => (
                            <div className={`
                                flex flex-col items-center gap-1 transition-all
                                ${isActive ? 'text-brand-primary' : 'text-brand-muted hover:text-brand-primary'}
                            `}>
                                <link.icon size={24} />
                                <span className="text-[9px] font-black uppercase tracking-tighter">
                                    {link.label}
                                </span>
                            </div>
                        )}
                    </NavLink>
                ))}
                
                <button
                    onClick={logout}
                    className="flex-1 flex flex-col items-center gap-1 text-brand-muted hover:text-brand-primary transition-colors"
                >
                    <AiOutlineLogout size={24} />
                    <span className="text-[9px] font-black uppercase">Logout</span>
                </button>
            </nav>
        </>
    );
};

export default Sidebar;