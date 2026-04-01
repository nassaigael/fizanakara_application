import React, { useState, useEffect } from 'react';
import {
    AiOutlineUser,
    AiOutlineMail,
    AiOutlinePhone,
    AiOutlineCalendar,
    AiOutlineCrown,
    AiOutlineCheckCircle,
    AiOutlineBgColors,
    AiOutlineLogout,
    AiOutlineCheck
} from 'react-icons/ai';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import StatCard from '../../components/ui/StatCard';
import { formatDate, getInitials } from '../../lib/helper';
import { getImageUrl } from '../../lib/constant/constant';
import { THEME } from '../../styles/theme';
import { applyThemeToDOM } from '../../lib/helper';

const themeColors = [
    { name: 'Rouge', primary: '#E51A1A', dark: '#B91C1C', light: '#FEE2E2' },
    { name: 'Bleu', primary: '#1E3A8A', dark: '#1E3A8A', light: '#DBEAFE' },
    { name: 'Vert', primary: '#10B981', dark: '#059669', light: '#D1FAE5' },
    { name: 'Violet', primary: '#8B5CF6', dark: '#6D28D9', light: '#EDE9FE' },
    { name: 'Orange', primary: '#F97316', dark: '#C2410C', light: '#FFEDD5' },
];

const SuperAdminProfile: React.FC = () => {
    const { user, logout } = useAuth();
    const [currentColor, setCurrentColor] = useState<string>(() => {
        return localStorage.getItem('app-theme-color') || themeColors[0].primary;
    });

    useEffect(() => {
        applyThemeToDOM(currentColor);
        localStorage.setItem('app-theme-color', currentColor);
    }, [currentColor]);

    if (!user) return null;

    return (
        <div className={THEME.section}>
            <div className="relative overflow-hidden bg-white border-2 border-brand-border rounded-2xl shadow-[0_8px_0_0_#E5E5E5] hover:shadow-[0_12px_0_0_#E5E5E5] hover:translate-y-[-4px] transition-all duration-300 p-6 md:p-8">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/5 via-transparent to-brand-primary/5" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-primary/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-brand-primary to-brand-primary rounded-2xl blur-md opacity-50" />
                            <div className="relative p-4 bg-gradient-to-br from-brand-primary to-brand-primary-dark text-white rounded-2xl shadow-lg transform hover:scale-105 transition-transform">
                                <AiOutlineCrown size={36} />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-brand-text tracking-tight">
                                MON PROFIL SUPER ADMIN
                            </h1>
                            <p className="flex items-center gap-2 text-sm text-brand-muted mt-1">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                {user.role} - Compte actif
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="primary"
                        onClick={logout}
                        className="flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
                    >
                        <AiOutlineLogout size={18} />
                        Déconnexion
                    </Button>
                </div>
            </div>

            <div className={`${THEME.card} relative overflow-hidden border-b-[6px] border-brand-border hover:translate-y-[-2px] transition-all duration-300`}>
                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-transparent" />

                <div className="relative flex flex-col md:flex-row items-center gap-10">
                    <div className="relative shrink-0 group">
                        <div className="relative w-36 h-36 md:w-44 md:h-44 bg-white rounded-[2rem] border-2 border-brand-border shadow-[0_6px_0_0_#E5E5E5] flex items-center justify-center overflow-hidden transition-all group-hover:shadow-[0_10px_0_0_#E5E5E5] group-hover:translate-y-[-4px]">
                            {user.imageUrl ? (
                                <img
                                    src={getImageUrl(user.imageUrl, 'admin')}
                                    alt="Profile"
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-brand-primary to-brand-primary-dark flex items-center justify-center text-white text-4xl md:text-5xl font-black italic">
                                    {getInitials(user.firstName, user.lastName)}
                                </div>
                            )}
                        </div>

                        <div className={`absolute -bottom-1 -right-1 p-2.5 rounded-full border-4 border-white shadow-lg ${user.verified ? 'bg-green-500' : 'bg-red-500'} z-10 transition-transform group-hover:scale-110`}>
                            <AiOutlineCheckCircle className="text-white" size={22} />
                        </div>

                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white border-2 border-yellow-500 text-yellow-600 rounded-2xl font-black text-[10px] tracking-widest flex items-center gap-2 shadow-[0_4px_0_0_#EAB308] whitespace-nowrap">
                            <AiOutlineCrown size={14} className="animate-pulse" />
                            SUPER ADMIN
                        </div>
                    </div>

                    <div className="flex-1 w-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {[
                                { icon: AiOutlineUser, label: "Nom complet", value: `${user.firstName} ${user.lastName}` },
                                { icon: AiOutlineMail, label: "Email", value: user.email },
                                { icon: AiOutlinePhone, label: "Téléphone", value: user.phoneNumber || '-' },
                                { icon: AiOutlineCalendar, label: "Date de naissance", value: formatDate(user.birthDate) }
                            ].map((item, index) => (
                                <div
                                    key={index}
                                    className="group flex items-center gap-4 bg-white border-2 border-brand-border rounded-xl p-3 shadow-[0_4px_0_0_#F0F0F0] hover:border-brand-primary/30 hover:shadow-[0_4px_0_0_var(--color-primary-light)] transition-all cursor-default"
                                >
                                    <div className="shrink-0 w-10 h-10 rounded-full border-2 border-brand-border bg-brand-bg flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white group-hover:border-brand-primary-dark transition-all duration-300 shadow-sm">
                                        <item.icon size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[9px] font-black uppercase tracking-wider text-brand-muted mb-0.5">
                                            {item.label}
                                        </p>
                                        <p className="font-semibold text-brand-text text-sm truncate">
                                            {item.value}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white border-2 border-brand-border rounded-2xl p-4 shadow-[0_6px_0_0_#E5E5E5] hover:shadow-[0_8px_0_0_#E5E5E5] hover:translate-y-[-2px] transition-all duration-300">
                    <StatCard
                        title="Compte"
                        status={user.verified ? "Vérifié" : "Non vérifié"}
                        icon={<AiOutlineCheckCircle size={24} />}
                        color={user.verified ? "green" : "orange"}
                    />
                </div>
                <div className="bg-white border-2 border-brand-border rounded-2xl p-4 shadow-[0_6px_0_0_#E5E5E5] hover:shadow-[0_8px_0_0_#E5E5E5] hover:translate-y-[-2px] transition-all duration-300">
                    <StatCard
                        title="Rôle"
                        status={user.role}
                        icon={<AiOutlineCrown size={24} />}
                        color="blue"
                    />
                </div>
                <div className="bg-white border-2 border-brand-border rounded-2xl p-4 shadow-[0_6px_0_0_#E5E5E5] hover:shadow-[0_8px_0_0_#E5E5E5] hover:translate-y-[-2px] transition-all duration-300">
                    <StatCard
                        title="Statut"
                        status="Actif"
                        icon={<AiOutlineCheckCircle size={24} />}
                        color="green"
                    />
                </div>
            </div>

            <div className="bg-white border-2 border-brand-border rounded-2xl p-6 md:p-8 shadow-[0_6px_0_0_#E5E5E5] hover:shadow-[0_8px_0_0_#E5E5E5] hover:translate-y-[-2px] transition-all duration-300">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-brand-border">
                    <div className="p-3 bg-brand-primary/10 rounded-xl">
                        <AiOutlineBgColors className="text-brand-primary" size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">PERSONNALISATION</h2>
                        <p className="text-xs font-semibold uppercase tracking-wider text-brand-muted mt-1">Choisissez la couleur principale de l'application</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                    {themeColors.map((color) => (
                        <button
                            key={color.primary}
                            onClick={() => setCurrentColor(color.primary)}
                            className={`relative w-12 h-12 rounded-full border-2 transition-all duration-200 hover:scale-110 focus:outline-none ${
                                currentColor === color.primary
                                    ? 'border-black ring-2 ring-offset-2 ring-brand-primary'
                                    : 'border-transparent'
                            }`}
                            style={{ backgroundColor: color.primary }}
                            aria-label={`Thème ${color.name}`}
                        >
                            {currentColor === color.primary && (
                                <AiOutlineCheck className="absolute inset-0 m-auto text-white drop-shadow-md" size={20} />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SuperAdminProfile;