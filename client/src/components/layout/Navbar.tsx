import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
    AiOutlineMenu, 
    AiOutlineBell, 
    AiOutlineUser, 
    AiOutlineSetting,
    AiOutlineCrown,
    AiOutlineDown,
    AiOutlineLogout,
    AiOutlineClose
} from 'react-icons/ai';
import { getImageUrl } from '../../lib/constant/constant';

interface NavbarProps {
    toggleSidebar: () => void;
}

const Navbar = ({ }: NavbarProps) => {
    const { user, isSuperAdmin, logout } = useAuth();
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Détecter le scroll pour changer l'apparence
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const Logo = () => (
        <svg 
            width="28" 
            height="28" 
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

    // Style glassmorphism pour la navbar
    const navbarStyle = scrolled 
        ? 'bg-white/80 backdrop-blur-xl border-b border-white/30 shadow-lg'
        : 'bg-white/95 backdrop-blur-md border-b-4 border-brand-border';

    return (
        <>
            <header className={`sticky top-0 z-50 h-16 md:h-20 flex items-center justify-between px-4 md:px-6 transition-all duration-300 ${navbarStyle}`}>
                {/* Effet de brillance */}
                <div className="absolute inset-0 bg-linear-to-r from-brand-primary/5 via-transparent to-orange-500/5 pointer-events-none" />
                
                <div className="relative flex items-center gap-3">
                    {/* Menu mobile button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 rounded-xl transition-all text-brand-muted hover:text-brand-primary hover:bg-white/50 backdrop-blur-sm"
                        aria-label="Menu"
                    >
                        {isMobileMenuOpen ? <AiOutlineClose size={22} /> : <AiOutlineMenu size={22} />}
                    </button>

                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="p-1.5 md:p-2 rounded-xl bg-linear-to-br from-brand-primary/10 to-orange-500/10">
                            <Logo />
                        </div>
                        <div>
                            <h1 className="font-black text-base md:text-lg tracking-tight text-brand-primary leading-tight">
                                FIZANAKARA
                            </h1>
                            <p className="text-[7px] md:text-[8px] text-brand-muted -mt-0.5 font-medium">
                                Gestion cotisation
                            </p>
                        </div>
                    </div>
                </div>

                <div className="relative flex items-center gap-2">
                    {!isSuperAdmin && (
                        <button className="relative p-2 rounded-xl hover:bg-white/50 backdrop-blur-sm transition-all text-brand-muted hover:text-brand-primary">
                            <AiOutlineBell size={20} className="md:w-5 md:h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white/80"></span>
                        </button>
                    )}

                    {/* Profile Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/50 backdrop-blur-sm transition-all group"
                            aria-expanded={isProfileMenuOpen}
                        >
                            <div className="relative">
                                <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-linear-to-br from-brand-primary to-orange-500 text-white flex items-center justify-center font-bold text-xs md:text-sm overflow-hidden shadow-md">
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
                                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 md:w-4 md:h-4 bg-yellow-400 rounded-full border-2 border-white/80 flex items-center justify-center">
                                        <AiOutlineCrown size={7} className="md:w-2 md:h-2 text-yellow-900" />
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

                                    <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/50 to-transparent" />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Mobile Sidebar Menu - Glassmorphism */}
            {isMobileMenuOpen && (
                <>
                    <div 
                        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    <div className="fixed left-0 top-16 bottom-0 w-64 bg-white/90 backdrop-blur-xl border-r border-white/30 shadow-2xl z-50 animate-in slide-in-from-left duration-300">
                        <div className="absolute inset-0 bg-linear-to-b from-white/40 to-white/10 pointer-events-none" />
                        
                        <div className="relative p-4 border-b border-white/30">
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

                        <nav className="relative p-4 space-y-2">
                            <NavLink
                                to={isSuperAdmin ? '/superadmin/dashboard' : '/admin/dashboard'}
                                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/50 backdrop-blur-sm text-gray-600 hover:text-brand-primary transition-all duration-200"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <AiOutlineUser size={18} />
                                <span className="font-medium text-sm">Dashboard</span>
                            </NavLink>
                            
                            {!isSuperAdmin && (
                                <>
                                    <NavLink
                                        to="/admin/members"
                                        className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/50 backdrop-blur-sm text-gray-600 hover:text-brand-primary transition-all duration-200"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <AiOutlineUser size={18} />
                                        <span className="font-medium text-sm">Membres</span>
                                    </NavLink>
                                    <NavLink
                                        to="/admin/finance"
                                        className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/50 backdrop-blur-sm text-gray-600 hover:text-brand-primary transition-all duration-200"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <AiOutlineUser size={18} />
                                        <span className="font-medium text-sm">Finance</span>
                                    </NavLink>
                                </>
                            )}

                            {isSuperAdmin && (
                                <NavLink
                                    to="/superadmin/management"
                                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/50 backdrop-blur-sm text-gray-600 hover:text-brand-primary transition-all duration-200"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <AiOutlineSetting size={18} />
                                    <span className="font-medium text-sm">Gestion</span>
                                </NavLink>
                            )}

                            <div className="h-px bg-linear-to-r from-transparent via-gray-200 to-transparent my-3" />

                            <button
                                onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-red-50/80 backdrop-blur-sm text-red-500 transition-all duration-200"
                            >
                                <AiOutlineLogout size={18} />
                                <span className="font-medium text-sm">Déconnexion</span>
                            </button>
                        </nav>
                    </div>
                </>
            )}
        </>
    );
};

export default Navbar;