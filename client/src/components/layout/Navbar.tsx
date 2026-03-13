import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
    AiOutlineMenu, 
    AiOutlineBell, 
    AiOutlineUser, 
    AiOutlineSetting,
    AiOutlineCrown,
    AiOutlineDown,
    AiOutlineLogout
} from 'react-icons/ai';

interface NavbarProps {
    toggleSidebar: () => void;
}

const Navbar = ({ toggleSidebar }: NavbarProps) => {
    const { user, isSuperAdmin, logout } = useAuth();
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    const Logo = () => (
        <svg 
            width="32" 
            height="32" 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            className="text-brand-primary"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            <path d="M11 5l1 1-1 1-1-1 1-1zM15 3l1 1-1 1-1-1 1-1zM18 6l1 1-1 1-1-1 1-1z" />
        </svg>
    );

    return (
        <header className="sticky top-0 z-50 h-20 bg-brand-card border-b-4 border-brand-border flex items-center justify-between px-4 md:px-6 shadow-[0_4px_0_0_var(--border-main)]">
            <div className="flex items-center gap-3">
                <button
                    onClick={toggleSidebar}
                    className="md:hidden p-2 hover:bg-brand-bg rounded-xl transition-all text-brand-muted hover:text-brand-primary"
                    aria-label="Menu"
                >
                    <AiOutlineMenu size={24} />
                </button>

                <div className="flex items-center gap-3">
                    <Logo />
                    <div>
                        <h1 className="font-black text-lg tracking-tight text-brand-primary leading-tight">
                            FIZANAKARA
                        </h1>
                        <p className="text-[8px] text-brand-muted -mt-1 font-medium">
                            Gestion cotisation
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {!isSuperAdmin && (
                    <button className="relative p-2 hover:bg-brand-bg rounded-xl transition-all text-brand-muted hover:text-brand-primary">
                        <AiOutlineBell size={22} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-brand-card"></span>
                    </button>
                )}

                <div className="relative">
                    <button
                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                        className="flex items-center gap-2 p-1.5 hover:bg-brand-bg rounded-xl transition-all"
                        aria-expanded={isProfileMenuOpen}
                    >
                        <div className="relative">
                            <div className="w-9 h-9 rounded-xl bg-brand-primary text-white flex items-center justify-center font-bold text-sm">
                                {user?.firstName?.[0]}{user?.lastName?.[0]}
                            </div>
                            {isSuperAdmin && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-brand-card flex items-center justify-center">
                                    <AiOutlineCrown size={8} className="text-yellow-900" />
                                </div>
                            )}
                        </div>

                        <div className="hidden lg:flex items-center gap-1">
                            <span className="font-bold text-sm">{user?.firstName}</span>
                            <AiOutlineDown size={12} className={`text-brand-muted transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                        </div>
                    </button>

                    {isProfileMenuOpen && (
                        <>
                            <div 
                                className="fixed inset-0 z-40"
                                onClick={() => setIsProfileMenuOpen(false)}
                            />
                            
                            <div className="absolute right-0 top-12 w-56 bg-brand-card border-4 border-brand-border rounded-2xl shadow-xl z-50 overflow-hidden">
                                <div className="p-3 border-b-4 border-brand-border bg-brand-bg">
                                    <p className="font-bold text-sm">{user?.firstName} {user?.lastName}</p>
                                    <p className="text-xs text-brand-muted truncate">{user?.email}</p>
                                </div>

                                <div className="p-2">
                                    <NavLink
                                        to={isSuperAdmin ? '/superadmin/profile' : '/admin/profile'}
                                        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-brand-bg text-brand-muted hover:text-brand-primary transition-all font-medium text-sm"
                                        onClick={() => setIsProfileMenuOpen(false)}
                                    >
                                        <AiOutlineUser size={18} />
                                        <span>Mon Profil</span>
                                    </NavLink>

                                    {isSuperAdmin && (
                                        <NavLink
                                            to="/superadmin/management"
                                            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-brand-bg text-brand-muted hover:text-brand-primary transition-all font-medium text-sm"
                                            onClick={() => setIsProfileMenuOpen(false)}
                                        >
                                            <AiOutlineSetting size={18} />
                                            <span>Administration</span>
                                        </NavLink>
                                    )}

                                    <button
                                        onClick={() => { logout(); setIsProfileMenuOpen(false); }}
                                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-50 text-red-600 transition-all font-medium text-sm"
                                    >
                                        <AiOutlineLogout size={18} />
                                        <span>Déconnexion</span>
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;