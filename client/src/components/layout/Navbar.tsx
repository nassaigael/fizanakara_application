import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    AiOutlineBell,
    AiOutlineUser,
    AiOutlineSetting,
    AiOutlineCrown,
    AiOutlineDown,
    AiOutlineLogout
} from 'react-icons/ai';
import { Avatar } from '../../components/ui/Avatar';
import logo from "../../../public/logo.png";

interface NavbarProps {
    toggleSidebar: () => void;
}

const Navbar = ({ }: NavbarProps) => {
    const { user, isSuperAdmin, logout } = useAuth();
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navbarStyle = scrolled
        ? 'bg-white/80 backdrop-blur-xl border-b border-white/30 shadow-lg'
        : 'bg-white/95 backdrop-blur-md border-b-4 border-brand-border';

    return (
        <>
            <header className={`sticky top-0 z-50 h-16 md:h-20 flex items-center justify-between px-4 md:px-6 transition-all duration-300 ${navbarStyle}`}>
                <div className="absolute inset-0 bg-linear-to-r from-brand-primary/5 via-transparent to-orange-500/5 pointer-events-none" />

                <div className="relative flex items-center gap-3">
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="p-1.5 md:p-2 rounded-xl bg-linear-to-br from-brand-primary/10 to-orange-500/10">
                            <img
                                src={logo}
                                alt="FIZANAKARA logo"
                                className="w-7 h-7 md:w-8 md:h-8 object-contain"
                            />
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

                    <div className="relative">
                        <button
                            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/50 backdrop-blur-sm transition-all group"
                            aria-expanded={isProfileMenuOpen}
                        >
                            <div className="relative">
                                {/* Avatar avec composant Avatar */}
                                <Avatar
                                    imageUrl={user?.imageUrl}
                                    firstName={user?.firstName}
                                    lastName={user?.lastName}
                                    category="admin"
                                    size="md"
                                    shape="rounded"
                                />
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
                                            {/* Avatar dans le dropdown */}
                                            <Avatar
                                                imageUrl={user?.imageUrl}
                                                firstName={user?.firstName}
                                                lastName={user?.lastName}
                                                category="admin"
                                                size="lg"
                                                shape="rounded"
                                            />
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
        </>
    );
};

export default Navbar;