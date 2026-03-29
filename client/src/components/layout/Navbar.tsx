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
import { getImageUrl } from '../../lib/constant/constant';

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

    const getInitials = () => {
        if (!user) return '?';
        return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
    };

    const hasImage = user?.imageUrl && user.imageUrl.trim() !== '';

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
                        className="flex items-center gap-2 p-1.5 hover:bg-brand-bg rounded-xl transition-all group"
                        aria-expanded={isProfileMenuOpen}
                    >
                        <div className="relative">
                            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-brand-primary to-orange-500 text-white flex items-center justify-center font-bold text-sm overflow-hidden shadow-md">
                                {hasImage ? (
                                    <img
                                        src={getImageUrl(user?.imageUrl, 'admin')}
                                        alt={user?.firstName}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                            (e.target as HTMLImageElement).parentElement!.innerHTML = getInitials();
                                        }}
                                    />
                                ) : (
                                    getInitials()
                                )}
                            </div>
                            {isSuperAdmin && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-brand-card flex items-center justify-center">
                                    <AiOutlineCrown size={8} className="text-yellow-900" />
                                </div>
                            )}
                        </div>

                        <div className="hidden lg:flex items-center gap-1">
                            <span className="font-bold text-sm">{user?.firstName}</span>
                            <AiOutlineDown size={12} className={`text-brand-muted transition-transform duration-300 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                        </div>
                    </button>

                    {/* Dropdown Glassmorphism */}
                    {isProfileMenuOpen && (
                        <>
                            <div 
                                className="fixed inset-0 z-40"
                                onClick={() => setIsProfileMenuOpen(false)}
                            />
                            
                            <div className="absolute right-0 top-12 w-64 bg-white/90 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                                <div className="absolute inset-0 bg-linear-to-br from-white/40 to-white/10 pointer-events-none" />
                                
                                {/* Header avec effet glass */}
                                <div className="relative p-4 border-b border-white/30 bg-linear-to-r from-brand-primary/10 to-orange-500/10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-brand-primary to-orange-500 text-white flex items-center justify-center font-bold text-sm overflow-hidden shadow-lg">
                                            {hasImage ? (
                                                <img
                                                    src={getImageUrl(user?.imageUrl, 'admin')}
                                                    alt={user?.firstName}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                        (e.target as HTMLImageElement).parentElement!.innerHTML = getInitials();
                                                    }}
                                                />
                                            ) : (
                                                getInitials()
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm text-gray-800 truncate">{user?.firstName} {user?.lastName}</p>
                                            <p className="text-[9px] text-gray-500 truncate">{user?.email}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Menu items avec effet glass */}
                                <div className="relative p-2 space-y-1">
                                    <NavLink
                                        to={isSuperAdmin ? '/superadmin/profile' : '/admin/profile'}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/50 backdrop-blur-sm text-gray-600 hover:text-brand-primary transition-all duration-200 group"
                                        onClick={() => setIsProfileMenuOpen(false)}
                                    >
                                        <div className="p-1 rounded-lg bg-gray-100 group-hover:bg-brand-primary/10 transition-colors">
                                            <AiOutlineUser size={16} />
                                        </div>
                                        <span className="font-medium text-sm">Mon Profil</span>
                                    </NavLink>

                                    {isSuperAdmin && (
                                        <NavLink
                                            to="/superadmin/management"
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/50 backdrop-blur-sm text-gray-600 hover:text-brand-primary transition-all duration-200 group"
                                            onClick={() => setIsProfileMenuOpen(false)}
                                        >
                                            <div className="p-1 rounded-lg bg-gray-100 group-hover:bg-brand-primary/10 transition-colors">
                                                <AiOutlineSetting size={16} />
                                            </div>
                                            <span className="font-medium text-sm">Administration</span>
                                        </NavLink>
                                    )}

                                    <div className="h-px bg-linear-to-r from-transparent via-gray-200 to-transparent my-2" />

                                    <button
                                        onClick={() => { logout(); setIsProfileMenuOpen(false); }}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50/80 backdrop-blur-sm text-red-500 transition-all duration-200 group"
                                    >
                                        <div className="p-1 rounded-lg bg-red-50 group-hover:bg-red-100 transition-colors">
                                            <AiOutlineLogout size={16} />
                                        </div>
                                        <span className="font-medium text-sm">Déconnexion</span>
                                    </button>
                                </div>

                                {/* Effet de bordure brillante */}
                                <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/50 to-transparent" />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;