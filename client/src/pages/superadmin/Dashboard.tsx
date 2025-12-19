import React, { useMemo } from 'react';
import { 
    AiOutlineUser, 
    AiOutlineEnvironment,
    AiOutlineFlag,
    AiOutlineRise,
    AiOutlineTeam,
    AiOutlinePlus,
    AiOutlineSetting,
    AiOutlineCrown,
    AiOutlineBarChart,
    AiOutlineThunderbolt,
    AiOutlineArrowRight
} from 'react-icons/ai';
import { useAdmin } from '../../hooks/useAdmin';
import { useDistrict } from '../../hooks/useDistrict';
import { useTribute } from '../../hooks/useTribute';

interface StatCardProps {
    title: string;
    value: number;
    subtitle: string;
    icon: React.ReactNode;
    color: string;
    trend?: number;
    onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, color, trend, onClick }) => (
    <div 
        onClick={onClick}
        className="bg-brand-card border-2 border-brand-border rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-[0_6px_0_0_var(--border-main)] cursor-pointer group"
    >
        <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl ${color} text-white border-b-4 border-black/20 shadow-sm`}>
                {icon}
            </div>
            {trend !== undefined && (
                <div className="flex items-center gap-1 bg-green-50 text-green-600 px-2 py-1 rounded-lg border border-green-200 border-b-2 text-xs font-medium">
                    <AiOutlineRise />
                    <span>+{trend}%</span>
                </div>
            )}
        </div>
        
        <h3 className="text-brand-muted text-xs font-black uppercase tracking-widest mb-1">
            {title}
        </h3>
        <p className="text-3xl font-black text-brand-text mb-2">
            {value.toLocaleString()}
        </p>
        <p className="text-brand-muted text-sm flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${color.replace('bg-', 'bg-')}`}></span>
            {subtitle}
        </p>
    </div>
);

interface QuickActionProps {
    title: string;
    icon: React.ReactNode;
    href: string;
    color: string;
    description: string;
}

const QuickActionCard: React.FC<QuickActionProps> = ({ title, icon, href, color, description }) => (
    <a
        href={href}
        className="bg-brand-card border-2 border-brand-border rounded-xl p-5 transition-all hover:-translate-y-1 hover:shadow-[0_4px_0_0_var(--border-main)] flex items-start gap-4 group"
    >
        <div className={`p-2.5 rounded-lg ${color} text-white border-b-4 border-black/20 shadow-sm`}>
            {icon}
        </div>
        <div className="flex-1">
            <h3 className="font-black text-xs uppercase tracking-widest mb-1 flex items-center gap-2">
                {title}
            </h3>
            <p className="text-brand-muted text-xs">{description}</p>
        </div>
        <AiOutlineArrowRight className="text-brand-muted group-hover:text-brand-primary transition-colors" size={18} />
    </a>
);

const SuperAdminDashboard: React.FC = () => {
    const { admins, isLoading: loadingAdmins } = useAdmin();
    const { districts, isLoading: loadingDistricts } = useDistrict();
    const { tributes, isLoading: loadingTributes } = useTribute();

    const stats = useMemo(() => ({
        admins: admins?.length || 0,
        districts: districts?.length || 0,
        tributes: tributes?.length || 0,
        totalEntities: (admins?.length || 0) + (districts?.length || 0) + (tributes?.length || 0)
    }), [admins, districts, tributes]);

    if (loadingAdmins || loadingDistricts || loadingTributes) {
        return (
            <div className="flex items-center justify-center min-h-[70vh]">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin mx-auto mb-4" />
                        <AiOutlineCrown className="absolute top-5 left-1/2 transform -translate-x-1/2 text-brand-primary/50" size={24} />
                    </div>
                    <p className="text-brand-muted text-sm font-medium">
                        Chargement du dashboard...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 space-y-8">
            {/* Header avec effet 3D */}
            <div className="bg-brand-card border-2 border-brand-border rounded-2xl p-6 shadow-[0_6px_0_0_var(--border-main)]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-brand-primary text-white rounded-xl border-b-4 border-brand-primary-dark shadow-sm">
                            <AiOutlineCrown size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-brand-text flex items-center gap-3">
                                Dashboard
                                <span className="bg-brand-primary/10 text-brand-primary text-xs px-3 py-1.5 rounded-full border-2 border-brand-primary/30 font-black">
                                    SUPER ADMIN
                                </span>
                            </h1>
                            <p className="text-brand-muted text-sm font-medium flex items-center gap-2 mt-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary"></span>
                                Gérez l'ensemble du système
                            </p>
                        </div>
                    </div>
                    
                    {/* Mini stats avec effet 3D */}
                    <div className="flex items-center gap-4 bg-brand-bg border-2 border-brand-border rounded-xl px-4 py-2 shadow-[0_4px_0_0_var(--border-main)]">
                        <div className="text-center px-3">
                            <p className="text-xl font-black text-brand-primary">{stats.totalEntities}</p>
                            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Entités</p>
                        </div>
                        <div className="w-px h-8 bg-brand-border"></div>
                        <div className="text-center px-3">
                            <p className="text-xl font-black text-green-600">{stats.admins}</p>
                            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Admins</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistiques principales avec effet 3D */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="ADMINISTRATEURS"
                    value={stats.admins}
                    subtitle="Comptes actifs dans le système"
                    icon={<AiOutlineUser size={22} />}
                    color="bg-red-500"
                    trend={12}
                />
                <StatCard
                    title="DISTRICTS"
                    value={stats.districts}
                    subtitle="Zones géographiques configurées"
                    icon={<AiOutlineEnvironment size={22} />}
                    color="bg-blue-500"
                    trend={8}
                />
                <StatCard
                    title="TRIBUS"
                    value={stats.tributes}
                    subtitle="Entités traditionnelles"
                    icon={<AiOutlineFlag size={22} />}
                    color="bg-purple-500"
                    trend={15}
                />
            </div>

            {/* Actions rapides avec effet 3D */}
            <div className="bg-brand-card border-2 border-brand-border rounded-2xl p-6 shadow-[0_6px_0_0_var(--border-main)]">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-brand-primary/10 text-brand-primary rounded-xl border-b-4 border-brand-primary/30">
                        <AiOutlineThunderbolt size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-brand-text">Actions rapides</h2>
                        <p className="text-xs text-brand-muted font-medium">Gestion courante du système</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <QuickActionCard
                        title="GÉRER LES ADMINISTRATEURS"
                        description="Ajouter, modifier ou supprimer des comptes"
                        icon={<AiOutlineUser size={18} />}
                        href="/superadmin/management?tab=admins"
                        color="bg-red-500"
                    />
                    <QuickActionCard
                        title="GÉRER LES DISTRICTS"
                        description="Configurer les zones et responsables"
                        icon={<AiOutlineEnvironment size={18} />}
                        href="/superadmin/management?tab=districts"
                        color="bg-blue-500"
                    />
                    <QuickActionCard
                        title="GÉRER LES TRIBUS"
                        description="Administrer les entités et chefs"
                        icon={<AiOutlineFlag size={18} />}
                        href="/superadmin/management?tab=tributes"
                        color="bg-purple-500"
                    />
                    <QuickActionCard
                        title="RAPPORTS SYSTÈME"
                        description="Analyses et statistiques globales"
                        icon={<AiOutlineBarChart size={18} />}
                        href="/superadmin/reports"
                        color="bg-green-500"
                    />
                </div>
            </div>

            {/* Activités récentes avec effet 3D */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-brand-card border-2 border-brand-border rounded-2xl p-6 shadow-[0_6px_0_0_var(--border-main)]">
                    <h3 className="font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                        <AiOutlineTeam className="text-brand-muted" size={18} />
                        DERNIERS ADMINISTRATEURS
                    </h3>
                    <div className="space-y-3">
                        {admins?.slice(0, 3).map((admin, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-brand-bg border-2 border-brand-border rounded-xl hover:shadow-[0_4px_0_0_var(--border-main)] transition-all">
                                <div className="w-8 h-8 bg-brand-primary/10 text-brand-primary rounded-lg flex items-center justify-center font-black text-sm border-b-2 border-brand-primary/30">
                                    {admin.firstName?.[0]}{admin.lastName?.[0]}
                                </div>
                                <div className="flex-1">
                                    <p className="font-black text-sm">{admin.firstName} {admin.lastName}</p>
                                    <p className="text-xs text-brand-muted font-medium">{admin.email}</p>
                                </div>
                                <span className="text-[10px] font-black px-2 py-1 bg-green-50 text-green-600 rounded-full border-2 border-green-200 border-b-4">
                                    ACTIF
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-brand-card border-2 border-brand-border rounded-2xl p-6 shadow-[0_6px_0_0_var(--border-main)]">
                    <h3 className="font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                        <AiOutlineSetting className="text-brand-muted" size={18} />
                        CONFIGURATION RAPIDE
                    </h3>
                    <div className="space-y-3">
                        <button className="w-full flex items-center justify-between p-3 bg-brand-bg border-2 border-brand-border rounded-xl hover:shadow-[0_4px_0_0_var(--border-main)] transition-all group">
                            <span className="font-black text-xs uppercase tracking-widest">Nouveau district</span>
                            <AiOutlinePlus className="text-brand-muted group-hover:text-brand-primary" size={16} />
                        </button>
                        <button className="w-full flex items-center justify-between p-3 bg-brand-bg border-2 border-brand-border rounded-xl hover:shadow-[0_4px_0_0_var(--border-main)] transition-all group">
                            <span className="font-black text-xs uppercase tracking-widest">Nouvel administrateur</span>
                            <AiOutlinePlus className="text-brand-muted group-hover:text-brand-primary" size={16} />
                        </button>
                        <button className="w-full flex items-center justify-between p-3 bg-brand-bg border-2 border-brand-border rounded-xl hover:shadow-[0_4px_0_0_var(--border-main)] transition-all group">
                            <span className="font-black text-xs uppercase tracking-widest">Nouvelle tribu</span>
                            <AiOutlinePlus className="text-brand-muted group-hover:text-brand-primary" size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;